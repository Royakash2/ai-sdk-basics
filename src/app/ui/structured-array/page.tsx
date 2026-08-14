"use client"

import React, { useEffect, useRef, useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { pokemonUiSchema } from "@/app/api/structured-array/schema";

export default function StructuredArray() {
    const [pokemonType, setPokemonType] = useState("");
    const { submit, object, isLoading, error, stop } = useObject({
        api: "/api/structured-array",
        schema: pokemonUiSchema,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pokemonType.trim()) return;
        submit({ type: pokemonType });
        setPokemonType("");
    };

    const pokemon = object;
    const mainRef = useRef<HTMLElement>(null);

    // follow the stream: keep the newest generated content in view
    useEffect(() => {
        const el = mainRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [object]);

    return (
        <div className="flex h-dvh flex-col bg-zinc-950 text-zinc-100">
            {/* pokemon display area */}
            <main ref={mainRef} className="flex-1 min-h-0 overflow-y-auto">
                <div className="mx-auto w-full max-w-2xl p-6">
                    {/* loading state (only while nothing has streamed yet) */}
                    {isLoading && !pokemon && (
                        <div className="flex items-center justify-center gap-3 border border-zinc-800 p-8">
                            <div className="h-4 w-4 animate-spin rounded-full border border-zinc-700 border-t-zinc-400" />
                            <span className="font-mono text-xs text-zinc-500">
                                Generating pokemon...
                            </span>
                        </div>
                    )}

                    {/* error state */}
                    {!isLoading && error && (
                        <div className="border border-red-500/30 px-4 py-3 text-sm text-red-400">
                            Failed to generate pokemon: {error.message}
                        </div>
                    )}

                    {/* pokemon list — renders live as the object streams in */}
                    {!error && pokemon && pokemon.length > 0 && (
                        <div className="space-y-4">
                            {pokemon.map((poke, index) => (
                                <div key={index} className="border border-zinc-800 p-6">
                                    <h2 className="text-xl font-medium tracking-tight text-zinc-100">
                                        {poke?.name}
                                        {isLoading && index === pokemon.length - 1 && (
                                            <span className="ml-3 inline-block animate-pulse rounded-full border border-zinc-700 px-2.5 py-0.5 align-middle text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                                                generating
                                            </span>
                                        )}
                                    </h2>

                                    {poke?.abilities && poke.abilities.length > 0 && (
                                        <section className="mt-6 border-t border-zinc-800 pt-4">
                                            <h3 className="text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-500">
                                                Abilities
                                            </h3>
                                            <ul className="mt-3 flex flex-wrap gap-2">
                                                {poke.abilities.map((ability, abilityIndex) => (
                                                    <li
                                                        key={abilityIndex}
                                                        className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300"
                                                    >
                                                        {ability}
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* empty state */}
                    {!isLoading && !error && !pokemon && (
                        <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-zinc-800 p-10 text-center">
                            <span className="text-3xl">⚡</span>
                            <p className="text-sm text-zinc-400">
                                Type a pokemon type below and press{" "}
                                <span className="font-medium text-zinc-200">generate</span> to get
                                a list of pokemon.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* composer */}
            <form onSubmit={handleSubmit} action="" className="mx-auto flex w-full max-w-2xl gap-4 p-6">
                <input
                    value={pokemonType}
                    onChange={(e) => setPokemonType(e.target.value)}
                    type="text"
                    placeholder="e.g. fire"
                    className="w-full min-w-0 flex-1 border-b border-zinc-700 bg-transparent px-0 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-300 focus:outline-none"
                />
                {isLoading ? (
                    <button
                        type="button"
                        onClick={stop}
                        className="shrink-0 border border-red-500/40 px-4 py-2 text-xs font-medium uppercase tracking-wider text-red-400 transition-colors hover:border-red-400 hover:text-red-300"
                    >
                        Stop
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={!pokemonType.trim()}
                        className="shrink-0 border border-zinc-700 px-4 py-2 text-xs font-medium uppercase tracking-wider text-zinc-300 transition-colors hover:border-zinc-400 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-700 disabled:hover:text-zinc-300"
                    >
                        generate
                    </button>
                )}
            </form>
        </div>
    );
}
