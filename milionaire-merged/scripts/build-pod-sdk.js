/**
 * Build @coti/pod-sdk from source so dist/ exists (GitHub package does not ship dist).
 * Writes src + tsconfig into node_modules/@coti/pod-sdk and runs tsc.
 */
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const POD_SDK = join(ROOT, 'node_modules/@coti/pod-sdk');

const SRC = {
  'index.ts': `export {
  CotiPodCrypto,
  DataType,
  type EncryptedUint64,
  type EncryptedScalar,
  type EncryptedString,
  type EncryptedValue,
} from "./coti-pod-crypto.js";
`,
  'coti-pod-crypto.ts': `/**
 * @title Coti Pod Crypto
 * Encrypt uses the PoD encryption service; decrypt uses @coti-io/coti-sdk-typescript.
 */
import { decryptUint, decryptString } from "@coti-io/coti-sdk-typescript";
import type { ctString } from "@coti-io/coti-sdk-typescript";

const ENCRYPTION_SERVICE: Record<string, string> = {
  testnet: "https://fullnode.testnet.coti.io/pod-encryption",
  mainnet: "https://pod-encryption-service-mainnet.coti.io",
};

export enum DataType {
  Bool = "bool",
  Uint8 = "uint8",
  Uint16 = "uint16",
  Uint32 = "uint32",
  Uint64 = "uint64",
  Uint128 = "uint128",
  Uint256 = "uint256",
  String = "string",
}

export type EncryptedScalar = { ciphertext: string; signature: string };
export type EncryptedString = { ciphertext: { value: string[] }; signature: string[] };
export type EncryptedValue = EncryptedScalar | EncryptedString;
export type EncryptedUint64 = EncryptedScalar;

function toServiceType(dataType: DataType): string {
  return dataType;
}

export class CotiPodCrypto {
  static async encrypt(
    value: string,
    network: "testnet" | "mainnet" | string,
    dataType: DataType = DataType.Uint64
  ): Promise<EncryptedValue> {
    const baseUrl = ENCRYPTION_SERVICE[network] ?? network;
    const url = baseUrl.replace(/\\/$/, "");
    const body = { type: toServiceType(dataType), value };
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(\`Encryption failed (\${res.status}): \${text}\`);
    }
    const data = (await res.json()) as Record<string, unknown>;

    if (dataType === DataType.String) {
      const ct = data.ciphertext as { value?: string[] } | undefined;
      const sig = data.signature as string[] | undefined;
      if (!ct?.value || !Array.isArray(sig)) {
        throw new Error("Encryption response for string missing ciphertext.value or signature array");
      }
      return { ciphertext: { value: ct.value.map(String) }, signature: sig };
    }

    const ciphertext = (data.ciphertext ?? (data as { cipherText?: string }).cipherText) as string | undefined;
    const signature = data.signature as string | undefined;
    if (ciphertext == null || signature == null) {
      throw new Error("Encryption response missing ciphertext or signature");
    }
    return { ciphertext: String(ciphertext), signature: String(signature) };
  }

  static decrypt(
    ciphertext: string | ctString,
    aesKey: string,
    dataType: DataType = DataType.Uint64
  ): string {
    const key = aesKey.trim();
    if (!key) throw new Error("AES key is required");
    if (dataType === DataType.String) {
      const ct = typeof ciphertext === "string" ? JSON.parse(ciphertext) : ciphertext;
      const value = Array.isArray(ct?.value) ? ct.value.map((c: string | bigint) => BigInt(c)) : [];
      return decryptString({ value }, key);
    }
    const raw = (typeof ciphertext === "string" ? ciphertext : "").trim();
    if (!raw || raw === "0x" || raw === "0x0") return dataType === DataType.Bool ? "false" : "0";
    const big = BigInt(raw);
    if (big === 0n) return dataType === DataType.Bool ? "false" : "0";
    const decrypted = decryptUint(big, key);
    if (dataType === DataType.Bool) return decrypted === 1n ? "true" : "false";
    return decrypted.toString();
  }
}
`,
};

const TSCONFIG = {
  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "lib": ["ES2020", "DOM"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
`,
};

async function main() {
  const distIndex = join(POD_SDK, 'dist', 'index.js');
  try {
    const { readFile } = await import('fs/promises');
    await readFile(distIndex);
    console.log('@coti/pod-sdk dist already present, skip build');
    return;
  } catch {
    /* dist missing, build */
  }

  await mkdir(join(POD_SDK, 'src'), { recursive: true });
  for (const [name, content] of Object.entries(SRC)) {
    await writeFile(join(POD_SDK, 'src', name), content, 'utf8');
  }
  for (const [name, content] of Object.entries(TSCONFIG)) {
    await writeFile(join(POD_SDK, name), content, 'utf8');
  }

  execSync('npx tsc', { cwd: POD_SDK, stdio: 'inherit' });
  console.log('@coti/pod-sdk built successfully');
}

main().catch((err) => {
  console.error('build-pod-sdk:', err);
  process.exit(1);
});
