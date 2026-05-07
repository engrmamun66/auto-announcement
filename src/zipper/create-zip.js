const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { uploadToGoogleDrive } = require('./drive-upload');

async function create_zip_with_latest_code({ zip_for_setup_in_new_pc = false, debug_mode=false } = {}) {
    try {
        const FILE_NAME = !debug_mode ? "calling-bird-latest.zip" : "calling-bird-latest-debug-temp.zip"
        const directories = [];
        const files = [];

        const assetsDir = path.join(global.DIR, 'front-end/dist/assets');
        if (fs.existsSync(assetsDir)) {
            fs.readdirSync(assetsDir).forEach(file => {
                files.push({ src: path.join(assetsDir, file), dest: `front-end/dist/assets/${file}` });
            });
        }

        if (zip_for_setup_in_new_pc) {
            directories.push(path.join(global.DIR, 'database'));
            directories.push(path.join(global.DIR, "public"));

            
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
