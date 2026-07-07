/**
 * src/lib/types.ts
 * ----------------
 * Shared TypeScript interfaces used across the entire ANIMA application.
 * These types are the contract between frontend, API routes, and storage layers.
 */

// ─── Memory ──────────────────────────────────────────────────────────────────

export interface MemoryNode {
  id: string;
  type: "fact" | "emotion" | "relationship" | "event";
  content: string;
  confidence: number;        // 0.0 – 1.0
  timestamp: number;         // Unix ms
  sourceMessageIds: string[];
  connections: string[];     // IDs of related MemoryNodes
  storageCID: string;        // empty until Phase 5 upload
  chainTxHash: string;       // empty until Phase 7 attestation
}

export interface MemoryGraph {
  companionId: string;
  nodes: MemoryNode[];
  rootHash: string;          // SHA-256 of sorted serialised nodes
}

// ─── Companion ───────────────────────────────────────────────────────────────

export interface Companion {
  id: string;
  name: string;
  personalitySeed: string;
  ownerId: string;           // wallet address
  memoryRootHash: string;
  memoryNodeCount: number;
  createdAt: number;         // Unix ms
  nftTokenId: string;
  chainCompanionId?: number; // set after Phase 7 on-chain registration
  storageCID?: string;       // 0G Storage CID after Phase 5
  chainTxHash?: string;      // latest attestation tx after Phase 7
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  provider?: "0g" | "openai-fallback"; // populated after Phase 6
}
