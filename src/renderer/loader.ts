import { loadPlugins } from "./plugins/plugins";
import { applyStyles, loadStyles } from "./styleLoader";

console.log("Initializing DowngradedDiscord");

loadStyles();
applyStyles();

loadPlugins();