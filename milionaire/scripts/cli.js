#!/usr/bin/env node
/**
 * Encrypt a hex private key for use in .env (output is v2:<hex>; keep ENC_K out of git).
 *
 * Usage:
 *   ENC_K='your-master-secret' npm run encrypt-key -- '0x...'   # 0x + 64 hex chars typical
 *   echo '0x...' | ENC_K='...' npm run encrypt-key
 */
import 'dotenv/config';
import { encryptPrivateKey } from '../src/lib/KeyUtils.js';
import { readFileSync } from 'node:fs';

function readPlaintext() {
    const arg = process.argv[2];
    if (arg !== undefined && arg !== '') {
        return arg;
    }
    if (!process.stdin.isTTY) {
        const buf = readFileSync(0, 'utf8');
        const s = buf.trim();
        if (s) return s;
    }
    console.error('Usage: ENC_K=<secret> npm run encrypt-key -- <private-key-hex>');
    console.error('   or: echo <private-key-hex> | ENC_K=<secret> npm run encrypt-key');
    process.exit(1);
}

function main() {
    const encK = process.env.ENC_K;
    if (!encK || encK.trim() === '') {
        console.error('ENC_K is not set. Set a strong master secret (not committed to git).');
        process.exit(1);
    }
    const plain = readPlaintext();
    const out = encryptPrivateKey(plain, encK);
    process.stdout.write(out + '\n');
}

try {
    main();
} catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
}
