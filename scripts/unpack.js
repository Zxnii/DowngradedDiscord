const process = require("process");
const asar = require("asar");
const path = require("path");
const os = require("os");
const fs = require("fs");

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

console.log(`Unpacking Discord found at ${discordPath}`);

const binaryPath = path.join(discordPath,
    fs.readdirSync(discordPath).filter(file => file.startsWith("app-")).sort().pop());

console.log(`Binaries found at ${binaryPath}`);

const asarPath = path.join(binaryPath, "resources");
const coreAsarPath = path.join(binaryPath, `modules/${fs.readdirSync(path.join(binaryPath, "modules")).filter(file => file.startsWith("discord_desktop_core-")).pop()}/discord_desktop_core`);

console.log(`Core asar found at ${coreAsarPath}`);

const currentAsarPath = path.join(asarPath, "app.asar");
const backupAsarPath = path.join(asarPath, "app.asar.bak");

const currentCoreAsarPath = path.join(coreAsarPath, "core.asar");
const backupCoreAsarPath = path.join(coreAsarPath, "core.asar.bak");

// before decompiling any asars ensure it's the default.
if (fs.existsSync(backupAsarPath)) {
    fs.copyFileSync(backupAsarPath, currentAsarPath);
}

if (fs.existsSync(backupCoreAsarPath)) {
    fs.copyFileSync(backupCoreAsarPath, currentCoreAsarPath);
}

// backup original
fs.copyFileSync(currentAsarPath, backupAsarPath);
fs.copyFileSync(currentCoreAsarPath, backupCoreAsarPath);

const unpackDir = path.join(process.cwd(), "unpacked/app");
const coreUnpackDir = path.join(process.cwd(), "unpacked/desktop_core");

if (!fs.existsSync(unpackDir)) fs.mkdirSync(unpackDir, { recursive: true });
if (!fs.existsSync(coreUnpackDir)) fs.mkdirSync(coreUnpackDir, { recursive: true });

console.log("Extracting app.asar");
asar.extractAll(currentAsarPath, unpackDir);
console.log("Extracting core.asar");
asar.extractAll(currentCoreAsarPath, coreUnpackDir);

console.log(`Complete, Discord code is now in ${path.join(process.cwd(), "unpacked")}`);
console.log("Please note, you'll have to run inject again as the original binaries were restored.");