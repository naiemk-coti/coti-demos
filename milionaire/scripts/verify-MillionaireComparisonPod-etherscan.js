/**
 * Verify MillionaireComparisonPod on Etherscan (Sepolia) using the Standard JSON Input API.
 *
 * Hardhat's `verify` task often fails with HH3 build-info because `solcLongVersion` is stored as
 * "0.8.26" while Etherscan expects "v0.8.26+commit.<hash>". This script sends the exact compiler
 * string Etherscan lists for 0.8.26.
 *
 * Usage:
 *   HARDHAT_CONTRACTS_SCOPE=pod npm run compile:pod
 *   node scripts/verify-MillionaireComparisonPod-etherscan.js <deployedAddress>
 *
 * Requires .env: ETHERSCAN_API_KEY, VITE_ALICE_PK, VITE_BOB_PK
 * Optional: POD_INBOX_ADDRESS, POD_MPC_EXECUTOR_ADDRESS, POD_COTI_CHAIN_ID (same as deploy)
 *
 * Optional: VERIFY_BUILD_INFO=artifacts-pod/build-info/<file>.json
 */
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config as dotenvConfig } from "dotenv";
import { ethers } from "ethers";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

/** Matches https://etherscan.io/solcversions for 0.8.26 */
const ETHERSCAN_SOLC_VERSION = "v0.8.26+commit.8a97fa7a";

/** Sepolia — Etherscan API V2 (unified); V1 host deprecated as of Aug 2025 */
const ETHERSCAN_V2_API = "https://api.etherscan.io/v2/api";
const SEPOLIA_CHAIN_ID = "11155111";

dotenvConfig({ path: join(ROOT, ".env") });

function findPodBuildInfoPath() {
  if (process.env.VERIFY_BUILD_INFO) {
    return join(ROOT, process.env.VERIFY_BUILD_INFO);
  }
  const dir = join(ROOT, "artifacts-pod", "build-info");
  const files = readdirSync(dir).filter(
    (f) => f.endsWith(".json") && !f.endsWith(".output.json"),
  );
  for (const f of files) {
    const p = join(dir, f);
    const raw = readFileSync(p, "utf8");
    if (!raw.includes("project/contracts/pod/MillionaireComparisonPod.sol")) continue;
    try {
      const j = JSON.parse(raw);
      if (j.input?.sources?.["project/contracts/pod/MillionaireComparisonPod.sol"]) {
        return p;
      }
    } catch {
      /* skip */
    }
  }
  throw new Error(
    "Could not find pod build-info JSON. Run: HARDHAT_CONTRACTS_SCOPE=pod npm run compile:pod",
  );
}

async function pollGuid(guid) {
  const apiKey = process.env.ETHERSCAN_API_KEY;
  const url = new URL(ETHERSCAN_V2_API);
  url.searchParams.set("chainid", SEPOLIA_CHAIN_ID);
  url.searchParams.set("module", "contract");
  url.searchParams.set("action", "checkverifystatus");
  url.searchParams.set("guid", guid);
  url.searchParams.set("apikey", apiKey);
  for (let i = 0; i < 40; i++) {
    const res = await fetch(url.toString());
    const json = await res.json();
    if (json.status === "1" && json.result?.toLowerCase?.().includes("pass")) {
      return json;
    }
    if (json.status === "0" && json.result && !json.result.includes("Pending")) {
      return json;
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return { status: "0", result: "Timeout waiting for Etherscan verification status" };
}

async function main() {
  const address = process.argv[2];
  if (!address) {
    console.error(
      "Usage: node scripts/verify-MillionaireComparisonPod-etherscan.js <deployedAddress>",
    );
    process.exit(1);
  }

  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (!apiKey) {
    console.error("Set ETHERSCAN_API_KEY in .env");
    process.exit(1);
  }

  const alicePk = process.env.VITE_ALICE_PK;
  const bobPk = process.env.VITE_BOB_PK;
  if (!alicePk || !bobPk) {
    console.error("Set VITE_ALICE_PK and VITE_BOB_PK (must match deployment).");
    process.exit(1);
  }

  const inbox =
    process.env.POD_INBOX_ADDRESS ||
    "0xe828127c72813658af1e52bacbe7282578fc36a0";
  const mpc =
    process.env.POD_MPC_EXECUTOR_ADDRESS ||
    "0x44584e5449caaaf554f7875a6a45bf28169e4537";
  const cotiChainId = BigInt(process.env.POD_COTI_CHAIN_ID || "7082400");
  const alice = new ethers.Wallet(alicePk).address;
  const bob = new ethers.Wallet(bobPk).address;

  const buildInfoPath = findPodBuildInfoPath();
  const buildInfo = JSON.parse(readFileSync(buildInfoPath, "utf8"));
  const sourceCode = JSON.stringify(buildInfo.input);

  const constructorArgs = ethers.AbiCoder.defaultAbiCoder()
    .encode(
      ["address", "address", "uint256", "address", "address"],
      [inbox, mpc, cotiChainId, alice, bob],
    )
    .slice(2);

  const body = new URLSearchParams({
    contractaddress: ethers.getAddress(address),
    sourceCode,
    codeformat: "solidity-standard-json-input",
    contractname:
      "project/contracts/pod/MillionaireComparisonPod.sol:MillionaireComparisonPod",
    compilerversion: ETHERSCAN_SOLC_VERSION,
    optimizationUsed: "1",
    runs: "200",
    constructorArguments: constructorArgs,
    licenseType: "3",
  });

  const submitUrl = new URL(ETHERSCAN_V2_API);
  submitUrl.searchParams.set("chainid", SEPOLIA_CHAIN_ID);
  submitUrl.searchParams.set("module", "contract");
  submitUrl.searchParams.set("action", "verifysourcecode");
  submitUrl.searchParams.set("apikey", apiKey);

  console.log("Using build-info:", buildInfoPath.replace(ROOT + "/", ""));
  console.log("Submitting to Etherscan API V2 (Sepolia)...");

  const res = await fetch(submitUrl.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const json = await res.json();
  console.log("Submit:", JSON.stringify(json, null, 2));

  if (json.status === "1" && json.result && typeof json.result === "string") {
    const status = await pollGuid(json.result);
    console.log("Result:", JSON.stringify(status, null, 2));
    if (status.status === "1") {
      console.log("\nDone. View on Sepolia Etherscan.");
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
