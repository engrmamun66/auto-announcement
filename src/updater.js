const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { FormData } = require("formdata-node");
const { fileFromPath } = require("formdata-node/file-from-path");
const utils = require('./utls');
const unzipper = require('unzipper');
const Readable = require('stream').Readable;
let { PRIMARY_SERVER } = global.config.env


module.exports = {
  async downloadFile(url, filename = 'latest.zip') {
    try {
      const dest = path.resolve(filename);
      const res = await fetch(url);
  
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  
      const fileStream = fs.createWriteStream(dest);
      const nodeStream = Readable.fromWeb(res.body); // ✅ convert web stream to Node stream
  
      await new Promise((resolve, reject) => {
        nodeStream.pipe(fileStream);
        nodeStream.on("error", reject);
        fileStream.on("finish", resolve);
      });
  
      console.log(`✅ File downloaded: ${dest}`);
      return dest;
    } catch (err) {
      console.error("❌ downloadFile error:", err);
      return false
    }
  },
  async getUpdateVersion() {
    try {
       
      const formdata = new FormData();
      formdata.append("action", "calling_bird_request");
      formdata.append("action_type", "get_latest_version");
      formdata.append("secret_key", global.config.env.SECRET_KEY) 
    
      const response = await fetch(PRIMARY_SERVER, {
        method: "POST",
        body: formdata,
      });
      try {
        const result = await response.json(); 
        let Tracker = require('../tracker.json')
        let version = result?.version
        if(version){
          if(version !== Tracker.version){
            Tracker.version = version
            let downloadUrl = result.url
            // utils.withTrackFile(Tracker)
             
            let filePath = await this.downloadFile(downloadUrl)
            if(filePath){
              console.log(`✅ Extracting latest.zip: ${version}`);
              await this.extractZip(filePath, path.resolve('./latest') )
            }
          }

        }
      } catch (error) {
        console.log('isUsingLatestVersion error:', error);
      }
    } catch (err) {
      console.error("❌ getUpdateVersion download error:", err);
    }
  },
  async extractZip(zipPath, extractTo) {
    try {
      await fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: extractTo }))
        .promise();

      console.log(`✅ Extracted to: ${extractTo}`);
    } catch (err) {
      console.error("❌ extractZip error:", err);
    }
  }
};



