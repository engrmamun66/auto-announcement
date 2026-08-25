# SMS Proxy Setup Guide

## Overview

This implementation enables Calling Bird to send SMS through a WordPress server with fixed IP, bypassing dynamic IP whitelist restrictions from SMS providers.

## Components

### 1. Node.js Backend (`src/class-sms.js`)
- Added `wp_ajax` configuration support
- New method: `_dispatchViaWpAjax()` — routes SMS through WordPress AJAX when configured
- Falls back to direct provider API if `wp_ajax.status === false`

**Changes:**
- Added axios import (used for HTTPS requests)
- Modified `_sendSmsInternal()` to check for `wp_ajax` config
- Added `_dispatchViaWpAjax()` method for WordPress proxy

### 2. Configuration (`config.example.js`)
New SMS sub-config added:
```javascript
sms: {
  enabled: true,
  wp_ajax: {
    status: false,                // Enable proxy
    ajax_url: '',                 // WordPress AJAX endpoint
  }
}
```

### 3. WordPress Plugin (`/wp-content/plugins/cb-sms-proxy/`)
PHP plugin that receives SMS requests and forwards to provider API.

**Files:**
- `cb-sms-proxy.php` — Main plugin file with AJAX handler
- `README.md` — Installation and usage guide

**Features:**
- Handles both MIMSMS and SSL Wireless providers
- Validates all parameters
- Sanitizes input using WordPress functions
- Returns success/error responses

## Installation Steps

### Step 1: Enable WordPress Plugin
1. Copy plugin to: `wp-content/plugins/cb-sms-proxy/`
2. Log into WordPress Admin
3. Go to: Plugins → Calling Bird SMS Proxy
4. Click "Activate"

### Step 2: Configure Calling Bird
Option A: Edit `config.js`:
```javascript
sms: {
  enabled: true,
  provider: 'mimsms',
  api_key: 'YOUR_KEY',
  user_name: 'email@example.com',
  sender_id: 'YourSenderID',
  wp_ajax: {
    status: true,
    ajax_url: 'https://your-wordpress.com/wp-admin/admin-ajax.php'
  }
}
```

Option B: Use Settings Panel in UI:
1. Navigate to Settings
2. Go to SMS section
3. Add `wp_ajax.status: true`
4. Add `wp_ajax.ajax_url: https://...`

### Step 3: Test
1. Go to Contact page
2. Console log should show MAC and IP
3. Send test SMS via app
4. Check SMS received on test phone

## How It Works

```
Calling Bird App
    ↓
_sendSmsInternal() checks wp_ajax.status
    ↓
IF wp_ajax.enabled:
    → _dispatchViaWpAjax()
    → POST to WordPress AJAX endpoint
    → WordPress plugin forwards to SMS provider API
ELSE:
    → _dispatch() (original flow)
    → Direct connection to SMS provider API
```

## Security Considerations

### IP Whitelist Setup
On WordPress server:
1. Note WordPress server's public IP (static)
2. Add to SMS provider whitelist
3. SMS will be sent from this IP always

### Access Control
Current plugin: `wp_ajax_nopriv_cb_send_sms` (unauthenticated)

**Recommended improvement:**
Add API key validation in plugin:
```php
if ($_POST['api_key'] !== CALLING_BIRD_API_KEY) {
    wp_send_json_error(['message' => 'Invalid API key']);
}
```

Define in `wp-config.php`:
```php
define('CALLING_BIRD_API_KEY', 'your-secret-key');
```

## Troubleshooting

### SMS not sending (wp_ajax enabled)
1. **Check plugin is active:** WordPress Admin → Plugins
2. **Verify ajax_url:** 
   - Should be: `https://domain.com/wp-admin/admin-ajax.php`
   - Test URL in browser (should show `0` or error, not 404)
3. **Check WordPress logs:** `wp-content/debug.log`
4. **Test connectivity:** 
   - Calling Bird server should reach WordPress server
   - No firewall blocking port 443

### Mixed results (some SMS send, some fail)
- **Likely:** Plugin activated mid-run, restart Calling Bird app
- **Or:** Check DNS resolves WordPress domain correctly

## Monitoring & Logs

### Calling Bird SMS Debug Log
Location: `logs/sms-debug.log`
- Records all SMS attempts
- Shows which provider used (mimsms vs wp_ajax)

### WordPress Logs
Location: `wp-content/debug.log` (if enabled in wp-config.php)
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

## Rollback

To disable WordPress proxy and return to direct SMS:
1. Set `wp_ajax.status: false` in config
2. Or delete `wp_ajax` section entirely (defaults to `false`)
3. App will use direct provider API again

No database changes needed — safe to toggle anytime.

## Supported Providers

✅ MIMSMS — Tested  
✅ SSL Wireless — Implemented  
❌ Muthofon — Not yet supported (can be added)

## Next Steps

1. Activate WordPress plugin
2. Update Calling Bird config with wordpress ajax_url
3. Test SMS sending
4. Monitor logs for issues
5. Adjust security settings as needed
