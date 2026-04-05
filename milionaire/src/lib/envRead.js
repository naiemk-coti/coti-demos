/**
 * Read Vite client env. Merged app uses envPrefix VITE_, SEPOLIA_, COTI_ in vite.config.js.
 */
export function readEnv(key, fallback) {
    const v = import.meta.env[key];
    if (v !== undefined && v !== null && v !== '') {
        return v;
    }
    return fallback;
}
