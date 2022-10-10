import { PLUGIN_DIR } from "../constants";
import Plugin from "./Plugin";
import path from "path";
import fs from "fs";
import PluginFunction from "./PluginFunction";
import PluginHeader from "./PluginHeader";

const plugins: Plugin[] = [];

function readHeader(source: string): PluginHeader {
    const metadata: Record<string, string | undefined> = {};

    const commentRegex = /\/\*\*\*((.|\n|\r)*)\*\*\*\//;
    const matches = commentRegex.exec(source);

    if (!matches) {
        throw "missing plugin metadata";
    }

    const lines = matches[1].split("\n");

    for (const line of lines) {
        const lineRegex = /(\s+)?\*\s(.*):(\s+)?(.*)/;
        const lineMatches = lineRegex.exec(line)?.filter(match => match.trim().length > 0);

        if (lineMatches) {
            const key = lineMatches[1];
            const value = lineMatches[2];

            metadata[key] = value;
        }
    }

    if (!metadata["name"]) throw "missing plugin name";
    if (!metadata["version"]) throw "missing plugin version";
    if (!metadata["type"]) throw "missing plugin type";
    else {
        if (
            metadata["type"] !== "js"
                && metadata["type"] !== "ts"
                && metadata["type"] !== "javascript"
                && metadata["type"] !== "typescript") {
                    throw "invalid plugin type, must be one of the following: js, ts, javascript, typescript";
                }
    }

    return {
        name: metadata["name"],
        version: metadata["version"],
        type: metadata["type"],
        description: metadata["description"] ?? "no description provided"
    };
}

export function loadPlugin(source: string, fileName: string) {
    let header: PluginHeader;

    try {
        header = readHeader(source);
    } catch (e) {
        console.error(`Plugin load from ${fileName} failed:`, e);
        return;
    }

    if (plugins.find(plugin => plugin.name === header.name)) {
        console.error(`Plugin ${header.name} is already loaded.`);
        return;
    }

    console.log(`Loading plugin: ${header.name}`);
    console.log(`Version: ${header.version}`);
    console.log(`Plugin type: ${header.type}`);
    console.log(`Description: ${header.description}`);

    let pluginFunction: PluginFunction;

    try {
        pluginFunction = <PluginFunction>new Function("api", "exports", "module", source);
    } catch (e) {
        console.error(`Failed to compile plugin ${header.name}:`, e);
        return;
    }

    try {
        const exports = {};

        pluginFunction({}, exports, { exports });

        plugins.push(<any>{
            ...header,
            exports
        });
    } catch (e) {
        console.error(`Error occured within plugin ${header.name}:`, e)
    }
}

export function unloadPlugin(plugin: Plugin) {
    console.log(`Unloading ${plugin.name}`);

    const unload = <(() => void) | undefined>plugin.exports.unload;

    if (unload) {
        unload();
    } else {
        console.error("Plugin did not export an unload function.")
    }

    const index = plugins.findIndex(val => val.name === plugin.name);

    plugins.splice(index, 1);
}

export function loadPlugins() {
    const plugins = fs.readdirSync(PLUGIN_DIR);

    for (const plugin of plugins) {
        loadPlugin(fs.readFileSync(path.join(PLUGIN_DIR, plugin), "utf8"), plugin);
    }
}