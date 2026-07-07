"use client";

/**
 * src/app/companion/[id]/page.tsx
 * --------------------------------
 * Real-time streaming chat page for a single companion.
 * Loads companion data from localStorage, streams responses via /api/chat,
 * and triggers memory extraction after each completed assistant message.
 * Memory updates are displayed with a brief toast indicator.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChat } from "ai/react";
import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import type { Companion, MemoryGraph } from "@/lib/types";

// ─── localStorage helpers ────────────────────────────────────────────────────

function getStorageKey(address: string) {
  return `anima:companions:${address.toLowerCase()}`;
}

function loadCompanionData(
  address: string,
  companionId: string
): { companion: Companion; graph: MemoryGraph } | null {
  try {
    const raw = localStorage.getItem(getStorageKey(address));
    if (!raw) return null;
    const all = JSON.parse(raw);
    return all[companionId] ?? null;
  } catch {
    return null;
  }
}

function saveCompanionData(
  address: string,
  companionId: string,
  companion: Companion,
  graph: MemoryGraph
) {
  const key = getStorageKey(address);
  const existing = JSON.parse(localStorage.getItem(key) ?? "{}");
  existing[companionId] = { companion, graph };
  localStorage.setItem(key, JSON.stringify(existing));
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CompanionChatPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useWallet();
  const companionId = params.id as string;

  const [companion, setCompanion] = useState<Companion | null>(null);
  const [graph, setGraph] = useState<MemoryGraph | null>(null);
  const [memoryToast, setMemoryToast] = useState<string | null>(null);
  const [storageCID, setStorageCID] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load companion from localStorage once wallet connects
  useEffect(() => {
    if (!isConnected || !address) return;
    const data = loadCompanionData(address, companionId);
    if (!data) {
      router.push("/");
      return;
    }
    setCompanion(data.companion);
    setGraph(data.graph);
  }, [isConnected, address, companionId, router]);

  // Build memory context string from graph nodes
  const memoryContext = graph?.nodes
    .map((n) => `- ${n.type.toUpperCase()}: ${n.content} (confidence: ${n.confidence.toFixed(2)})`)
    .join("\n") ?? "";

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      companionName: companion?.name ?? "",
      personalitySeed: companion?.personalitySeed ?? "",
      memoryContext,
    },
    onFinish: async (message) => {
      if (!companion || !graph || !address) return;
      // Trigger memory extraction after each assistant reply
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
      if (!lastUserMsg) return;

      try {
        const res = await fetch("/api/memory/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userMessage: lastUserMsg.content,
            assistantMessage: message.content,
            existingMemory: graph.nodes,
          }),
        });
        const { newNodes, storageCID: cid } = await res.json();

        if (newNodes && newNodes.length > 0) {
          setGraph((prev) => {
            if (!prev) return prev;
            const updated: MemoryGraph = {
              ...prev,
              nodes: [...prev.nodes, ...newNodes],
              rootHash: "", // updated in Phase 5
            };
            const updatedCompanion: Companion = {
              ...companion,
              memoryNodeCount: updated.nodes.length,
            };
            saveCompanionData(address, companionId, updatedCompanion, updated);
            setCompanion(updatedCompanion);
            return updated;
          });

          setMemoryToast(`💭 ${newNodes.length} memor${newNodes.length > 1 ? "ies" : "y"} updated`);
          setTimeout(() => setMemoryToast(null), 3000);

          if (cid) setStorageCID(cid);
        }
      } catch {
        // Silent fail — memory extraction is non-blocking
      }
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;
    handleSubmit(new Event("submit") as unknown as React.FormEvent);
  }, [input, isLoading, handleSubmit]);

  if (!companion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground animate-pulse">Loading companion…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-border bg-background/80 backdrop-blur shrink-0">
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
          ← Home
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold">{companion.name}</h1>
          <p className="text-xs text-muted-foreground">
            {companion.memoryNodeCount} memor{companion.memoryNodeCount === 1 ? "y" : "ies"}
          </p>
        </div>
        <Link
          href={`/companion/${companionId}/memory`}
          id="view-memory-btn"
          className="text-xs border border-border px-3 py-1.5 rounded-lg hover:border-primary/50 transition-colors"
        >
          🧠 Memory
        </Link>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-12">
            <p className="text-4xl mb-4">👋</p>
            <p>Say hello to <strong>{companion.name}</strong>!</p>
            <p className="mt-1 text-xs opacity-60">Personality: {companion.personalitySeed}</p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={{
              id: msg.id,
              role: msg.role as "user" | "assistant",
              content: msg.content,
              timestamp: Date.now(),
            }}
            companionName={companion.name}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Memory toast + Storage CID */}
      {(memoryToast || storageCID) && (
        <div className="px-4 py-2 flex items-center justify-between text-xs bg-muted/50 border-t border-border">
          {memoryToast && (
            <span className="text-primary font-medium animate-in fade-in duration-300">
              {memoryToast}
            </span>
          )}
          {storageCID && (
            <span
              className="text-muted-foreground font-mono cursor-pointer hover:text-foreground transition-colors"
              title="Click to copy"
              onClick={() => navigator.clipboard.writeText(storageCID)}
            >
              Stored on 0G: {storageCID.slice(0, 20)}…
            </span>
          )}
        </div>
      )}

      {/* Input */}
      <ChatInput
        value={input}
        onChange={(val) => handleInputChange({ target: { value: val } } as React.ChangeEvent<HTMLTextAreaElement>)}
        onSend={handleSend}
        isLoading={isLoading}
      />
    </div>
  );
}
