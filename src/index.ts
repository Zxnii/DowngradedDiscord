import "./exports";

import { app } from "electron";
import path from "path";
import fs from "fs";
import * as electron from "electron";

export function load(): void {
    console.log("Loading modifications.");

    electron.session.defaultSession.webRequest.onHeadersReceived(function(details: any, callback) {
        if (!details.responseHeaders["content-security-policy-report-only"] && !details.responseHeaders["content-security-policy"]) return callback({cancel: false});
        delete details.responseHeaders["content-security-policy-report-only"];
        delete details.responseHeaders["content-security-policy"];
        callback({cancel: false, responseHeaders: details.responseHeaders});
    });

    app.once("browser-window-created", (ev, window) => {
        console.log("Main window created.");
        
        window.on("ready-to-show", () => {
            console.log("Main window ready to be injected into.");

            window.webContents.executeJavaScript(fs.readFileSync(path.join(__dirname, "./renderer/bundle.js"), "utf8"), true);
        });
    });
}