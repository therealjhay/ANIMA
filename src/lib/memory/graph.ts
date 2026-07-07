/**
 * src/lib/memory/graph.ts
 * -----------------------
 * Pure utility functions for working with the in-memory MemoryGraph data
 * structure. No I/O here — persistence is handled in storage.ts.
 *
 * computeRootHash uses the Web Crypto API (no external dep) so it works
 * in both Node.js and Edge runtimes.
 */

import type { MemoryGraph, MemoryNode } from "@/lib/types";

// ─── Hashing ─────────────────────────────────────────────────────────────────

/**
 * Compute a SHA-256 root hash over all nodes, sorted by id.
 * Returns a lowercase hex string.
 */
export async function computeRootHash(nodes: MemoryNode[]): Promise<string> {
  const sorted = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  const payload = JSON.stringify(sorted);
  const buf = new TextEncoder().encode(payload);
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Graph mutations (immutable) ─────────────────────────────────────────────

/**
 * Add a node to the graph and recompute the root hash.
 * Returns a new MemoryGraph (original is untouched).
 */
export async function addNode(
  graph: MemoryGraph,
  node: MemoryNode
): Promise<MemoryGraph> {
  const nodes = [...graph.nodes, node];
  const rootHash = await computeRootHash(nodes);
  return { ...graph, nodes, rootHash };
}

// ─── Graph queries ────────────────────────────────────────────────────────────

/**
 * Return all nodes that are directly connected to the given nodeId,
 * either by listing it in their own connections array or because the
 * given node lists them.
 */
export function findRelatedNodes(
  graph: MemoryGraph,
  nodeId: string
): MemoryNode[] {
  const node = graph.nodes.find((n) => n.id === nodeId);
  if (!node) return [];

  const connectedIds = new Set([
    ...node.connections,
    ...graph.nodes
      .filter((n) => n.connections.includes(nodeId))
      .map((n) => n.id),
  ]);

  return graph.nodes.filter((n) => connectedIds.has(n.id));
}
