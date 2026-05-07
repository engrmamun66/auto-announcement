/**
 * Run this ONCE to get your Google Drive refresh_token.
 * Steps:
 *   1. Copy this file to get-google-token.js (gitignored)
 *   2. Fill in CLIENT_ID and CLIENT_SECRET below (from Google Cloud Console)
 *   3. node get-google-token.js
 *   4. Open the URL printed in terminal → Allow → copy the code
 *   5. Paste code when prompted → refresh_token will be printed
 *   6. Copy refresh_token → paste into src/zipper/drive-config.js
 *   GO: https://console.cloud.google.com/auth/clients/1007948709664-2en05iifj11s2vmmqvk8ar0g4g8v0n6a.apps.googleusercontent.com?project=announcment-466023
 *   To add user
 *   GO: https://console.cloud.google.com/auth/audience?project=announcment-466023
 */

const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID     = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const REDIRECT_URI  = 'urn:ietf:wg:oauth:2.0:oob';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file'],
});

console.log('\n✅ Open this URL in your browser:\n');
console.log(authUrl);
console.log('');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Paste the code from the redirect URL: ', async (code) => {
    rl.close();
    try {
        const { tokens } = await oauth2Client.getToken(code.trim());
        console.log('\n✅ Your tokens:\n');
        console.log(JSON.stringify(tokens, null, 2));
        console.log('\n👉 Copy "refresh_token" → paste into src/zipper/drive-config.js');
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
});
