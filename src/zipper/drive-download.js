const fs = require('fs');
const path = require('path');
const { GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET, GDRIVE_REFRESH_TOKEN, GDRIVE_FOLDER_ID } = require('./drive-config');

async function downloadFromGoogleDrive() {
    try {
        const { google } = require('googleapis');
        if (GDRIVE_REFRESH_TOKEN === 'YOUR_REFRESH_TOKEN') {
            console.error('❌ Fill in GDRIVE credentials in src/zipper/drive-config.js');
            return;
        }

        const auth = new google.auth.OAuth2(GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET);
        auth.setCredentials({ refresh_token: GDRIVE_REFRESH_TOKEN });
        const drive = google.drive({ version: 'v3', auth });

        const list = await drive.files.list({
            q: `'${GDRIVE_FOLDER_ID}' in parents and name='calling-bird-latest.zip' and trashed=false`,
            orderBy: 'modifiedTime desc',
            pageSize: 1,
            fields: 'files(id, name, modifiedTime)',
        });

        const file = list.data.files?.[0];
        if (!file) {
            console.error('❌ No calling-bird-latest.zip found in Drive folder.');
            return;
        }

        console.log(`📥 Downloading: ${file.name} (modified: ${file.modifiedTime})`);
        const destPath = path.resolve('calling-bird-latest.zip');
        const dest = fs.createWriteStream(destPath);

        const res = await drive.files.get(
            { fileId: file.id, alt: 'media' },
            { responseType: 'stream' }
        );

        await new Promise((resolve, reject) => {
            res.data.pipe(dest);
            res.data.on('error', reject);
            dest.on('finish', resolve);
        });

        console.log(`✅ Downloaded to: ${destPath}`);
    } catch (err) {
        console.error('❌ downloadFromGoogleDrive error:', err.message);
    }
}

module.exports = { downloadFromGoogleDrive };
