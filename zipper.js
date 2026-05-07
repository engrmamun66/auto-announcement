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
let { PRIMARY_SERVER, PRIMARY_SERVER_LOCAL } = global.config.env
 



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
    const create = await ask("Create(c) / Upload to server(u) / Upload to Google Drive(g)? ");
    if(create.toLowerCase() === "c"){
        const zip_for_setup_in_new_pc = await ask("Zip for setup in new PC (y/n): ");
        create_zip_with_latest_code({zip_for_setup_in_new_pc: zip_for_setup_in_new_pc === 'y'})
    } else if(create.toLowerCase() === "g"){
        uploadToGoogleDrive()
    } else {
      console.log('===== Uploading Latest Code to Server =====');
        // const username = await ask("Enter username: ");
        // const password = await ask("Enter password: ");
        // if(!username) {
        //     console.log("❌ Username is required")
        //     return
        // }
        // if(!password) {
        //     console.log("❌ Password is required")
        //     return
        // }
        // let server_api_url = PRIMARY_SERVER
        // console.log('PRIMARY_SERVER:: ', PRIMARY_SERVER);
        // const server = await ask("Which Server(l/p)? ");
        // if(!server || server.toLowerCase() === "l"){
        //     server_api_url = PRIMARY_SERVER_LOCAL
        // } else {
        //     server_api_url = PRIMARY_SERVER
        // }


        let username = 'mamun'
        let password = 'xasdf'
        server_api_url = PRIMARY_SERVER_LOCAL

        uploadLatestZopToServer({server_api_url, username, password}) 
    }
  })();





















async function create_zip_with_latest_code({zip_for_setup_in_new_pc=false}={}) {
  try {
    const directories = [];
    const files = [];


    // files.push({
    //     src: path.join(__dirname, "front-end/dist/assets/my-announcement.min.css"),
    //     dest: "front-end/dist/assets/my-announcement.min.css"
    // });
    // files.push({
    //     src: path.join(__dirname, "front-end/dist/assets/my-announcement.min.js"),
    //     dest: "front-end/dist/assets/my-announcement.min.js"
    // });
 

    const assetsDir = path.join(__dirname, "front-end/dist/assets");
    if (fs.existsSync(assetsDir)) {
      fs.readdirSync(assetsDir).forEach(file => {
        files.push({
          src: path.join(assetsDir, file),
          dest: `front-end/dist/assets/${file}`
        });
      });
    }

    if(zip_for_setup_in_new_pc){
      directories.push(path.join(__dirname, "database"));
      const publicDir = path.join(__dirname, "public");
      if (fs.existsSync(publicDir)) {
        fs.readdirSync(publicDir).forEach(file => {
          const fullPath = path.join(publicDir, file);
          if (fs.statSync(fullPath).isFile()) {
            files.push({ src: fullPath, dest: `public/${file}` });
          }
        });
      }

    } else {
      files.push({
          src: path.join(__dirname, "public/favicon.png"),
          dest: "public/favicon.png"
      });
      files.push({
          src: path.join(__dirname, "public/logo.example.png"),
          dest: "public/logo.example.jpeg"
      });
      files.push({
        src: path.join(__dirname, "public/logo.example.jpeg"),
        dest: "public/logo.example.jpeg"
      });
      files.push({
        src: path.join(__dirname, "public/logo.example.jpg"),
        dest: "public/logo.example.jpg"
      });
      files.push({
          src: path.join(__dirname, "public/sample.xlsx"),
          dest: "public/sample.xlsx"
      });
    }

    
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


async function uploadLatestZopToServer({server_api_url=PRIMARY_SERVER, username, password}) {
    try {
        const outputPath = path.resolve("calling-bird-latest.zip");
         
        const formdata = new FormData();
        formdata.append("action", "calling_bird_request");
        formdata.append("action_type", "upload_latest_zip");
        formdata.append("username", username);
        formdata.append("password", password);
        formdata.append("credential", username + '||' + password);
        formdata.append("secret_key", global.config.env.SECRET_KEY)
        formdata.set("file", await fileFromPath(outputPath, "calling-bird-latest.zip"));


      
        const response = await fetch(server_api_url, {
          method: "POST",
          body: formdata,
        });
      
        try {
            const result = await response.json();   
            console.log({result});
            if(result?.success){
                console.log("📤 Uploaded the latest " + outputPath);
                console.log(result.data);
                // await deleteDir(outputPath)
            } else {
                console.log("❌ uploadLatestZopToServer error1:", result.data?.message);
            }
        } catch (error) {
            console.log("❌ uploadLatestZopToServer error2:", error);
        } 
    } catch (err) {
      console.error("❌ uploadLatestZopToServer error3:", err);
    }
}

// ===== Google Drive credentials (fill in per machine) =====
const GDRIVE_CLIENT_ID     = '1007948709664-qhdf7mhmd8g4mhr6gqumu98d0pldsl1v.apps.googleusercontent.com';
const GDRIVE_CLIENT_SECRET = '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';
const GDRIVE_REFRESH_TOKEN = '1//0gHLsoFNhMoX-CgYIARAAGBASNwF-L9IroRBfAZeD74kifG49059lm3m7hdGvp0CdaTN9mfw4VMCLB7HG2Nlm-h4wt691AhUkvdQ';
const GDRIVE_FOLDER_ID     = '1_RO1kcAVIQPAQan_46mX8detzJnznZ5p';
// ==========================================================

async function uploadToGoogleDrive() {
    try {
        const { google } = require('googleapis');
        if (GDRIVE_REFRESH_TOKEN === 'YOUR_REFRESH_TOKEN') {
            console.error('❌ Fill in GDRIVE credentials in zipper.js');
            return;
        }

        const auth = new google.auth.OAuth2(GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET);
        auth.setCredentials({ refresh_token: GDRIVE_REFRESH_TOKEN });

        const drive = google.drive({ version: 'v3', auth });
        const zipPath = path.resolve('calling-bird-latest.zip');

        if (!fs.existsSync(zipPath)) {
            console.error('❌ calling-bird-latest.zip not found. Create it first (c).');
            return;
        }

        console.log('📤 Uploading to Google Drive...');
        const response = await drive.files.create({
            requestBody: {
                name: 'calling-bird-latest.zip',
                parents: [GDRIVE_FOLDER_ID],
            },
            media: {
                mimeType: 'application/zip',
                body: fs.createReadStream(zipPath),
            },
            fields: 'id, name, webViewLink',
        });

        console.log('✅ Uploaded:', response.data.name);
        console.log('🔗 Link:', response.data.webViewLink);
    } catch (err) {
        console.error('❌ uploadToGoogleDrive error:', err.message);
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