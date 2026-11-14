package com.creampie.holdings

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import java.text.NumberFormat
import java.util.Locale

class Widget : AppWidgetProvider() {
    override fun onUpdate(ctx: Context, mgr: AppWidgetManager, ids: IntArray) = refresh(ctx)

    companion object {
        private val nf: NumberFormat = NumberFormat.getNumberInstance(Locale("pl", "PL")).apply { minimumFractionDigits = 2; maximumFractionDigits = 2 }
        fun zl(v: Double) = nf.format(v).replace(' ', ' ') + " zł"

        private fun open(ctx: Context, where: String, code: Int): PendingIntent {
            val i = Intent(ctx, MainActivity::class.java).apply { putExtra("open", where); flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP }
            return PendingIntent.getActivity(ctx, code, i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        }

        fun refresh(ctx: Context) {
            val mgr = AppWidgetManager.getInstance(ctx)
            val ids = mgr.getAppWidgetIds(ComponentName(ctx, Widget::class.java))
            if (ids.isEmpty()) return
            val cfg = Store.config(ctx)
            val w = cfg.optJSONObject("widget")
            val prefs = Store.prefs(ctx)
            val gold = prefs.getFloat("lastPrice", 0f).toDouble().takeIf { it > 0 } ?: w?.optDouble("gold", 0.0) ?: 0.0
            val ref = prefs.getFloat("refPrice", 0f).toDouble()
            val priv = w?.optBoolean("privacy", false) == true
            val v = RemoteViews(ctx.packageName, R.layout.widget)
            if (w != null && !w.isNull("left")) {
                val left = w.optDouble("left")
                v.setTextViewText(R.id.left_label, if (left >= 0) "Left to spend today" else "Over today by")
                v.setTextViewText(R.id.left, if (priv) "••••" else zl(kotlin.math.abs(left)))
                v.setTextColor(R.id.left, if (left >= 0) 0xFF1D1D1B.toInt() else 0xFFC2392F.toInt())
                v.setTextViewText(R.id.today, if (priv) "" else "Spent today: ${zl(w.optDouble("today", 0.0))}")
            } else {
                v.setTextViewText(R.id.left_label, "Spent this month")
                v.setTextViewText(R.id.left, if (priv || w == null) "••••" else zl(w.optDouble("month", 0.0)))
                v.setTextViewText(R.id.today, "Set a monthly limit for a daily one")
            }
            v.setTextViewText(R.id.gold, if (gold > 0) nf.format(gold).replace(' ', ' ') else "…")
            if (gold > 0 && ref > 0) {
                val pct = (gold - ref) / ref * 100
                v.setTextViewText(R.id.goldchg, String.format(Locale.US, "%s %.2f%%", if (pct >= 0) "▲" else "▼", kotlin.math.abs(pct)))
                v.setTextColor(R.id.goldchg, if (pct >= 0) 0xFF1E8A55.toInt() else 0xFFC2392F.toInt())
            }
            v.setOnClickPendingIntent(R.id.root, open(ctx, "home", 9001))
            v.setOnClickPendingIntent(R.id.goldbox, open(ctx, "gold", 9002))
            v.setOnClickPendingIntent(R.id.add, open(ctx, "add", 9003))
            mgr.updateAppWidget(ids, v)
        }
    }
}
