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

const { create_zip_with_latest_code } = require('./src/zipper/create-zip');
const { uploadToGoogleDrive }         = require('./src/zipper/drive-upload');
const { downloadFromGoogleDrive }     = require('./src/zipper/drive-download');
const { downloadFromUrl }     = require('./src/zipper/download-from-url');

function ask(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

const has_drive_config = fs.existsSync(path.join(__dirname, 'src/zipper/drive-config.js'));

(async () => {
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║       🐦 Calling Bird Zipper         ║');
    console.log('╠══════════════════════════════════════╣');
    console.log('║  [c]  Create Latest ZIP              ║');
    console.log('║  [t]  Create Temporaty Zip           ║');
    console.log('║  [n]  Create ZIP - For New Customer  ║');
    console.log('║  [dd]  Donwnload - Latest Zip.       ║');
    console.log('║  [dt]  Donwnload - Temp Zip.         ║');
    if(has_drive_config){
    console.log('║  [g]  Upload to Google Drive         ║');
    console.log('║  [d]  Download from Google Drive     ║');
    console.log('╚══════════════════════════════════════╝');
    } else {
    console.log('╚══════════════════════════════════════╝');
    }

    const choice = await ask('\n  → Choose option: ');
    let char = choice.toLowerCase()

    if (char === 'c') {
        await create_zip_with_latest_code();
    }
    else if (char === 't') {
        await create_zip_with_latest_code({ debug_mode: true });
    }
    else if (char === 'n') {
        await create_zip_with_latest_code({ zip_for_setup_in_new_pc: true });
    } 
    else if (char === 'g') {
        uploadToGoogleDrive();
    } 
    else if (char === 'd') {
        downloadFromGoogleDrive();
    } 
    else if (char === 'dd') {
        downloadFromUrl();
    } 
    else if (char === 'dt') {
        downloadFromUrl(true);
    } 
    else {
        console.log('❌ Invalid option.');
    }

    if(has_drive_config){
        let filename = char !== 't' 
            ? 'calling-bird-latest.zip' 
            : 'calling-bird-latest-debug-temp.zip'
        if(['c', 't', 'n'].includes(char)){
            let upload = await ask('\n  → Upload to google-drive (y/n)? ');
            if(upload.toLowerCase() == 'y'){
                uploadToGoogleDrive(filename)
            }
        }
    }


})();
