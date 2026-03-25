import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const nm = (pkg) => path.join(__dirname, 'node_modules', pkg);

export default defineConfig({
    // Expose SEPOLIA_* and COTI_* keys from .env to import.meta.env (in addition to VITE_*)
    envPrefix: ['VITE_', 'SEPOLIA_', 'COTI_'],
    plugins: [react()],
    server: {
        port: 3000,
        strictPort: false,
        host: true,
        fs: {
            allow: [repoRoot],
        },
    },
    define: {
        global: 'globalThis',
    },
    resolve: {
        dedupe: ['react', 'react-dom', 'styled-components'],
        alias: {
            '@experience-coti': path.join(repoRoot, 'milionaire/src'),
            '@experience-pod': path.join(repoRoot, 'milionaire-pod/src'),
            react: nm('react'),
            'react-dom': nm('react-dom'),
            'react-router-dom': nm('react-router-dom'),
            'styled-components': nm('styled-components'),
            ethers: nm('ethers'),
            '@coti-io/coti-ethers': nm('@coti-io/coti-ethers'),
            '@coti-io/coti-contracts': nm('@coti-io/coti-contracts'),
            '@coti/pod-sdk': nm('@coti/pod-sdk'),
            process: 'process/browser',
            buffer: 'buffer',
            crypto: 'crypto-browserify',
            stream: 'stream-browserify',
            assert: 'assert',
            http: 'stream-http',
            https: 'https-browserify',
            os: 'os-browserify',
            url: 'url',
        },
    },
});
