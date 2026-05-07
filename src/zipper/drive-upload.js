const fs = require('fs');
const path = require('path');
const { GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET, GDRIVE_REFRESH_TOKEN, GDRIVE_FOLDER_ID } = require('./drive-config');

async function uploadToGoogleDrive(file_name='calling-bird-latest.zip') {
    try {
        if(!file_name){
            return
        }
        const { google } = require('googleapis');
        if (GDRIVE_REFRESH_TOKEN === 'YOUR_REFRESH_TOKEN') {
            console.error('❌ Fill in GDRIVE credentials in src/zipper/drive-config.js');
            return;
        }

        const auth = new google.auth.OAuth2(GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET);
        auth.setCredentials({ refresh_token: GDRIVE_REFRESH_TOKEN });
        

        const drive = google.drive({ version: 'v3', auth });
        const zipPath = path.resolve(file_name);

        if (!fs.existsSync(zipPath)) {
            console.error(`❌ ${file_name} not found. Create it first (c).`);
            return;
        }

        // Check if file already exists in folder
        const existing = await drive.files.list({
            q: `'${GDRIVE_FOLDER_ID}' in parents and name='${file_name}' and trashed=false`,
            fields: 'files(id, name)',
            pageSize: 1,
        });
        const existingFile = existing.data.files?.[0];

        let response;
        if (existingFile) {
            console.log(`📤 Replacing existing file on Google Drive...`);
            response = await drive.files.update({
                fileId: existingFile.id,
                requestBody: { name: file_name },
                media: {
                    mimeType: 'application/zip',
                    body: fs.createReadStream(zipPath),
                },
                fields: 'id, name, webViewLink',
            });
        } else {
            console.log('📤 Uploading to Google Drive...');
            response = await drive.files.create({
                requestBody: {
                    name: file_name,
                    parents: [GDRIVE_FOLDER_ID],
                },
                media: {
                    mimeType: 'application/zip',
                    body: fs.createReadStream(zipPath),
                },
                fields: 'id, name, webViewLink',
            });
        }

        console.log('✅ Uploaded:', response.data.name);
        console.log('🔗 Link:', response.data.webViewLink);
    } catch (err) {
        console.error('❌ uploadToGoogleDrive error:', err.message);
    }
}

module.exports = { uploadToGoogleDrive };
