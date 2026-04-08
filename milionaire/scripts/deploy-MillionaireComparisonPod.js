/**
 * Deploy `MillionaireComparisonPod` from contracts/pod to Sepolia (or another L1 with PoD).
 *
 * Constructor: none (inbox, MPC executor, COTI chain id are hardcoded in the contract).
 * Call `configurePlayers(alice, bob)` after deploy.
 *
 * Hardcoded in contract:
 * - inbox: 0xfa158f9e49c8bb77f971c3630ebcd23a8a88d14e
 * - mpc executor: 0xc76aae4f3810fbbd5d96b92defebe0034405ad9c
 * - cotiChainId: 7082400
 *
 * Prerequisites:
 * - `HARDHAT_CONTRACTS_SCOPE=pod npm run compile` (or `npm run compile:pod`)
 * - `.env`: SEPOLIA_PRIVATE_KEY (or DEPLOYER_PRIVATE_KEY), VITE_ALICE_PK, VITE_BOB_PK, ENC_K (for v2: keys), SEPOLIA_RPC_URL
 *
 * After deploy, set VITE_CONTRACT_ADDRESS_SEPOLIA in .env for the UI.
 */
import { network } from "hardhat";
import { config as dotenvConfig } from "dotenv";
import { getPrivateKey } from "../src/lib/KeyUtils.js";

dotenvConfig();

async function main() {
    if (process.env.HARDHAT_CONTRACTS_SCOPE !== "pod") {
        console.error(
            "Set HARDHAT_CONTRACTS_SCOPE=pod for this deploy (e.g. npm run deploy:pod).\n" +
                "Default Hardhat scope compiles contracts/coti only."
        );
        process.exit(1);
    }

    const connection = await network.connect();
    const { ethers } = connection;
    const networkName = connection.networkName;

    console.log("Deploying MillionaireComparisonPod to", networkName, "...");

    const signers = await ethers.getSigners();
    if (signers.length === 0) {
        throw new Error(
            "No signers. Set SEPOLIA_PRIVATE_KEY or DEPLOYER_PRIVATE_KEY in .env for this network."
        );
    }
    const deployer = signers[0];
    console.log("Deployer (owner):", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

    if (!process.env.VITE_ALICE_PK?.trim() || !process.env.VITE_BOB_PK?.trim()) {
        console.error(
            "Set VITE_ALICE_PK and VITE_BOB_PK (same as the UI: v2: encrypted with ENC_K, or 64-char hex)."
        );
        process.exit(1);
    }

    const alicePrivateKey = getPrivateKey("VITE_ALICE_PK");
    const bobPrivateKey = getPrivateKey("VITE_BOB_PK");
    const aliceAddress = new ethers.Wallet(alicePrivateKey).address;
    const bobAddress = new ethers.Wallet(bobPrivateKey).address;
    console.log("Alice:", aliceAddress);
    console.log("Bob:  ", bobAddress);

    const Factory = await ethers.getContractFactory("MillionaireComparisonPod");
    const contract = await Factory.deploy({
        gasLimit: 4_000_000,
    });

    console.log("Deployment tx:", contract.deploymentTransaction()?.hash);
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    const code = await ethers.provider.getCode(address);
    if (code === "0x") {
        console.error("No bytecode at address — deployment failed.");
        process.exit(1);
    }

    console.log("Configuring players…");
    const tx = await contract.configurePlayers(aliceAddress, bobAddress, {
        gasLimit: 500_000,
    });
    await tx.wait();
    console.log("configurePlayers tx:", tx.hash);

    console.log("\n✅ MillionaireComparisonPod deployed at:", address);
    console.log("\nAdd to .env for the app (Sepolia / PoD route):");
    console.log(`  VITE_CONTRACT_ADDRESS_SEPOLIA=${address}`);
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
