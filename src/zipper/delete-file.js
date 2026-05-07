const fs = require('fs');
const path = require('path');

function delelteFile(file_path){
    let filePath = path.resolve(file_path)
    if(fs.existsSync(filePath)){
        fs.unlinkSync(filePath);
        console.log(`✅ Deleted (${file_path})`)
    }
}

module.exports = { delelteFile }