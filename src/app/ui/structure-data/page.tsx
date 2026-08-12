"use client"

import React, { useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { recipeSchema } from "@/app/api/structured-data/schema";

export default function StructureData() {
    const [dishName, setDishName] = useState("");
    const { submit, object, isLoading, error } = useObject({
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

    return (
        <div className="flex min-h-dvh flex-col bg-zinc-950 text-zinc-100">
            {/* recipe display area */}
            <main className="flex-1 min-h-0 overflow-y-auto">
                <div className="mx-auto w-full max-w-2xl p-6">
                    {/* loading state (only while nothing has streamed yet) */}
                    {isLoading && !recipe && (
                        <div className="flex items-center justify-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-8">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
                            <span className="text-sm text-zinc-400">Generating recipe...</span>
                        </div>
                    )}

                    {/* error state */}
                    {!isLoading && error && (
                        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
                            Failed to generate recipe: {error.message}
                        </div>
                    )}

                    {/* recipe card — renders live as the object streams in */}
                    {!error && recipe && (
                        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
                            <h2 className="text-2xl font-bold text-zinc-100">
                                {recipe.name}
                                {isLoading && (
                                    <span className="ml-3 inline-block animate-pulse rounded-full bg-indigo-500/20 px-2.5 py-0.5 align-middle text-xs font-medium text-indigo-300">
                                        generating...
                                    </span>
                                )}
                            </h2>

                            {recipe.ingredients && recipe.ingredients.length > 0 && (
                                <section className="mt-6">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                                        Ingredients
                                    </h3>
                                    <ul className="mt-3 space-y-2">
                                        {recipe.ingredients.map((ingredient, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center justify-between gap-4 rounded-md bg-zinc-800/60 px-4 py-2 text-sm"
                                            >
                                                <span className="text-zinc-200">{ingredient?.name}</span>
                                                <span className="text-zinc-400">{ingredient?.amount}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {recipe.steps && recipe.steps.length > 0 && (
                                <section className="mt-6">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                                        Steps
                                    </h3>
                                    <ol className="mt-3 space-y-3">
                                        {recipe.steps.map((step, index) => (
                                            <li key={index} className="flex gap-3 text-sm text-zinc-300">
                                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-medium text-indigo-300">
                                                    {index + 1}
                                                </span>
                                                <span className="pt-0.5">{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </section>
                            )}
                        </div>
                    )}

                    {/* empty state */}
                    {!isLoading && !error && !recipe && (
                        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-800 p-10 text-center">
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
            <form onSubmit={handleSubmit} action="" className="mx-auto flex w-full max-w-2xl gap-2 p-6">
                <input
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    type="text"
                    placeholder="e.g. butter chicken"
                    className="flex-1 min-w-0 rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
                <button
                    type="submit"
                    disabled={isLoading || !dishName.trim()}
                    className="shrink-0 rounded-lg bg-zinc-100 px-5 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-zinc-100"
                >
                    {isLoading ? "Generating..." : "generate"}
                </button>
            </form>
        </div>
    );
}
