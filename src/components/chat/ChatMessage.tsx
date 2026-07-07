"use client";

/**
 * src/components/chat/ChatMessage.tsx
 * ------------------------------------
 * Renders a single chat bubble.
 * User messages are right-aligned in rose/accent colour.
 * Assistant messages are left-aligned and show the companion name.
 */

import type { Message } from "@/lib/types";

interface ChatMessageProps {
  message: Message;
  companionName: string;
}

export function ChatMessage({ message, companionName }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary mr-2 mt-1 shrink-0">
          {companionName.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="max-w-[75%]">
        {!isUser && (
          <p className="text-xs text-muted-foreground mb-1 ml-1">{companionName}</p>
        )}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-card border border-border text-card-foreground rounded-bl-sm"
          }`}
        >
          {message.content}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 mx-1">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {message.provider && (
            <span className="ml-2 opacity-70">
              ⚡ via {message.provider === "0g" ? "0G Compute" : "OpenAI"}
            </span>
          )}
        </p>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary ml-2 mt-1 shrink-0">
          You
        </div>
      )}
    </div>
  );
}
