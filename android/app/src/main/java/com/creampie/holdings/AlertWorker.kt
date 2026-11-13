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
                    Notifier.send(ctx, Notifier.CH_GOLD, 101, "📉 Gold went down on you", String.format("Now %.2f zł/g, under your %.0f zł target. Time to get some? 😏", price, below), "gold")
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
                    Notifier.send(ctx, Notifier.CH_GOLD, 102, String.format("🔥 Gold dropped %.1f%% today", drop), String.format("%.2f zł/g, down from %.2f in the last 24h. Dip time? 🍆", price, hi), "gold")
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
                        Notifier.send(ctx, Notifier.CH_NEWS, 200 + count, if (up) "🗞️ Hot gossip: gold may RISE ▲" else "🗞️ Hot gossip: gold may FALL ▼", n.optString("title") + "\n" + n.optString("why") + ". Stay alert 👀", "news")
                        sent = true; count++
                    }
                    seen.add(id)
                }
                ed.putInt(dayKey, count).putString("seen", seen.takeLast(200).joinToString(","))
            } catch (_: Exception) {}
        }

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
                Notifier.send(ctx, Notifier.CH_REMIND, 301, if (days == 0) "💳 $name bill due TODAY" else "💳 $name bill in $days day${if (days > 1) "s" else ""}", String.format("Pay %.2f zł to keep Plastic Daddy satisfied 💦", card.optDouble("owed")), "card")
                ed.putString("cardKey", key)
            }
        }

        // ---- 9 pm reminder ----
        if (cfg.optBoolean("remind9pm") && local.hour == 21 && prefs.getString("night", "") != today) {
            if (cfg.optString("lastEntry") != today) Notifier.send(ctx, Notifier.CH_REMIND, 401, "🌙 Did you log today's sins?", "Quick, add what you blew today before bed 😈", "add")
            ed.putString("night", today)
        }

        ed.apply()
        Widget.refresh(ctx)
        Result.success()
    }
}
