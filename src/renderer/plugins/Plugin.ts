import PluginHeader from "./PluginHeader";

type Plugin = {
    exports: { [key: string | number | symbol]: any };
} & PluginHeader;

export default Plugin;