type PluginHeader = {
    name: string;
    version: string;
    type: "js" | "ts" | "javascript" | "typescript";
    description: string;
    [key: string]: string | undefined;
};

export default PluginHeader;