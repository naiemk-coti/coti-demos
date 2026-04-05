import { Contract, type Provider } from 'ethers';

const INBOX_ABI = [
    'function calculateTwoWayFeeRequiredInLocalToken(uint256 remoteMethodCallSize, uint256 callBackMethodCallSize, uint256 remoteMethodExecutionGas, uint256 callBackMethodExecutionGas, uint256 gasPrice) view returns (uint256 targetGasRemote, uint256 callerGasLocal)',
] as const;

/** Same fallback as inbox `InboxFeeManager.DEFAULT_GAS_PRICE`. */
const DEFAULT_GAS_PRICE_WEI = 2_000_000_000n;
/**
 * Conservative `abi.encode(MpcMethodCall).length` for fee templates (real `gt64` payload is ~928 bytes).
 */
const REMOTE_METHOD_CALL_SIZE_BYTES = 2048n;
const CALLBACK_METHOD_CALL_SIZE_BYTES = 128n;
const REMOTE_METHOD_EXECUTION_GAS = 300_000n;
const CALLBACK_METHOD_EXECUTION_GAS = 300_000n;

export type PodCompareWealthFeeEstimate = {
    gasPriceWei: bigint;
    /** `calculateTwoWayFeeRequiredInLocalToken`: remote leg, converted to local native wei via oracle `mulDiv`. */
    totalFeeWei: bigint;
    /** `calculateTwoWayFeeRequiredInLocalToken`: local callback leg (wei). */
    callbackFeeWei: bigint;
};

/**
 * Fee for `MillionaireComparisonPod.compareWealth` using inbox `calculateTwoWayFeeRequiredInLocalToken`
 * (same remote→local conversion as on-chain `Math.mulDiv(targetGas, remoteTokenPrice, localTokenPrice)`).
 */
export async function estimateMillionairePodCompareWealthFee(
    provider: Provider,
    inboxAddress: string
): Promise<PodCompareWealthFeeEstimate> {
    const fd = await provider.getFeeData();
    const gasPriceWei = fd.gasPrice ?? fd.maxFeePerGas ?? DEFAULT_GAS_PRICE_WEI;

    const inbox = new Contract(inboxAddress, INBOX_ABI, provider);
    const [targetGasRemoteInLocalWei, callerGasLocalWei] =
        await inbox.calculateTwoWayFeeRequiredInLocalToken(
            REMOTE_METHOD_CALL_SIZE_BYTES,
            CALLBACK_METHOD_CALL_SIZE_BYTES,
            REMOTE_METHOD_EXECUTION_GAS,
            CALLBACK_METHOD_EXECUTION_GAS,
            gasPriceWei
        );

    return {
        gasPriceWei,
        totalFeeWei: (targetGasRemoteInLocalWei + callerGasLocalWei) * 4n, // double the gas as buffer
        callbackFeeWei: callerGasLocalWei * 2n, // double the gas as buffer
    };
}
