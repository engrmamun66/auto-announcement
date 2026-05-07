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

function ask(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

(async () => {
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║       🐦 Calling Bird Zipper         ║');
    console.log('╠══════════════════════════════════════╣');
    console.log('║  [c]  Create Latest ZIP              ║');
    console.log('║  [t]  Create Temporaty Zip           ║');
    console.log('║  [n]  Create ZIP - For New Customer  ║');
    console.log('║  [g]  Upload to Google Drive         ║');
    console.log('║  [d]  Download from Google Drive     ║');
    console.log('╚══════════════════════════════════════╝');

    const choice = await ask('\n  → Choose option: ');

    if (choice.toLowerCase() === 'c') {
        create_zip_with_latest_code();
    } 
    if (choice.toLowerCase() === 't') {
        create_zip_with_latest_code({ debug_mode: true });
    } 
    if (choice.toLowerCase() === 'n') {
        create_zip_with_latest_code({ zip_for_setup_in_new_pc: true });
    } 
    else if (choice.toLowerCase() === 'g') {
        uploadToGoogleDrive();
    } 
    else if (choice.toLowerCase() === 'd') {
        downloadFromGoogleDrive();
    } 
    else {
        console.log('❌ Invalid option.');
    }
})();
