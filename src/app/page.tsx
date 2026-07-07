"use client";

/**
 * src/app/page.tsx
 * -----------------
 * Landing page. Shows the ANIMA hero when disconnected.
 * When the wallet is connected it shows existing companions and a create button.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import type { Companion } from "@/lib/types";

function getStorageKey(address: string) {
  return `anima:companions:${address.toLowerCase()}`;
}

export default function Home() {
  const { address, isConnected } = useWallet();
  const [companions, setCompanions] = useState<Companion[]>([]);

  useEffect(() => {
    if (!isConnected || !address) return;
    try {
      const raw = localStorage.getItem(getStorageKey(address));
      if (!raw) return;
      const all = JSON.parse(raw) as Record<
        string,
        { companion: Companion }
      >;
      setCompanions(Object.values(all).map((v) => v.companion));
    } catch {
      /* ignore */
    }
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <main className="flex min-h-[80vh] flex-col items-center justify-center p-8 text-center">
        <div className="flex flex-col items-center max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <h1 className="relative text-6xl sm:text-8xl font-extrabold tracking-tight bg-gradient-to-br from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">
              ANIMA
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-md">
            Your AI companion&apos;s memories belong to you —{" "}
            <span className="text-foreground font-medium">cryptographically, forever.</span>
          </p>
          <p className="text-xs text-muted-foreground/60">
            Built on 0G Storage · Compute · Chain
          </p>
          <div className="pt-4">
            <ConnectButton />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] p-6 sm:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Your Companions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {address?.slice(0, 6)}…{address?.slice(-4)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ConnectButton />
          <Link
            href="/create"
            id="create-companion-link"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold
                       hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            + New Companion
          </Link>
        </div>
      </div>

      {companions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <div className="text-6xl">🌱</div>
          <p className="text-muted-foreground">No companions yet.</p>
          <Link
            href="/create"
            className="text-primary hover:underline text-sm font-medium"
          >
            Create your first companion →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companions.map((c) => (
            <Link
              key={c.id}
              href={`/companion/${c.id}`}
              className="group relative rounded-2xl border border-border bg-card p-5 hover:border-primary/50
                         hover:shadow-lg hover:shadow-primary/10 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {c.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {c.personalitySeed}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs bg-muted rounded-full px-2 py-0.5 text-muted-foreground">
                  🧠 {c.memoryNodeCount} memor{c.memoryNodeCount === 1 ? "y" : "ies"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
