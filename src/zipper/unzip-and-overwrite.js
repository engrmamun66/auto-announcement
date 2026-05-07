const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const { ZIP_LATEST } = require('./zip-names');

 
async function unzipAndOverwrite(
    zipFilename = ZIP_LATEST,
    destDir = path.resolve('.')
) {
    const zipPath = path.resolve(zipFilename)

    if (!fs.existsSync(zipPath)) {
        console.error(`❌ Zip file not found: ${zipPath}`);
        return;
    }

    console.log(`📦 Extracting ${path.basename(zipPath)} → ${destDir}`);

    await fs.createReadStream(zipPath)
        .pipe(unzipper.Parse())
        .on('entry', (entry) => {
            const entryPath = path.join(destDir, entry.path);
            if (entry.type === 'Directory') {
                fs.mkdirSync(entryPath, { recursive: true });
                entry.autodrain();
            } else {
                fs.mkdirSync(path.dirname(entryPath), { recursive: true });
                entry.pipe(fs.createWriteStream(entryPath));
            }
        })
        .promise();

    console.log(`✅ Extracted to: ${destDir}`);
    fs.unlinkSync(zipPath);
    console.log(`🗑️  Deleted: ${zipFilename}`);
}

module.exports = { unzipAndOverwrite };
