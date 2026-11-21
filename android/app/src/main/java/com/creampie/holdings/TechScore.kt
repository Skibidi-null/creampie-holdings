package com.creampie.holdings

import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

/**
 * The advisor's technical score (0-100) for background signal alerts. Same rules and weights as
 * web/src/score.js (moving averages, golden/death cross, timeframes, RSI, MACD, rate of change,
 * Bollinger, 52-week range, breakout, volume, accumulation), evaluated on the latest daily bar.
 */
object TechScore {
    class Bar(val high: Double, val low: Double, val close: Double, val volume: Double)

    private fun sma(x: DoubleArray, n: Int): Array<Double?> { val o = arrayOfNulls<Double>(x.size); var s = 0.0; for (i in x.indices) { s += x[i]; if (i >= n) s -= x[i - n]; if (i >= n - 1) o[i] = s / n }; return o }
    private fun ema(x: DoubleArray, n: Int): Array<Double?> { val o = arrayOfNulls<Double>(x.size); val k = 2.0 / (n + 1); var e = 0.0; var s = 0.0
        for (i in x.indices) { if (i < n) { s += x[i]; if (i == n - 1) { e = s / n; o[i] = e }; continue }; e = x[i] * k + e * (1 - k); o[i] = e }; return o }
    private fun rsi(x: DoubleArray, n: Int = 14): Array<Double?> { val o = arrayOfNulls<Double>(x.size); var g = 0.0; var l = 0.0
        for (i in 1 until x.size) { val d = x[i] - x[i - 1]; val up = max(d, 0.0); val dn = max(-d, 0.0)
            if (i <= n) { g += up; l += dn; if (i == n) { g /= n; l /= n; o[i] = if (l == 0.0) 100.0 else 100 - 100 / (1 + g / l) }; continue }
            g = (g * (n - 1) + up) / n; l = (l * (n - 1) + dn) / n; o[i] = if (l == 0.0) 100.0 else 100 - 100 / (1 + g / l) }
        return o }

    fun score(b: List<Bar>): Int? {
        val n = b.size; if (n < 230) return null
        val c = DoubleArray(n) { b[it].close }; val i = n - 1; val px = c[i]
        val ma20 = sma(c, 20); val ma50 = sma(c, 50); val ma200 = sma(c, 200); val r = rsi(c)
        val e12 = ema(c, 12); val e26 = ema(c, 26)
        val line = DoubleArray(n) { if (e12[it] != null && e26[it] != null) e12[it]!! - e26[it]!! else Double.NaN }
        val st = line.indexOfFirst { !it.isNaN() }; val sig = ema(line.copyOfRange(st, n), 9)
        fun hist(k: Int): Double? { val s = sig.getOrNull(k - st); return if (k >= st && s != null) line[k] - s else null }
        // ATR (Wilder)
        var a = 0.0; var s0 = 0.0
        for (k in 0 until n) { val pc = if (k > 0) c[k - 1] else c[k]; val tr = maxOf(b[k].high - b[k].low, abs(b[k].high - pc), abs(b[k].low - pc)); if (k < 14) { s0 += tr; if (k == 13) a = s0 / 14 } else a = (a * 13 + tr) / 14 }
        var sum = 0.0; var w = 0.0
        fun add(v: Double, wt: Double) { sum += v.coerceIn(-1.0, 1.0) * wt; w += wt }
        // moving averages
        run { val ms = listOfNotNull(ma20[i], ma50[i], ma200[i]); if (ma50[i] != null) add(ms.count { px > it }.toDouble() / ms.size * 2 - 1, 2.0) }
        // golden / death cross
        if (ma200[i] != null && ma200[i - 20] != null) { val now = ma50[i]!! > ma200[i]!!; var crossed = false
            for (k in i - 19..i) if ((ma50[k]!! > ma200[k]!!) != (ma50[k - 1]!! > ma200[k - 1]!!)) crossed = true
            add(if (crossed) (if (now) 1.0 else -1.0) else if (now) 0.4 else -0.4, 1.0) }
        // timeframes
        if (ma200[i] != null) { val k = listOf(px > ma20[i]!!, px > ma50[i]!!, px > ma200[i]!!).count { it }; add(k / 3.0 * 2 - 1, 1.5) }
        // RSI
        run { val rv = r[i]; val r5 = r[i - 5]; if (rv != null && r5 != null) add(when { rv >= 75 -> -0.7; rv >= 68 -> -0.3; rv <= 25 -> 0.7; rv <= 32 -> 0.35; rv >= 50 -> if (rv > r5) 0.45 else 0.15; else -> if (rv < r5) -0.45 else -0.15 }, 1.2) }
        // MACD
        run { val h = hist(i); val h1 = hist(i - 1); val h3 = hist(i - 3); if (h != null && h1 != null && h3 != null) add(when { h > 0 && h1 <= 0 -> 0.9; h < 0 && h1 >= 0 -> -0.9; h > 0 -> if (h > h3) 0.6 else 0.25; else -> if (h < h3) -0.6 else -0.25 }, 1.0) }
        // rate of change
        if (i >= 60 && a > 0) { val r20 = (c[i] / c[i - 20] - 1) * 100; val r60 = (c[i] / c[i - 60] - 1) * 100; val dv = a / c[i] * 100 * sqrt(20.0); add(r20 / dv * 0.6 + r60 / (dv * 1.7) * 0.4, 1.0) }
        // Bollinger
        run { val m = ma20[i]; if (m != null) { var v = 0.0; for (k in i - 19..i) v += (c[k] - m) * (c[k] - m); val sd = sqrt(v / 20); val up = m + 2 * sd; val lo = m - 2 * sd
            val pb = (px - lo) / (if (up - lo == 0.0) 1.0 else up - lo); add(if (pb > 1.05) -0.5 else if (pb < -0.05) 0.5 else (pb - 0.5) * 0.4, 0.8) } }
        // 52-week range
        if (i >= 200) { var hi = -1e18; var lo = 1e18; for (k in max(0, i - 251)..i) { hi = max(hi, c[k]); lo = min(lo, c[k]) }
            val fromHi = (px / hi - 1) * 100; val pos = (px - lo) / (if (hi - lo == 0.0) 1.0 else hi - lo); add(if (fromHi > -2) 0.5 else if (fromHi < -35) -0.5 else (pos - 0.5) * 0.6, 1.0) }
        // breakout
        if (i >= 60) { var hi = -1e18; var lo = 1e18; for (k in max(0, i - 55)..i - 1) { hi = max(hi, b[k].high); lo = min(lo, b[k].low) }; add(if (px > hi) 1.0 else if (px < lo) -1.0 else 0.0, 1.2) }
        // volume + accumulation
        val hasVol = (n - 60 until n).count { b[it].volume > 0 } > 40
        if (hasVol) {
            var avg = 0.0; for (k in i - 20 until i) avg += b[k].volume; avg /= 20
            if (avg > 0) { val rel = b[i].volume / avg; add(if (rel >= 1.6) (if (c[i] >= c[i - 1]) 0.7 else -0.7) else 0.0, 0.8) }
            var ad = 0.0; var tot = 0.0
            for (k in i - 19..i) { val rg = b[k].high - b[k].low; val mfm = if (rg > 0) ((b[k].close - b[k].low) - (b[k].high - b[k].close)) / rg else 0.0; ad += mfm * b[k].volume; tot += b[k].volume }
            if (tot > 0) add(ad / tot * 3, 0.8)
        }
        return if (w > 0) Math.round(50 + sum / w * 50).toInt() else null
    }
}
