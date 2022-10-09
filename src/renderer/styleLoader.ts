import { STYLE_DIR } from "./constants";
import path from "path";
import fs from "fs";

const loadedStyles: string[] = [];

export function loadStyles(): void {
    const styles = fs.readdirSync(STYLE_DIR);

    for (const style of styles) {
        loadedStyles.push(fs.readFileSync(path.join(STYLE_DIR, style), "utf8"));
    }
}

export function applyStyles(): void {
    document.querySelectorAll(".downgraded-discord-style").forEach(node => node.remove());

    for (const style of loadedStyles) {
        const tag = document.createElement("style");

        tag.innerHTML = style;
        tag.className = "downgraded-discord-style";

        document.head.appendChild(tag);
    }
}

(<any>window).loadStyles = loadStyles;
(<any>window).applyStyles = applyStyles;