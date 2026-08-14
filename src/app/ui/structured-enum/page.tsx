"use client"

import React, { useRef, useState } from "react";

const SENTIMENT_STYLES: Record<string, { label: string; emoji: string; className: string }> = {
    bhalo: { label: "Bhalo", emoji: "👍", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
    majhari: { label: "Majhari", emoji: "😐", className: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
    karap: { label: "Karap", emoji: "👎", className: "border-red-500/30 bg-red-500/10 text-red-300" },
};

const DEFAULT_STYLE = { label: "Unknown", emoji: "❓", className: "border-zinc-600/30 bg-zinc-600/10 text-zinc-300" };

export default function StructuredEnum() {
    const [text, setText] = useState("");
    const [sentiment, setSentiment] = useState<string | null>(null);
    const [submittedText, setSubmittedText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const controllerRef = useRef<AbortController | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || isLoading) return;

        const controller = new AbortController();
        controllerRef.current = controller;
        setError(null);
        setSentiment(null);
        setIsLoading(true);

        try {
            const res = await fetch("/api/structured-enum", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
                signal: controller.signal,
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.error ?? "Failed to generate sentiment");
            }

            setSentiment(await res.json());
            setSubmittedText(text);
        } catch (err) {
            if ((err as Error).name === "AbortError") return;
            setError(err as Error);
        } finally {
            setIsLoading(false);
            controllerRef.current = null;
        }
    };

    const handleStop = () => {
        controllerRef.current?.abort();
    };

    const style = sentiment ? (SENTIMENT_STYLES[sentiment] ?? DEFAULT_STYLE) : undefined;

    return (
        <div className="flex h-dvh flex-col bg-zinc-950 text-zinc-100">
            {/* sentiment display area */}
            <main className="flex-1 min-h-0 overflow-y-auto">
                <div className="mx-auto w-full max-w-2xl p-6">
                    {/* loading state */}
                    {isLoading && (
                        <div className="flex items-center justify-center gap-3 border border-zinc-800 p-8">
                            <div className="h-4 w-4 animate-spin rounded-full border border-zinc-700 border-t-zinc-400" />
                            <span className="font-mono text-xs text-zinc-500">
                                Classifying sentiment...
                            </span>
                        </div>
                    )}

                    {/* error state */}
                    {!isLoading && error && (
                        <div className="border border-red-500/30 px-4 py-3 text-sm text-red-400">
                            Failed to generate sentiment: {error.message}
                        </div>
                    )}

                    {/* result */}
                    {!isLoading && !error && sentiment !== null && style && (
                        <div className="border border-zinc-800 p-6">
                            <h3 className="text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-500">
                                Sentiment
                            </h3>
                            <div
                                className={`mt-4 inline-flex items-center gap-3 border px-4 py-2 text-sm font-medium ${style.className}`}
                            >
                                <span className="text-lg">{style.emoji}</span>
                                {style.label}
                            </div>
                            {submittedText && (
                                <p className="mt-6 border-t border-zinc-800 pt-4 text-sm text-zinc-400">
                                    <span className="text-zinc-600">Text:</span> “{submittedText}”
                                </p>
                            )}
                        </div>
                    )}

                    {/* empty state */}
                    {!isLoading && !error && sentiment === null && (
                        <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-zinc-800 p-10 text-center">
                            <span className="text-3xl">💬</span>
                            <p className="text-sm text-zinc-400">
                                Type some text below and press{" "}
                                <span className="font-medium text-zinc-200">generate</span> to
                                classify its sentiment.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* composer */}
            <form onSubmit={handleSubmit} action="" className="mx-auto flex w-full max-w-2xl gap-4 p-6">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    type="text"
                    placeholder="e.g. this movie was amazing"
                    className="w-full min-w-0 flex-1 border-b border-zinc-700 bg-transparent px-0 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-300 focus:outline-none"
                />
                {isLoading ? (
                    <button
                        type="button"
                        onClick={handleStop}
                        className="shrink-0 border border-red-500/40 px-4 py-2 text-xs font-medium uppercase tracking-wider text-red-400 transition-colors hover:border-red-400 hover:text-red-300"
                    >
                        Stop
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={!text.trim()}
                        className="shrink-0 border border-zinc-700 px-4 py-2 text-xs font-medium uppercase tracking-wider text-zinc-300 transition-colors hover:border-zinc-400 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-700 disabled:hover:text-zinc-300"
                    >
                        generate
                    </button>
                )}
            </form>
        </div>
    );
}
