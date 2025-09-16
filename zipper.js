/**
 * This file will make "calling-bird-latest.zip" as latest stable version
 * Command:
 */

global.DIR = __dirname;
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
let { PRIMARY_SERVER } = global.config.env
 



const process = require("process")
const readline = require("readline");
const args = process.argv.slice(2);  

 


function ask(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(question, (ans) => {
      rl.close();
      resolve(ans);
    }));
  }
  
  (async () => {
    const create = await ask("Create or Upload zip (c/u)? ");
    if(create.toLowerCase() === "c"){
        create_zip_with_latest_code()
    } else {
        const username = await ask("Enter username: ");
        const password = await ask("Enter password: ");
        if(!username) {
            console.log("❌ Username is required")
            return
        }
        if(!password) {
            console.log("❌ Password is required")
            return
        }
        let version = await ask("Enter version (Example: 1.0 or 1.0.0): ");
        if(!version){
            console.log("❌ Version is required")
            return
        } else {
            if(/^\d+\.\d{0,2}$/.test(version) || /^\d+\.\d{0,2}\.\d{0,2}$/.test(version)){
                uploadLatestZopToServer({username, password, version})
            } else {
                console.log("❌ Version format is invalid. Example: 1.0 or 1.0.0")
                return
            }
        }
    }
  })();





















async function create_zip_with_latest_code() {
  try {
    const directories = [];
    const files = [];
 

    files.push({
        src: path.join(__dirname, "front-end/dist/assets/my-announcement.min.css"),
        dest: "front-end/dist/assets/my-announcement.min.css"
    });
    files.push({
        src: path.join(__dirname, "front-end/dist/assets/my-announcement.min.js"),
        dest: "front-end/dist/assets/my-announcement.min.js"
    });

    files.push({
        src: path.join(__dirname, "public/favicon.png"),
        dest: "public/favicon.png"
    });
    files.push({
        src: path.join(__dirname, "public/logo.example.png"),
        dest: "public/logo.example.png"
    });
    files.push({
        src: path.join(__dirname, "public/sample.xlsx"),
        dest: "public/sample.xlsx"
    });
    
    directories.push(path.join(__dirname, "socket"));
    directories.push(path.join(__dirname, "src"));

    files.push(path.join(__dirname, "config.example.js"));
    files.push(path.join(__dirname, "ecosystem.config.js"));
    files.push(path.join(__dirname, "open.example.bat"));
    files.push(path.join(__dirname, "package.json"));
    files.push(path.join(__dirname, "README.md"));
    files.push(path.join(__dirname, "server.js"));
    files.push(path.join(__dirname, "zipper.js"));

    const output_file_name = `calling-bird-latest.zip`
    const outputPath = path.resolve(output_file_name);

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
      files.forEach((file) => {

        if (typeof file === "string") { 
            archive.file(file, { name: path.basename(file) });
          } else {
            // file with custom path inside zip 
            archive.file(file.src, { name: file.dest });
          }
      });

      archive.finalize();
    });

    console.log(`✅ ${output_file_name} created at`, outputPath);


  } catch (create_zip_with_latest_code_error) {
    console.log({ create_zip_with_latest_code_error });
  }
}


async function uploadLatestZopToServer({username, password, version}) {
    try {
        const outputPath = path.resolve("calling-bird-latest.zip");
         
        const formdata = new FormData();
        formdata.append("action", "calling_bird_request");
        formdata.append("action_type", "upload_latest_zip");
        formdata.append("version", version);
        formdata.append("username", username);
        formdata.append("password", password);
        formdata.append("credential", username + '||' + password);
        formdata.append("secret_key", global.config.env.SECRET_KEY)
        formdata.set("file", await fileFromPath(outputPath, "calling-bird-latest.zip"));

        console.log('======================', PRIMARY_SERVER);
      
        const response = await fetch(PRIMARY_SERVER, {
          method: "POST",
          body: formdata,
        });
      
        try {
            const result = await response.json();   
            if(result?.data?.status === "OK"){
                console.log("📤 Uploaded the latest " + outputPath);
                // await deleteDir(outputPath)
            } else {
                console.log("❌ uploadLatestZopToServer error1:", result.data.message);
            }
        } catch (error) {
            console.log("❌ uploadLatestZopToServer error2:", error);
        } 
    } catch (err) {
      console.error("❌ uploadLatestZopToServer error2:", err);
    }
}

async function deleteDir(dirPath) {
    try {
      await fs.promises.rm(dirPath, { recursive: true, force: true });
      console.log(`✅ Deleted: ${dirPath}`);
    } catch (err) {
      console.error("❌ deleteDir error:", err);
    }
}