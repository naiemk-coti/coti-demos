/**
 * Verify MillionaireComparison on Cotiscan (COTI testnet Blockscout) via Standard JSON Input API.
 *
 * Hardhat 3 build-info sets `solcLongVersion` to `"0.8.19"` only; Cotiscan expects the full
 * string from the compiler list (e.g. `v0.8.19+commit.7dd6d404`), so `hardhat verify blockscout`
 * often returns "Unable to verify". This script sends the correct `compilerversion`.
 *
 * Usage:
 *   npm run compile
 *   node scripts/verify-MillionaireComparison-cotiscan.js <deployedAddress>
 *
 * Optional: VERIFY_BUILD_INFO=artifacts/build-info/<file>.json
 *
 * Explorer: https://testnet.cotiscan.io/
 */
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

/** Matches https://etherscan.io/solcversions (same compiler string Blockscout expects). */
const COTI_SOLC_VERSION = "v0.8.19+commit.7dd6d404";

const COTISCAN_API = "https://testnet.cotiscan.io/api";

function findCotiBuildInfoPath() {
  if (process.env.VERIFY_BUILD_INFO) {
    return join(ROOT, process.env.VERIFY_BUILD_INFO);
  }
  const dir = join(ROOT, "artifacts", "build-info");
  const files = readdirSync(dir).filter(
    (f) => f.endsWith(".json") && !f.endsWith(".output.json"),
  );
  for (const f of files) {
    const p = join(dir, f);
    const raw = readFileSync(p, "utf8");
    if (!raw.includes("project/contracts/coti/MillionaireComparison.sol")) continue;
    try {
      const j = JSON.parse(raw);
      if (j.input?.sources?.["project/contracts/coti/MillionaireComparison.sol"]) {
        return p;
      }
    } catch {
      /* skip */
    }
  }
  throw new Error(
    "Could not find COTI build-info JSON. Run: npm run compile (default scope, contracts/coti).",
  );
}

async function pollGuid(guid) {
  const url = new URL(COTISCAN_API);
  url.searchParams.set("module", "contract");
  url.searchParams.set("action", "checkverifystatus");
  url.searchParams.set("guid", guid);
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
  return { status: "0", result: "Timeout waiting for Cotiscan verification status" };
}

async function main() {
  const address = process.argv[2];
  if (!address) {
    console.error(
      "Usage: node scripts/verify-MillionaireComparison-cotiscan.js <deployedAddress>",
    );
    process.exit(1);
  }

  const buildInfoPath = findCotiBuildInfoPath();
  const buildInfo = JSON.parse(readFileSync(buildInfoPath, "utf8"));
  const sourceCode = JSON.stringify(buildInfo.input);

  const body = new URLSearchParams({
    contractaddress: ethers.getAddress(address),
    sourceCode,
    codeformat: "solidity-standard-json-input",
    contractname:
      "project/contracts/coti/MillionaireComparison.sol:MillionaireComparison",
    compilerversion: COTI_SOLC_VERSION,
    optimizationUsed: "1",
    runs: "200",
    constructorArguments: "",
    licenseType: "3",
  });

  const submitUrl = new URL(COTISCAN_API);
  submitUrl.searchParams.set("module", "contract");
  submitUrl.searchParams.set("action", "verifysourcecode");

  console.log("Using build-info:", buildInfoPath.replace(ROOT + "/", ""));
  console.log("Submitting to Cotiscan (COTI testnet)...");

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
    if (status.status === "1" && String(status.result).toLowerCase().includes("pass")) {
      console.log("\nDone:", `${submitUrl.origin}/address/${ethers.getAddress(address)}#code`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
