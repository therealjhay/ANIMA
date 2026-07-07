"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import type { Companion, MemoryGraph } from "@/lib/types";
import { useVerifyMemory } from "@/lib/contracts";

function getStorageKey(address: string) {
  return `anima:companions:${address.toLowerCase()}`;
}

export default function MemoryGraphPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useWallet();
  const companionId = params.id as string;

  const [companion, setCompanion] = useState<Companion | null>(null);
  const [graph, setGraph] = useState<MemoryGraph | null>(null);

  // Read the on-chain attestation status
  const { data: isAttested, isLoading: isVerifying } = useVerifyMemory(
    companionId ? BigInt(companionId) : undefined,
    graph?.rootHash ?? ""
  );

  useEffect(() => {
    if (!isConnected || !address) return;
    try {
      const raw = localStorage.getItem(getStorageKey(address));
      if (!raw) {
        router.push("/");
        return;
      }
      const all = JSON.parse(raw);
      const data = all[companionId];
      if (!data) {
        router.push("/");
        return;
      }
      setCompanion(data.companion);
      setGraph(data.graph);
    } catch {
      router.push("/");
    }
  }, [isConnected, address, companionId, router]);

  if (!companion || !graph) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground animate-pulse">Loading memory graph…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-border bg-background/80 backdrop-blur shrink-0">
        <Link href={`/companion/${companionId}`} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
          ← Back to Chat
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Memory Graph: {companion.name}</h1>
          <p className="text-xs text-muted-foreground">
            {graph.nodes.length} node{graph.nodes.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="text-xs border border-border px-3 py-1.5 rounded-lg flex items-center gap-2">
          {/* Phase 9: Tamper Detection UI */}
          {isVerifying ? (
            <span className="text-muted-foreground animate-pulse">Verifying chain attestation...</span>
          ) : isAttested ? (
            <span className="text-green-500 font-medium">✓ Verified on 0G Chain</span>
          ) : graph.rootHash ? (
            <span className="text-red-500 font-medium">✗ Tamper Detected (Hash Mismatch)</span>
          ) : (
            <span className="text-yellow-500 font-medium">⚠ Not Attested Yet</span>
          )}
        </div>
      </header>

      {/* Graph Visualization */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {graph.nodes.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No memories yet. Chat with {companion.name} to generate some!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {graph.nodes.map((node) => (
              <div key={node.id} className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-2 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full" style={{
                  backgroundColor: 
                    node.type === "fact" ? "#3b82f6" : 
                    node.type === "emotion" ? "#ec4899" : 
                    node.type === "relationship" ? "#10b981" : "#f59e0b"
                }} />
                <div className="flex justify-between items-start pl-2">
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                    {node.type}
                  </span>
                  <span className="text-xs opacity-50 font-mono">
                    {(node.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="pl-2 text-sm leading-relaxed">{node.content}</p>
                <div className="pl-2 mt-auto pt-2 text-[10px] text-muted-foreground font-mono">
                  ID: {node.id.split("-")[0]}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
