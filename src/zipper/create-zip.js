const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { ZIP_LATEST, ZIP_TEMP, ZIP_NEW_SETUP } = require('./zip-names');

function addDirFiles(files, dirPath, archiveDest) {
    if (!fs.existsSync(dirPath)) return;
    fs.readdirSync(dirPath).forEach(item => {
        const full = path.join(dirPath, item);
        if (fs.statSync(full).isDirectory()) {
            addDirFiles(files, full, `${archiveDest}/${item}`);
        } else {
            files.push({ src: full, dest: `${archiveDest}/${item}` });
        }
    });
}

async function create_zip_with_latest_code({ file_name, for_new_setup = false, ask = async ()=>{} } = {}) {
    try {
        const FILE_NAME = file_name;
        const directories = [];
        const files = [];

        const assetsDir = path.join(global.DIR, 'front-end/dist/assets');
        if (fs.existsSync(assetsDir)) {
            fs.readdirSync(assetsDir).forEach(file => {
                files.push({ src: path.join(assetsDir, file), dest: `front-end/dist/assets/${file}` });
            });
        }

        if (for_new_setup) {
            const { DATABASE_PATH, CODE_NUMBER } = global.config.env;

            // Only the specific DB file, not whole database dir
            const dbFile = path.resolve(DATABASE_PATH || './database/database.db');
            if (fs.existsSync(dbFile)) {
                files.push({ src: dbFile, dest: `database/${path.basename(dbFile)}` });
            }

            console.log(`\nCode-Number:: ${CODE_NUMBER}`);
            const choice = (await ask(`\n  → Only matched media([y/enter]/all): `)).trim().toLowerCase();

            const publicDir = path.join(global.DIR, 'public');
            const EXCLUDE = new Set(['exports', 'temp']);
            if (fs.existsSync(publicDir)) {
                fs.readdirSync(publicDir).forEach(item => {
                    const fullPath = path.join(publicDir, item);
                    const stat = fs.statSync(fullPath);
                    if (stat.isFile()) {
                        files.push({ src: fullPath, dest: `public/${item}` });
                    } else if (stat.isDirectory() && !EXCLUDE.has(item)) {
                        if (item === 'media' && (!choice || choice === 'y')) {
                            fs.readdirSync(fullPath).forEach(mediaFile => {
                                if (mediaFile.startsWith(CODE_NUMBER)) {
                                    files.push({ src: path.join(fullPath, mediaFile), dest: `public/media/${mediaFile}` });
                                }
                            });
                        } else {
                            addDirFiles(files, fullPath, `public/${item}`);
                        }
                    }
                });
            }

        } else {
            // all root file of public folder
            const publicDir = path.join(global.DIR, 'public');
            if (fs.existsSync(publicDir)) {
                fs.readdirSync(publicDir).forEach(file => {
                    const fullPath = path.join(publicDir, file);
                    if (fs.statSync(fullPath).isFile()) {
                        files.push({ src: fullPath, dest: `public/${file}` });
                    }
                });
            }
        }

        directories.push(path.join(global.DIR, 'socket'));
        directories.push(path.join(global.DIR, 'src'));

        files.push(path.join(global.DIR, 'config.example.js'));
        files.push(path.join(global.DIR, 'ecosystem.config.js'));
        files.push(path.join(global.DIR, 'open.example.bat'));
        files.push(path.join(global.DIR, 'package.json'));
        files.push(path.join(global.DIR, 'server.js'));
        files.push(path.join(global.DIR, 'README.md'));
        files.push(path.join(global.DIR, 'zipper.js'));
        files.push(path.join(global.DIR, 'relay.multiboard.md'));

        const outputPath = path.resolve(FILE_NAME);

        await new Promise((resolve, reject) => {
            const output = fs.createWriteStream(outputPath);
            const archive = archiver('zip', { zlib: { level: 9 } });
            output.on('close', resolve);
            archive.on('error', reject);
            archive.pipe(output);
            directories.forEach(p => archive.directory(p, path.basename(p)));
            files.forEach(file => {
                if (typeof file === 'string') {
                    archive.file(file, { name: path.basename(file) });
                } else {
                    archive.file(file.src, { name: file.dest });
                }
            });
            archive.finalize();
        });

        console.log(`\n ✅ created  ${FILE_NAME}`);
    } catch (err) {
        console.error('❌ create_zip error:', err);
    }
}

module.exports = { create_zip_with_latest_code };
