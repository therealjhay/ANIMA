/**
 * src/lib/memory/storage.ts
 * -------------------------
 * Local persistence layer for MemoryGraph data.
 * Phase 5 will replace the uploadMemoryGraph call with a real 0G Storage
 * upload while keeping the same function signatures so no call-sites change.
 */

import type { MemoryGraph } from "@/lib/types";
import { computeRootHash } from "@/lib/memory/graph";

// Key format: anima:graph:{companionId}
function graphKey(companionId: string) {
  return `anima:graph:${companionId}`;
}

/**
 * Save a MemoryGraph to localStorage (with a fresh root hash) and — once
 * Phase 5 is integrated — also upload to 0G Storage.
 * Returns the CID / identifier for the stored blob (mock prefix until Phase 5).
 */
export async function saveGraph(
  companionId: string,
  graph: MemoryGraph
): Promise<string> {
  // Recompute root hash to keep it fresh
  const rootHash = await computeRootHash(graph.nodes);
  const updated: MemoryGraph = { ...graph, rootHash };

  if (typeof window !== "undefined") {
    localStorage.setItem(graphKey(companionId), JSON.stringify(updated));
  }

  // Phase 5 will call uploadMemoryGraph(updated) here and return the real CID.
  // For now return a deterministic local identifier.
  return `local://${rootHash.slice(0, 16)}`;
}

/**
 * Load a MemoryGraph from localStorage.
 * Phase 5 adds a fallback to 0G Storage download when local cache is missing.
 */
export function loadGraph(companionId: string): MemoryGraph | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(graphKey(companionId));
    return raw ? (JSON.parse(raw) as MemoryGraph) : null;
  } catch {
    return null;
  }
}
