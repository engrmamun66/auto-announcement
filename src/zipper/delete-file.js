const fs = require('fs');
const path = require('path');

function delelteFile(file_path){
    let filePath = path.resolve(file_path)
    if(fs.existsSync(zipPath)){
        fs.unlinkSync(zipPath);
        console.log(`✅ Deleted (${file_path})`)
    }
}

module.exports = { delelteFile }