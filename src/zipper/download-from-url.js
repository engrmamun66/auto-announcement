const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { ZIP_LATEST, ZIP_TEMP } = require('./zip-names');

 
async function downloadFromUrl(debug_file=false, zipFilename=ZIP_LATEST) {

    const url = debug_file
                    ? "https://drive.google.com/uc?id=1ISeHzAjp-k65KURIEUDifPP8_ImZrbnr&export=download" // ZIP_TEMP
                    : "https://drive.google.com/uc?id=1LmBlo7XrQDlbwMvAJDtuoJy8U1QkGc_8&export=download" // ZIP_LATEST

    const destPath = path.resolve(zipFilename)

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
