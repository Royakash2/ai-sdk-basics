"use client";

import { useEffect, useRef } from "react";
import { useCompletion } from "@ai-sdk/react";

export default function StreamPage() {
  const {
    completion,
    input,
    handleInputChange,
    handleSubmit,
    setInput,
    isLoading,
    error,
  } = useCompletion({
    api: "/api/stream",
  });

  // scroll the output area to the bottom as new tokens arrive
  const outputRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [completion]);

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e);
    setInput(""); // clear the input after submitting
  };

  return (
    <div className="flex flex-col h-dvh bg-zinc-950 text-zinc-100">
      <main className="flex-1 w-full max-w-2xl mx-auto flex flex-col p-6 min-h-0">
        <h1 className="text-2xl font-semibold mb-6">AI Completion</h1>

        <div
          ref={outputRef}
          className="flex-1 min-h-0 overflow-y-auto rounded-lg bg-zinc-900 p-4 mb-4"
        >
          {isLoading && !completion ? (
            <p className="text-zinc-400 animate-pulse">Thinking...</p>
          ) : completion ? (
            <p className="whitespace-pre-wrap leading-7">{completion}</p>
          ) : error ? (
            <div className="text-red-500">{error.message}</div>
          ) : (
            <p className="text-zinc-500">
              Your response will appear here…
            </p>
          )}
        </div>

        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="How can I help you today?"
            className="flex-1 rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-zinc-100 px-5 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Thinking..." : "Submit"}
          </button>
        </form>
      </main>
    </div>
  );
}
