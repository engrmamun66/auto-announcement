const fs = require('fs');
const path = require('path');
const { ZIP_LATEST, ZIP_TEMP } = require('./zip-names');
let { GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET, GDRIVE_REFRESH_TOKEN, GDRIVE_FOLDER_ID } = require('./drive-config.example');
const driveConfigPath = path.join(__dirname, 'drive-config.js');
if (fs.existsSync(driveConfigPath)) {
    ({ GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET, GDRIVE_REFRESH_TOKEN, GDRIVE_FOLDER_ID } = require('./drive-config'));
}

async function downloadFromGoogleDrive(debug_mode=false) {
    try {
        const { google } = require('googleapis');
        if (GDRIVE_REFRESH_TOKEN === 'YOUR_REFRESH_TOKEN') {
            console.error('❌ Fill in GDRIVE credentials in src/zipper/drive-config.js');
            return;
        }

        const auth = new google.auth.OAuth2(GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET);
        auth.setCredentials({ refresh_token: GDRIVE_REFRESH_TOKEN });
        const drive = google.drive({ version: 'v3', auth });

        const file_name = debug_mode ? ZIP_TEMP : ZIP_LATEST;

        const list = await drive.files.list({
            q: `'${GDRIVE_FOLDER_ID}' in parents and name='${file_name}' and trashed=false`,
            orderBy: 'modifiedTime desc',
            pageSize: 1,
            fields: 'files(id, name, modifiedTime)',
        });

        const file = list.data.files?.[0];
        if (!file) {
            console.error(`❌ No ${file_name} found in Drive folder.`);
            return;
        }

        console.log(`📥 Downloading: ${file.name} (modified: ${file.modifiedTime})`);
        const destPath = path.resolve(file_name);
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
