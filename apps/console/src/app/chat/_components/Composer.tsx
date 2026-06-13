"use client";

import { useRef } from "react";

interface ComposerProps {
  value: string;
  busy: boolean;
  onChange: (v: string) => void;
  onSend: () => void;
}

/**
 * Composer — the input instrument. An auto-growing textarea (Enter sends,
 * Shift+Enter newlines) and a send button that locks while a turn is in flight.
 */
export function Composer({ value, busy, onChange, onSend }: ComposerProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim() !== "" && !busy;

  function grow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSend) onSend();
      }}
      className="panel flex items-end gap-2 p-2 focus-within:border-line-strong"
    >
      <textarea
        ref={ref}
        value={value}
        rows={1}
        onChange={(e) => {
          onChange(e.target.value);
          grow(e.target);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (canSend) onSend();
          }
        }}
        placeholder="Ask the supplier-intelligence agent…"
        className="max-h-40 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm leading-relaxed text-ink outline-none placeholder:text-ink-faint"
      />
      <button
        type="submit"
        disabled={!canSend}
        aria-label="Send"
        className="focus-ring group flex h-9 items-center gap-2 rounded-md bg-accent px-3.5 text-sm font-medium text-accent-ink transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:bg-panel-2 disabled:text-ink-ghost"
      >
        <span className="hidden sm:inline">{busy ? "Sending" : "Send"}</span>
        {busy ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className="animate-spin"
            style={{ animationDuration: "0.8s" }}
            aria-hidden
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeOpacity={0.3}
              strokeWidth="3"
            />
            <path
              d="M12 3a9 9 0 0 1 9 9"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            className="transition-transform group-enabled:group-hover:translate-x-0.5"
          >
            <path
              d="M2.5 8h10M8.5 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </form>
  );
}
