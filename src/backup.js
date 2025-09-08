const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const FormData = require('form-data');

const utils = require("./utls");


let access_api_key = require('./../access-apikey.example');
const googleSheetApiKey = path.join(__dirname, './../access-apikey');
if (fs.existsSync(googleSheetApiKey)) {
    access_api_key = require(googleSheetApiKey) || access_api_key;
}
 

module.exports = {
  async createBackupAndSend() {
    const directories = [];
    if(global.config.settings?.backup?.database) directories.push(path.join(global.DIR, "database"))
    if(global.config.settings?.backup?.exports) directories.push(path.join(global.DIR, "public/exports"))
    if(global.config.settings?.backup?.media) directories.push(path.join(global.DIR, "public/media"))
     
  
    const files = []
    if(global.config.settings?.backup?.config) files.push(path.join(global.DIR, "config.js"))
    if(global.config.settings?.backup?.openbat) files.push(path.join(global.DIR, "open.bat"))
    if(global.config.settings?.backup?.logo) files.push(path.join(global.DIR, "public/logo.png"))
  
    const outputPath = path.resolve("backup.zip");
  
    // Step 1: Create backup.zip
    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver("zip", { zlib: { level: 9 } });
  
      output.on("close", resolve);
      archive.on("error", reject);
  
      archive.pipe(output);
  
      // Add directories
      directories.forEach((fullPath) => {
        archive.directory(fullPath, path.basename(fullPath));
      });
  
      // Add individual files
      files.forEach((filePath) => {
        archive.file(filePath, { name: path.basename(filePath) });
      });
  
      archive.finalize();
    });
  
    console.log("✅ backup.zip created at", outputPath);
  
    // Step 2: Send to /api/backup
    const form = new FormData();
    form.append("file", fs.createReadStream(outputPath), "backup.zip")
    form.append("secret_key", global.config.env.SECRET_KEY)
    form.append("backup", 'true')
  
    const response = await fetch(access_api_key, {
      method: "POST",
      headers: {
        "Content-Type": "application/zip",
        // "X-SECRET-KEY": global.config.env.SECRET_KEY,
      },
      body: form,
    });
  
    const result = await response.text();
    console.log("📤 Upload response:", result);
  }
  
};
