"use client";

/**
 * src/app/create/page.tsx
 * -----------------------
 * Companion creation form.
 * User enters a name and personality seed. On submit the companion is saved
 * to localStorage under `anima:companions:{walletAddress}` and the user is
 * redirected to the companion chat page.
 *
 * On-chain registration is performed in Phase 7.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useWallet } from "@/hooks/useWallet";
import type { Companion, MemoryGraph } from "@/lib/types";

const PERSONALITY_CHIPS = [
  "Curious and philosophical",
  "Warm and nurturing",
  "Witty and sardonic",
  "Adventurous and spontaneous",
  "Calm and introspective",
];

function getStorageKey(address: string) {
  return `anima:companions:${address.toLowerCase()}`;
}

export default function CreatePage() {
  const router = useRouter();
  const { address, isConnected } = useWallet();

  const [name, setName] = useState("");
  const [seed, setSeed] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isConnected || !address) {
      router.push("/");
      return;
    }
    if (!name.trim() || !seed.trim()) {
      setError("Name and personality are required.");
      return;
    }

    setCreating(true);
    const companionId = uuidv4();

    const newCompanion: Companion = {
      id: companionId,
      name: name.trim(),
      personalitySeed: seed.trim(),
      ownerId: address,
      memoryRootHash: "",
      memoryNodeCount: 0,
      createdAt: Date.now(),
      nftTokenId: "",
    };

    const emptyGraph: MemoryGraph = {
      companionId,
      nodes: [],
      rootHash: "",
    };

    // Persist to localStorage
    const storageKey = getStorageKey(address);
    const existing = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    existing[companionId] = { companion: newCompanion, graph: emptyGraph };
    localStorage.setItem(storageKey, JSON.stringify(existing));

    router.push(`/companion/${companionId}`);
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create a Companion</h1>
          <p className="text-muted-foreground text-sm">
            Give your AI companion a name and personality. Their memories will be
            yours — stored on-chain, forever.
          </p>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="companion-name" className="text-sm font-medium">
              Companion Name
            </label>
            <input
              id="companion-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lyra, Atlas, Sage…"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm
                         placeholder:text-muted-foreground focus:outline-none focus:ring-2
                         focus:ring-primary/50 transition-all"
              maxLength={40}
              required
            />
          </div>

          {/* Personality Seed */}
          <div className="space-y-2">
            <label htmlFor="personality-seed" className="text-sm font-medium">
              Personality Seed
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PERSONALITY_CHIPS.map((chip) => (
                <button
                  type="button"
                  key={chip}
                  onClick={() => setSeed(chip)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    seed === chip
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
            <textarea
              id="personality-seed"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="Describe your companion's personality in a few words or sentences…"
              rows={3}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm resize-none
                         placeholder:text-muted-foreground focus:outline-none focus:ring-2
                         focus:ring-primary/50 transition-all"
              required
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button
            type="submit"
            disabled={creating}
            id="create-companion-btn"
            className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-semibold
                       hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all shadow-lg shadow-primary/20"
          >
            {creating ? "Creating…" : "Create Companion →"}
          </button>
        </form>
      </div>
    </main>
  );
}
