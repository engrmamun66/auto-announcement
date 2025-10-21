const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { FormData } = require("formdata-node");
const { fileFromPath } = require("formdata-node/file-from-path");
let { PRIMARY_SERVER } = global.config.env

module.exports = {
  async createBackupAndSend() {
    try {

      const directories = [];
      if(global.config.settings?.backup){
        if(global.config.settings?.backup?.database) directories.push(path.join(global.DIR, "database"))
        if(global.config.settings?.backup?.exports) directories.push(path.join(global.DIR, "public/exports"))
        if(global.config.settings?.backup?.media) directories.push(path.join(global.DIR, "public/media"))
      }
  
      
    
      const files = []
      if(global.config.settings?.backup){
        if(global.config.settings?.backup?.config) files.push(path.join(global.DIR, "README.md"))
        if(global.config.settings?.backup?.config) files.push(path.join(global.DIR, "config.js"))
        if(global.config.settings?.backup?.openbat) files.push(path.join(global.DIR, "open.bat"))
        if(global.config.settings?.backup?.logo) files.push(path.join(global.DIR, "public/logo.png"))
      }
    
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
      const formdata = new FormData();
      formdata.append("action", "calling_bird_request");
      formdata.append("action_type", "backup");
      formdata.append("secret_key", global.config.env.SECRET_KEY)
      formdata.set("file", await fileFromPath(outputPath, "backup.zip"));
    
      const response = await fetch(PRIMARY_SERVER, {
        method: "POST",
        body: formdata,
      });
    
      const result = await response.json(); 
      // console.log(result.data[global.config.env.SECRET_KEY]);
      if(result?.data?.[global.config.env.SECRET_KEY]){
        console.log("📤 Uploaded the backup file");
        await fs.promises.unlink(outputPath).catch(err => console.warn("Delete failed:", err))
      }
    } catch (createBackupAndSend_error) {
        // console.log({createBackupAndSend_error})
    }
  },
  async getBackupDetails({req, res}={}) {
    try {
      // Step 2: Send to /api/backup
      const formdata = new FormData();
      formdata.append("action", "calling_bird_request");
      formdata.append("action_type", "backup_details");
      formdata.append("secret_key", global.config.env.SECRET_KEY) 
    
      const response = await fetch(PRIMARY_SERVER, {
        method: "POST",
        body: formdata,
      });
    
      const result = await response.json();
      // console.log("📤 Upload response:: === ", result);
      if(res){
        res.send({ 
          data: result 
        });
      }
    } catch (getBackupDetails_error) {
      console.log({getBackupDetails_error})
      res.status(400).send({ success: true, message: "getBackupDetails() failed" });
    }
    
  },
  
};
