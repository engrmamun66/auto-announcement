const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { ZIP_LATEST, ZIP_TEMP, ZIP_NEW_SETUP } = require('./zip-names');

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
            const { config } = global
            const { DATABASE_PATH } = config.env // './database/latest-db-DHM101.db'
            directories.push(path.join(global.DIR, 'database'));
            /**
             * Add database folder only 'latest-db-DHM101.db' file
             */


            directories.push(path.join(global.DIR, "public"));
            const { CODE_NUMBER } = config.env
            console.log(`\nCode-Number:: ${CODE_NUMBER}`)
            const choice = await ask(`\n  → Only matched media(y/n): `);

            /**
             * From public folder
             * ==============================
             * Exclude folder: exports, temp,
             * if(choice == 'y'){
             *   pushed media folder, and take only those media that matched starts with CODE_NUMBER
             * }
             */

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
