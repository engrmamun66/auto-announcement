/**
 * Calling Bird Zipper — entry point
 * Usage: node zipper.js
 */

global.DIR = __dirname;

const fs = require('fs');
const path = require('path');
const process = require('process');
const readline = require('readline');

let config = require('./config.example');
const configPath = path.join(__dirname, 'config.js');
if (fs.existsSync(configPath)) config = require(configPath);
global.config = config;

const { delelteFile } = require('./src/zipper/delete-file');
const { create_zip_with_latest_code } = require('./src/zipper/create-zip');
const { uploadToGoogleDrive }         = require('./src/zipper/drive-upload');
const { downloadFromGoogleDrive }     = require('./src/zipper/drive-download');
const { downloadFromUrl }       = require('./src/zipper/download-from-url');
const { unzipAndOverwrite }     = require('./src/zipper/unzip-and-overwrite');

function ask(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

const has_drive_config = fs.existsSync(path.join(__dirname, 'src/zipper/drive-config.js'));

const { ZIP_LATEST, ZIP_TEMP, ZIP_NEW_SETUP, encodeAndWrite, decodeAndWrite } = require('./src/zipper/zip-names');



(async () => {

    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║       🐦 Calling Bird Zipper          ║');
    console.log('╠═══════════════════════════════════════╣');
    console.log('║  [c]   Create Latest ZIP              ║');
    console.log('║  [t]   Create Temporaty Zip           ║');
    console.log('║  [n]   Create ZIP - For New Customer  ║');
    console.log('║  [dd]  Donwnload - Latest Zip.        ║');
    console.log('║  [tt]  Donwnload - Temp Zip.          ║');
    console.log('║  [u]   Unzip & Overwrite              ║');
    if(!has_drive_config)
    console.log('║  [dec] encoded.md ---------------     ║');
    console.log('║  [clear] Unneccessary Files ------    ║');
    if(has_drive_config){
    console.log('║  -----------------------------------  ║');
    console.log('║  [g]   Upload to Google Drive         ║');
    console.log('║  [d]   Download from Google Drive     ║');
    console.log('╚═══════════════════════════════════════╝');
    } else {
    console.log('╚═══════════════════════════════════════╝');
    }

    const choice = await ask('\n  → Choose option: ');
    let char = choice.toLowerCase()

    if (char === 'c') {
        await create_zip_with_latest_code({ file_name: ZIP_LATEST });
    }
    else if (char === 't') {
        await create_zip_with_latest_code({ file_name: ZIP_TEMP });
    }
    else if (char === 'n') {
        await create_zip_with_latest_code({ file_name: ZIP_NEW_SETUP, for_new_setup: true, ask });
    } 
    else if (char === 'g') {
        uploadToGoogleDrive();
    } 
    else if (char === 'd') {
        downloadFromGoogleDrive();
    } 
    else if (char === 'dd') {
        await downloadFromUrl(false, ZIP_LATEST);
    }
    else if (char === 'tt') {
        await downloadFromUrl(true, ZIP_TEMP);
    }
    else if (char === 'u') {
        await unzipAndOverwrite(ZIP_LATEST);
    }
    else if (char === 'dec') {
        if(has_drive_config){
            console.log('✅ Already Exist drive-config.js file');
        } else {
            decodeAndWrite('src/zipper/encoded.md', 'src/zipper/drive-config.js')
        }
    }
    else if (char === 'clear') {
        delelteFile(ZIP_LATEST)
        delelteFile(ZIP_TEMP)
        delelteFile(ZIP_NEW_SETUP)

        if(has_drive_config){
            // Read file content
            delelteFile(ZIP_NEW_SETUP)
        }
    }
    else {
        console.log('❌ Invalid option.');
    }

    if(has_drive_config){
        const filename = char === 't' ? ZIP_TEMP : (char == 'n' ? ZIP_NEW_SETUP : ZIP_LATEST);
        if(['c', 't', 'n'].includes(char)){
            let upload = await ask('\n  → Upload to google-drive (y/n)? ');
            if(upload.toLowerCase() == 'y'){
                uploadToGoogleDrive(filename)
            }
        }
    }


})();
