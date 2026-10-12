package cloud.softproit.callingbird;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.text.TextUtils;
import android.util.Base64;
import android.util.SparseArray;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.MimeTypeMap;
import android.webkit.PermissionRequest;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.window.OnBackInvokedDispatcher;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.core.content.FileProvider;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Full-screen WebView that browses WEB_URL. Bridges the browser features the
 * front-end uses: microphone (audio recording), camera + file picker (image/audio/
 * Excel uploads), blob downloads (students export) and printing.
 */
public class MainActivity extends Activity implements WebBridge.Host {

    private static final int REQUEST_FILE_CHOOSER = 1;

    /** Injected after every page load; see WebBridge for the native side. */
    private static final String INJECTED_JS = "(function(){"
            + "if(window.__callingBirdApp)return;window.__callingBirdApp=true;"
            + "var app=window." + WebBridge.NAME + ";if(!app)return;"
            // Keep blob URLs alive long enough for us to read them after the page revokes them.
            + "var revoke=URL.revokeObjectURL.bind(URL);URL.revokeObjectURL=function(u){setTimeout(function(){revoke(u);},60000);};"
            + "function save(href,name){fetch(href).then(function(r){return r.blob();}).then(function(b){"
            + "var fr=new FileReader();fr.onloadend=function(){app.saveDataUrl(String(fr.result),name||'',b.type||'');};fr.readAsDataURL(b);"
            + "}).catch(function(e){app.downloadFailed(String(e));});}"
            + "function handle(a){var h=a.href||'';if(h.indexOf('blob:')===0||h.indexOf('data:')===0){save(h,a.getAttribute('download'));return true;}return false;}"
            + "document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[download]');"
            + "if(a&&handle(a)){e.preventDefault();e.stopImmediatePropagation();}},true);"
            + "var click=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){"
            + "if(!this.isConnected&&this.hasAttribute('download')&&handle(this))return;return click.apply(this,arguments);};"
            // printDiv() in front-end/src/main.js opens a blank window, writes HTML and prints it.
            + "window.print=function(){app.printPage();};"
            + "var open=window.open;window.open=function(url){if(!url||url==='about:blank'){var html='';var w={closed:false,"
            + "document:{open:function(){html='';},write:function(){html+=Array.prototype.join.call(arguments,'');},"
            + "writeln:function(){html+=Array.prototype.join.call(arguments,'')+'\\n';},close:function(){}},"
            + "focus:function(){},print:function(){app.printHtml(html);},close:function(){w.closed=true;}};return w;}"
            + "return open.apply(window,arguments);};"
            + "})();";

    private WebView webView;
    private ProgressBar progress;
    private View errorView;
    private TextView errorMessage;

    private String startUrl;
    private String appHost;

    private ValueCallback<Uri[]> filePathCallback;
    private Uri cameraOutputUri;
    private WebView printWebView;

    private final SparseArray<Runnable> permissionCallbacks = new SparseArray<>();
    private int nextPermissionRequestCode = 100;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        startUrl = AppConfig.getWebUrl(this);
        if (startUrl == null) {
            openSetup();
            return;
        }
        appHost = AppConfig.getHost(this);

        setContentView(R.layout.activity_main);
        AppConfig.applySystemInsets(findViewById(android.R.id.content));

        webView = findViewById(R.id.webview);
        progress = findViewById(R.id.progress);
        errorView = findViewById(R.id.error_view);
        errorMessage = findViewById(R.id.error_message);
        Button retry = findViewById(R.id.retry_button);
        Button changeServer = findViewById(R.id.change_server_button);

        retry.setOnClickListener(v -> {
            errorView.setVisibility(View.GONE);
            String current = webView.getUrl();
            webView.loadUrl(current == null || current.startsWith("data:") || current.startsWith("about:") ? startUrl : current);
        });
        changeServer.setVisibility(AppConfig.needsSubdomain() ? View.VISIBLE : View.GONE);
        changeServer.setOnClickListener(v -> openSetup());

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        cookies.setAcceptThirdPartyCookies(webView, true);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false); // announcements autoplay audio
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setSupportZoom(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setSupportMultipleWindows(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        s.setUserAgentString(s.getUserAgentString() + " CallingBirdApp/" + BuildConfig.VERSION_NAME);

        webView.addJavascriptInterface(new WebBridge(this), WebBridge.NAME);
        webView.setWebViewClient(new AppWebViewClient());
        webView.setWebChromeClient(new AppChromeClient());
        webView.setDownloadListener(this::onDownload);

        registerBackHandler();

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(startUrl);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) webView.saveState(outState);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
    }

    @Override
    protected void onPause() {
        if (webView != null) webView.onPause();
        CookieManager.getInstance().flush();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.removeJavascriptInterface(WebBridge.NAME);
            webView.destroy();
        }
        super.onDestroy();
    }

    private void openSetup() {
        Intent intent = new Intent(this, SetupActivity.class);
        intent.putExtra(SetupActivity.EXTRA_CHANGE, true);
        startActivity(intent);
        finish();
    }

    private boolean isAppUrl(Uri uri) {
        String scheme = uri.getScheme();
        return ("https".equalsIgnoreCase(scheme) || "http".equalsIgnoreCase(scheme))
                && appHost != null && appHost.equalsIgnoreCase(uri.getHost());
    }

    // ---------------------------------------------------------------- Back navigation

    private void registerBackHandler() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        }
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        handleBack();
    }

    private void handleBack() {
        if (errorView.getVisibility() != View.VISIBLE && webView.canGoBack()) {
            webView.goBack();
            return;
        }
        AlertDialog.Builder dialog = new AlertDialog.Builder(this)
                .setTitle(R.string.exit_title)
                .setPositiveButton(R.string.exit, (d, w) -> finish())
                .setNegativeButton(R.string.cancel, null);
        if (AppConfig.needsSubdomain()) {
            dialog.setNeutralButton(R.string.change_server, (d, w) -> openSetup());
        }
        dialog.show();
    }

    // ---------------------------------------------------------------- Runtime permissions

    /** Requests any missing permissions, then runs the callback (check results with hasPermission). */
    private void withPermissions(List<String> permissions, Runnable callback) {
        List<String> missing = new ArrayList<>();
        for (String p : permissions) {
            if (!hasPermission(p)) missing.add(p);
        }
        if (missing.isEmpty()) {
            callback.run();
            return;
        }
        int code = nextPermissionRequestCode++;
        permissionCallbacks.put(code, callback);
        requestPermissions(missing.toArray(new String[0]), code);
    }

    private boolean hasPermission(String permission) {
        return checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        Runnable callback = permissionCallbacks.get(requestCode);
        if (callback != null) {
            permissionCallbacks.remove(requestCode);
            callback.run();
        }
    }

    // ---------------------------------------------------------------- WebView clients

    private class AppWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            if (isAppUrl(uri)) return false;
            if ("blob".equals(uri.getScheme()) || "data".equals(uri.getScheme())) return false;
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
            } catch (ActivityNotFoundException ignored) {
                // nothing can handle it
            }
            return true;
        }

        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            progress.setVisibility(View.VISIBLE);
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            progress.setVisibility(View.GONE);
            view.evaluateJavascript(INJECTED_JS, null);
            CookieManager.getInstance().flush();
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (!request.isForMainFrame()) return;
            errorMessage.setText(AppConfig.hasBuiltInSubdomain()
                    ? error.getDescription()
                    : String.format(Locale.ROOT, "%s\n\n%s", request.getUrl().getHost(), error.getDescription()));
            errorView.setVisibility(View.VISIBLE);
        }
    }

    private class AppChromeClient extends WebChromeClient {
        @Override
        public void onProgressChanged(WebView view, int newProgress) {
            progress.setProgress(newProgress);
            progress.setVisibility(newProgress < 100 ? View.VISIBLE : View.GONE);
        }

        /** getUserMedia() from the page (audio recording, camera). */
        @Override
        public void onPermissionRequest(PermissionRequest request) {
            runOnUiThread(() -> {
                if (!isAppUrl(request.getOrigin())) {
                    request.deny();
                    return;
                }
                List<String> needed = new ArrayList<>();
                for (String resource : request.getResources()) {
                    if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) {
                        needed.add(Manifest.permission.RECORD_AUDIO);
                    } else if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) {
                        needed.add(Manifest.permission.CAMERA);
                    }
                }
                withPermissions(needed, () -> {
                    List<String> granted = new ArrayList<>();
                    for (String resource : request.getResources()) {
                        if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)
                                && hasPermission(Manifest.permission.RECORD_AUDIO)) {
                            granted.add(resource);
                        } else if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)
                                && hasPermission(Manifest.permission.CAMERA)) {
                            granted.add(resource);
                        }
                    }
                    if (granted.isEmpty()) {
                        request.deny();
                        Toast.makeText(MainActivity.this, R.string.permission_denied, Toast.LENGTH_LONG).show();
                    } else {
                        request.grant(granted.toArray(new String[0]));
                    }
                });
            });
        }

        /** <input type="file"> — images (with camera), audio files and Excel imports. */
        @Override
        public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
            if (filePathCallback != null) filePathCallback.onReceiveValue(null);
            filePathCallback = callback;

            String[] mimeTypes = resolveMimeTypes(params.getAcceptTypes());
            boolean acceptsImages = mimeTypes.length == 0;
            for (String m : mimeTypes) {
                if (m.startsWith("image/") || m.equals("*/*")) acceptsImages = true;
            }
            boolean multiple = params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE;
            boolean captureOnly = params.isCaptureEnabled();

            if (acceptsImages) {
                withPermissions(Collections.singletonList(Manifest.permission.CAMERA),
                        () -> launchFileChooser(mimeTypes, multiple, captureOnly, hasPermission(Manifest.permission.CAMERA)));
            } else {
                launchFileChooser(mimeTypes, multiple, false, false);
            }
            return true;
        }
    }

    // ---------------------------------------------------------------- File chooser

    /** Converts accept="image/*,.xlsx,application/vnd.ms-excel" into MIME types. */
    private static String[] resolveMimeTypes(String[] acceptTypes) {
        Set<String> result = new LinkedHashSet<>();
        if (acceptTypes != null) {
            for (String raw : acceptTypes) {
                for (String part : raw.split(",")) {
                    String t = part.trim().toLowerCase(Locale.ROOT);
                    if (t.isEmpty()) continue;
                    if (t.startsWith(".")) {
                        String mime = MimeTypeMap.getSingleton().getMimeTypeFromExtension(t.substring(1));
                        if (mime != null) result.add(mime);
                    } else if (t.contains("/")) {
                        result.add(t);
                    }
                }
            }
        }
        return result.toArray(new String[0]);
    }

    private void launchFileChooser(String[] mimeTypes, boolean multiple, boolean captureOnly, boolean cameraAllowed) {
        Intent cameraIntent = cameraAllowed ? createCameraIntent() : null;

        Intent target;
        if (captureOnly && cameraIntent != null) {
            target = cameraIntent;
        } else {
            Intent pick = new Intent(Intent.ACTION_GET_CONTENT);
            pick.addCategory(Intent.CATEGORY_OPENABLE);
            if (mimeTypes.length == 1) {
                pick.setType(mimeTypes[0]);
            } else {
                pick.setType("*/*");
                if (mimeTypes.length > 1) pick.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes);
            }
            pick.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, multiple);

            target = Intent.createChooser(pick, getString(R.string.choose_file));
            if (cameraIntent != null) {
                target.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{cameraIntent});
            }
        }

        try {
            startActivityForResult(target, REQUEST_FILE_CHOOSER);
        } catch (ActivityNotFoundException e) {
            if (filePathCallback != null) filePathCallback.onReceiveValue(null);
            filePathCallback = null;
        }
    }

    private Intent createCameraIntent() {
        Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        if (intent.resolveActivity(getPackageManager()) == null) return null;
        try {
            File dir = new File(getCacheDir(), "camera");
            if (!dir.exists() && !dir.mkdirs()) return null;
            File photo = File.createTempFile("IMG_" + System.currentTimeMillis(), ".jpg", dir);
            cameraOutputUri = FileProvider.getUriForFile(this, getPackageName() + ".fileprovider", photo);
        } catch (IOException e) {
            return null;
        }
        intent.putExtra(MediaStore.EXTRA_OUTPUT, cameraOutputUri);
        intent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
        return intent;
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != REQUEST_FILE_CHOOSER || filePathCallback == null) return;

        Uri[] results = null;
        if (resultCode == RESULT_OK) {
            if (data != null && data.getClipData() != null) {
                int count = data.getClipData().getItemCount();
                results = new Uri[count];
                for (int i = 0; i < count; i++) results[i] = data.getClipData().getItemAt(i).getUri();
            } else if (data != null && data.getData() != null) {
                results = new Uri[]{data.getData()};
            } else if (cameraOutputUri != null) {
                results = new Uri[]{cameraOutputUri}; // photo taken with the camera
            }
        }
        filePathCallback.onReceiveValue(results);
        filePathCallback = null;
        cameraOutputUri = null;
    }

    // ---------------------------------------------------------------- Downloads

    private void onDownload(String url, String userAgent, String contentDisposition, String mimeType, long length) {
        if (url.startsWith("blob:") || url.startsWith("data:")) {
            String js = "(function(){fetch(" + jsString(url) + ").then(function(r){return r.blob();}).then(function(b){"
                    + "var fr=new FileReader();fr.onloadend=function(){" + WebBridge.NAME + ".saveDataUrl(String(fr.result),'',b.type||"
                    + jsString(mimeType == null ? "" : mimeType) + ");};fr.readAsDataURL(b);})"
                    + ".catch(function(e){" + WebBridge.NAME + ".downloadFailed(String(e));});})();";
            webView.evaluateJavascript(js, null);
            return;
        }

        String fileName = URLUtil.guessFileName(url, contentDisposition, mimeType);
        withPermissions(legacyStoragePermission(), () -> {
            try {
                DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                request.setMimeType(mimeType);
                String cookie = CookieManager.getInstance().getCookie(url);
                if (cookie != null) request.addRequestHeader("Cookie", cookie);
                request.addRequestHeader("User-Agent", userAgent);
                request.setTitle(fileName);
                request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);
                ((DownloadManager) getSystemService(DOWNLOAD_SERVICE)).enqueue(request);
                Toast.makeText(this, getString(R.string.download_started, fileName), Toast.LENGTH_SHORT).show();
            } catch (Exception e) {
                Toast.makeText(this, R.string.download_failed, Toast.LENGTH_LONG).show();
            }
        });
    }

    private static List<String> legacyStoragePermission() {
        return Build.VERSION.SDK_INT <= Build.VERSION_CODES.P
                ? Collections.singletonList(Manifest.permission.WRITE_EXTERNAL_STORAGE)
                : Collections.<String>emptyList();
    }

    private static String jsString(String value) {
        return "'" + value.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n") + "'";
    }

    @Override
    public void saveDataUrl(String dataUrl, String fileName, String mimeType) {
        int comma = dataUrl.indexOf(',');
        if (!dataUrl.startsWith("data:") || comma < 0) {
            onDownloadFailed("invalid data");
            return;
        }
        String header = dataUrl.substring(5, comma);
        String mime = !TextUtils.isEmpty(mimeType) ? mimeType : header.split(";")[0];
        byte[] bytes;
        try {
            bytes = header.contains(";base64")
                    ? Base64.decode(dataUrl.substring(comma + 1), Base64.DEFAULT)
                    : Uri.decode(dataUrl.substring(comma + 1)).getBytes();
        } catch (IllegalArgumentException e) {
            onDownloadFailed(e.getMessage());
            return;
        }

        String name = TextUtils.isEmpty(fileName) ? "download" : fileName.replaceAll("[\\\\/:*?\"<>|]", "_");
        if (!name.contains(".")) {
            String ext = MimeTypeMap.getSingleton().getExtensionFromMimeType(mime);
            if (ext != null) name += "." + ext;
        }
        if (TextUtils.isEmpty(mime) || "application/octet-stream".equals(mime)) {
            String ext = MimeTypeMap.getFileExtensionFromUrl(name.replace(' ', '_'));
            String guessed = MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext);
            mime = guessed != null ? guessed : "application/octet-stream";
        }

        final String finalName = name;
        final String finalMime = mime;
        runOnUiThread(() -> withPermissions(legacyStoragePermission(), () -> {
            try {
                writeToDownloads(bytes, finalName, finalMime);
                Toast.makeText(this, getString(R.string.download_saved, finalName), Toast.LENGTH_LONG).show();
            } catch (IOException e) {
                Toast.makeText(this, R.string.download_failed, Toast.LENGTH_LONG).show();
            }
        }));
    }

    private void writeToDownloads(byte[] bytes, String name, String mime) throws IOException {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues values = new ContentValues();
            values.put(MediaStore.Downloads.DISPLAY_NAME, name);
            values.put(MediaStore.Downloads.MIME_TYPE, mime);
            values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
            Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
            if (uri == null) throw new IOException("insert failed");
            try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                if (out == null) throw new IOException("open failed");
                out.write(bytes);
            }
        } else {
            File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            if (!dir.exists() && !dir.mkdirs()) throw new IOException("no downloads dir");
            File file = new File(dir, name);
            int dot = name.lastIndexOf('.');
            for (int i = 1; file.exists(); i++) {
                file = new File(dir, dot > 0
                        ? name.substring(0, dot) + " (" + i + ")" + name.substring(dot)
                        : name + " (" + i + ")");
            }
            try (FileOutputStream out = new FileOutputStream(file)) {
                out.write(bytes);
            }
            MediaScannerConnection.scanFile(this, new String[]{file.getAbsolutePath()}, new String[]{mime}, null);
        }
    }

    @Override
    public void onDownloadFailed(String reason) {
        runOnUiThread(() -> Toast.makeText(this, R.string.download_failed, Toast.LENGTH_LONG).show());
    }

    // ---------------------------------------------------------------- Printing

    @Override
    public void printPage() {
        runOnUiThread(() -> print(webView));
    }

    @Override
    public void printHtml(String html) {
        runOnUiThread(() -> {
            printWebView = new WebView(this);
            printWebView.setWebViewClient(new WebViewClient() {
                @Override
                public void onPageFinished(WebView view, String url) {
                    print(view);
                }
            });
            printWebView.loadDataWithBaseURL(webView.getUrl(), html, "text/html", "UTF-8", null);
        });
    }

    private void print(WebView source) {
        PrintManager printManager = (PrintManager) getSystemService(PRINT_SERVICE);
        String jobName = getString(R.string.app_name) + " " + System.currentTimeMillis();
        printManager.print(jobName, source.createPrintDocumentAdapter(jobName),
                new PrintAttributes.Builder().build());
    }
}
