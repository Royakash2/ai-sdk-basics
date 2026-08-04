"use client";

import { useState } from "react";

export default function Completion() {
    const [prompt, setPrompt] = useState("");
    const [completion, setCompletion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError(null);
        setPrompt("");
        setCompletion("");

        try {
            const res = await fetch("/api/completion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });
            const data = await res.json();
            if(!res.ok){
                throw new Error(data.error || "something went wrong");
            }
            setCompletion(data.text);
        } catch (error) {
            console.log("Error:",error);
            setError(error instanceof Error ? error.message : "something went wrong try again");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
          
            <main className="flex-1 w-full max-w-2xl mx-auto flex flex-col p-6">
                <h1 className="text-2xl font-semibold mb-6">AI Completion</h1>

                <div className="flex-1 rounded-lg bg-zinc-900 p-4 mb-4 overflow-y-auto min-h-64">
                    {isLoading ? (
                        <p className="text-zinc-400 animate-pulse">Thinking...</p>
                    ) : completion ? (
                        <p className="whitespace-pre-wrap leading-7">{completion}</p>
                    ) : (
                          error && <div className="text-red-500 mb-4">{error}</div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="How can I help you today?"
                        className="flex-1 rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-lg bg-zinc-100 px-5 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Submit
                    </button>
                </form>
            </main>
        </div>
    );
}
