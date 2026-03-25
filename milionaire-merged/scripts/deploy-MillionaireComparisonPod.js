/**
 * Deploy `MillionaireComparisonPod` from contracts/pod to Sepolia (or another L1 with PoD).
 *
 * Constructor: (address inbox, address mpcExecutor, uint256 cotiChainId, address alice, address bob)
 *
 * Prerequisites:
 * - `HARDHAT_CONTRACTS_SCOPE=pod npm run compile` (or use `npm run compile:pod`)
 * - `.env`: SEPOLIA_PRIVATE_KEY (or DEPLOYER_PRIVATE_KEY), VITE_ALICE_PK, VITE_BOB_PK, SEPOLIA_RPC_URL
 * - Optional: POD_INBOX_ADDRESS, POD_MPC_EXECUTOR_ADDRESS, POD_COTI_CHAIN_ID
 *
 * After deploy, set VITE_CONTRACT_ADDRESS_SEPOLIA in .env for the UI.
 */
import { network } from "hardhat";
import { config as dotenvConfig } from "dotenv";

const DEFAULT_INBOX = "0xbccda4021ec2feb6c20d96aa5ab1ed3f70af7fb9";
const DEFAULT_MPC_EXECUTOR = "0x4ac4344553822cdc7201439873d575214ee3d133";
const DEFAULT_COTI_CHAIN_ID = "7082400";

dotenvConfig();

async function main() {
    if (process.env.HARDHAT_CONTRACTS_SCOPE !== "pod") {
        console.error(
            "Set HARDHAT_CONTRACTS_SCOPE=pod for this deploy (e.g. npm run deploy:pod).\n" +
                "Default Hardhat scope compiles contracts/coti only."
        );
        process.exit(1);
    }

    const { ethers } = await network.connect();
    const networkName = network.name;

    console.log("Deploying MillionaireComparisonPod to", networkName, "...");

    const signers = await ethers.getSigners();
    if (signers.length === 0) {
        throw new Error(
            "No signers. Set SEPOLIA_PRIVATE_KEY or DEPLOYER_PRIVATE_KEY in .env for this network."
        );
    }
    const deployer = signers[0];
    console.log("Deployer:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

    const alicePrivateKey = process.env.VITE_ALICE_PK;
    const bobPrivateKey = process.env.VITE_BOB_PK;

    if (!alicePrivateKey || !bobPrivateKey) {
        console.error("Set VITE_ALICE_PK and VITE_BOB_PK (participant addresses stored in the contract).");
        process.exit(1);
    }

    const aliceAddress = new ethers.Wallet(alicePrivateKey).address;
    const bobAddress = new ethers.Wallet(bobPrivateKey).address;
    console.log("Alice:", aliceAddress);
    console.log("Bob:  ", bobAddress);

    const inboxAddress = process.env.POD_INBOX_ADDRESS || DEFAULT_INBOX;
    const mpcExecutorAddress = process.env.POD_MPC_EXECUTOR_ADDRESS || DEFAULT_MPC_EXECUTOR;
    const cotiChainId = BigInt(process.env.POD_COTI_CHAIN_ID || DEFAULT_COTI_CHAIN_ID);

    console.log("POD inbox:", inboxAddress);
    console.log("POD mpcExecutor:", mpcExecutorAddress);
    console.log("POD cotiChainId:", cotiChainId.toString());

    const Factory = await ethers.getContractFactory("MillionaireComparisonPod");
    const contract = await Factory.deploy(
        inboxAddress,
        mpcExecutorAddress,
        cotiChainId,
        aliceAddress,
        bobAddress,
        {
            gasLimit: 4_000_000,
        }
    );

    console.log("Deployment tx:", contract.deploymentTransaction()?.hash);
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    const code = await ethers.provider.getCode(address);
    if (code === "0x") {
        console.error("No bytecode at address — deployment failed.");
        process.exit(1);
    }

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
