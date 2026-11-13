package com.creampie.holdings

import android.content.Context
import org.json.JSONObject

object Store {
    fun prefs(ctx: Context) = ctx.getSharedPreferences("cp", Context.MODE_PRIVATE)
    fun config(ctx: Context): JSONObject = try { JSONObject(prefs(ctx).getString("config", "{}")!!) } catch (_: Exception) { JSONObject() }
}
