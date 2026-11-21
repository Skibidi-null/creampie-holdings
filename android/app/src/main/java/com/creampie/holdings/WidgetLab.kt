package com.creampie.holdings

import android.app.Activity
import android.appwidget.AppWidgetHost
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.os.Bundle
import android.util.SizeF
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView

/** TEMPORARY test screen: hosts every widget at the sizes given by extra "sizes" (e.g. "110x110,250x110"). */
class WidgetLab : Activity() {
    private lateinit var host: AppWidgetHost
    override fun onCreate(b: Bundle?) {
        super.onCreate(b)
        host = AppWidgetHost(this, 4242); host.startListening()
        val mgr = AppWidgetManager.getInstance(this); val d = resources.displayMetrics.density
        val kinds = (intent.getStringExtra("kinds") ?: "nw,signal,watch,risk,ticker,markets,budget,alert").split(",")
        val sizes = (intent.getStringExtra("sizes") ?: "110x110").split(",").map { it.split("x").map(String::toInt) }
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setBackgroundColor(0xFF2A2F3A.toInt()); setPadding(16, 60, 16, 16) }
        val cls = mapOf("nw" to NwWidget::class.java, "signal" to SignalWidget::class.java, "watch" to WatchWidget::class.java, "risk" to RiskWidget::class.java, "ticker" to TickerWidget::class.java, "markets" to MarketsWidget::class.java, "budget" to BudgetWidget::class.java, "alert" to AlertWidget::class.java)
        val row = { LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL } }
        var r = row(); var used = 0
        for (k in kinds) for ((w, h) in sizes) {
            val id = host.allocateAppWidgetId(); val cn = ComponentName(this, cls[k]!!)
            if (!mgr.bindAppWidgetIdIfAllowed(id, cn)) { col.addView(TextView(this).apply { text = "bind not allowed: run appwidget grantbind"; setTextColor(-1) }); continue }
            val opts = Bundle().apply { putInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, w); putInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, h); putInt(AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH, w); putInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, h) }
            mgr.updateAppWidgetOptions(id, opts)
            val v = host.createView(this, id, mgr.getAppWidgetInfo(id))
            WidgetKit.render(this, mgr, id, k)
            if (used + w > 380) { col.addView(r); r = row(); used = 0 }
            r.addView(FrameLayout(this).apply { addView(v, FrameLayout.LayoutParams((w * d).toInt(), (h * d).toInt())); setPadding(6, 6, 6, 6) })
            used += w + 4
        }
        col.addView(r)
        setContentView(ScrollView(this).apply { addView(col) })
    }
    override fun onDestroy() { super.onDestroy(); host.stopListening(); host.deleteHost() }
}
