const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');

/**
 * Unzip a zip file and overwrite files into the destination directory.
 * @param {string} zipPath   - Path to zip file (default: calling-bird-latest.zip)
 * @param {string} destDir   - Destination directory (default: project root)
 */
async function unzipAndOverwrite(
    zipPath = path.resolve('calling-bird-latest.zip'),
    destDir = path.resolve('.')
) {
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
}

module.exports = { unzipAndOverwrite };
