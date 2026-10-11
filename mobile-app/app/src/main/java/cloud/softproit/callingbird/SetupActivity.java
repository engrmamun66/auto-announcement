package cloud.softproit.callingbird;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

/**
 * First-launch screen: asks for the subdomain that completes WEB_URL
 * (e.g. "cb2" -> https://cb2.softproit.cloud). Skipped once a subdomain is saved.
 */
public class SetupActivity extends Activity {

    static final String EXTRA_CHANGE = "change";

    private EditText input;
    private TextView message;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        boolean changing = getIntent().getBooleanExtra(EXTRA_CHANGE, false);
        if (!AppConfig.needsSubdomain() || (!changing && AppConfig.getSubdomain(this) != null)) {
            openWebApp();
            return;
        }

        setContentView(R.layout.activity_setup);
        AppConfig.applySystemInsets(findViewById(android.R.id.content));

        ((TextView) findViewById(R.id.url_prefix)).setText(AppConfig.urlPrefix());
        ((TextView) findViewById(R.id.url_suffix)).setText(AppConfig.urlSuffix());
        input = findViewById(R.id.subdomain_input);
        message = findViewById(R.id.setup_message);
        Button button = findViewById(R.id.continue_button);

        String saved = AppConfig.getSubdomain(this);
        if (saved != null) {
            input.setText(saved);
            input.setSelection(saved.length());
        }

        button.setOnClickListener(v -> submit());
        input.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_GO || actionId == EditorInfo.IME_ACTION_DONE) {
                submit();
                return true;
            }
            return false;
        });
        input.requestFocus();
    }

    private void submit() {
        String subdomain = AppConfig.normaliseSubdomain(input.getText().toString());
        if (subdomain == null) {
            message.setText(R.string.setup_invalid);
            message.setTextColor(getColor(R.color.error));
            return;
        }
        AppConfig.setSubdomain(this, subdomain);
        openWebApp();
    }

    private void openWebApp() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
