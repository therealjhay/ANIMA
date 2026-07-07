/**
 * src/lib/0g/compute.ts
 * ----------------------
 * 0G Compute client wrapper.
 * Routes LLM inference through the verifiable compute network when available.
 * Falls back to direct OpenAI when the 0G Compute SDK is unavailable.
 *
 * MOCK: replace the try block with real 0G Compute SDK call — see NOTES.md
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ComputeInferenceParams {
  model: string;
  messages: Array<{ role: string; content: string }>;
  systemPrompt?: string;
  stream?: boolean;
}

export interface ComputeInferenceResult {
  content: string;
  verificationProof?: string;  // 0G proof hash when verifiable compute is used
  provider: "0g" | "openai-fallback";
}

// ─── Main function ────────────────────────────────────────────────────────────

/**
 * Run LLM inference, preferring 0G Compute for verifiability.
 * Automatically degrades to OpenAI when 0G is unavailable.
 */
export async function runInference(
  params: ComputeInferenceParams
): Promise<ComputeInferenceResult> {
  try {
    // MOCK: replace with actual @0glabs/compute SDK when available — see NOTES.md
    throw new Error("0G Compute SDK not yet integrated");
  } catch {
    // Fallback: direct OpenAI call
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: params.model || "gpt-4o-mini",
        messages: params.systemPrompt
          ? [{ role: "system", content: params.systemPrompt }, ...params.messages]
          : params.messages,
        stream: false,
      }),
    });

    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content ?? "",
      verificationProof: undefined,
      provider: "openai-fallback",
    };
  }
}
