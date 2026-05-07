const fs = require('fs');
const path = require('path');
const { GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET, GDRIVE_REFRESH_TOKEN, GDRIVE_FOLDER_ID } = require('./drive-config');

async function uploadToGoogleDrive() {
    try {
        const { google } = require('googleapis');
        if (GDRIVE_REFRESH_TOKEN === 'YOUR_REFRESH_TOKEN') {
            console.error('❌ Fill in GDRIVE credentials in src/zipper/drive-config.js');
            return;
        }

        const auth = new google.auth.OAuth2(GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET);
        auth.setCredentials({ refresh_token: GDRIVE_REFRESH_TOKEN });

        const drive = google.drive({ version: 'v3', auth });
        const zipPath = path.resolve('calling-bird-latest.zip');

        if (!fs.existsSync(zipPath)) {
            console.error('❌ calling-bird-latest.zip not found. Create it first (c).');
            return;
        }

        console.log('📤 Uploading to Google Drive...');
        const response = await drive.files.create({
            requestBody: {
                name: 'calling-bird-latest.zip',
                parents: [GDRIVE_FOLDER_ID],
            },
            media: {
                mimeType: 'application/zip',
                body: fs.createReadStream(zipPath),
            },
            fields: 'id, name, webViewLink',
        });

        console.log('✅ Uploaded:', response.data.name);
        console.log('🔗 Link:', response.data.webViewLink);
    } catch (err) {
        console.error('❌ uploadToGoogleDrive error:', err.message);
    }
}

module.exports = { uploadToGoogleDrive };
