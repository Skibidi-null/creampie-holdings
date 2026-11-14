package com.creampie.holdings

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.fragment.app.FragmentActivity

class MainActivity : FragmentActivity() {
    private lateinit var web: WebView
    private var fileCallback: ValueCallback<Array<Uri>>? = null
    private var loaded = false

    private val pickFile = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        fileCallback?.onReceiveValue(if (uri != null) arrayOf(uri) else null)
        fileCallback = null
    }
    private val notifPerm = registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowCompat.getInsetsController(window, window.decorView).apply {
            isAppearanceLightStatusBars = false
            isAppearanceLightNavigationBars = false
        }
        val root = FrameLayout(this).apply { setBackgroundColor(0xFFF4F4F1.toInt()) }
        web = WebView(this).apply {
            setBackgroundColor(0xFFF4F4F1.toInt())
            layoutParams = FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
            overScrollMode = WebView.OVER_SCROLL_NEVER
            isVerticalScrollBarEnabled = false
        }
        root.addView(web)
        setContentView(root)
        ViewCompat.setOnApplyWindowInsetsListener(root) { v, insets ->
            val b = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
            val ime = insets.getInsets(WindowInsetsCompat.Type.ime())
            v.setPadding(b.left, b.top, b.right, maxOf(b.bottom, ime.bottom))
            WindowInsetsCompat.CONSUMED
        }

        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT
            mediaPlaybackRequiresUserGesture = true
            allowFileAccess = false
            setSupportZoom(false)
            textZoom = 100
            userAgentString = "$userAgentString CreampieAndroid/1.0"
        }
        web.addJavascriptInterface(Bridge(this), "CPNative")
        web.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, req: WebResourceRequest): Boolean {
                val u = req.url.toString()
                if (u.startsWith(SITE)) return false
                try { startActivity(Intent(Intent.ACTION_VIEW, req.url)) } catch (_: Exception) {}
                return true
            }
            override fun onPageFinished(view: WebView, url: String) {
                if (url.startsWith(SITE)) loaded = true
            }
            override fun onReceivedError(view: WebView, req: WebResourceRequest, err: WebResourceError) {
                if (req.isForMainFrame && !loaded) showOffline()
            }
        }
        web.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(v: WebView, cb: ValueCallback<Array<Uri>>, p: FileChooserParams): Boolean {
                fileCallback?.onReceiveValue(null)
                fileCallback = cb
                pickFile.launch("*/*")
                return true
            }
        }
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                val js = "(function(){var h=(location.hash||'#/home').split('/')[1]||'home';if(history.state&&history.state.sheet)return 'back';if(['home','activity','gold','wealth'].indexOf(h)<0)return 'back';return h==='home'?'exit':'home';})()"
                web.evaluateJavascript(js) { r ->
                    when {
                        r.contains("exit") -> finish()
                        r.contains("home") -> web.evaluateJavascript("location.replace('#/home')", null)
                        r.contains("back") -> web.evaluateJavascript("history.back()", null)
                        else -> finish()
                    }
                }
            }
        })

        if (savedInstanceState != null) web.restoreState(savedInstanceState)
        else web.loadUrl(SITE + hashFor(intent))
        (application as App).schedule()
        askNotificationPermission()
    }

    private fun hashFor(i: Intent?): String = when (val o = i?.getStringExtra("open")) {
        null -> "#/home"
        else -> "#/$o"
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        val o = intent.getStringExtra("open") ?: return
        if (loaded) web.evaluateJavascript("window.cpOpen && window.cpOpen('$o')", null)
        else web.loadUrl(SITE + "#/$o")
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        web.saveState(outState)
    }

    override fun onPause() {
        super.onPause()
        web.evaluateJavascript("try{window.dispatchEvent(new Event('pagehide'))}catch(e){}", null)
        Widget.refresh(this)
    }

    fun askNotificationPermission() {
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            notifPerm.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    fun showBiometric() {
        if (BiometricManager.from(this).canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK) != BiometricManager.BIOMETRIC_SUCCESS) return
        val prompt = BiometricPrompt(this, ContextCompat.getMainExecutor(this), object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                web.evaluateJavascript("window.cpBio && window.cpBio(true)", null)
            }
        })
        prompt.authenticate(BiometricPrompt.PromptInfo.Builder()
            .setTitle("Creampie Holdings")
            .setSubtitle("Touch to get in")
            .setNegativeButtonText("Use PIN")
            .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_WEAK)
            .build())
    }

    private fun showOffline() {
        val html = """<html><body style="background:#f4f4f1;color:#1d1d1b;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:24px">
            <div style="font-size:54px">🔌</div><h2 style="color:#ff7ab8">No connection</h2>
            <p style="color:#b49bb5">Creampie needs the internet the very first time it opens. After that it works offline.</p>
            <button onclick="location.href='$SITE#/home'" style="margin-top:12px;background:#1f6b57;color:#fff;border:0;border-radius:14px;padding:14px 26px;font-size:16px">Try again</button></body></html>"""
        web.loadDataWithBaseURL(SITE, html, "text/html", "utf-8", null)
    }
}
