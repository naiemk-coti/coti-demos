/**
 * COTI-native MillionaireComparison only (contracts/coti).
 * The default hardhat.config.js compiles both coti + pod and fails on pragma/toolchain mismatch for pod.
 */
import "@nomicfoundation/hardhat-ignition";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const cotiRpc =
    process.env.COTI_TESTNET_RPC_URL ||
    process.env.VITE_COTI_RPC_URL ||
    process.env.VITE_COTI_APP_NODE_HTTPS_ADDRESS ||
    process.env.VITE_APP_NODE_HTTPS_ADDRESS ||
    "https://testnet.coti.io/rpc";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
    plugins: [hardhatEthers, hardhatVerify],
    solidity: {
        compilers: [
            {
                version: "0.8.19",
                settings: {
                    optimizer: { enabled: true, runs: 200 },
                },
            },
        ],
    },
    networks: {
        cotiTestnet: {
            type: "http",
            url: cotiRpc,
            chainId: 7082400,
            accounts: [
                process.env.DEPLOYER_PRIVATE_KEY,
                process.env.VITE_ALICE_PK,
                process.env.VITE_BOB_PK,
            ].filter(Boolean),
            timeout: 120000,
            gas: 3000000,
            gasPrice: 10000000000,
        },
    },
    sourcify: {
        enabled: false,
    },
    verify: {
        etherscan: {
            apiKey: process.env.ETHERSCAN_API_KEY,
            enabled: true,
        },
    },
    paths: {
        sources: "./contracts/coti",
        tests: "./test",
        cache: "./cache-coti",
        artifacts: "./artifacts-coti",
    },
};
