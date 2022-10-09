import "./exports";

import { app } from "electron";
import path from "path";
import fs from "fs";

export function load(): void {
    console.log("Loading modifications.");

    app.once("browser-window-created", (ev, window) => {
        console.log("Main window created.");
        
        window.on("ready-to-show", () => {
            console.log("Main window ready to be injected into.");

            window.webContents.openDevTools();
            window.webContents.executeJavaScript(fs.readFileSync(path.join(__dirname, "./renderer/bundle.js"), "utf8"), true);
        });
    });
}