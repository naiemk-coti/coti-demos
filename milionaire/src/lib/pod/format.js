/** Pretty-print on-chain ciphertext values for the UI. */
export function formatCiphertext(ct) {
    if (ct == null) return '';
    const replacer = (_, v) => (typeof v === 'bigint' ? v.toString() : v);
    try {
        return JSON.stringify(ct, replacer, 2);
    } catch {
        return String(ct);
    }
}

/** @deprecated use formatCiphertext */
export const formatCtUint256 = formatCiphertext;
