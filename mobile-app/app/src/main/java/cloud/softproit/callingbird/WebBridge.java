package cloud.softproit.callingbird;

import android.webkit.JavascriptInterface;

/**
 * Exposed to the page as window.CallingBirdApp. Lets the web app save blob downloads
 * and print, which a plain WebView cannot do on its own.
 */
final class WebBridge {

    static final String NAME = "CallingBirdApp";

    interface Host {
        void saveDataUrl(String dataUrl, String fileName, String mimeType);

        void printHtml(String html);

        void printPage();

        void onDownloadFailed(String reason);
    }

    private final Host host;

    WebBridge(Host host) {
        this.host = host;
    }

    @JavascriptInterface
    public boolean isApp() {
        return true;
    }

    @JavascriptInterface
    public void saveDataUrl(String dataUrl, String fileName, String mimeType) {
        host.saveDataUrl(dataUrl, fileName, mimeType);
    }

    @JavascriptInterface
    public void printHtml(String html) {
        host.printHtml(html);
    }

    @JavascriptInterface
    public void printPage() {
        host.printPage();
    }

    @JavascriptInterface
    public void downloadFailed(String reason) {
        host.onDownloadFailed(reason);
    }
}
