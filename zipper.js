/**
 * This file will make "calling-bird-latest.zip" as latest stable version
 */

const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { FormData } = require("formdata-node");
const { fileFromPath } = require("formdata-node/file-from-path");

let config = require('./config.example');
const configPath = path.join(__dirname, 'config.js');
if (fs.existsSync(configPath)) {
  config = require(configPath);
}
global.config = config


async function createBackupAndSend() {
  try {
    const directories = [];
    const files = [];


    
    
    files.push(path.join(__dirname, "front-end/dist/assets/my-announcement.min.css"));
    files.push(path.join(__dirname, "front-end/dist/assets/my-announcement.min.js"));
    
    files.push(path.join(__dirname, "public/favicon.png"));
    files.push(path.join(__dirname, "public/logo.example.png"));
    files.push(path.join(__dirname, "public/sample.xlsx"));
    
    directories.push(path.join(__dirname, "socket"));
    directories.push(path.join(__dirname, "src"));

    files.push(path.join(__dirname, "config.example.js"));
    files.push(path.join(__dirname, "ecosystem.config.js"));
    files.push(path.join(__dirname, "open.example.bat"));
    files.push(path.join(__dirname, "package.json"));
    files.push(path.join(__dirname, "README.md"));
    files.push(path.join(__dirname, "server.js"));
    files.push(path.join(__dirname, "zipper.js"));


    const outputPath = path.resolve("calling-bird-latest.zip");

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

    console.log("📤 Uploaded the backup file");
       


  } catch (createBackupAndSend_error) {
    console.log({ createBackupAndSend_error });
  }
}

createBackupAndSend()
