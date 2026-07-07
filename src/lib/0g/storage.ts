/**
 * src/lib/0g/storage.ts
 * ----------------------
 * 0G Storage client wrapper.
 * Provides content-addressed storage for ANIMA memory graphs.
 * Falls back to a mock (deterministic CID) when the SDK is unavailable.
 *
 * MOCK: replace the mock block with real 0G SDK calls once ZG_STORAGE_NODE_URL
 * is set in .env.local. See NOTES.md for details.
 */

import type { MemoryGraph } from "@/lib/types";

// ─── SDK import (graceful degradation) ────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ZgFile: any, Indexer: any;
let sdkAvailable = false;

try {
  // Dynamic import so the build doesn't hard-fail if the package is absent
  // MOCK: replace with real 0G SDK call — see NOTES.md
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sdk = require("@0glabs/0g-ts-sdk");
  ZgFile = sdk.ZgFile;
  Indexer = sdk.Indexer;
  sdkAvailable = true;
} catch {
  console.warn("[0G Storage] SDK unavailable — running in MOCK mode. See NOTES.md");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function computeHash(data: string): Promise<string> {
  const buf = new TextEncoder().encode(data);
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Upload a MemoryGraph to 0G Storage and return its content identifier (CID).
 * In mock mode returns a deterministic `0g://mock/<hash>` string.
 */
export async function uploadMemoryGraph(graph: MemoryGraph): Promise<string> {
  const data = JSON.stringify(graph);

  if (!sdkAvailable) {
    // MOCK: generate deterministic fake CID from content hash
    const hash = await computeHash(data);
    return `0g://mock/${hash}`;
  }

  // REAL: Upload via 0G Storage SDK
  const indexer = new Indexer(process.env.ZG_STORAGE_NODE_URL);
  const [tree, err] = await ZgFile.fromBuffer(
    Buffer.from(data),
    process.env.ZG_PRIVATE_KEY!
  );
  if (err) throw new Error(`0G upload failed: ${err}`);
  const [, uploadErr] = await indexer.upload(
    tree,
    0,
    process.env.ZG_PRIVATE_KEY!
  );
  if (uploadErr) throw new Error(`0G upload failed: ${uploadErr}`);
  return tree.rootHash() as string;
}

/**
 * Download a MemoryGraph from 0G Storage by its CID.
 * Throws on mock CIDs — data was never persisted off-chain.
 */
export async function downloadMemoryGraph(cid: string): Promise<MemoryGraph> {
  if (cid.startsWith("0g://mock/")) {
    throw new Error(
      "Cannot download mock CID — data was not persisted off-chain. " +
        "Set ZG_STORAGE_NODE_URL in .env.local to enable real uploads."
    );
  }
  const indexer = new Indexer(process.env.ZG_STORAGE_NODE_URL);
  const data = await indexer.download(cid);
  return JSON.parse(data.toString()) as MemoryGraph;
}
