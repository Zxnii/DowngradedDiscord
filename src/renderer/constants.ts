import path from "path";
import os from "os";
import fs from "fs";

export const CONFIG_DIR = path.join(os.homedir(), ".downgraded_discord");

export const STYLE_DIR = path.join(CONFIG_DIR, "styles");
export const PLUGIN_DIR = path.join(CONFIG_DIR, "plugins");

if (!fs.existsSync(STYLE_DIR)) fs.mkdirSync(STYLE_DIR, { recursive: true });
if (!fs.existsSync(PLUGIN_DIR)) fs.mkdirSync(PLUGIN_DIR, { recursive: true });