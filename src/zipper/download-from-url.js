const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * Download a file from a URL (supports Google Drive direct download links).
 * @param {string} url - Direct download URL
 * @param {string} destPath - Local path to save the file (default: calling-bird-latest.zip)
 */
async function downloadFromUrl(debug_file=false) {

    const url = debug_file 
                    ? "https://drive.google.com/uc?id=1ISeHzAjp-k65KURIEUDifPP8_ImZrbnr&export=download" // calling-bird-latest-debug-temp.zip
                    : "https://drive.google.com/uc?id=1LmBlo7XrQDlbwMvAJDtuoJy8U1QkGc_8&export=download" // calling-bird-latest.zip

    const destPath = path.resolve(debug_file ? 'calling-bird-latest-debug-temp.zip' : 'calling-bird-latest.zip')

    return new Promise((resolve, reject) => {
        function doRequest(requestUrl) {
            const protocol = requestUrl.startsWith('https') ? https : http;
            protocol.get(requestUrl, (res) => {
                if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303 || res.statusCode === 307 || res.statusCode === 308) {
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
                    process.exit(0);
                });
                dest.on('error', reject);
            }).on('error', reject);
        }

        console.log(`📥 Downloading from URL...`);
        doRequest(url);
    });
}

module.exports = { downloadFromUrl };
