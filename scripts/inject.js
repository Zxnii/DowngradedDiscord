const esbuild = require("esbuild");
const process = require("process");
const asar = require("asar");
const path = require("path");
const os = require("os");
const fs = require("fs");

function getAllFiles(dir, root = dir) {
    const files = [];
    const dirFiles = fs.readdirSync(dir);

    for (const file of dirFiles) {
        const fullPath = path.join(dir, file);

        if (fs.statSync(fullPath).isDirectory()) {
            files.push(...getAllFiles(fullPath, root));
        } else {
            files.push(fullPath.replace(root, ""));
        }
    }

    return files;
}

(async function() {
    let discordPath;
    
    if (process.platform === "win32") {
        discordPath = path.join(os.homedir(), "AppData/Local");

        if (process.argv.includes("-ptb")) {
            discordPath = path.join(discordPath, "DiscordPTB");
        } else if (process.argv.includes("-canary")) {
            discordPath = path.join(discordPath, "DiscordCanary");
        } else {
            discordPath = path.join(discordPath, "Discord");
        }
    } else {
        console.log("Only Windows is supported currently.");
        process.exit(0);
    }

    if (!fs.existsSync(discordPath)) {
        console.log(`Could not find Discord at ${discordPath}`);
        process.exit(0);
    }

    console.log(`Patching Discord found at ${discordPath}`);

    const binaryPath = path.join(discordPath,
        fs.readdirSync(discordPath).filter(file => file.startsWith("app-")).sort().pop());

    console.log(`Binaries found at ${binaryPath}`);

    const asarPath = path.join(binaryPath, "resources");
    const coreAsarPath = path.join(binaryPath, `modules/${fs.readdirSync(path.join(binaryPath, "modules")).filter(file => file.startsWith("discord_desktop_core-")).pop()}/discord_desktop_core`);

    console.log(`Core asar found at ${coreAsarPath}`)

    const currentAsarPath = path.join(asarPath, "app.asar");
    const backupAsarPath = path.join(asarPath, "app.asar.bak");

    const currentCoreAsarPath = path.join(coreAsarPath, "core.asar");
    const backupCoreAsarPath = path.join(coreAsarPath, "core.asar.bak");

    // before modifying any asars ensure it's the default.
    if (fs.existsSync(backupAsarPath)) {
        fs.copyFileSync(backupAsarPath, currentAsarPath);
    }

    if (fs.existsSync(backupCoreAsarPath)) {
        fs.copyFileSync(backupCoreAsarPath, currentCoreAsarPath);
    }

    // backup original
    fs.copyFileSync(currentAsarPath, backupAsarPath);
    fs.copyFileSync(currentCoreAsarPath, backupCoreAsarPath);

    const unpackDir = path.join(binaryPath, "app_unpacked");
    const coreUnpackDir = path.join(binaryPath, "core_unpacked");

    console.log("Bundling renderer source.");
    esbuild.buildSync({
        entryPoints: [path.join(__dirname, "../src/renderer/loader.ts")],
        bundle: true,
        outfile: path.join(__dirname, "../build/renderer/bundle.js"),
        platform: "node"
    });
    console.log("Bundled.")

    console.log("Extracting app.asar");
    asar.extractAll(currentAsarPath, unpackDir);
    console.log("Extracting core.asar");
    asar.extractAll(currentCoreAsarPath, coreUnpackDir);
    console.log("Extracted! Patching asars.");

    const patchDir = path.join(__dirname, "../patches");
    const modificationDir = path.join(__dirname, "../build");

    const patches = getAllFiles(patchDir);

    const appPatches = patches.filter(path => !path.includes("desktop_core"));
    const corePatches = patches.filter(path => path.includes("desktop_core"));

    const modifications = getAllFiles(modificationDir);

    for (const patch of appPatches) {
        fs.copyFileSync(path.join(patchDir, patch), path.join(unpackDir, patch));
    }

    for (const patch of corePatches) {
        fs.copyFileSync(path.join(patchDir, patch),
            path.join(coreUnpackDir, patch.replace(`${path.sep}modules${path.sep}desktop_core`, "")));
    }

    console.log("Patched. Adding modifications");

    if (!fs.existsSync(path.join(unpackDir, "modifications"))) {
        fs.mkdirSync(path.join(unpackDir, "modifications"));
    }

    for (const mod of modifications) {
        const dest = path.join(unpackDir, "modifications", mod);

        if (!fs.existsSync(path.dirname(dest))) {
            fs.mkdirSync(path.dirname(dest), { recursive: true });
        }

        fs.copyFileSync(path.join(modificationDir, mod), dest);
    }

    console.log("Added modifications, packing asars");

    await Promise.all([
        asar.createPackage(unpackDir, currentAsarPath),
        asar.createPackage(coreUnpackDir, currentCoreAsarPath)
    ]);

    console.log("Done. Cleaning up.");

    fs.rm(unpackDir, { recursive: true, force: true }, err => {
        if (err) throw err;
    });
    fs.rm(coreUnpackDir, { recursive: true, force: true }, err => {
        if (err) throw err;
    });
})();