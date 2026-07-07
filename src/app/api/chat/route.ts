/**
 * src/app/api/chat/route.ts
 * -------------------------
 * Streaming chat endpoint using the Vercel AI SDK.
 * Constructs a personalised system prompt from the companion's personality seed
 * and injected memory context, then streams the response back to the browser.
 */

import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages, companionName, personalitySeed, memoryContext } =
    await req.json();

  const systemPrompt = `You are ${companionName}, an AI companion with the following personality:
${personalitySeed}

Here is what you remember about your owner:
${memoryContext || "Nothing yet — this is the start of your journey together."}

Stay in character. Be warm, personal, and reference memories naturally when relevant.`;

  const result = await streamText({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: openai("gpt-4o-mini") as any,
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
