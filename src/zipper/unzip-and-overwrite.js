const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const { ZIP_LATEST } = require('./zip-names');

const TEXT_EXTS = new Set([
    '.js', '.ts', '.vue', '.jsx', '.tsx', '.json', '.md',
    '.html', '.css', '.scss', '.less', '.txt', '.yml', '.yaml',
    '.env', '.sh', '.config', '.xml', '.svg'
]);

function normalizeLineEndings(buf) {
    return buf.toString('utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function isTextFile(filePath) {
    return TEXT_EXTS.has(path.extname(filePath).toLowerCase());
}

function contentChanged(filePath, newBuf) {
    if (!fs.existsSync(filePath)) return true;
    try {
        const existing = fs.readFileSync(filePath);
        if (isTextFile(filePath)) {
            return normalizeLineEndings(existing) !== normalizeLineEndings(newBuf);
        }
        return !existing.equals(newBuf);
    } catch {
        return true;
    }
}

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

    let skipped = 0;
    let written = 0;
    const writes = [];

    await new Promise((resolve, reject) => {
        fs.createReadStream(zipPath)
            .pipe(unzipper.Parse())
            .on('entry', (entry) => {
                const entryPath = path.join(destDir, entry.path);
                if (entry.type === 'Directory') {
                    fs.mkdirSync(entryPath, { recursive: true });
                    entry.autodrain();
                } else {
                    fs.mkdirSync(path.dirname(entryPath), { recursive: true });
                    const chunks = [];
                    const p = new Promise((res, rej) => {
                        entry.on('data', (chunk) => chunks.push(chunk));
                        entry.on('end', () => {
                            try {
                                const newBuf = Buffer.concat(chunks);
                                if (contentChanged(entryPath, newBuf)) {
                                    // Normalize line endings to LF for text files
                                    const writeData = isTextFile(entryPath)
                                        ? Buffer.from(normalizeLineEndings(newBuf), 'utf8')
                                        : newBuf;
                                    fs.writeFileSync(entryPath, writeData);
                                    written++;
                                } else {
                                    skipped++;
                                }
                                res();
                            } catch (err) {
                                rej(err);
                            }
                        });
                        entry.on('error', rej);
                    });
                    writes.push(p);
                }
            })
            .on('finish', () => Promise.all(writes).then(resolve).catch(reject))
            .on('error', reject);
    });

    console.log(`✅ Extracted to: ${destDir} (written: ${written}, unchanged: ${skipped})`);
    fs.unlinkSync(zipPath);
    console.log(`🗑️  Deleted: ${zipFilename}`);
}

module.exports = { unzipAndOverwrite };
