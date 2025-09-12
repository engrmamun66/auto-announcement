const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { FormData } = require("formdata-node");
const { fileFromPath } = require("formdata-node/file-from-path");

let secondary_server = global.config.env.SECONDARY_SERVER;

module.exports = {
  async downloadFile(url, filename) {
    try {
      const dest = path.resolve(filename); // save in root
      const res = await fetch(url);

      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

      const fileStream = fs.createWriteStream(dest);
      await new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on("error", reject);
        fileStream.on("finish", resolve);
      });

      console.log(`✅ File downloaded: ${dest}`);
      return dest;
    } catch (err) {
      console.error("❌ downloadFile error:", err);
    }
  },
  async isUsingLatestVersion() {
    try {
       
      const formdata = new FormData();
      formdata.append("action", "calling_bird_request");
      formdata.append("action_type", "asdfafa");
      formdata.append("secret_key", global.config.env.SECRET_KEY) 
    
      // const response = await fetch(secondary_server, {
      //   method: "POST",
      //   body: formdata,
      // });
    } catch (err) {
      console.error("❌ downloadFile error:", err);
    }
  },
};
