const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * Download a file from a URL (supports Google Drive direct download links).
 * @param {string} url - Direct download URL
 * @param {string} destPath - Local path to save the file (default: calling-bird-latest.zip)
 */
async function downloadFromUrl(url, debug_file=false) {

    const calling_bird_lates__zip = debug_file 
                    ? "https://drive.google.com/uc?id=1i9HWFHwcw7oeVedz0CfR4J9-oZ5_fH22&export=download"
                    : "https://drive.google.com/uc?id=1i9HWFHwcw7oeVedz0CfR4J9-oZ5_fH22&export=download"

    const destPath = path.resolve('calling-bird-latest.zip')

    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;

        function doRequest(requestUrl) {
            protocol.get(requestUrl, (res) => {
                // Follow redirects
                if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
                    return doRequest(res.headers.location);
                }

                if (res.statusCode !== 200) {
                    return reject(new Error(`Failed to download. Status: ${res.statusCode}`));
                }

                const dest = fs.createWriteStream(destPath);
                res.pipe(dest);
                dest.on('finish', () => {
                    console.log(`✅ Downloaded to: ${destPath}`);
                    resolve(destPath);
                });
                dest.on('error', reject);
            }).on('error', reject);
        }

        console.log(`📥 Downloading from URL...`);
        doRequest(url);
    });
}

module.exports = { downloadFromUrl };
