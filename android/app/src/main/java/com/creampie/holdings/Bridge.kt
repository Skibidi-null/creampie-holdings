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
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONObject

/** Methods the web app calls as window.CPNative.xxx() */
class Bridge(private val act: MainActivity) {
    private val ctx: Context get() = act.applicationContext

    @JavascriptInterface
    fun setConfig(json: String) {
        Store.prefs(ctx).edit().putString("config", json).apply()
        Widget.refresh(ctx)
        // check alerts and refresh widget prices right away (debounced), not only every 15 minutes
        androidx.work.WorkManager.getInstance(ctx).enqueueUniqueWork("alerts-now", androidx.work.ExistingWorkPolicy.REPLACE,
            androidx.work.OneTimeWorkRequestBuilder<AlertWorker>().setInitialDelay(8, java.util.concurrent.TimeUnit.SECONDS)
                .setConstraints(androidx.work.Constraints.Builder().setRequiredNetworkType(androidx.work.NetworkType.CONNECTED).build()).build())
    }

    @JavascriptInterface fun appVersion(): String = Updater.versionName(ctx) + " (" + Updater.versionCode(ctx) + ")"
    @JavascriptInterface fun checkUpdate(manual: Boolean) = Updater.check(ctx, manual)
    @JavascriptInterface fun downloadUpdate() = Updater.download(ctx)
    @JavascriptInterface fun installUpdate() = Updater.install(ctx)
    @JavascriptInterface fun updateLater() = Updater.later(ctx)
    @JavascriptInterface fun openInstallPermission() = Updater.openPermission(ctx)
    @JavascriptInterface fun vibrate(ms: Int) { runCatching { (ctx.getSystemService(android.os.Vibrator::class.java))?.vibrate(android.os.VibrationEffect.createOneShot(ms.toLong().coerceIn(5, 600), android.os.VibrationEffect.DEFAULT_AMPLITUDE)) } }

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

    /**
     * HTTPS request for the Trading 212 API (browsers are blocked by Trading 212's CORS rules).
     * Only demo/live.trading212.com is allowed. Result → window.cpHttp(id, status, body).
     */
    @JavascriptInterface
    fun http(id: String, method: String, url: String, auth: String, body: String) {
        Thread {
            var code = 0
            var text = ""
            try {
                val u = URL(url)
                val okHost = u.protocol == "https" && (u.host == "live.trading212.com" || u.host == "demo.trading212.com")
                val okMethod = method == "GET" || method == "POST" || method == "DELETE"
                if (!okHost || !okMethod) throw IllegalArgumentException("blocked")
                val c = u.openConnection() as HttpURLConnection
                c.requestMethod = method
                c.connectTimeout = 15000; c.readTimeout = 20000
                c.setRequestProperty("Authorization", auth)
                c.setRequestProperty("Accept", "application/json")
                c.setRequestProperty("User-Agent", "CreampieAndroid/2.0")
                if (body.isNotEmpty() && method == "POST") {
                    c.doOutput = true
                    c.setRequestProperty("Content-Type", "application/json")
                    c.outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }
                }
                code = c.responseCode
                val stream = if (code in 200..299) c.inputStream else c.errorStream
                text = stream?.bufferedReader()?.use { it.readText() } ?: ""
                c.disconnect()
            } catch (e: Exception) {
                text = if (e is IllegalArgumentException) "blocked" else (e.message ?: "network error")
            }
            act.runJs("window.cpHttp&&window.cpHttp(${JSONObject.quote(id)},$code,${JSONObject.quote(text)})")
        }.start()
    }

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
