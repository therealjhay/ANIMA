"use client";

/**
 * src/components/chat/ChatInput.tsx
 * -----------------------------------
 * Textarea + send button for the chat interface.
 * Enter sends the message; Shift+Enter inserts a newline.
 * Disabled while the AI is streaming a response.
 */

import { useRef, KeyboardEvent } from "react";

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChange, onSend, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim()) onSend();
    }
  }

  return (
    <div className="flex items-end gap-3 p-4 border-t border-border bg-background/80 backdrop-blur">
      <textarea
        ref={textareaRef}
        id="chat-input"
        className="flex-1 resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm
                   placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50
                   max-h-40 min-h-[48px] transition-all"
        placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
      />
      <button
        id="send-btn"
        onClick={onSend}
        disabled={isLoading || !value.trim()}
        className="shrink-0 h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center
                   justify-center transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        )}
      </button>
    </div>
  );
}
