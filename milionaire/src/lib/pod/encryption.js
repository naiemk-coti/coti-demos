import { ethers } from 'ethers';
import { readEnv } from '../envRead.js';

const ENCRYPTION_URL = 'https://fullnode.testnet.coti.io/pod-encryption';
const MAX_UINT64 = (1n << 64n) - 1n;

const WEALTH_ABI = new ethers.Interface([
    'function setAliceWealth(tuple(uint256 ciphertext, bytes signature) wealth) external',
    'function setBobWealth(tuple(uint256 ciphertext, bytes signature) wealth) external',
]);
export const SET_ALICE_WEALTH_SELECTOR = WEALTH_ABI.getFunction('setAliceWealth').selector;
export const SET_BOB_WEALTH_SELECTOR = WEALTH_ABI.getFunction('setBobWealth').selector;

function hex(v) {
    const t = String(v).trim();
    return t.startsWith('0x') ? t : `0x${t}`;
}

export function parseUint64Wealth(raw) {
    const s = String(raw ?? '')
        .trim()
        .replace(/,/g, '');
    if (!s) throw new Error('Amount is required');
    if (!/^\d+$/.test(s)) throw new Error('PoD wealth must be a whole number');
    const value = BigInt(s);
    if (value > MAX_UINT64) throw new Error('Amount exceeds 64-bit range');
    return value;
}

/** PoD service `buildEncryptedInputs` → pod-mpc-lib `itUint64`. */
export function mapPodUint64Response({ ciphertext, signature }) {
    if (ciphertext == null || typeof signature !== 'string') {
        throw new Error('Invalid uint64 encrypt response (expected ciphertext and signature)');
    }
    return {
        ciphertext: BigInt(hex(ciphertext)),
        signature: hex(signature),
    };
}

async function fetchEncryptedInputs(value, signingContext = {}) {
    const res = await fetch(`${ENCRYPTION_URL}/buildEncryptedInputs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            dataType: 'uint64',
            value: String(value),
            ...signingContext,
        }),
    });
    if (!res.ok) {
        throw new Error(`PoD encryption service error: ${await res.text()}`);
    }
    const data = await res.json();
    const ciphertext = data.ciphertext ?? data.cipherText;
    if (ciphertext == null || data.signature == null) {
        throw new Error('PoD encryption response missing ciphertext or signature');
    }
    return { ciphertext, signature: data.signature };
}

/**
 * @param {string} decimalAmount
 * @param {'alice'|'bob'} role
 * @param {string} contractAddress
 * @param {string} userAddress
 */
export async function encryptDecimalWealth(decimalAmount, role, contractAddress, userAddress) {
    const wei = parseUint64Wealth(decimalAmount);
    const enc = await fetchEncryptedInputs(wei.toString(), {
        contractAddress,
        functionSelector: role === 'alice' ? SET_ALICE_WEALTH_SELECTOR : SET_BOB_WEALTH_SELECTOR,
        userAddress,
        aesKey: readEnv(role === 'alice' ? 'VITE_ALICE_AES_KEY' : 'VITE_BOB_AES_KEY'),
    });
    return mapPodUint64Response(enc);
}
