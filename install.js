/*
 * Copyright 2018-2020 TON DEV SOLUTIONS LTD.
*/

const fs = require('fs');
const path = require('path');
const http = require('http');
const zlib = require('zlib');

const { bv } = require('./binaries');
const root = process.cwd();
const binariesHost = 'sdkbinaries-ws.tonlabs.io';


function downloadAndGunzip(dest, url) {
    return new Promise((resolve, reject) => {

        const request = http.get(url, response => {
            if (response.statusCode !== 200) {
                reject({
                    message: `Download from ${url} failed with ${response.statusCode}: ${response.statusMessage}`,
                });
                return;
            }
            fs.mkdirSync(path.dirname(path.resolve(dest)), { recursive: true });
            let file = fs.createWriteStream(dest, { flags: "w" });
            let opened = false;
            const failed = (err) => {
                if (file) {
                    file.close();
                    file = null;

                    fs.unlink(dest, () => {
                    });
                    reject(err);
                }
            };

            const unzip = zlib.createGunzip();
            unzip.pipe(file);


            response.pipe(unzip);


            request.on("error", err => {
                failed(err);
            });

            file.on("finish", () => {
                if (opened && file) {
                    resolve();
                }
            });

            file.on("open", () => {
                opened = true;
            });

            file.on("error", err => {
                if (err.code === "EEXIST") {
                    file.close();
                    reject("File already exists");
                } else {
                    failed(err);
                }
            });
        });
    });

}

// dev_dl - used when this package installed during CI phase or development process.
// Binaries will be copied from location specified by TC_BIN_SRC environment variable.
function dev_dl(dst, binSrc) {
    const androidPfx = 'android/src/main/jniLibs/';
    const srcPath = path.resolve(
        binSrc,
        dst.startsWith(androidPfx) ? `android/${dst.substr(androidPfx.length)}` : dst,
    );
    if (!fs.existsSync(srcPath)) {
        process.stdout.write(`Skipping ${dst} from ${srcPath} ...\n`);
        return;
    }
    process.stdout.write(`Copying ${dst} from ${srcPath} ...\n`);
    const dstPath = path.resolve(root, dst);
    const dstDir = path.dirname(path.resolve(dstPath));
    if (!fs.existsSync(dstDir)) {
        fs.mkdirSync(dstDir, { recursive: true });
    }
    fs.copyFileSync(srcPath, dstPath);
}


async function dl(dst, src) {
    if ((process.env.TC_BIN_SRC || '') !== '') {
        dev_dl(dst, process.env.TC_BIN_SRC);
        return;
    }
    const dst_path = path.resolve(root, dst);
    const src_url = `http://${binariesHost}/${src}.gz`;
    process.stdout.write(`Downloading from ${src_url} to ${dst_path} ...`);
    await downloadAndGunzip(dst_path, src_url);
    process.stdout.write('\n');
}


async function main() {
    await dl('ios/libtonclient.a', `tonclient_${bv}_react_native_ios`);
    await dl('android/src/main/jniLibs/arm64-v8a/libtonclient.so', `tonclient_${bv}_react_native_aarch64-linux-android`);
    await dl('android/src/main/jniLibs/armeabi-v7a/libtonclient.so', `tonclient_${bv}_react_native_armv7-linux-androideabi`);
    await dl('android/src/main/jniLibs/x86/libtonclient.so', `tonclient_${bv}_react_native_i686-linux-android`);
}


(async () => {
    try {
        await main();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();

