import { network } from "hardhat";
import { config as dotenvConfig } from 'dotenv';

// POD / MPC defaults for COTI Testnet (override with POD_INBOX_ADDRESS, POD_MPC_EXECUTOR_ADDRESS, POD_COTI_CHAIN_ID in .env)
const DEFAULT_INBOX = "0xbccda4021ec2feb6c20d96aa5ab1ed3f70af7fb9";
const DEFAULT_MPC_EXECUTOR = "0x4ac4344553822cdc7201439873d575214ee3d133";
const DEFAULT_COTI_CHAIN_ID = "7082400";

dotenvConfig();

async function main() {
    // Hardhat 3: ethers from network.connect() (requires @nomicfoundation/hardhat-ethers plugin)
    const { ethers } = await network.connect();
    const networkName = network.name;
    console.log("Deploying MillionaireComparison (POD) contract to", networkName, "...");

    const signers = await ethers.getSigners();
    if (signers.length === 0) {
        throw new Error("No signers available. Configure accounts for this network in hardhat.config.js.");
    }
    const deployer = signers[0];
    console.log("Deploying with account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    const alicePrivateKey = process.env.VITE_ALICE_PK;
    const bobPrivateKey = process.env.VITE_BOB_PK;

    let aliceAddress, bobAddress;

    if (alicePrivateKey && bobPrivateKey) {
        aliceAddress = new ethers.Wallet(alicePrivateKey).address;
        bobAddress = new ethers.Wallet(bobPrivateKey).address;
        console.log("Alice address:", aliceAddress);
        console.log("Bob address:", bobAddress);
    } else {
        console.log("⚠️  Alice and Bob addresses not found in .env");
        console.log("Please set VITE_ALICE_PK and VITE_BOB_PK in your .env file");
        console.log("Deployment aborted.");
        process.exit(1);
    }

    // POD/MPC configuration
    const inboxAddress = process.env.POD_INBOX_ADDRESS || DEFAULT_INBOX;
    const mpcExecutorAddress = process.env.POD_MPC_EXECUTOR_ADDRESS || DEFAULT_MPC_EXECUTOR;
    const cotiChainId = BigInt(process.env.POD_COTI_CHAIN_ID || DEFAULT_COTI_CHAIN_ID);

    console.log("POD config: inbox:", inboxAddress, "mpcExecutor:", mpcExecutorAddress, "cotiChainId:", cotiChainId.toString());

    // Deploy the MillionaireComparison (POD) contract
    const MillionaireComparison = await ethers.getContractFactory("MillionaireComparison");

    console.log("Deploying MillionaireComparison (POD)...");

    // Constructor: (address inbox, address mpcExecutor, uint256 cotiChainId, address alice, address bob)
    const millionaireComparison = await MillionaireComparison.deploy(
        inboxAddress,
        mpcExecutorAddress,
        cotiChainId,
        aliceAddress,
        bobAddress,
        {
            gasLimit: 3000000,
            gasPrice: ethers.parseUnits("10", "gwei")
        }
    );

    console.log("Transaction sent, waiting for confirmation...");

    // Wait for deployment to be mined
    await millionaireComparison.waitForDeployment();

    const contractAddress = await millionaireComparison.getAddress();
    console.log("MillionaireComparison (POD) deployed to:", contractAddress);

    // Verify deployment by checking if code exists at the address
    const deployedCode = await ethers.provider.getCode(contractAddress);
    if (deployedCode === "0x") {
        console.error("❌ Deployment failed - no code at contract address");
        process.exit(1);
    }

    console.log("✅ MillionaireComparison (POD) successfully deployed!");
    console.log("Contract address:", contractAddress);
    console.log("Transaction hash:", millionaireComparison.deploymentTransaction()?.hash);

    // Save deployment info
    const deploymentInfo = {
        network: networkName,
        contractName: "MillionaireComparison",
        variant: "POD",
        contractAddress: contractAddress,
        deployerAddress: deployer.address,
        aliceAddress: aliceAddress,
        bobAddress: bobAddress,
        inboxAddress,
        mpcExecutorAddress,
        cotiChainId: cotiChainId.toString(),
        transactionHash: millionaireComparison.deploymentTransaction()?.hash,
        timestamp: new Date().toISOString()
    };

    console.log("\n🎉 Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📝 Next steps:");
    console.log("1. Copy the contract address above");
    console.log("2. Update VITE_CONTRACT_ADDRESS in your .env file");
    console.log("3. Run 'npm run dev' to start the application");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
