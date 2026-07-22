"use client";

import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What's my next deadline?",
  "What's due this week?",
  "What's the course plan for KIT719?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading, error]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-20),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          data?.error || "Something went wrong reaching the AI assistant. Please try again."
        );
        return;
      }

      setMessages([...nextMessages, { role: "assistant", content: data.reply as string }]);
    } catch {
      setError("Couldn't reach the AI assistant - check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      {open ? (
        <div className="fixed bottom-20 right-4 z-40 flex h-[70vh] max-h-[600px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 sm:w-96">
          <div className="flex items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Deadlines assistant</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Answers grounded in your real data</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              <CloseIcon />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Ask about upcoming deadlines, rubrics, weights, or course plans - answered with live
                  data from your courses.
                </p>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => sendMessage(s)}
                      className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => <MessageBubble key={i} message={m} />)
            )}

            {isLoading ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
                </div>
              </div>
            ) : null}

            {error ? (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                {error}
              </p>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a deadline…"
              disabled={isLoading}
              className="flex-1 rounded-full border border-zinc-300 bg-white px-3.5 py-2 text-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-indigo-600 p-2.5 text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open deadlines assistant"}
        className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-transform hover:bg-indigo-500 active:scale-95"
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>
    </>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <p
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
        }`}
      >
        {message.content}
      </p>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M4 4.5h16a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1H9l-4.4 3.3A.5.5 0 0 1 4 18.9V16H4a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M3.5 12 20 4l-6.5 16-2.7-6.3L3.5 12Zm7 1.7L18 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
