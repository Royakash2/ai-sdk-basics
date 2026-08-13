"use client"

import React, { useEffect, useRef, useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { recipeSchema } from "@/app/api/structured-data/schema";

export default function StructureData() {
    const [dishName, setDishName] = useState("");
    const { submit, object, isLoading, error, stop } = useObject({
        api: "/api/structured-data",
        schema: recipeSchema,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!dishName.trim()) return;
        submit({ dish: dishName });
        setDishName("");
    };

    const recipe = object?.recipe;
    const mainRef = useRef<HTMLElement>(null);

    // follow the stream: keep the newest generated content in view
    useEffect(() => {
        const el = mainRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [object]);

    return (
        <div className="flex h-dvh flex-col bg-zinc-950 text-zinc-100">
            {/* recipe display area */}
            <main ref={mainRef} className="flex-1 min-h-0 overflow-y-auto">
                <div className="mx-auto w-full max-w-2xl p-6">
                    {/* loading state (only while nothing has streamed yet) */}
                    {isLoading && !recipe && (
                        <div className="flex items-center justify-center gap-3 border border-zinc-800 p-8">
                            <div className="h-4 w-4 animate-spin rounded-full border border-zinc-700 border-t-zinc-400" />
                            <span className="font-mono text-xs text-zinc-500">
                                Generating recipe...
                            </span>
                        </div>
                    )}

                    {/* error state */}
                    {!isLoading && error && (
                        <div className="border border-red-500/30 px-4 py-3 text-sm text-red-400">
                            Failed to generate recipe: {error.message}
                        </div>
                    )}

                    {/* recipe card — renders live as the object streams in */}
                    {!error && recipe && (
                        <div className="border border-zinc-800 p-6">
                            <h2 className="text-xl font-medium tracking-tight text-zinc-100">
                                {recipe.name}
                                {isLoading && (
                                    <span className="ml-3 inline-block animate-pulse rounded-full border border-zinc-700 px-2.5 py-0.5 align-middle text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                                        generating
                                    </span>
                                )}
                            </h2>

                            {recipe.ingredients && recipe.ingredients.length > 0 && (
                                <section className="mt-6 border-t border-zinc-800 pt-4">
                                    <h3 className="text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-500">
                                        Ingredients
                                    </h3>
                                    <ul className="mt-3 space-y-2">
                                        {recipe.ingredients.map((ingredient, index) => (
                                            <li
                                                key={index}
                                                className="flex items-baseline justify-between gap-4 text-sm text-zinc-300"
                                            >
                                                <span>{ingredient?.name}</span>
                                                <span className="font-mono text-xs text-zinc-500">
                                                    {ingredient?.amount}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {recipe.steps && recipe.steps.length > 0 && (
                                <section className="mt-6 border-t border-zinc-800 pt-4">
                                    <h3 className="text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-500">
                                        Steps
                                    </h3>
                                    <ol className="mt-3 space-y-3">
                                        {recipe.steps.map((step, index) => (
                                            <li
                                                key={index}
                                                className="flex gap-4 text-sm text-zinc-300"
                                            >
                                                <span className="font-mono text-xs text-zinc-600">
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>
                                                <span className="pt-px">{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </section>
                            )}
                        </div>
                    )}

                    {/* empty state */}
                    {!isLoading && !error && !recipe && (
                        <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-zinc-800 p-10 text-center">
                            <span className="text-3xl">🍽️</span>
                            <p className="text-sm text-zinc-400">
                                Type a dish below and press{" "}
                                <span className="font-medium text-zinc-200">generate</span> to get a
                                structured recipe.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* composer */}
            <form onSubmit={handleSubmit} action="" className="mx-auto flex w-full max-w-2xl gap-4 p-6">
                <input
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    type="text"
                    placeholder="e.g. butter chicken"
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
                        disabled={!dishName.trim()}
                        className="shrink-0 border border-zinc-700 px-4 py-2 text-xs font-medium uppercase tracking-wider text-zinc-300 transition-colors hover:border-zinc-400 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-700 disabled:hover:text-zinc-300"
                    >
                        generate
                    </button>
                )}
            </form>
        </div>
    );
}
