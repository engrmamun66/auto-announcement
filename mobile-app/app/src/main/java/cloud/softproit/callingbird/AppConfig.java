package cloud.softproit.callingbird;

import android.content.Context;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.view.View;
import android.view.WindowInsets;

import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Resolves the web URL from BuildConfig.WEB_URL (injected from mobile-app/.env)
 * and the subdomain the user typed on first launch.
 */
final class AppConfig {

    static final String PLACEHOLDER = "{subdomain}";

    private static final String PREFS = "callingbird";
    private static final String KEY_SUBDOMAIN = "subdomain";
    private static final Pattern SUBDOMAIN = Pattern.compile("^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$");

    private AppConfig() {
    }

    /** True when WEB_URL contains {subdomain} and the user must provide it. */
    static boolean needsSubdomain() {
        return BuildConfig.WEB_URL.contains(PLACEHOLDER) && !hasBuiltInSubdomain();
    }

    /** True when SUBDOMAIN is set in .env: the URL is fixed and hidden from the user. */
    static boolean hasBuiltInSubdomain() {
        return !BuildConfig.SUBDOMAIN.trim().isEmpty();
    }

    /** Text shown before the input field, e.g. "https://". */
    static String urlPrefix() {
        int i = BuildConfig.WEB_URL.indexOf(PLACEHOLDER);
        return i < 0 ? "" : BuildConfig.WEB_URL.substring(0, i);
    }

    /** Text shown after the input field, e.g. ".softproit.cloud". */
    static String urlSuffix() {
        int i = BuildConfig.WEB_URL.indexOf(PLACEHOLDER);
        return i < 0 ? "" : BuildConfig.WEB_URL.substring(i + PLACEHOLDER.length());
    }

    private static SharedPreferences prefs(Context ctx) {
        return ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static String getSubdomain(Context ctx) {
        return prefs(ctx).getString(KEY_SUBDOMAIN, null);
    }

    static void setSubdomain(Context ctx, String subdomain) {
        prefs(ctx).edit().putString(KEY_SUBDOMAIN, subdomain).apply();
    }

    /**
     * Normalises user input ("CB2", " cb2 ", "https://cb2.softproit.cloud/") to "cb2".
     * Returns null when the result is not a valid DNS label.
     */
    static String normaliseSubdomain(String input) {
        if (input == null) return null;
        String value = input.trim().toLowerCase(Locale.ROOT);
        String prefix = urlPrefix().toLowerCase(Locale.ROOT);
        String suffix = urlSuffix().toLowerCase(Locale.ROOT);
        value = value.replaceFirst("^https?://", "");
        if (prefix.matches("^https?://.*")) prefix = prefix.replaceFirst("^https?://", "");
        if (!prefix.isEmpty() && value.startsWith(prefix)) value = value.substring(prefix.length());
        int slash = value.indexOf('/');
        if (slash >= 0 && !suffix.contains("/")) value = value.substring(0, slash);
        if (!suffix.isEmpty() && value.endsWith(suffix)) value = value.substring(0, value.length() - suffix.length());
        return SUBDOMAIN.matcher(value).matches() ? value : null;
    }

    /** The URL to open, or null when the subdomain has not been set yet. */
    static String getWebUrl(Context ctx) {
        if (hasBuiltInSubdomain()) {
            return BuildConfig.WEB_URL.replace(PLACEHOLDER, BuildConfig.SUBDOMAIN.trim().toLowerCase(Locale.ROOT));
        }
        if (!needsSubdomain()) return BuildConfig.WEB_URL;
        String sub = getSubdomain(ctx);
        return sub == null ? null : BuildConfig.WEB_URL.replace(PLACEHOLDER, sub);
    }

    static String getHost(Context ctx) {
        String url = getWebUrl(ctx);
        return url == null ? null : Uri.parse(url).getHost();
    }

    /** Pads the view so content stays clear of system bars and the keyboard (edge-to-edge on API 35+). */
    static void applySystemInsets(View root) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return;
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            android.graphics.Insets bars = insets.getInsets(
                    WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return WindowInsets.CONSUMED;
        });
    }
}
