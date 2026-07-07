/**
 * src/app/api/memory/extract/route.ts
 * -------------------------------------
 * POST endpoint that extracts meaningful memory nodes from a conversation
 * exchange using structured JSON output from OpenAI.
 * Returns an array of new MemoryNode objects to be appended to the graph.
 */

import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import type { MemoryNode } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userMessage, assistantMessage, existingMemory } = await req.json();

  const existingStr = existingMemory && existingMemory.length > 0
    ? existingMemory
        .map((n: MemoryNode) => `[${n.id}] (${n.type}) ${n.content}`)
        .join("\n")
    : "None yet.";

  const systemPrompt = `You are a memory extraction engine. Given a conversation exchange, extract meaningful facts about the USER ONLY (not the AI).

Return ONLY valid JSON — no markdown, no explanation:
{
  "newNodes": [
    {
      "type": "fact" | "emotion" | "relationship" | "event",
      "content": "brief factual statement about the user",
      "confidence": 0.0-1.0,
      "connections": ["id of related existing node if any"]
    }
  ]
}

Rules:
- Extract 0-3 nodes per exchange. Extract 0 if nothing meaningful.
- Confidence > 0.7 = stated fact. 0.4-0.7 = implied. < 0.4 = uncertain.
- Do not duplicate existing memories. Check existing nodes first.
- types: fact=personal info, emotion=feeling expressed, relationship=person mentioned, event=something that happened

Existing memory nodes:
${existingStr}`;

  const userContent = `User said: "${userMessage}"\nAI replied: "${assistantMessage}"`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.2,
        max_tokens: 512,
      }),
    });

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? '{"newNodes":[]}';

    let parsed: { newNodes: Omit<MemoryNode, "id" | "timestamp" | "sourceMessageIds" | "storageCID" | "chainTxHash">[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { newNodes: [] };
    }

    const now = Date.now();
    const newNodes: MemoryNode[] = (parsed.newNodes ?? []).map((n) => ({
      id: uuidv4(),
      type: n.type,
      content: n.content,
      confidence: Math.min(1, Math.max(0, n.confidence ?? 0.5)),
      timestamp: now,
      sourceMessageIds: [],
      connections: n.connections ?? [],
      storageCID: "",    // populated in Phase 5
      chainTxHash: "",   // populated in Phase 7
    }));

    return NextResponse.json({ newNodes, provider: "openai-fallback" });
  } catch (err) {
    console.error("[memory/extract] error:", err);
    return NextResponse.json({ newNodes: [] });
  }
}
