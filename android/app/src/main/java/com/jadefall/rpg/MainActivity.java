package com.jadefall.rpg;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
  @Override public void onCreate(Bundle b){ super.onCreate(b); requestWindowFeature(Window.FEATURE_NO_TITLE); getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,WindowManager.LayoutParams.FLAG_FULLSCREEN); WebView w=new WebView(this); w.setWebViewClient(new WebViewClient()); WebSettings s=w.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setAllowFileAccess(true); s.setMediaPlaybackRequiresUserGesture(false); w.setOverScrollMode(WebView.OVER_SCROLL_NEVER); w.loadUrl("file:///android_asset/www/index.html"); setContentView(w); }
}
