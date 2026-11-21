package com.creampie.holdings

import android.content.Context
import java.text.NumberFormat
import java.util.Locale

/** The original widget (v1). Kept so widgets already on the home screen keep working; it now shows the HOLO budget card. */
class Widget : HoloWidget("budget") {
    companion object {
        private val nf: NumberFormat = NumberFormat.getNumberInstance(Locale("pl", "PL")).apply { minimumFractionDigits = 2; maximumFractionDigits = 2 }
        fun zl(v: Double) = nf.format(v).replace(' ', ' ') + " zł"
        fun refresh(ctx: Context) = WidgetKit.refreshAll(ctx)
    }
}
