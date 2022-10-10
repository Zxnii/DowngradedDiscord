import PluginApi from "./PluginApi";

type PluginFunction = (api: PluginApi, exports: {[key: string | number | symbol]: any}, module: { exports: {[key: string | number | symbol]: any} }) => unknown;

export default PluginFunction;