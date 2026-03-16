/**
 * Verify MillionaireComparison on Etherscan (Sepolia) using a full compiler version
 * string that Etherscan accepts. Run with Node (not "hardhat run") so the address
 * is passed correctly and Hardhat doesn't trigger compilation (pragma conflict).
 *
 * Usage:
 *   node scripts/verify-etherscan-sepolia.js 0xYourContractAddress
 *   or: VERIFY_CONTRACT_ADDRESS=0x... node scripts/verify-etherscan-sepolia.js
 *
 * Requires: ETHERSCAN_API_KEY, and constructor args in .env (same as deploy).
 */
import { config as dotenvConfig } from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { ethers } from "ethers";

dotenvConfig();

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Full compiler version from https://etherscan.io/solcversions (must match what we compiled with)
const ETHERSCAN_COMPILER_VERSION = "v0.8.26+commit.8a97fa7a";
const SEPOLIA_CHAIN_ID = 11155111;
// Etherscan API V2 unified endpoint (chainid selects network)
const API_URL = "https://api.etherscan.io/v2/api";

async function getConstructorArgsEncoded() {
  const args = (await import("./constructor-args-sepolia.js")).default;
  const coder = ethers.AbiCoder.defaultAbiCoder();
  const types = ["address", "address", "uint256", "address", "address"];
  const encoded = coder.encode(types, args);
  return encoded.slice(2); // strip 0x for Etherscan
}

function getBuildInfo() {
  const artifact = JSON.parse(
    readFileSync(
      join(ROOT, "artifacts/contracts/MillionaireComparison.sol/MillionaireComparison.json"),
      "utf8"
    )
  );
  const buildInfoId = artifact.buildInfoId;
  if (!buildInfoId) throw new Error("No buildInfoId in artifact");
  const buildPath = join(ROOT, "artifacts/build-info", `${buildInfoId}.json`);
  return JSON.parse(readFileSync(buildPath, "utf8"));
}

/** Contract FQN as in compiler output (source path from build input). */
function getContractFqn(buildInfo) {
  const sourceName = "contracts/MillionaireComparison.sol";
  const inputSourceName = buildInfo.userSourceNameMap?.[sourceName] ?? sourceName;
  return `${inputSourceName}:MillionaireComparison`;
}

async function verify() {
  const contractAddress = process.argv[2] || process.env.VERIFY_CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("Usage: npx hardhat run scripts/verify-etherscan-sepolia.js [CONTRACT_ADDRESS]");
    console.error("Or set VERIFY_CONTRACT_ADDRESS in .env");
    process.exit(1);
  }

  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (!apiKey) {
    console.error("Set ETHERSCAN_API_KEY in .env");
    process.exit(1);
  }

  const buildInfo = getBuildInfo();
  const compilerInput = buildInfo.input;
  const contractName = getContractFqn(buildInfo);
  const constructorArguments = await getConstructorArgsEncoded();

  const query = new URLSearchParams({
    module: "contract",
    action: "verifysourcecode",
    chainid: String(SEPOLIA_CHAIN_ID),
    apikey: apiKey,
  });
  const body = new URLSearchParams({
    contractaddress: contractAddress,
    sourceCode: JSON.stringify(compilerInput),
    codeformat: "solidity-standard-json-input",
    contractname: contractName,
    compilerversion: ETHERSCAN_COMPILER_VERSION,
    constructorArguments,
  });

  console.log("Submitting to Etherscan with compiler:", ETHERSCAN_COMPILER_VERSION);
  const url = `${API_URL}?${query.toString()}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const data = await res.json();
  if (data.status !== "1" || !data.result) {
    const msg = data.message || data.result;
    const detail = typeof data.result === "string" ? data.result : JSON.stringify(data.result);
    console.error("Etherscan error:", msg);
    if (detail && detail !== msg) console.error("Detail:", detail);
    console.error("Full response:", JSON.stringify(data, null, 2));
    process.exit(1);
  }
  const guid = data.result;
  console.log("GUID:", guid);
  console.log("Waiting for result...");

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const checkRes = await fetch(
      `${API_URL}?chainid=${SEPOLIA_CHAIN_ID}&module=contract&action=checkverifystatus&guid=${guid}&apikey=${apiKey}`
    );
    const check = await checkRes.json();
    if (check.result) {
      console.log("Verification result:", check.result);
      if (check.result.includes("Fail")) {
        console.error("Verification failed:", check.result);
        process.exit(1);
      }
      console.log("Success. Contract verified on Etherscan.");
      return;
    }
  }
  console.error("Timeout waiting for verification");
  process.exit(1);
}

verify().catch((e) => {
  console.error(e);
  process.exit(1);
});
