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

/** Pick the asset for a Signal or Ticker widget (from your watchlist). */
class WidgetConfig : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val id = intent?.extras?.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID) ?: AppWidgetManager.INVALID_APPWIDGET_ID
        setResult(RESULT_CANCELED, Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id))
        if (id == AppWidgetManager.INVALID_APPWIDGET_ID) { finish(); return }
        val d = resources.displayMetrics.density
        val w = Store.config(this).optJSONObject("widget")
        val items = mutableListOf<Pair<String, String>>()
        val calls = w?.optJSONArray("calls") ?: JSONArray(); for (i in 0 until calls.length()) calls.getJSONObject(i).let { items += it.optString("sym") to it.optString("name") }
        val watch = w?.optJSONArray("watch") ?: JSONArray(); for (i in 0 until watch.length()) watch.getJSONObject(i).let { o -> if (items.none { it.first == o.optString("sym") }) items += o.optString("sym") to o.optString("name") }
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding((20 * d).toInt(), (48 * d).toInt(), (20 * d).toInt(), (20 * d).toInt()); setBackgroundColor(0xFF040407.toInt()) }
        col.addView(TextView(this).apply { text = "Choose an asset"; textSize = 22f; setTextColor(0xFFF4F5FA.toInt()); typeface = Typeface.DEFAULT_BOLD })
        col.addView(TextView(this).apply { text = if (items.isEmpty()) "Open Creampie Holdings once so your watchlist is available here." else "From your watchlist"; textSize = 13f; setTextColor(0xFF6E7190.toInt()); setPadding(0, (6 * d).toInt(), 0, (14 * d).toInt()) })
        for ((sym, name) in items) {
            col.addView(TextView(this).apply {
                text = "$name   ${sym}"; textSize = 16f; setTextColor(0xFFE6E7F2.toInt()); gravity = Gravity.CENTER_VERTICAL
                setPadding((16 * d).toInt(), (14 * d).toInt(), (16 * d).toInt(), (14 * d).toInt())
                background = GradientDrawable().apply { cornerRadius = 14 * d; setColor(0x12FFFFFF); setStroke((1 * d).toInt(), 0x1AFFFFFF) }
                layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { bottomMargin = (8 * d).toInt() }
                setOnClickListener {
                    Store.prefs(this@WidgetConfig).edit().putString("w_$id", sym).apply()
                    WidgetKit.refreshAll(this@WidgetConfig)
                    setResult(RESULT_OK, Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id)); finish()
                }
            })
        }
        setContentView(ScrollView(this).apply { setBackgroundColor(0xFF040407.toInt()); addView(col) })
    }
}
