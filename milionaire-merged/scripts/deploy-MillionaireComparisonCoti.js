/**
 * Deploy native COTI Testnet MillionaireComparison (constructor: alice, bob).
 * Uses hardhat.config.coti.js so only contracts/coti is compiled.
 */
import { network } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
    const { ethers } = await network.connect();
    const networkName = network.name;

    console.log("Deploying MillionaireComparison (COTI native MPC) to", networkName, "...");

    const signers = await ethers.getSigners();
    if (signers.length === 0) {
        throw new Error(
            "No signers. Set DEPLOYER_PRIVATE_KEY and/or VITE_ALICE_PK in .env (see .env.example)."
        );
    }
    const deployer = signers[0];
    console.log("Deploying with account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "COTI");

    const alicePrivateKey = process.env.VITE_ALICE_PK;
    const bobPrivateKey = process.env.VITE_BOB_PK;

    if (!alicePrivateKey || !bobPrivateKey) {
        console.error("Set VITE_ALICE_PK and VITE_BOB_PK in .env (contract stores these participant addresses).");
        process.exit(1);
    }

    const aliceAddress = new ethers.Wallet(alicePrivateKey).address;
    const bobAddress = new ethers.Wallet(bobPrivateKey).address;
    console.log("Alice address:", aliceAddress);
    console.log("Bob address:", bobAddress);

    const MillionaireComparison = await ethers.getContractFactory("MillionaireComparison");

    const millionaireComparison = await MillionaireComparison.deploy(aliceAddress, bobAddress, {
        gasLimit: 3000000,
        gasPrice: ethers.parseUnits("10", "gwei"),
    });

    console.log("Transaction sent, waiting for confirmation...");
    await millionaireComparison.waitForDeployment();

    const contractAddress = await millionaireComparison.getAddress();
    const deployedCode = await ethers.provider.getCode(contractAddress);
    if (deployedCode === "0x") {
        console.error("Deployment failed — no code at address");
        process.exit(1);
    }

    console.log("\n✅ MillionaireComparison deployed to:", contractAddress);
    console.log("\nAdd to .env for the merged UI (COTI mode):");
    console.log("  VITE_CONTRACT_ADDRESS_COTI_TESTNET=" + contractAddress);
    console.log("  # aliases: VITE_CONTRACT_ADDRESS_COTI= / VITE_COTI_CONTRACT_ADDRESS=");
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
