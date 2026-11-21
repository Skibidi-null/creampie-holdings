package com.creampie.holdings

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.Intent
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import org.json.JSONArray

/** Choose what a widget shows. Signal: 1 to 4 assets. Watchlist: any assets, in the order you tap them. Ticker: one asset. */
class WidgetConfig : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val id = intent?.extras?.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID) ?: AppWidgetManager.INVALID_APPWIDGET_ID
        setResult(RESULT_CANCELED, Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id))
        if (id == AppWidgetManager.INVALID_APPWIDGET_ID) { finish(); return }
        val provider = AppWidgetManager.getInstance(this).getAppWidgetInfo(id)?.provider?.className ?: ""
        val kind = when { provider.endsWith("SignalWidget") -> "signal"; provider.endsWith("WatchWidget") -> "watch"; else -> "ticker" }
        val maxPick = when (kind) { "signal" -> 4; "watch" -> 10; else -> 1 }
        val d = resources.displayMetrics.density
        val w = Store.config(this).optJSONObject("widget")
        val items = LinkedHashMap<String, String>()
        val scored = HashSet<String>()
        val calls = w?.optJSONArray("calls") ?: JSONArray(); for (i in 0 until calls.length()) calls.getJSONObject(i).let { items[it.optString("sym")] = it.optString("name"); scored += it.optString("sym") }
        val watch = w?.optJSONArray("watch") ?: JSONArray(); for (i in 0 until watch.length()) watch.getJSONObject(i).let { items.putIfAbsent(it.optString("sym"), it.optString("name")) }
        if (kind != "signal") for ((k, v) in WidgetKit.EXTRA_NAMES) items.putIfAbsent(k, v)
        val picked = (Store.prefs(this).getString("w_$id", null) ?: "").split(",").filter { it.isNotBlank() && items.containsKey(it) }.toMutableList()
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding((20 * d).toInt(), (44 * d).toInt(), (20 * d).toInt(), (20 * d).toInt()); setBackgroundColor(0xFF040407.toInt()) }
        col.addView(TextView(this).apply { text = when (kind) { "signal" -> "Choose up to 4 signals"; "watch" -> "Choose your widget list"; else -> "Choose an asset" }; textSize = 22f; setTextColor(0xFFF4F5FA.toInt()); typeface = Typeface.DEFAULT_BOLD })
        col.addView(TextView(this).apply { text = if (items.isEmpty()) "Open Creampie Holdings once so your assets are available here." else if (kind == "signal") "Scored assets from your watchlist. Add more in the app's Markets tab." else if (kind == "watch") "Tap in the order you want them shown. Tap again to remove." else "Any watched asset"; textSize = 13f; setTextColor(0xFF6E7190.toInt()); setPadding(0, (6 * d).toInt(), 0, (14 * d).toInt()) })
        val views = HashMap<String, TextView>()
        fun paint() { for ((sym, tv) in views) { val k = picked.indexOf(sym); val on = k >= 0
            tv.text = (if (maxPick > 1 && on) "${k + 1}.  " else "") + (items[sym] ?: sym) + "   " + sym + if (kind == "signal" && sym !in scored) "  (no score yet)" else ""
            tv.background = GradientDrawable().apply { cornerRadius = 14 * d; setColor(if (on) 0x337A5CFF else 0x12FFFFFF); setStroke((1 * d).toInt(), if (on) 0xAAA794FF.toInt() else 0x1AFFFFFF) } } }
        fun save() {
            Store.prefs(this).edit().putString("w_$id", picked.joinToString(",")).apply()
            WidgetKit.refreshAll(this)
            androidx.work.WorkManager.getInstance(this).enqueueUniqueWork("alerts-now", androidx.work.ExistingWorkPolicy.REPLACE, androidx.work.OneTimeWorkRequestBuilder<AlertWorker>().build())
            setResult(RESULT_OK, Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id)); finish()
        }
        for ((sym, _) in items) {
            val tv = TextView(this).apply {
                textSize = 16f; setTextColor(0xFFE6E7F2.toInt()); gravity = Gravity.CENTER_VERTICAL
                setPadding((16 * d).toInt(), (14 * d).toInt(), (16 * d).toInt(), (14 * d).toInt())
                layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { bottomMargin = (8 * d).toInt() }
                setOnClickListener {
                    if (maxPick == 1) { picked.clear(); picked += sym; save(); return@setOnClickListener }
                    if (sym in picked) picked.remove(sym) else if (picked.size < maxPick) picked += sym
                    paint()
                }
            }
            views[sym] = tv; col.addView(tv)
        }
        paint()
        if (maxPick > 1) col.addView(TextView(this).apply {
            text = "Save"; textSize = 17f; setTextColor(0xFFFFFFFF.toInt()); gravity = Gravity.CENTER; typeface = Typeface.DEFAULT_BOLD
            setPadding(0, (16 * d).toInt(), 0, (16 * d).toInt())
            background = GradientDrawable(GradientDrawable.Orientation.LEFT_RIGHT, intArrayOf(0xFFFF3CC8.toInt(), 0xFF7A5CFF.toInt(), 0xFF00D2FF.toInt())).apply { cornerRadius = 18 * d }
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { topMargin = (10 * d).toInt() }
            setOnClickListener { save() }
        })
        setContentView(ScrollView(this).apply { setBackgroundColor(0xFF040407.toInt()); addView(col) })
    }
}
