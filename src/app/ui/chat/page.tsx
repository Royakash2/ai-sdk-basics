"use client"

import { useChat } from "@ai-sdk/react"
import React, { useEffect, useRef, useState } from "react"

export default function ChatPage() {
    const [input, setInput] = useState("")
    const { messages, sendMessage, status,error,stop } = useChat();

    // keep the newest message in view
    const bottomRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        sendMessage({ text: input })
        setInput("")
    }

    return (
        <div className="flex h-dvh flex-col bg-zinc-950 text-zinc-100">
            {/* scrollable message area */}
            <main className="flex-1 min-h-0 overflow-y-auto">
                <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
                    {error && (
                        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            {error.message}
                        </div>
                    )}

                    {messages.length === 0 && status === "ready" && (
                        <div className="mt-16 text-center">
                            <p className="text-sm text-zinc-500">No messages yet — say hi! 👋</p>
                        </div>
                    )}

                    {messages.map((message) =>
                        message.role === "user" ? (
                            // user bubble — right aligned
                            <div key={message.id} className="flex justify-end">
                                <div className="max-w-[80%] rounded-2xl rounded-br-md bg-indigo-600 px-4 py-3 text-sm leading-6">
                                    {message.parts.map((part, index) =>
                                        part.type === "text" ? (
                                            <div key={`${message.id}-${index}`} className="whitespace-pre-wrap">
                                                {part.text}
                                            </div>
                                        ) : null
                                    )}
                                </div>
                            </div>
                        ) : (
                            // ai message — left aligned with avatar
                            <div key={message.id} className="flex gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold">
                                    AI
                                </div>
                                <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-zinc-900 px-4 py-3 text-sm leading-6">
                                    {message.parts.map((part, index) =>
                                        part.type === "text" ? (
                                            <div key={`${message.id}-${index}`} className="whitespace-pre-wrap">
                                                {part.text}
                                            </div>
                                        ) : null
                                    )}
                                </div>
                            </div>
                        )
                    )}

                    {(status === "submitted" || status === "streaming") && (
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold">
                                AI
                            </div>
                            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-zinc-900 px-4 py-3">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
                                <span className="text-sm text-zinc-400">thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
                <div ref={bottomRef} />
            </main>

            {/* composer pinned at the bottom */}
            <form onSubmit={handleSubmit} action="" className="border-t border-zinc-800/60 p-4">
                <div className="mx-auto flex w-full max-w-2xl gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="how can i help you"
                        className="flex-1 rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    />
                    {status === "submitted" || status === "streaming" ? (
                        <button
                            type="button"
                            onClick={stop}
                            className="rounded-lg border border-red-500/40 bg-red-500/10 px-5 py-3 font-medium text-red-400 transition-colors hover:bg-red-500/20"
                        >
                            Stop
                        </button>
                    ) : (
                        <button
                            disabled={status !== "ready" || !input.trim()}
                            type="submit"
                            className="rounded-lg bg-zinc-100 px-5 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-100"
                        >
                            send
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}