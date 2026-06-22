/**
 * Public deployed contract addresses.
 *
 * These are not secrets, so keep them in git instead of .env. Leave a value as
 * an empty string until that network is deployed.
 */
export const MILLIONAIRE_CONTRACT_ADDRESSES = {
    7082400: '', // COTI Testnet
    11155111: '', // Sepolia
    43113: '', // Avalanche Fuji
};

export function configuredAddress(address) {
    return typeof address === 'string' && address.trim() ? address.trim() : '';
}

export function getMillionaireContractAddress(chainId) {
    return configuredAddress(MILLIONAIRE_CONTRACT_ADDRESSES[String(chainId)]);
}
