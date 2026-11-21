package com.creampie.holdings

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageInstaller
import android.net.Uri
import android.os.Build
import androidx.core.content.FileProvider
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest

/**
 * In-app updates (same idea as Barakah): version.json + APK on GitHub Pages under android/.
 * The web app shows the HOLO update sheet; this object checks, downloads with progress,
 * verifies the SHA-256 and installs (same signing key, so all data stays).
 * State goes to the page as window.cpUpdate({state, ...}).
 */
object Updater {
    const val URL_JSON = SITE + "android/version.json"
    private const val SIX_HOURS = 6 * 3600_000L
    data class Info(val code: Int, val name: String, val url: String, val sha: String, val size: Long, val notes: String)
    @Volatile var info: Info? = null
    @Volatile var file: File? = null
    var emit: (JSONObject) -> Unit = {}

    private fun prefs(ctx: Context) = ctx.getSharedPreferences("update", Context.MODE_PRIVATE)
    fun versionCode(ctx: Context): Int = runCatching { if (Build.VERSION.SDK_INT >= 28) ctx.packageManager.getPackageInfo(ctx.packageName, 0).longVersionCode.toInt() else @Suppress("DEPRECATION") ctx.packageManager.getPackageInfo(ctx.packageName, 0).versionCode }.getOrDefault(0)
    fun versionName(ctx: Context): String = runCatching { ctx.packageManager.getPackageInfo(ctx.packageName, 0).versionName ?: "" }.getOrDefault("")
    private fun url(ctx: Context): String = runCatching { File(ctx.getExternalFilesDir(null), "update_url.txt").takeIf { it.exists() }?.readText()?.trim()?.takeIf { it.startsWith("http") } }.getOrNull() ?: URL_JSON
    private fun send(state: String, extra: JSONObject.() -> Unit = {}) = emit(JSONObject().put("state", state).apply(extra))

    /** On open (at most every 6 h) or when asked from Settings. */
    fun check(ctx: Context, manual: Boolean) = Thread {
        val p = prefs(ctx)
        if (!manual && System.currentTimeMillis() - p.getLong("last", 0) < SIX_HOURS) return@Thread
        if (manual) send("checking")
        val i = runCatching {
            val c = URL(url(ctx)).openConnection() as HttpURLConnection
            c.connectTimeout = 8000; c.readTimeout = 8000; c.useCaches = false; c.setRequestProperty("Cache-Control", "no-cache")
            try { if (c.responseCode != 200) null else JSONObject(c.inputStream.bufferedReader().readText()).let { o -> Info(o.getInt("versionCode"), o.optString("versionName"), o.getString("url"), o.optString("sha256").lowercase(), o.optLong("size", 0), o.optString("notes")) } } finally { c.disconnect() }
        }.getOrNull()
        p.edit().putLong("last", System.currentTimeMillis()).apply()
        when {
            i == null -> if (manual) send("failed") { put("message", "Could not check for updates. Check your internet connection.") }
            i.code > versionCode(ctx) -> { info = i; if (manual || p.getInt("later", 0) != i.code) send("available") { put("version", i.name).put("notes", i.notes).put("size", i.size) } }
            else -> if (manual) send("uptodate") { put("version", versionName(ctx)) }
        }
    }.start()

    fun later(ctx: Context) { info?.let { prefs(ctx).edit().putInt("later", it.code).apply() } }

    fun download(ctx: Context) = Thread {
        val i = info ?: return@Thread
        val f = File(File(ctx.cacheDir, "update").apply { mkdirs() }, "CreampieHoldings-${i.code}.apk")
        val ok = runCatching {
            f.parentFile?.listFiles()?.filter { it != f }?.forEach { it.delete() }
            if (i.size > 0 && f.length() > i.size) f.delete()
            if (!(i.size > 0 && f.length() == i.size)) {
                val have = f.length()
                val c = URL(i.url).openConnection() as HttpURLConnection
                c.connectTimeout = 15000; c.readTimeout = 20000
                if (have > 0) c.setRequestProperty("Range", "bytes=$have-")
                try {
                    val code = c.responseCode; require(code == 200 || code == 206) { "HTTP $code" }
                    val append = code == 206; val total = if (i.size > 0) i.size else c.contentLengthLong + (if (append) have else 0)
                    var done = if (append) have else 0L; var last = 0L
                    c.inputStream.use { inp -> FileOutputStream(f, append).use { out -> val buf = ByteArray(64 * 1024)
                        while (true) { val r = inp.read(buf); if (r < 0) break; out.write(buf, 0, r); done += r
                            if (total > 0 && done - last > 96 * 1024) { last = done; send("downloading") { put("progress", done.toDouble() / total) } } } } }
                } finally { c.disconnect() }
            }
            if (i.sha.isNotBlank()) {
                val md = MessageDigest.getInstance("SHA-256"); f.inputStream().use { s -> val b = ByteArray(64 * 1024); while (true) { val r = s.read(b); if (r < 0) break; md.update(b, 0, r) } }
                if (md.digest().joinToString("") { "%02x".format(it) } != i.sha) { f.delete(); error("checksum") }
            }
            true
        }.getOrElse { e -> send("failed") { put("message", if (e.message == "checksum") "The download was damaged. Please try again." else "Download stopped. Check your internet connection and try again.") }; false }
        if (ok) { file = f; install(ctx) }
    }.start()

    fun canInstall(ctx: Context) = Build.VERSION.SDK_INT < 26 || ctx.packageManager.canRequestPackageInstalls()
    fun openPermission(ctx: Context) { runCatching { ctx.startActivity(Intent(android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:${ctx.packageName}")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) } }
    fun onResume(ctx: Context) { if (file != null && info != null && canInstall(ctx) && prefs(ctx).getBoolean("waitPerm", false)) { prefs(ctx).edit().putBoolean("waitPerm", false).apply(); install(ctx) } }

    fun install(ctx: Context) {
        val f = file ?: return
        if (!canInstall(ctx)) { prefs(ctx).edit().putBoolean("waitPerm", true).apply(); send("permission"); return }
        send("installing")
        val ok = runCatching {
            val pi = ctx.packageManager.packageInstaller
            val params = PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL)
            params.setAppPackageName(ctx.packageName)
            if (Build.VERSION.SDK_INT >= 31) params.setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_NOT_REQUIRED)
            params.setSize(f.length())
            val id = pi.createSession(params)
            pi.openSession(id).use { s ->
                f.inputStream().use { inp -> s.openWrite("base.apk", 0, f.length()).use { out -> inp.copyTo(out); s.fsync(out) } }
                val flags = PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= 31) PendingIntent.FLAG_MUTABLE else 0)
                s.commit(PendingIntent.getBroadcast(ctx, 7700, Intent(ctx, InstallReceiver::class.java).setPackage(ctx.packageName), flags).intentSender)
            }
        }.isSuccess
        if (!ok) runCatching {
            val uri = FileProvider.getUriForFile(ctx, "${ctx.packageName}.files", f)
            ctx.startActivity(Intent(Intent.ACTION_VIEW).setDataAndType(uri, "application/vnd.android.package-archive").addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK))
        }.onFailure { send("failed") { put("message", "Could not open the installer.") } }
    }

    internal fun result(ctx: Context, intent: Intent) {
        when (intent.getIntExtra(PackageInstaller.EXTRA_STATUS, PackageInstaller.STATUS_FAILURE)) {
            PackageInstaller.STATUS_PENDING_USER_ACTION -> { @Suppress("DEPRECATION") val c = intent.getParcelableExtra<Intent>(Intent.EXTRA_INTENT); if (c != null) runCatching { ctx.startActivity(c.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) } }
            PackageInstaller.STATUS_SUCCESS -> send("done")
            PackageInstaller.STATUS_FAILURE_ABORTED -> send("available") { put("version", info?.name ?: "") }
            else -> send("failed") { put("message", "The update could not be installed." + (intent.getStringExtra(PackageInstaller.EXTRA_STATUS_MESSAGE)?.let { " ($it)" } ?: "")) }
        }
    }
}
class InstallReceiver : BroadcastReceiver() { override fun onReceive(ctx: Context, intent: Intent) = Updater.result(ctx, intent) }
