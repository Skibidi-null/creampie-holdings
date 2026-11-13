# JavaScript bridge methods are called by name from the web app
-keepclassmembers class com.creampie.holdings.Bridge {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface
