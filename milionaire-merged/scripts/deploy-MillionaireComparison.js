/**
 * Deploy `MillionaireComparison` from contracts/coti to the configured network (default: cotiTestnet).
 *
 * Constructor: (address alice, address bob)
 *
 * Prerequisites:
 * - `npm run compile` (Hardhat compiles contracts/coti only)
 * - `.env`: VITE_ALICE_PK_FOR_COTIA, VITE_BOB_PK_FOR_COTI; DEPLOYER_PRIVATE_KEY recommended as first signer
 * - Funded deployer on COTI testnet
 *
 * After deploy, set VITE_CONTRACT_ADDRESS_COTI_TESTNET in .env for the UI.
 */
import { network } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
    const { ethers } = await network.connect();
    const networkName = network.name;

    console.log("Deploying MillionaireComparison (COTI native MPC) on network:", networkName);

    const signers = await ethers.getSigners();
    if (signers.length === 0) {
        throw new Error(
            "No signers. Set DEPLOYER_PRIVATE_KEY and/or VITE_ALICE_PK_FOR_COTIA in .env (see .env.example)."
        );
    }
    const deployer = signers[0];
    console.log("Deployer:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", ethers.formatEther(balance));

    const alicePrivateKey = process.env.VITE_ALICE_PK_FOR_COTIA;
    const bobPrivateKey = process.env.VITE_BOB_PK_FOR_COTI;

    if (!alicePrivateKey || !bobPrivateKey) {
        console.error(
            "Set VITE_ALICE_PK_FOR_COTIA and VITE_BOB_PK_FOR_COTI (participant addresses stored in the contract)."
        );
        process.exit(1);
    }

    const aliceAddress = new ethers.Wallet(alicePrivateKey).address;
    const bobAddress = new ethers.Wallet(bobPrivateKey).address;
    console.log("Alice:", aliceAddress);
    console.log("Bob:  ", bobAddress);

    const Factory = await ethers.getContractFactory("MillionaireComparison");
    const contract = await Factory.deploy(aliceAddress, bobAddress, {
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
