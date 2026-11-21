package com.creampie.holdings

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.time.LocalDate
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.temporal.ChronoUnit

/** Background check every ~15 min: gold alerts, hot news, card bill, 9 pm reminder, widget. */
class AlertWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {
    private val OZ = 31.1034768

    private fun get(url: String): String {
        val c = URL(url).openConnection() as HttpURLConnection
        c.connectTimeout = 10000; c.readTimeout = 10000
        c.setRequestProperty("User-Agent", "CreampieAndroid/1.0")
        return c.inputStream.bufferedReader().use { it.readText() }
    }

    /** Latest price: crypto (XXX-USD) from Coinbase, everything else from CNBC (incl. pre/after-hours). */
    private fun assetPrice(sym: String): Double? = try {
        if (Regex("^[A-Z0-9]+-USD$").matches(sym)) JSONObject(get("https://api.exchange.coinbase.com/products/$sym/ticker")).getString("price").toDouble()
        else {
            val u = "https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=" + java.net.URLEncoder.encode(sym, "UTF-8") + "&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json"
            val q = JSONObject(getUA(u, "Mozilla/5.0 (Linux; Android 14) Mobile")).getJSONObject("FormattedQuoteResult").getJSONArray("FormattedQuote").getJSONObject(0)
            val ext = q.optJSONObject("ExtendedMktQuote")
            val raw = if (ext != null && q.optString("curmktstatus") != "REG_MKT") ext.optString("last") else q.optString("last")
            raw.replace(",", "").replace("%", "").toDoubleOrNull()
        }
    } catch (_: Exception) { null }

    private fun getUA(url: String, ua: String): String {
        val c = URL(url).openConnection() as HttpURLConnection
        c.connectTimeout = 10000; c.readTimeout = 10000
        c.setRequestProperty("User-Agent", ua)
        return c.inputStream.bufferedReader().use { it.readText() }
    }

    /** Last price and today's % change (CNBC or Coinbase 24h). */
    private fun quoteFull(sym: String): Pair<Double, Double?>? = try {
        if (Regex("^[A-Z0-9]+-USD$").matches(sym)) { val st = JSONObject(get("https://api.exchange.coinbase.com/products/$sym/stats")); val last = st.getString("last").toDouble(); val open = st.getString("open").toDouble(); last to (if (open > 0) (last - open) / open * 100 else null) }
        else {
            val u = "https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=" + java.net.URLEncoder.encode(sym, "UTF-8") + "&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json"
            val q = JSONObject(getUA(u, "Mozilla/5.0 (Linux; Android 14) Mobile")).getJSONObject("FormattedQuoteResult").getJSONArray("FormattedQuote").getJSONObject(0)
            val last = q.optString("last").replace(",", "").toDoubleOrNull()
            last?.let { it to q.optString("change_pct").replace("%", "").replace("+", "").replace(",", "").toDoubleOrNull() }
        }
    } catch (_: Exception) { null }

    /** About 600 days of daily bars (CNBC or Coinbase). */
    private fun dailyBars(sym: String): List<TechScore.Bar> = try {
        if (Regex("^[A-Z0-9]+-USD$").matches(sym)) {
            val out = java.util.TreeMap<Long, TechScore.Bar>(); val end = System.currentTimeMillis()
            for (k in 0..1) { val e = end - k * 300 * 86400_000L; val b = e - 300 * 86400_000L
                val arr = JSONArray(get("https://api.exchange.coinbase.com/products/$sym/candles?granularity=86400&start=${java.time.Instant.ofEpochMilli(b)}&end=${java.time.Instant.ofEpochMilli(e)}"))
                for (i in 0 until arr.length()) { val x = arr.getJSONArray(i); out[x.getLong(0)] = TechScore.Bar(x.getDouble(2), x.getDouble(1), x.getDouble(4), x.getDouble(5)) } }
            out.values.toList()
        } else {
            val f = java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss").withZone(java.time.ZoneOffset.UTC)
            val u = "https://ts-api.cnbc.com/harmony/app/bars/" + java.net.URLEncoder.encode(sym, "UTF-8").replace("+", "%20") + "/1D/" + f.format(java.time.Instant.now().minusSeconds(600L * 86400)) + "/" + f.format(java.time.Instant.now().plusSeconds(86400)) + "/adjusted/EST5EDT.json"
            val arr = JSONObject(getUA(u, "Mozilla/5.0 (Linux; Android 14) Mobile")).getJSONObject("barData").getJSONArray("priceBars")
            (0 until arr.length()).mapNotNull { i -> val x = arr.getJSONObject(i); val c = x.optString("close").toDoubleOrNull() ?: return@mapNotNull null
                TechScore.Bar(x.optString("high").toDoubleOrNull() ?: c, x.optString("low").toDoubleOrNull() ?: c, c, x.optDouble("volume", 0.0)) }
        }
    } catch (_: Exception) { emptyList() }

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val ctx = applicationContext
        val prefs = Store.prefs(ctx)
        val cfg = Store.config(ctx)
        val now = System.currentTimeMillis()
        val tz = try { ZoneId.of(cfg.optString("tz", "Europe/Warsaw")) } catch (_: Exception) { ZoneId.systemDefault() }
        val local = ZonedDateTime.now(tz)
        val today = local.toLocalDate().toString()
        val ed = prefs.edit()

        // ---- gold price ----
        var price: Double? = null
        try {
            val usdOz = JSONObject(get("https://api.gold-api.com/price/XAU")).getDouble("price")
            var usdPln = prefs.getFloat("usdPln", 0f).toDouble()
            if (usdPln <= 0 || now - prefs.getLong("usdAt", 0) > 6 * 3600_000L) {
                usdPln = JSONObject(get("https://api.nbp.pl/api/exchangerates/rates/a/usd/?format=json")).getJSONArray("rates").getJSONObject(0).getDouble("mid")
                ed.putFloat("usdPln", usdPln.toFloat()).putLong("usdAt", now)
            }
            price = usdOz / OZ * usdPln
        } catch (_: Exception) {}

        // samples for 24h-drop detection
        val samples = try { JSONArray(prefs.getString("samples", "[]")) } catch (_: Exception) { JSONArray() }
        val kept = JSONArray()
        for (i in 0 until samples.length()) { val s = samples.getJSONArray(i); if (s.getLong(0) > now - 48 * 3600_000L) kept.put(s) }
        if (price != null) {
            kept.put(JSONArray().put(now).put(price))
            ed.putFloat("lastPrice", price.toFloat())
            // reference for widget % = price ~24h ago
            var ref = 0.0
            for (i in 0 until kept.length()) { val s = kept.getJSONArray(i); if (s.getLong(0) <= now - 20 * 3600_000L) ref = s.getDouble(1) }
            if (ref > 0) ed.putFloat("refPrice", ref.toFloat())
        }
        ed.putString("samples", kept.toString())

        val gold = cfg.optJSONObject("gold") ?: JSONObject()
        if (price != null && gold.optBoolean("on", false)) {
            val below = gold.optDouble("below", 0.0)
            if (below > 0) {
                if (price <= below && !prefs.getBoolean("firedBelow", false)) {
                    Notifier.send(ctx, Notifier.CH_GOLD, 101, "Gold price alert", String.format("Gold is now %.2f zł/g, below your %.0f zł target.", price, below), "gold")
                    ed.putBoolean("firedBelow", true)
                }
                if (price > below * 1.005) ed.putBoolean("firedBelow", false)
            }
            val dropPct = gold.optDouble("dropPct", 0.0)
            if (dropPct > 0) {
                var hi = 0.0; var first = now
                for (i in 0 until kept.length()) { val s = kept.getJSONArray(i); if (s.getLong(0) >= now - 24 * 3600_000L) { hi = maxOf(hi, s.getDouble(1)); first = minOf(first, s.getLong(0)) } }
                val drop = if (hi > 0) (hi - price) / hi * 100 else 0.0
                if (now - first > 3 * 3600_000L && drop >= dropPct && now - prefs.getLong("dropAt", 0) > 6 * 3600_000L) {
                    Notifier.send(ctx, Notifier.CH_GOLD, 102, String.format("Gold dropped %.1f%% today", drop), String.format("%.2f zł/g, down from %.2f in the last 24 hours.", price, hi), "gold")
                    ed.putLong("dropAt", now)
                }
            }
        }

        // ---- hot news ----
        if (gold.optBoolean("news", false) && local.hour in 8..22) {
            try {
                val items = JSONObject(get(SITE + "news.json?t=" + now / 600_000)).getJSONArray("items")
                val seen = (prefs.getString("seen", "") ?: "").split(",").toMutableList()
                val dayKey = "newsCount_$today"
                var count = prefs.getInt(dayKey, 0)
                var sent = false
                for (i in 0 until items.length()) {
                    val n = items.getJSONObject(i)
                    val id = n.optString("id")
                    if (id in seen) continue
                    val fresh = now - java.time.Instant.parse(n.optString("date")).toEpochMilli() < 6 * 3600_000L
                    val strong = n.optBoolean("gold") && n.optString("impact") != "watch" && n.optInt("strength") >= 2
                    if (fresh && strong && !sent && count < 3) {
                        val up = n.optString("impact") == "up"
                        Notifier.send(ctx, Notifier.CH_NEWS, 200 + count, if (up) "News: gold may rise ▲" else "News: gold may fall ▼", n.optString("title") + "\n" + n.optString("why") + ".", "news")
                        sent = true; count++
                    }
                    seen.add(id)
                }
                ed.putInt(dayKey, count).putString("seen", seen.takeLast(200).joinToString(","))
            } catch (_: Exception) {}
        }

        // ---- early warnings (computed every ~10 min by the online job, published in news.json) ----
        if (gold.optBoolean("on", true) && gold.optBoolean("signals", true)) {
            try {
                val sigs = JSONObject(get(SITE + "news.json?t=" + now / 300_000)).optJSONArray("signals") ?: JSONArray()
                val seen = (prefs.getString("sigSeen", "") ?: "").split(",").filter { it.isNotEmpty() }.toMutableList()
                val dayKey = "sigCount_$today"
                var count = prefs.getInt(dayKey, 0)
                val awake = local.hour in 7..22
                var sent = false
                for (i in 0 until sigs.length()) {
                    val x = sigs.getJSONObject(i)
                    val id = x.optString("id")
                    if (x.optString("level") != "high" || id in seen) continue
                    if (awake && !sent && count < 4) {
                        val dir = x.optString("dir")
                        val whenMs = x.optLong("when", 0L)
                        val whenTxt = if (whenMs > 0) java.time.format.DateTimeFormatter.ofPattern("EEE HH:mm").format(java.time.Instant.ofEpochMilli(whenMs).atZone(tz)) + " · " else ""
                        Notifier.send(ctx, Notifier.CH_WARN, 500 + count, (if (dir == "up") "▲ " else if (dir == "down") "▼ " else "! ") + x.optString("title"), whenTxt + x.optString("body"), "gold")
                        sent = true; count++; seen.add(id)
                    } else if (!awake) seen.add(id) // don't deliver stale warnings in the morning
                }
                ed.putInt(dayKey, count).putString("sigSeen", seen.takeLast(100).joinToString(","))
            } catch (_: Exception) {}
        }

        // ---- price and signal alerts v2 ----
        val quietCfg = cfg.optJSONObject("quiet")
        val quiet = quietCfg != null && quietCfg.optBoolean("on") && run { val f = quietCfg.optInt("from", 23); val t = quietCfg.optInt("to", 7); val h = local.hour; if (f > t) h >= f || h < t else h in f until t }
        val als = cfg.optJSONArray("alerts")
        val qcache = HashMap<String, Double?>()
        fun px(sym: String) = qcache.getOrPut(sym) { assetPrice(sym) }
        if (als != null && als.length() > 0) {
            val st = try { JSONObject(prefs.getString("al2", "{}")) } catch (_: Exception) { JSONObject() }
            var n = 0
            for (i in 0 until als.length()) {
                val al = als.getJSONObject(i)
                val id = al.optString("id"); val sym = al.optString("sym"); val name = al.optString("name", sym); val kind = al.optString("kind")
                val a = al.optDouble("a", 0.0).let { if (it.isNaN()) 0.0 else it }; val b = al.optDouble("b", 0.0).let { if (it.isNaN()) 0.0 else it }
                val p = px(sym) ?: continue
                val s0 = st.optJSONObject(id) ?: JSONObject()
                fun f(v: Double) = if (v >= 1) String.format(java.util.Locale.US, "%,.2f", v) else String.format(java.util.Locale.US, "%.6f", v)
                var side: Int? = null; var title = ""; var body = "Now ${f(p)}. Your alert."
                when (kind) {
                    "above" -> { side = if (p >= a) 1 else if (p < a * 0.997) 0 else s0.optInt("s", -1).takeIf { it >= 0 }; title = "$name is above ${f(a)}" }
                    "below" -> { side = if (p <= a) 1 else if (p > a * 1.003) 0 else s0.optInt("s", -1).takeIf { it >= 0 }; title = "$name fell below ${f(a)}" }
                    "enter", "leave" -> { val lo = minOf(a, b); val hi = maxOf(a, b); val inside = p in lo..hi; side = if (kind == "enter") (if (inside) 1 else 0) else (if (inside) 0 else 1)
                        title = if (kind == "enter") "$name entered ${f(lo)} to ${f(hi)}" else "$name left ${f(lo)} to ${f(hi)}" }
                    "move", "score" -> {
                        val bars = dailyBars(sym); if (bars.size < 5) continue
                        if (kind == "move") { val d = al.optInt("days", 1); if (bars.size <= d) continue; val ref = bars[bars.size - 1 - d].close; val ch = (p - ref) / ref * 100; val want = Math.abs(al.optDouble("pct", 5.0)); val dir = al.optString("dir", "both")
                            side = if ((dir == "down" && ch <= -want) || (dir == "up" && ch >= want) || (dir == "both" && Math.abs(ch) >= want)) 1 else 0
                            title = String.format(java.util.Locale.US, "%s %s %.1f%% in %s", name, if (ch >= 0) "up" else "down", Math.abs(ch), if (d == 1) "a day" else "$d days") }
                        else { val live = bars.dropLast(1) + TechScore.Bar(maxOf(bars.last().high, p), minOf(bars.last().low, p), p, bars.last().volume); val sc = TechScore.score(live) ?: continue
                            val sty = cfg.optJSONObject("style"); val buy = sty?.optInt("buy", 60) ?: 60; val sell = sty?.optInt("sell", 40) ?: 40
                            val v = if (sc >= buy) 2 else if (sc <= sell) 0 else 1; val dir = al.optString("dir", "buy")
                            title = "$name: technical signals now say ${if (v == 2) "Buy" else if (v == 0) "Sell" else "Hold"}"; body = "Technical score $sc/100. Open the app for the full advisor reasons."
                            if (dir == "any") { val prev = s0.optInt("v", -1); if (prev >= 0 && prev != v && (!quiet || al.optBoolean("urgent"))) Notifier.send(ctx, Notifier.CH_GOLD, 600 + (n++ % 60), title, body, "asset/" + java.net.URLEncoder.encode(sym, "UTF-8")); s0.put("v", v); st.put(id, s0); continue }
                            side = if ((dir == "sell" && v == 0) || (dir != "sell" && v == 2)) 1 else 0 }
                    }
                    else -> continue
                }
                val prev = s0.optInt("s", -1)
                if (side == 1 && prev == 0 && !(al.optBoolean("once") && s0.optBoolean("done"))) {
                    if (!quiet || al.optBoolean("urgent")) Notifier.send(ctx, Notifier.CH_GOLD, 600 + (n++ % 60), title, body, "asset/" + java.net.URLEncoder.encode(sym, "UTF-8"))
                    if (al.optBoolean("once")) s0.put("done", true)
                }
                if (side != null) s0.put("s", side)
                st.put(id, s0)
            }
            ed.putString("al2", st.toString())
        }

        // ---- live quotes for the widgets (watchlist + chosen tickers) ----
        try {
            val w = cfg.optJSONObject("widget"); val syms = LinkedHashSet<String>()
            w?.optJSONArray("watch")?.let { for (i in 0 until minOf(it.length(), 8)) syms += it.getJSONObject(i).optString("sym") }
            for ((k, v) in prefs.all) if (k.startsWith("w_") && v is String) syms += v
            for (sym in syms) { val q = quoteFull(sym) ?: continue; ed.putString("q_$sym", JSONObject().put("last", q.first).put("pct", q.second ?: JSONObject.NULL).put("at", now).toString()) }
        } catch (_: Exception) {}

        // ---- Sunday summary (Sunday 18:00) ----
        val sun = cfg.optJSONObject("sunday")
        if (sun != null && local.dayOfWeek == java.time.DayOfWeek.SUNDAY && local.hour == 18 && prefs.getString("sunday", "") != today) {
            val parts = mutableListOf<String>()
            if (!sun.isNull("nwPct")) parts += String.format(java.util.Locale.US, "Your net worth %s%.1f%% this week.", if (sun.optDouble("nwPct") >= 0) "+" else "", sun.optDouble("nwPct"))
            val spx = dailyBars(".SPX"); val gl = dailyBars("@GC.1")
            fun wk(b: List<TechScore.Bar>) = if (b.size > 6) (b.last().close / b[b.size - 6].close - 1) * 100 else null
            listOfNotNull(wk(spx)?.let { String.format(java.util.Locale.US, "S&P 500 %+.1f%%", it) }, wk(gl)?.let { String.format(java.util.Locale.US, "gold %+.1f%%", it) }).takeIf { it.isNotEmpty() }?.let { parts += it.joinToString(", ") + " this week." }
            sun.optJSONArray("calls")?.let { if (it.length() > 0) parts += "Advisor: " + (0 until it.length()).joinToString(", ") { k -> it.getString(k) } + "." }
            if (parts.isNotEmpty()) Notifier.send(ctx, Notifier.CH_REMIND, 402, "Your Sunday summary", parts.joinToString(" "), "world/brief")
            ed.putString("sunday", today)
        }
        // ---- DCA payday and weekly backup reminders ----
        cfg.optJSONObject("dca")?.let { d -> if (local.hour == 9 && local.dayOfMonth == d.optInt("day", 10) && prefs.getString("dca", "") != today) { Notifier.send(ctx, Notifier.CH_REMIND, 403, "DCA day", "Time for your monthly investment. Open the app to buy.", "dca"); ed.putString("dca", today) } }
        cfg.optJSONObject("backup")?.let { bk -> if (local.dayOfWeek == java.time.DayOfWeek.SATURDAY && local.hour == 11 && prefs.getString("bk", "") != today && now - bk.optLong("last", 0) > 7 * 86400_000L) { Notifier.send(ctx, Notifier.CH_REMIND, 404, "Time for a backup", "Your last encrypted backup is more than a week old.", "backup"); ed.putString("bk", today) } }

        // ---- credit card bill ----
        val card = cfg.optJSONObject("card")
        if (card != null && card.optBoolean("on") && card.optInt("dueDay") > 0 && card.optDouble("owed") > 0 && local.hour in 9..20) {
            val d = card.optInt("dueDay")
            var due = local.toLocalDate().withDayOfMonth(minOf(d, local.toLocalDate().lengthOfMonth()))
            if (due.isBefore(local.toLocalDate())) { val nm = local.toLocalDate().plusMonths(1); due = nm.withDayOfMonth(minOf(d, nm.lengthOfMonth())) }
            val days = ChronoUnit.DAYS.between(local.toLocalDate(), due).toInt()
            val key = "$due:$days"
            if (days in listOf(3, 1, 0) && prefs.getString("cardKey", "") != key) {
                val name = card.optString("name", "Card")
                Notifier.send(ctx, Notifier.CH_REMIND, 301, if (days == 0) "$name bill due today" else "$name bill in $days day${if (days > 1) "s" else ""}", String.format("Amount to pay: %.2f zł", card.optDouble("owed")), "card")
                ed.putString("cardKey", key)
            }
        }

        // ---- 9 pm reminder ----
        if (cfg.optBoolean("remind9pm") && local.hour == 21 && prefs.getString("night", "") != today) {
            if (cfg.optString("lastEntry") != today) Notifier.send(ctx, Notifier.CH_REMIND, 401, "Daily reminder", "Add today's spending before you forget.", "add")
            ed.putString("night", today)
        }

        ed.apply()
        Widget.refresh(ctx)
        Result.success()
    }
}
