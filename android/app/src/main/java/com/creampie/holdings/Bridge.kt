package com.creampie.holdings

import android.content.ContentValues
import android.content.Context
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.webkit.JavascriptInterface
import android.widget.Toast
import androidx.biometric.BiometricManager
import java.io.File

/** Methods the web app calls as window.CPNative.xxx() */
class Bridge(private val act: MainActivity) {
    private val ctx: Context get() = act.applicationContext

    @JavascriptInterface
    fun setConfig(json: String) {
        Store.prefs(ctx).edit().putString("config", json).apply()
        Widget.refresh(ctx)
    }

    @JavascriptInterface
    fun notify(title: String, body: String) {
        Notifier.send(ctx, Notifier.CH_GOLD, 7001, title, body, "gold")
    }

    @JavascriptInterface
    fun requestNotifications() { act.runOnUiThread { act.askNotificationPermission() } }

    @JavascriptInterface
    fun canBiometric(): Boolean =
        BiometricManager.from(ctx).canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK) == BiometricManager.BIOMETRIC_SUCCESS

    @JavascriptInterface
    fun biometric() { act.runOnUiThread { act.showBiometric() } }

    @JavascriptInterface
    fun saveFile(name: String, mime: String, b64: String) {
        val bytes = Base64.decode(b64, Base64.DEFAULT)
        val ok = try {
            if (Build.VERSION.SDK_INT >= 29) {
                val values = ContentValues().apply {
                    put(MediaStore.Downloads.DISPLAY_NAME, name)
                    put(MediaStore.Downloads.MIME_TYPE, mime)
                    put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Creampie")
                }
                val uri = ctx.contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values) ?: throw Exception("no uri")
                ctx.contentResolver.openOutputStream(uri)!!.use { it.write(bytes) }
            } else {
                val dir = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "Creampie").apply { mkdirs() }
                File(dir, name).writeBytes(bytes)
            }
            true
        } catch (e: Exception) {
            // fall back to app folder
            try { File(ctx.getExternalFilesDir(null), name).writeBytes(bytes); true } catch (_: Exception) { false }
        }
        act.runOnUiThread {
            Toast.makeText(ctx, if (ok) "Saved to Downloads/Creampie/$name" else "Couldn't save the file", Toast.LENGTH_LONG).show()
        }
    }
}
