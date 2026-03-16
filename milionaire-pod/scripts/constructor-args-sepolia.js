/**
 * Constructor arguments for MillionaireComparison used when deploying to Sepolia.
 * Used by: npx hardhat verify --constructor-args-path scripts/constructor-args-sepolia.js ...
 *
 * Set these in .env (same as deploy) or replace with the exact values used at deploy time:
 * - POD_INBOX_ADDRESS, POD_MPC_EXECUTOR_ADDRESS, POD_COTI_CHAIN_ID
 * - VITE_ALICE_PK, VITE_BOB_PK (addresses are derived from these)
 */
import { config as dotenvConfig } from 'dotenv';
import { ethers } from 'ethers';

dotenvConfig();

const inbox = process.env.POD_INBOX_ADDRESS || "0xbccda4021ec2feb6c20d96aa5ab1ed3f70af7fb9";
const mpcExecutor = process.env.POD_MPC_EXECUTOR_ADDRESS || "0x4ac4344553822cdc7201439873d575214ee3d133";
const cotiChainId = process.env.POD_COTI_CHAIN_ID || "7082400";

let aliceAddress, bobAddress;
if (process.env.VITE_ALICE_PK && process.env.VITE_BOB_PK) {
  aliceAddress = new ethers.Wallet(process.env.VITE_ALICE_PK).address;
  bobAddress = new ethers.Wallet(process.env.VITE_BOB_PK).address;
} else {
  throw new Error(
    "Set VITE_ALICE_PK and VITE_BOB_PK in .env (same as deploy) so constructor args match deployed contract."
  );
}

export default [inbox, mpcExecutor, cotiChainId, aliceAddress, bobAddress];
