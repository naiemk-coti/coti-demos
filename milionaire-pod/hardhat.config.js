import "@nomicfoundation/hardhat-ignition";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

/** @type import('hardhat/config').HardhatUserConfig */
export default {
    plugins: [hardhatEthers, hardhatVerify],
    solidity: {
        // Use exact Etherscan-listed build so verification succeeds (see https://etherscan.io/solcversions)
        compilers: [
            {
                version: "0.8.19",
                settings: {
                    optimizer: { enabled: true, runs: 200 },
                    // viaIR: true, // only re‑enable if you really need it AND Etherscan supports it
                },
            },
            {
                version: "0.8.26",
                settings: {
                    optimizer: { enabled: true, runs: 200 },
                    // viaIR: true, // only re‑enable if you really need it AND Etherscan supports it
                },
            },
        ],
    },
    networks: {
        cotiTestnet: {
            type: 'http',
            url: process.env.VITE_APP_NODE_HTTPS_ADDRESS || "https://testnet.coti.io/rpc",
            chainId: 7082400,
            accounts: [
                process.env.VITE_ALICE_PK,
                process.env.VITE_BOB_PK,
                process.env.DEPLOYER_PRIVATE_KEY
            ].filter(Boolean), // Filter out undefined values
            timeout: 60000,
            gas: 3000000,
            gasPrice: 10000000000 // 10 gwei
        },
        sepolia: {
            type: "http",
            chainType: "l1",
            url: process.env.SEPOLIA_RPC_URL,
            accounts: [process.env.SEPOLIA_PRIVATE_KEY],
        },
    },
    sourcify: {
        enabled: false
    },
    verify: {
        etherscan: {
          apiKey: process.env.ETHERSCAN_API_KEY,
          enabled: true,
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
};
