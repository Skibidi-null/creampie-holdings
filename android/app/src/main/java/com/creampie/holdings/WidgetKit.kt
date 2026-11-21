package com.creampie.holdings

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.SweepGradient
import android.graphics.Typeface
import android.os.Bundle
import android.util.TypedValue
import android.view.View
import android.widget.RemoteViews
import org.json.JSONArray
import org.json.JSONObject
import java.time.DayOfWeek
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.Locale
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min

/** HOLO home-screen widgets. Every widget uses one flexible layout (w_holo) and adapts to its size. */
abstract class HoloWidget(private val kind: String) : AppWidgetProvider() {
    override fun onUpdate(ctx: Context, mgr: AppWidgetManager, ids: IntArray) { for (id in ids) WidgetKit.render(ctx, mgr, id, kind) }
    override fun onAppWidgetOptionsChanged(ctx: Context, mgr: AppWidgetManager, id: Int, opts: Bundle) = WidgetKit.render(ctx, mgr, id, kind)
    override fun onDeleted(ctx: Context, ids: IntArray) { val e = Store.prefs(ctx).edit(); for (id in ids) e.remove("w_$id"); e.apply() }
}
class NwWidget : HoloWidget("nw")
class SignalWidget : HoloWidget("signal")
class WatchWidget : HoloWidget("watch")
class RiskWidget : HoloWidget("risk")
class TickerWidget : HoloWidget("ticker")
class MarketsWidget : HoloWidget("markets")
class BudgetWidget : HoloWidget("budget")
class AlertWidget : HoloWidget("alert")

object WidgetKit {
    val ALL = listOf("nw" to NwWidget::class.java, "signal" to SignalWidget::class.java, "watch" to WatchWidget::class.java, "risk" to RiskWidget::class.java,
        "ticker" to TickerWidget::class.java, "markets" to MarketsWidget::class.java, "budget" to BudgetWidget::class.java, "alert" to AlertWidget::class.java, "budget" to Widget::class.java)
    private const val MINT = 0xFF3CFFB4.toInt(); private const val PINK = 0xFFFF5C8A.toInt(); private const val GOLD = 0xFFFFE36E.toInt()
    private const val DIM = 0xFFA9ABC8.toInt(); private const val MUTE = 0xFF6E7190.toInt(); private const val WHITE = 0xFFF4F5FA.toInt()

    /** the assets a Watchlist widget shows: chosen ones (in order) or the app's watchlist */
    fun watchItems(ctx: Context, w: JSONObject?, id: Int): List<Pair<String, String>> {
        val arr = w?.optJSONArray("watch") ?: JSONArray()
        val names = HashMap<String, String>(EXTRA_NAMES); for (i in 0 until arr.length()) arr.getJSONObject(i).let { names[it.optString("sym")] = it.optString("name") }
        val picks = (Store.prefs(ctx).getString("w_$id", null) ?: "").split(",").filter { it.isNotBlank() }
        return if (picks.isNotEmpty()) picks.map { it to (names[it] ?: it) } else (0 until arr.length()).map { arr.getJSONObject(it).let { o -> o.optString("sym") to o.optString("name") } }
    }
    val EXTRA_NAMES = mapOf("@GC.1" to "Gold", "@SI.1" to "Silver", "BTC-USD" to "Bitcoin", "ETH-USD" to "Ethereum", "VUAA-GB" to "S&P 500 ETF (VUAA)", "CSPX-GB" to "S&P 500 ETF (CSPX)", ".SPX" to "S&P 500", ".IXIC" to "Nasdaq", "EURPLN=" to "EUR/PLN", "PLN=" to "USD/PLN", "@CL.1" to "Oil")
    fun configIntent(ctx: Context, id: Int): PendingIntent = PendingIntent.getActivity(ctx, 9500 + id, Intent(ctx, WidgetConfig::class.java).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    private fun updatedCorner(ctx: Context, v: RemoteViews, id: Int) {
        val at = Store.prefs(ctx).getLong("wUpdated", 0)
        v.setTextViewText(R.id.corner, if (at == 0L) "tap to update" else "updated " + java.text.SimpleDateFormat("HH:mm", Locale.getDefault()).format(java.util.Date(at)))
        v.setOnClickPendingIntent(R.id.corner, PendingIntent.getBroadcast(ctx, 9700 + id, Intent(ctx, RefreshReceiver::class.java), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE))
    }
    fun refreshAll(ctx: Context) {
        val mgr = AppWidgetManager.getInstance(ctx)
        for ((k, cls) in ALL) for (id in mgr.getAppWidgetIds(ComponentName(ctx, cls))) runCatching { render(ctx, mgr, id, k) }
    }

    private fun open(ctx: Context, where: String, code: Int): PendingIntent {
        val i = Intent(ctx, MainActivity::class.java).apply { putExtra("open", where); flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP }
        return PendingIntent.getActivity(ctx, code, i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }
    fun pct(v: Double) = String.format(Locale.US, "%s%.2f%%", if (v >= 0) "+" else "−", abs(v))
    fun price(v: Double) = when { v >= 1000 -> String.format(Locale.US, "%,.0f", v); v >= 1 -> String.format(Locale.US, "%,.2f", v); else -> String.format(Locale.US, "%.4f", v) }

    /** Latest quote for a symbol: live one saved by the background worker, else the one the app sent. */
    fun quote(ctx: Context, w: JSONObject?, sym: String): Pair<Double?, Double?> {
        val q = runCatching { JSONObject(Store.prefs(ctx).getString("q_$sym", "{}")!!) }.getOrNull()
        if (q != null && q.has("last") && System.currentTimeMillis() - q.optLong("at") < 3 * 3600_000L) return q.optDouble("last") to (if (q.isNull("pct")) null else q.optDouble("pct"))
        val arr = w?.optJSONArray("watch") ?: JSONArray()
        for (i in 0 until arr.length()) { val x = arr.getJSONObject(i); if (x.optString("sym") == sym) return (if (x.isNull("last")) null else x.optDouble("last")) to (if (x.isNull("pct")) null else x.optDouble("pct")) }
        return null to null
    }

    fun render(ctx: Context, mgr: AppWidgetManager, id: Int, kind: String) {
        val opts = mgr.getAppWidgetOptions(id)
        val wDp = max(opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 110), 40)
        val hDp = max(opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 110)), 40)
        // size classes: cell = one column wide, short = one row high, tall = 3+ rows
        val cell = wDp < 100
        val short = hDp < 100
        val tall = hDp >= 150
        val wide = wDp >= 220
        val dens = ctx.resources.displayMetrics.density
        val cfg = Store.config(ctx); val w = cfg.optJSONObject("widget"); val priv = w?.optBoolean("privacy", false) == true
        pkg = ctx.packageName; resCtx = ctx
        val v = RemoteViews(ctx.packageName, R.layout.w_holo)
        for (x in listOf(R.id.gauge, R.id.chart, R.id.rows, R.id.foot, R.id.sub)) v.setViewVisibility(x, View.GONE)
        v.setViewVisibility(R.id.mid, View.VISIBLE); v.setViewVisibility(R.id.head, View.VISIBLE)
        v.setTextViewText(R.id.corner, ""); v.setTextColor(R.id.sub, MINT); v.setTextColor(R.id.big, WHITE)
        val scale = (min(wDp / 110f, hDp / 110f)).coerceIn(0.7f, 2.2f) // 1.0 = a 2x2 widget
        val padH = ((if (cell) 6 else 10) * dens).toInt(); val padV = ((if (short) 5 else 8) * dens).toInt()
        v.setViewPadding(R.id.pad, padH, padV, padH, padV)
        v.setTextViewTextSize(R.id.label, TypedValue.COMPLEX_UNIT_SP, (8.5f * scale).coerceIn(8.5f, 12f))
        v.setTextViewTextSize(R.id.sub, TypedValue.COMPLEX_UNIT_SP, (10.5f * scale).coerceIn(10f, 16f))
        v.setViewVisibility(R.id.edit, View.GONE)
        val inner = wDp - (if (cell) 16 else 22)
        // big text sized to fit the width (no ellipsis)
        fun big(t: String, maxSp: Float, color: Int = WHITE) {
            val fit = (inner / (max(t.length, 3) * 0.64f)).coerceIn(9f, maxSp)
            v.setTextViewText(R.id.big, t); v.setTextViewTextSize(R.id.big, TypedValue.COMPLEX_UNIT_SP, fit); v.setTextColor(R.id.big, color)
        }
        fun sub(t: String, color: Int = MINT) { if (t.isEmpty() || short && hDp < 80) return; v.setViewVisibility(R.id.sub, View.VISIBLE); v.setTextViewText(R.id.sub, t); v.setTextColor(R.id.sub, color) }
        val bigMax = (min(hDp * 0.30f, wDp * 0.2f)).coerceIn(14f, 52f)
        val chartPx = { ww: Int, hh: Int -> Pair(min((ww * dens).toInt(), 900), min((hh * dens).toInt(), 400)) }
        var route = "home"
        when (kind) {
            "nw" -> {
                route = "networth"
                v.setTextViewText(R.id.label, "NET WORTH")
                big(if (priv) "•••••" else w?.optString("nwTxt")?.takeIf { it.isNotEmpty() } ?: "Open the app", bigMax)
                val p = w?.optDouble("nwPct", Double.NaN) ?: Double.NaN
                if (!p.isNaN()) sub((if (p >= 0) "▲ " else "▼ ") + pct(p) + " today", if (p >= 0) MINT else PINK)
                val sp = w?.optJSONArray("nwSpark")
                if (!short && sp != null && sp.length() > 1) {
                    val vals = DoubleArray(sp.length()) { sp.optDouble(it) }
                    val (cw, ch) = chartPx(inner, max(30, (hDp * 0.45f).toInt())); v.setImageViewBitmap(R.id.chart, spark(vals, cw, ch, true, dens)); v.setViewVisibility(R.id.chart, View.VISIBLE)
                } else if (!short) sub("History builds up day by day", DIM)
                if (wide) v.setTextViewText(R.id.corner, w?.optString("cur", "") ?: "")
            }
            "signal" -> {
                val calls = w?.optJSONArray("calls") ?: JSONArray()
                val picks = (Store.prefs(ctx).getString("w_$id", null) ?: "").split(",").filter { it.isNotBlank() }
                val all = (0 until calls.length()).map { calls.getJSONObject(it) }
                val chosen = (if (picks.isEmpty()) all.take(1) else picks.mapNotNull { p -> all.firstOrNull { it.optString("sym") == p } ?: JSONObject().put("sym", p).put("name", EXTRA_NAMES[p] ?: p) }).take(4)
                val c = chosen.firstOrNull()
                route = if (c != null) "asset/" + java.net.URLEncoder.encode(c.optString("sym"), "UTF-8") else "advisor"
                v.setViewVisibility(R.id.edit, if (cell) View.GONE else View.VISIBLE)
                v.setOnClickPendingIntent(R.id.edit, configIntent(ctx, id))
                if (chosen.size > 1 && !short && !cell) {
                    // several signals: a grid of gauges filling the widget
                    v.setTextViewText(R.id.label, "SIGNALS"); v.setViewVisibility(R.id.mid, View.GONE)
                    val (cw, ch) = chartPx(inner, hDp - 30)
                    v.setImageViewBitmap(R.id.chart, multiGauge(chosen, cw, ch, dens)); v.setViewVisibility(R.id.chart, View.VISIBLE)
                    route = "advisor"
                } else {
                    val score = c?.optDouble("score", Double.NaN) ?: Double.NaN
                    val verdict = c?.optString("v") ?: ""
                    val vc = if (verdict.contains("Buy")) MINT else if (verdict.contains("Sell")) PINK else GOLD
                    val nm = c?.optString("name") ?: "Tap EDIT to choose"
                    if (cell) {
                        v.setTextViewText(R.id.label, nice(c?.optString("sym") ?: "", nm).uppercase())
                        val gs = max(36, min(wDp - 14, hDp - 28))
                        v.setImageViewBitmap(R.id.gauge, gauge(if (score.isNaN()) null else score, (gs * dens).toInt(), dens)); v.setViewVisibility(R.id.gauge, View.VISIBLE)
                        v.setTextViewText(R.id.big, ""); v.setTextViewTextSize(R.id.big, TypedValue.COMPLEX_UNIT_SP, 1f)
                    } else {
                        v.setTextViewText(R.id.label, "SIGNAL")
                        val gs = max(40, min((wDp * 0.48f).toInt(), hDp - 34))
                        v.setImageViewBitmap(R.id.gauge, gauge(if (score.isNaN()) null else score, (gs * dens).toInt(), dens)); v.setViewVisibility(R.id.gauge, View.VISIBLE)
                        val room = inner - gs - 10
                        v.setTextViewText(R.id.big, nm); v.setTextViewTextSize(R.id.big, TypedValue.COMPLEX_UNIT_SP, (room / (max(nm.length, 4) * 0.6f)).coerceIn(10f, 26f)); v.setTextColor(R.id.big, WHITE)
                        if (verdict.isNotEmpty()) { v.setViewVisibility(R.id.sub, View.VISIBLE); v.setTextViewText(R.id.sub, verdict.uppercase() + if (!score.isNaN() && !short) "  ${Math.round(score)}/100" else ""); v.setTextColor(R.id.sub, vc) }
                        else if (!score.isNaN()) Unit else { v.setViewVisibility(R.id.sub, View.VISIBLE); v.setTextViewText(R.id.sub, "No score yet: add it to your watchlist"); v.setTextColor(R.id.sub, DIM) }
                    }
                }
            }
            "watch" -> {
                route = "markets"
                v.setViewVisibility(R.id.mid, View.GONE); v.setViewVisibility(R.id.rows, View.VISIBLE)
                v.setViewVisibility(R.id.edit, if (cell) View.GONE else View.VISIBLE); v.setOnClickPendingIntent(R.id.edit, configIntent(ctx, id))
                if (short) v.setViewVisibility(R.id.head, View.GONE) else v.setTextViewText(R.id.label, "WATCHLIST")
                val items = watchItems(ctx, w, id)
                val avail = hDp - (if (short) 10 else 30)
                val n = min(items.size, (avail / 18).coerceIn(1, 10))
                val rowSp = ((avail.toFloat() / max(n, 1)) * 0.42f).coerceIn(10f, if (cell) 13f else 18f)
                for (i in 0 until 10) {
                    val row = rid("row", i); if (i >= n) { v.setViewVisibility(row, View.GONE); continue }
                    val (sym, name) = items[i]; val (last, pc) = quote(ctx, w, sym)
                    v.setViewVisibility(row, View.VISIBLE)
                    v.setTextViewText(rid("r", i, "n"), if (cell) nice(sym, name) else name)
                    v.setTextViewText(rid("r", i, "v"), if (pc == null) "-" else if (wDp >= 200 && last != null) "${price(last)}  ${pct(pc)}" else pct1(pc))
                    v.setTextColor(rid("r", i, "v"), if ((pc ?: 0.0) >= 0) MINT else PINK)
                    for (t in listOf(rid("r", i, "n"), rid("r", i, "v"))) v.setTextViewTextSize(t, TypedValue.COMPLEX_UNIT_SP, rowSp)
                }
                if (items.isEmpty()) { v.setViewVisibility(R.id.row0, View.VISIBLE); v.setTextViewText(R.id.r0n, "Tap EDIT to choose assets"); v.setTextViewText(R.id.r0v, "") }
                if (!short && wDp >= 200) updatedCorner(ctx, v, id)
            }
            "risk" -> {
                route = "world"
                val r = w?.optJSONObject("risk")
                v.setTextViewText(R.id.label, if (wide) "RISK ON / OFF" else "RISK")
                val sc = r?.optInt("score", -1) ?: -1
                big(if (sc < 0) "-" else if (sc >= 55) "ON" else if (sc <= 45) "OFF" else "MIXED", if (cell) 22f else bigMax, if (sc >= 55) MINT else if (sc in 0..45) PINK else GOLD)
                if (sc < 0) sub("Open the app once", DIM) else if (!cell && (short || hDp >= 160)) sub("${r?.optString("label")} · $sc/100", DIM) else if (cell) sub("$sc/100", DIM)
                if (!short && sc >= 0) { val (cw, ch) = chartPx(inner, 16); v.setImageViewBitmap(R.id.chart, meter(sc / 100.0, cw, ch, dens)); v.setViewVisibility(R.id.chart, View.VISIBLE) }
            }
            "ticker" -> {
                val sym = Store.prefs(ctx).getString("w_$id", null) ?: (w?.optJSONArray("watch")?.optJSONObject(0)?.optString("sym") ?: "BTC-USD")
                route = "asset/" + java.net.URLEncoder.encode(sym, "UTF-8")
                var name = sym
                val arr = w?.optJSONArray("watch") ?: JSONArray(); for (i in 0 until arr.length()) if (arr.getJSONObject(i).optString("sym") == sym) name = arr.getJSONObject(i).optString("name")
                val (last, pc) = quote(ctx, w, sym)
                v.setTextViewText(R.id.label, (if (cell || name.length > 14) nice(sym, name) else name).uppercase())
                big(if (pc == null) "-" else if (cell) pct1(pc) else pct(pc), if (cell) 20f else bigMax, if ((pc ?: 0.0) >= 0) MINT else PINK)
                if (last != null && (!short || !cell)) { v.setViewVisibility(R.id.sub, View.VISIBLE); v.setTextViewText(R.id.sub, price(last)); v.setTextColor(R.id.sub, DIM) }
                if (pc == null && last == null) sub("Waiting for prices", DIM)
            }
            "markets" -> {
                route = "world/now"
                val list = Sessions.status(cell || !wide)
                v.setTextViewText(R.id.label, if (wide) "MARKETS NOW" else "MARKETS")
                if (short || cell) {
                    // one line: an open market, or the next one to open
                    val open = list.firstOrNull { it.second }
                    val next = Sessions.next()
                    big(if (open != null) "${open.first} open" else "All closed", if (cell) 15f else bigMax, if (open != null) MINT else DIM)
                    if (open == null && next != null) sub("${next.first} in ${next.second}", DIM) else if (open != null) sub("${list.count { it.second }} of ${list.size} open", DIM)
                } else {
                    v.setViewVisibility(R.id.mid, View.GONE); v.setViewVisibility(R.id.rows, View.VISIBLE)
                    val n = min(list.size, ((hDp - 40) / 24).coerceIn(2, 6))
                    for (i in 0 until 6) {
                        val row = rid("row", i); if (i >= n) { v.setViewVisibility(row, View.GONE); continue }
                        val (nm, isOpen, txt) = list[i]; v.setViewVisibility(row, View.VISIBLE)
                        v.setTextViewText(rid("r", i, "n"), nm); v.setTextViewText(rid("r", i, "v"), txt); v.setTextColor(rid("r", i, "v"), if (isOpen) MINT else MUTE)
                    }
                }
            }
            "budget" -> {
                route = "budget"
                val b = w?.optJSONObject("budget")
                if (b == null) {
                    v.setTextViewText(R.id.label, if (wide) "SPENT THIS MONTH" else "THIS MONTH")
                    big(if (priv) "••••" else Widget.zl(w?.optDouble("month", 0.0) ?: 0.0), bigMax)
                    sub("Tap to set a monthly limit", DIM)
                } else {
                    v.setTextViewText(R.id.label, if (cell || !wide) "BUDGET" else "BUDGET · ${java.time.LocalDate.now().month.getDisplayName(java.time.format.TextStyle.FULL, Locale.ENGLISH).uppercase()}")
                    val over = b.optDouble("monthLeft") < 0
                    big(if (priv) "••••" else "${b.optString("leftTxt")} ${if (over) "over" else "left"}", bigMax, if (over) PINK else WHITE)
                    if (!priv) sub("${b.optInt("daysLeft")} days · " + (if (b.optBoolean("over")) "over today by " else "today ") + b.optString("todayTxt"), if (b.optBoolean("over")) PINK else MINT)
                    if (!short) { val (cw, ch) = chartPx(inner, 8); v.setImageViewBitmap(R.id.chart, bar(b.optDouble("used", 0.0), cw, ch, dens)); v.setViewVisibility(R.id.chart, View.VISIBLE) }
                }
            }
            "alert" -> {
                route = "alerts"
                val n = w?.optJSONObject("next")
                v.setTextViewText(R.id.label, "NEXT ALERT")
                if (n == null) { big("No alerts yet", if (short) 15f else 18f, DIM); sub("Tap to add one", GOLD) }
                else { big(String.format(Locale.US, if (n.optDouble("dist") >= 100) "%.0f%% away" else "%.1f%% away", n.optDouble("dist")), bigMax, GOLD); sub(n.optString("text"), DIM) }
            }
        }
        if (cell && short && kind != "signal") {
            val top: String; val value: String; var col = WHITE
            when (kind) {
                "ticker" -> { val sym = Store.prefs(ctx).getString("w_$id", null) ?: (w?.optJSONArray("watch")?.optJSONObject(0)?.optString("sym") ?: "BTC-USD"); var nm = sym
                    (w?.optJSONArray("watch") ?: JSONArray()).let { a -> for (i in 0 until a.length()) if (a.getJSONObject(i).optString("sym") == sym) nm = a.getJSONObject(i).optString("name") }
                    val pc = quote(ctx, w, sym).second; top = nice(sym, nm); value = if (pc == null) "-" else pct1(pc); col = if ((pc ?: 0.0) >= 0) MINT else PINK }
                "risk" -> { val sc = w?.optJSONObject("risk")?.optInt("score", -1) ?: -1; top = "RISK"; value = if (sc < 0) "-" else if (sc >= 55) "ON" else if (sc <= 45) "OFF" else "MIX"; col = if (sc >= 55) MINT else if (sc in 0..45) PINK else GOLD }
                "markets" -> { val n = Sessions.status(true).count { it.second }; top = "MARKETS"; value = if (n == 0) "Closed" else "$n open"; col = if (n > 0) MINT else DIM }
                "nw" -> { top = "NET WORTH"; value = if (priv) "\u2022\u2022\u2022" else (w?.optString("nwTxt") ?: "-").replace(" ", "") }
                else -> { top = kind.uppercase(); value = "-" }
            }
            v.setViewVisibility(R.id.head, View.GONE); v.setViewVisibility(R.id.chart, View.GONE)
            v.setTextViewText(R.id.big, top); v.setTextColor(R.id.big, DIM); v.setTextViewTextSize(R.id.big, TypedValue.COMPLEX_UNIT_SP, 9.5f)
            v.setViewVisibility(R.id.sub, View.VISIBLE); v.setTextViewText(R.id.sub, value); v.setTextColor(R.id.sub, col)
            v.setTextViewTextSize(R.id.sub, TypedValue.COMPLEX_UNIT_SP, (inner / (max(value.length, 3) * 0.95f)).coerceIn(8f, 18f)); v.setInt(R.id.sub, "setMaxLines", 1)
        }
        if (cell && short && kind == "signal") { v.setViewVisibility(R.id.head, View.GONE); v.setImageViewBitmap(R.id.gauge, gauge((w?.optJSONArray("calls")?.optJSONObject(0)?.optDouble("score", Double.NaN) ?: Double.NaN).let { if (it.isNaN()) null else it }, ((hDp - 14) * dens).toInt(), dens)) }
        if (tall && kind != "watch" && kind != "markets" && !cell) { v.setViewVisibility(R.id.foot, View.VISIBLE); v.setTextViewText(R.id.foot, "Creampie Holdings") }
        if (kind == "ticker" && wDp >= 200 && !short) updatedCorner(ctx, v, id)
        if (kind == "ticker" && !cell) { v.setViewVisibility(R.id.edit, View.VISIBLE); v.setOnClickPendingIntent(R.id.edit, configIntent(ctx, id)) }
        v.setOnClickPendingIntent(R.id.root, open(ctx, route, 9100 + id))
        mgr.updateAppWidget(id, v)
    }
    private val NICE = mapOf("@GC.1" to "Gold", "@SI.1" to "Silver", "@CL.1" to "Oil", "BTC-USD" to "BTC", "ETH-USD" to "ETH", ".SPX" to "S&P", ".IXIC" to "Nasdaq", "EURPLN=" to "EURPLN", "PLN=" to "USDPLN")
    private fun nice(sym: String, name: String) = NICE[sym] ?: if (name.length in 1..7) name else short(sym)
    fun pct1(v: Double) = String.format(Locale.US, "%s%.1f%%", if (v >= 0) "+" else "−", abs(v))
    private fun short(sym: String) = sym.removePrefix(".").removePrefix("@").removeSuffix("-USD").removeSuffix("=").removeSuffix("-GB").removeSuffix(".1").take(6)
    private var pkg = ""
    private var resCtx: Context? = null
    private fun rid(a: String, i: Int, b: String = ""): Int = resCtx!!.resources.getIdentifier("$a$i$b", "id", pkg)


    // ---------- small bitmaps ----------
    fun multiGauge(list: List<JSONObject>, w: Int, h: Int, d: Float): Bitmap {
        val bm = Bitmap.createBitmap(max(w, 20), max(h, 20), Bitmap.Config.ARGB_8888); val c = Canvas(bm)
        val cols = if (list.size > 2) 2 else list.size; val rows = (list.size + cols - 1) / cols
        val cw = bm.width / cols; val chh = bm.height / rows
        val name = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xFFE6E7F2.toInt(); textAlign = Paint.Align.CENTER }
        list.forEachIndexed { i, o ->
            val cx = (i % cols) * cw; val cy = (i / cols) * chh
            val gs = (min(cw, chh) * 0.72f).toInt()
            val sc = o.optDouble("score", Double.NaN)
            c.drawBitmap(gauge(if (sc.isNaN()) null else sc, gs, d), (cx + (cw - gs) / 2).toFloat(), cy.toFloat(), null)
            name.textSize = (chh * 0.13f).coerceIn(9 * d, 15 * d)
            val v = o.optString("v"); name.color = if (v.contains("Buy")) MINT else if (v.contains("Sell")) PINK else if (v.isEmpty()) DIM else GOLD
            c.drawText(nice(o.optString("sym"), o.optString("name")) + if (v.isNotEmpty()) " \u00B7 $v" else "", cx + cw / 2f, cy + gs + name.textSize * 1.1f, name)
        }
        return bm
    }
    fun spark(vals: DoubleArray, w: Int, h: Int, holo: Boolean, d: Float): Bitmap {
        val bm = Bitmap.createBitmap(max(w, 10), max(h, 10), Bitmap.Config.ARGB_8888); val c = Canvas(bm)
        val lo = vals.min(); val hi = vals.max(); val pad = 3 * d
        fun x(i: Int) = i * (bm.width - 1f) / (vals.size - 1)
        fun y(v: Double) = (pad + (1 - (v - lo) / (if (hi > lo) hi - lo else 1.0)) * (bm.height - 2 * pad)).toFloat()
        val path = Path(); path.moveTo(0f, y(vals[0]))
        for (i in 1 until vals.size) { val xm = (x(i - 1) + x(i)) / 2; path.cubicTo(xm, y(vals[i - 1]), xm, y(vals[i]), x(i), y(vals[i])) }
        val fill = Path(path); fill.lineTo(bm.width.toFloat(), bm.height.toFloat()); fill.lineTo(0f, bm.height.toFloat()); fill.close()
        c.drawPath(fill, Paint(Paint.ANTI_ALIAS_FLAG).apply { shader = LinearGradient(0f, 0f, 0f, bm.height.toFloat(), 0x597A5CFF, 0x007A5CFF, Shader.TileMode.CLAMP) })
        c.drawPath(path, Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE; strokeWidth = 2.2f * d; strokeCap = Paint.Cap.ROUND
            shader = if (holo) LinearGradient(0f, 0f, bm.width.toFloat(), 0f, intArrayOf(0xFFFF3CC8.toInt(), 0xFF7A5CFF.toInt(), 0xFF00D2FF.toInt()), null, Shader.TileMode.CLAMP) else null; color = if (holo) WHITE else MINT })
        c.drawCircle(x(vals.size - 1) - 3 * d, y(vals.last()), 3.5f * d, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xFF00D2FF.toInt() })
        return bm
    }
    fun gauge(score: Double?, size: Int, d: Float): Bitmap {
        val bm = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888); val c = Canvas(bm)
        val sw = size * 0.1f; val r = RectF(sw, sw, size - sw, size - sw)
        val base = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE; strokeWidth = sw; strokeCap = Paint.Cap.ROUND; color = 0x14FFFFFF }
        c.drawArc(r, 135f, 270f, false, base)
        if (score != null) {
            val p = Paint(base).apply { color = WHITE
                shader = if (score <= 40) null else SweepGradient(size / 2f, size / 2f, intArrayOf(MINT, GOLD, GOLD, MINT), floatArrayOf(0f, 0.375f, 0.5f, 1f)) }
            if (score <= 40) p.color = PINK
            c.drawArc(r, 135f, (270 * (score / 100)).toFloat().coerceAtLeast(2f), false, p)
        }
        val t = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = WHITE; textSize = size * 0.3f; textAlign = Paint.Align.CENTER; typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD) }
        c.drawText(score?.let { Math.round(it).toString() } ?: "-", size / 2f, size / 2f + t.textSize * 0.35f, t)
        return bm
    }
    fun meter(v: Double, w: Int, h: Int, d: Float): Bitmap {
        val bm = Bitmap.createBitmap(max(w, 10), max(h, 6), Bitmap.Config.ARGB_8888); val c = Canvas(bm)
        val bh = bm.height * 0.45f; val top = (bm.height - bh) / 2
        c.drawRoundRect(RectF(0f, top, bm.width.toFloat(), top + bh), bh, bh, Paint(Paint.ANTI_ALIAS_FLAG).apply { shader = LinearGradient(0f, 0f, bm.width.toFloat(), 0f, intArrayOf(PINK, GOLD, MINT), null, Shader.TileMode.CLAMP) })
        val x = (v.coerceIn(0.0, 1.0) * (bm.width - bm.height) + bm.height / 2).toFloat()
        c.drawCircle(x, bm.height / 2f, bm.height / 2f - 1, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = WHITE })
        return bm
    }
    fun bar(v: Double, w: Int, h: Int, d: Float): Bitmap {
        val bm = Bitmap.createBitmap(max(w, 10), max(h, 4), Bitmap.Config.ARGB_8888); val c = Canvas(bm); val rr = bm.height / 2f
        c.drawRoundRect(RectF(0f, 0f, bm.width.toFloat(), bm.height.toFloat()), rr, rr, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0x14FFFFFF })
        val ww = (v.coerceIn(0.0, 1.0) * bm.width).toFloat()
        if (ww > 1) c.drawRoundRect(RectF(0f, 0f, ww, bm.height.toFloat()), rr, rr, Paint(Paint.ANTI_ALIAS_FLAG).apply { shader = LinearGradient(0f, 0f, max(ww, 1f), 0f, if (v > 0.9) intArrayOf(0xFFFF3CC8.toInt(), PINK) else intArrayOf(0xFF7A5CFF.toInt(), 0xFF00D2FF.toInt()), null, Shader.TileMode.CLAMP) })
        return bm
    }
}

/** Regular trading hours of the main exchanges (holidays not modelled). */
object Sessions {
    private data class Ex(val name: String, val short: String, val tz: String, val open: Int, val close: Int)
    private val EX = listOf(Ex("New York", "NY", "America/New_York", 570, 960), Ex("London", "LDN", "Europe/London", 480, 990), Ex("Frankfurt", "FRA", "Europe/Berlin", 540, 1050),
        Ex("Warsaw", "WAW", "Europe/Warsaw", 540, 1020), Ex("Tokyo", "TKY", "Asia/Tokyo", 540, 930), Ex("Hong Kong", "HK", "Asia/Hong_Kong", 570, 960))
    fun status(short: Boolean = false): List<Triple<String, Boolean, String>> = EX.map { e0 -> val e = if (short) e0.copy(name = e0.short) else e0
        val t = ZonedDateTime.now(ZoneId.of(e.tz)); val m = t.hour * 60 + t.minute
        val weekday = t.dayOfWeek != DayOfWeek.SATURDAY && t.dayOfWeek != DayOfWeek.SUNDAY
        if (weekday && m in e.open until e.close) Triple(e.name, true, if (short) "open" else "open · ${fmt(e.close - m)}")
        else {
            var add = 0; var d = t.dayOfWeek; var mm = m
            for (i in 0..7) { val wd = d != DayOfWeek.SATURDAY && d != DayOfWeek.SUNDAY; if (wd && mm < e.open) { add += e.open - mm; break }; add += 1440 - mm; mm = 0; d = d.plus(1) }
            Triple(e.name, false, if (short) fmt(add) else "opens ${fmt(add)}")
        }
    }
    /** the exchange that opens next and how long until then */
    fun next(): Pair<String, String>? = status(true).filter { !it.second }.minByOrNull { mins(it.third) }?.let { it.first to it.third }
    private fun mins(t: String): Int { var m = 0; Regex("(\\d+)([dhm])").findAll(t).forEach { val n = it.groupValues[1].toInt(); m += when (it.groupValues[2]) { "d" -> n * 1440; "h" -> n * 60; else -> n } }; return m }
    private fun fmt(m: Int) = if (m < 60) "${m}m" else if (m < 1440) "${m / 60}h ${m % 60}m" else "${m / 1440}d ${m % 1440 / 60}h"
}
