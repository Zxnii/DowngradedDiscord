type DiscordNative = {
    ipc: {
        invoke<T>(channel: string, ...args: unknown[]): T;
    }
};

export default DiscordNative;