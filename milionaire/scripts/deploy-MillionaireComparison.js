/**
 * Deploy `MillionaireComparison` from contracts/coti to the configured network (default: cotiTestnet).
 *
 * Constructor: none. Call `configurePlayers(alice, bob)` after deploy (same tx batch via script).
 *
 * Prerequisites:
 * - `npm run compile` (Hardhat compiles contracts/coti only)
 * - `.env`: VITE_ALICE_PK_FOR_COTIA / VITE_BOB_PK_FOR_COTI (or VITE_ALICE_PK / VITE_BOB_PK), ENC_K if using v2: keys; DEPLOYER_PRIVATE_KEY as deployer
 * - Funded deployer on COTI testnet
 *
 * After deploy, set VITE_CONTRACT_ADDRESS_COTI_TESTNET in .env for the UI.
 */
import { network } from "hardhat";
import { config as dotenvConfig } from "dotenv";
import { getPrivateKey } from "../src/lib/KeyUtils.js";

dotenvConfig();

async function main() {
    const connection = await network.connect();
    const { ethers } = connection;
    const networkName = connection.networkName;

    console.log("Deploying MillionaireComparison (COTI native MPC) on network:", networkName);

    const signers = await ethers.getSigners();
    if (signers.length === 0) {
        throw new Error(
            "No signers. Set DEPLOYER_PRIVATE_KEY in .env (see .env.example)."
        );
    }
    const deployer = signers[0];
    console.log("Deployer:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", ethers.formatEther(balance));

    const aliceEnv = process.env.VITE_ALICE_PK_FOR_COTIA || process.env.VITE_ALICE_PK;
    const bobEnv = process.env.VITE_BOB_PK_FOR_COTI || process.env.VITE_BOB_PK;

    if (!aliceEnv?.trim() || !bobEnv?.trim()) {
        console.error(
            "Set VITE_ALICE_PK_FOR_COTIA and VITE_BOB_PK_FOR_COTI (or VITE_ALICE_PK / VITE_BOB_PK) for configurePlayers."
        );
        process.exit(1);
    }

    const alicePrivateKey = getPrivateKey(
        process.env.VITE_ALICE_PK_FOR_COTIA ? "VITE_ALICE_PK_FOR_COTIA" : "VITE_ALICE_PK"
    );
    const bobPrivateKey = getPrivateKey(
        process.env.VITE_BOB_PK_FOR_COTI ? "VITE_BOB_PK_FOR_COTI" : "VITE_BOB_PK"
    );
    const aliceAddress = new ethers.Wallet(alicePrivateKey).address;
    const bobAddress = new ethers.Wallet(bobPrivateKey).address;
    console.log("Alice:", aliceAddress);
    console.log("Bob:  ", bobAddress);

    const Factory = await ethers.getContractFactory("MillionaireComparison");
    const contract = await Factory.deploy({
        gasLimit: 3_000_000,
        gasPrice: ethers.parseUnits("10", "gwei"),
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
        gasPrice: ethers.parseUnits("10", "gwei"),
    });
    await tx.wait();
    console.log("configurePlayers tx:", tx.hash);

    console.log("\n✅ MillionaireComparison deployed at:", address);
    console.log("\nAdd to .env for the app (COTI route):");
    console.log(`  VITE_CONTRACT_ADDRESS_COTI_TESTNET=${address}`);
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
