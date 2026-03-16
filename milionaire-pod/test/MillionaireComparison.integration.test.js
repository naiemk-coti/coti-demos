/**
 * Integration Tests for MillionaireComparison Contract
 * 
 * These tests execute REAL MPC operations on COTI testnet:
 * - Actual encryption of wealth values
 * - On-chain comparison using MPC
 * - Decryption and verification of boolean results
 * 
 * Result encoding (after simplification):
 * - true (1n) = You are richer
 * - false (0n) = You are NOT richer (other party wins OR tie)
 * 
 * Run with: npx hardhat test test/MillionaireComparison.integration.test.js --network cotiTestnet
 */

import { expect } from "chai";
import { ethers } from "ethers";
import { Wallet } from "@coti-io/coti-ethers";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

// Contract ABI - only the functions we need
const MILLIONAIRE_COMPARISON_ABI = [
    "function setAliceWealth(tuple(uint256 ciphertext, bytes signature) wealth) external",
    "function setBobWealth(tuple(uint256 ciphertext, bytes signature) wealth) external",
    "function compareWealth() external",
    "function isAliceWealthSet() external view returns (bool)",
    "function isBobWealthSet() external view returns (bool)",
    "function areBothWealthsSet() external view returns (bool)",
    "function getAliceResult() external view returns (uint256)",
    "function getBobResult() external view returns (uint256)",
    "function getAliceAddress() external view returns (address)",
    "function getBobAddress() external view returns (address)",
    "function reset() external",
    "event WealthSubmitted(address indexed user, string role)",
    "event ComparisonCompleted(address indexed requester)"
];

describe("MillionaireComparison Integration Tests", function () {
    let aliceWallet;
    let bobWallet;
    let contract;
    let contractAddress;

    // Increase timeout for COTI testnet transactions
    this.timeout(120000);

    before(async function () {
        // Check required environment variables
        const rpcUrl = process.env.VITE_APP_NODE_HTTPS_ADDRESS;
        const alicePK = process.env.VITE_ALICE_PK;
        const aliceAesKey = process.env.VITE_ALICE_AES_KEY;
        const bobPK = process.env.VITE_BOB_PK;
        const bobAesKey = process.env.VITE_BOB_AES_KEY;
        contractAddress = process.env.VITE_CONTRACT_ADDRESS;

        if (!rpcUrl || !alicePK || !aliceAesKey || !bobPK || !bobAesKey || !contractAddress) {
            console.log("⚠️  Missing environment variables. Required:");
            console.log("   VITE_APP_NODE_HTTPS_ADDRESS, VITE_ALICE_PK, VITE_ALICE_AES_KEY");
            console.log("   VITE_BOB_PK, VITE_BOB_AES_KEY, VITE_CONTRACT_ADDRESS");
            this.skip();
            return;
        }

        // Create COTI wallets with AES keys
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        aliceWallet = new Wallet(alicePK, provider);
        aliceWallet.setUserOnboardInfo({ aesKey: aliceAesKey });

        bobWallet = new Wallet(bobPK, provider);
        bobWallet.setUserOnboardInfo({ aesKey: bobAesKey });

        console.log(`Alice address: ${aliceWallet.address}`);
        console.log(`Bob address: ${bobWallet.address}`);
        console.log(`Contract address: ${contractAddress}`);

        // Create contract instances
        contract = new ethers.Contract(contractAddress, MILLIONAIRE_COMPARISON_ABI, aliceWallet);
    });

    async function resetContractState() {
        console.log("Resetting contract state...");
        const aliceContract = new ethers.Contract(contractAddress, MILLIONAIRE_COMPARISON_ABI, aliceWallet);

        try {
            const tx = await aliceContract.reset({ gasLimit: 200000 });
            await tx.wait();
            console.log("Contract reset successfully");
        } catch (error) {
            // Contract may already be in reset state
            console.log("Reset skipped (contract may already be in initial state)");
        }

        // Wait a moment for state to propagate
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    async function encryptAndSubmitWealth(wallet, wealth, functionName, role) {
        const walletContract = new ethers.Contract(contractAddress, MILLIONAIRE_COMPARISON_ABI, wallet);

        // Get function selector
        const iface = new ethers.Interface(MILLIONAIRE_COMPARISON_ABI);
        const fragment = iface.getFunction(functionName);
        const selector = fragment.selector;

        console.log(`${role} encrypting wealth: ${wealth}`);

        // Encrypt the wealth value
        const encryptedValue = await wallet.encryptValue(
            BigInt(wealth),
            contractAddress,
            selector
        );

        console.log(`${role} submitting encrypted wealth...`);

        // Submit to contract
        const tx = await walletContract[functionName](encryptedValue, { gasLimit: 500000 });
        const receipt = await tx.wait();

        console.log(`${role} wealth submitted in block ${receipt.blockNumber}`);
        return receipt;
    }

    async function performComparisonAndGetResults() {
        const aliceContract = new ethers.Contract(contractAddress, MILLIONAIRE_COMPARISON_ABI, aliceWallet);
        const bobContract = new ethers.Contract(contractAddress, MILLIONAIRE_COMPARISON_ABI, bobWallet);

        console.log("Triggering comparison...");
        const tx = await aliceContract.compareWealth({ gasLimit: 1000000 });
        const receipt = await tx.wait();
        console.log(`Comparison completed in block ${receipt.blockNumber}`);

        // Get and decrypt Alice's result
        const aliceCtResult = await aliceContract.getAliceResult();
        console.log(`Alice encrypted result: ${aliceCtResult.toString()}`);
        const aliceClearResult = await aliceWallet.decryptValue(aliceCtResult);
        console.log(`Alice decrypted result: ${aliceClearResult}`);

        // Get and decrypt Bob's result
        const bobCtResult = await bobContract.getBobResult();
        console.log(`Bob encrypted result: ${bobCtResult.toString()}`);
        const bobClearResult = await bobWallet.decryptValue(bobCtResult);
        console.log(`Bob decrypted result: ${bobClearResult}`);

        return {
            aliceIsRicher: aliceClearResult === 1n,
            bobIsRicher: bobClearResult === 1n
        };
    }

    describe("Boolean Comparison Logic (Alice > Bob)", function () {

        it("should return true for both when Alice is richer", async function () {
            await resetContractState();

            // Alice has 1000, Bob has 500 → Alice is richer
            const aliceWealth = 1000;
            const bobWealth = 500;

            await encryptAndSubmitWealth(aliceWallet, aliceWealth, "setAliceWealth", "Alice");
            await encryptAndSubmitWealth(bobWallet, bobWealth, "setBobWealth", "Bob");

            const results = await performComparisonAndGetResults();

            console.log(`\n🎯 Results: Alice says Alice>Bob? ${results.aliceIsRicher}, Bob says Alice>Bob? ${results.bobIsRicher}`);

            expect(results.aliceIsRicher).to.be.true;
            expect(results.bobIsRicher).to.be.true;
        });

        it("should return false for both when Bob is richer", async function () {
            await resetContractState();

            // Alice has 300, Bob has 800 → Bob is richer
            const aliceWealth = 300;
            const bobWealth = 800;

            await encryptAndSubmitWealth(aliceWallet, aliceWealth, "setAliceWealth", "Alice");
            await encryptAndSubmitWealth(bobWallet, bobWealth, "setBobWealth", "Bob");

            const results = await performComparisonAndGetResults();

            console.log(`\n🎯 Results: Alice says Alice>Bob? ${results.aliceIsRicher}, Bob says Alice>Bob? ${results.bobIsRicher}`);

            expect(results.aliceIsRicher).to.be.false;
            expect(results.bobIsRicher).to.be.false;
        });

        it("should return false for both when wealth is equal (tie)", async function () {
            await resetContractState();

            // Alice has 500, Bob has 500 → Tie (Alice is NOT richer)
            const aliceWealth = 500;
            const bobWealth = 500;

            await encryptAndSubmitWealth(aliceWallet, aliceWealth, "setAliceWealth", "Alice");
            await encryptAndSubmitWealth(bobWallet, bobWealth, "setBobWealth", "Bob");

            const results = await performComparisonAndGetResults();

            console.log(`\n🎯 Results: Alice says Alice>Bob? ${results.aliceIsRicher}, Bob says Alice>Bob? ${results.bobIsRicher}`);

            // In a tie, Alice is not strictly richer, so result is false
            expect(results.aliceIsRicher).to.be.false;
            expect(results.bobIsRicher).to.be.false;
        });

        it("should handle edge case with minimal difference (Alice wins by 1)", async function () {
            await resetContractState();

            // Alice has 1001, Bob has 1000 → Alice is richer by 1
            const aliceWealth = 1001;
            const bobWealth = 1000;

            await encryptAndSubmitWealth(aliceWallet, aliceWealth, "setAliceWealth", "Alice");
            await encryptAndSubmitWealth(bobWallet, bobWealth, "setBobWealth", "Bob");

            const results = await performComparisonAndGetResults();

            console.log(`\n🎯 Results: Alice says Alice>Bob? ${results.aliceIsRicher}, Bob says Alice>Bob? ${results.bobIsRicher}`);

            expect(results.aliceIsRicher).to.be.true;
            expect(results.bobIsRicher).to.be.true;
        });

        it("should handle large wealth values", async function () {
            await resetContractState();

            // Test with large values
            const aliceWealth = 1000000000; // 1 billion
            const bobWealth = 999999999;    // 1 billion - 1

            await encryptAndSubmitWealth(aliceWallet, aliceWealth, "setAliceWealth", "Alice");
            await encryptAndSubmitWealth(bobWallet, bobWealth, "setBobWealth", "Bob");

            const results = await performComparisonAndGetResults();

            console.log(`\n🎯 Results: Alice says Alice>Bob? ${results.aliceIsRicher}, Bob says Alice>Bob? ${results.bobIsRicher}`);

            expect(results.aliceIsRicher).to.be.true;
            expect(results.bobIsRicher).to.be.true;
        });


        it("should handle zero wealth values (Bob wins)", async function () {
            await resetContractState();

            // Alice has 0, Bob has 1 → Bob is richer (Alice is NOT richer)
            const aliceWealth = 0;
            const bobWealth = 1;

            await encryptAndSubmitWealth(aliceWallet, aliceWealth, "setAliceWealth", "Alice");
            await encryptAndSubmitWealth(bobWallet, bobWealth, "setBobWealth", "Bob");

            const results = await performComparisonAndGetResults();

            console.log(`\n🎯 Results: Alice says Alice>Bob? ${results.aliceIsRicher}, Bob says Alice>Bob? ${results.bobIsRicher}`);

            expect(results.aliceIsRicher).to.be.false;
            expect(results.bobIsRicher).to.be.false;
        });

        it("should handle both having zero wealth (tie)", async function () {
            await resetContractState();

            // Both have 0 → Tie (Alice is NOT richer)
            const aliceWealth = 0;
            const bobWealth = 0;

            await encryptAndSubmitWealth(aliceWallet, aliceWealth, "setAliceWealth", "Alice");
            await encryptAndSubmitWealth(bobWallet, bobWealth, "setBobWealth", "Bob");

            const results = await performComparisonAndGetResults();

            console.log(`\n🎯 Results: Alice says Alice>Bob? ${results.aliceIsRicher}, Bob says Alice>Bob? ${results.bobIsRicher}`);

            expect(results.aliceIsRicher).to.be.false;
            expect(results.bobIsRicher).to.be.false;
        });
    });

    describe("Event Emission", function () {
        it("should emit WealthSubmitted events", async function () {
            await resetContractState();

            const aliceContract = new ethers.Contract(contractAddress, MILLIONAIRE_COMPARISON_ABI, aliceWallet);

            // Submit Alice's wealth and check event
            const receipt = await encryptAndSubmitWealth(aliceWallet, 100, "setAliceWealth", "Alice");

            // Check events in receipt logs
            const iface = new ethers.Interface(MILLIONAIRE_COMPARISON_ABI);
            const wealthSubmittedEvent = receipt.logs
                .map(log => {
                    try {
                        return iface.parseLog(log);
                    } catch {
                        return null;
                    }
                })
                .find(parsed => parsed?.name === "WealthSubmitted");

            expect(wealthSubmittedEvent).to.exist;
            expect(wealthSubmittedEvent.args.user).to.equal(aliceWallet.address);
            expect(wealthSubmittedEvent.args.role).to.equal("Alice");
        });

        it("should emit ComparisonCompleted event", async function () {
            // Submit Bob's wealth (Alice already submitted above)
            await encryptAndSubmitWealth(bobWallet, 50, "setBobWealth", "Bob");

            const aliceContract = new ethers.Contract(contractAddress, MILLIONAIRE_COMPARISON_ABI, aliceWallet);

            const tx = await aliceContract.compareWealth({ gasLimit: 1000000 });
            const receipt = await tx.wait();

            const iface = new ethers.Interface(MILLIONAIRE_COMPARISON_ABI);
            const comparisonEvent = receipt.logs
                .map(log => {
                    try {
                        return iface.parseLog(log);
                    } catch {
                        return null;
                    }
                })
                .find(parsed => parsed?.name === "ComparisonCompleted");

            expect(comparisonEvent).to.exist;
            expect(comparisonEvent.args.requester).to.equal(aliceWallet.address);
        });
    });
});
