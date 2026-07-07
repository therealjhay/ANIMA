/**
 * src/lib/contracts.ts
 * ---------------------
 * Exports the AnimaRegistry ABI and typed wagmi v2 hooks for every
 * contract function. This is the single integration point between the
 * frontend and the on-chain companion registry.
 *
 * Contract not yet deployed to 0G testnet — see NOTES.md.
 */

import { useReadContract, useWriteContract } from "wagmi";
import AnimaRegistryABI from "@/lib/abis/AnimaRegistry.json";

// ─── ABI & address ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ANIMA_REGISTRY_ABI = AnimaRegistryABI as any;

export const ANIMA_REGISTRY_ADDRESS = (
  process.env.NEXT_PUBLIC_ANIMA_REGISTRY_ADDRESS ?? "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

// ─── Write hooks ─────────────────────────────────────────────────────────────

/** Create a new companion. Returns the on-chain companion ID via receipt logs. */
export function useCreateCompanion() {
  return useWriteContract();
}

/** Update the memory root hash and node count for an existing companion. */
export function useUpdateMemory() {
  return useWriteContract();
}

// ─── Read hooks ──────────────────────────────────────────────────────────────

/**
 * Verify that a given root hash matches what is stored on-chain for a companion.
 * @param companionId - on-chain numeric companion ID
 * @param currentRootHash - the local root hash to compare
 */
export function useVerifyMemory(
  companionId: bigint | undefined,
  currentRootHash: string
) {
  return useReadContract({
    address: ANIMA_REGISTRY_ADDRESS,
    abi: ANIMA_REGISTRY_ABI,
    functionName: "verifyMemory",
    args: companionId !== undefined ? [companionId, currentRootHash] : undefined,
    query: { enabled: companionId !== undefined && currentRootHash.length > 0 },
  });
}

/** Fetch all companion IDs owned by a given address. */
export function useOwnerCompanions(owner: `0x${string}` | undefined) {
  return useReadContract({
    address: ANIMA_REGISTRY_ADDRESS,
    abi: ANIMA_REGISTRY_ABI,
    functionName: "getOwnerCompanions",
    args: owner ? [owner] : undefined,
    query: { enabled: !!owner },
  });
}

/** Fetch the on-chain Companion struct by ID. */
export function useCompanion(companionId: bigint | undefined) {
  return useReadContract({
    address: ANIMA_REGISTRY_ADDRESS,
    abi: ANIMA_REGISTRY_ABI,
    functionName: "companions",
    args: companionId !== undefined ? [companionId] : undefined,
    query: { enabled: companionId !== undefined },
  });
}
