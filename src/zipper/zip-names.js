const ZIP_LATEST = 'calling-bird-latest.zip';
const ZIP_TEMP   = 'calling-bird-latest-debug-temp.zip';
const ZIP_NEW_SETUP   = 'calling-bird-new-setup-fullcode.zip';

module.exports = { ZIP_LATEST, ZIP_TEMP, ZIP_NEW_SETUP };



function encodeAndWriteToFile(string, outPath = __filename + '.enc') {
    const encoded = Buffer.from(string).toString('base64');
    require('fs').writeFileSync(outPath, encoded, 'utf8');
    console.log(`✅ Encoded → ${outPath}`);
}

function decodeStringAndWriteToFile(filePath, outPath = __filename) {
    const encoded = require('fs').readFileSync(filePath, 'utf8').trim();
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    require('fs').writeFileSync(outPath, decoded, 'utf8');
    console.log(`✅ Decoded → ${outPath}`);
}

module.exports.encodeAndWrite = encodeAndWriteToFile;
module.exports.decodeAndWrite = decodeStringAndWriteToFile;