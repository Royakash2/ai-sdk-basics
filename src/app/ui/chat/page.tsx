"use client"

import { useChat } from "@ai-sdk/react"
import React, { useState } from "react"

export default function ChatPage() {
    const [input, setInput] = useState("")
    const { messages, sendMessage, status,error,stop } = useChat();
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        sendMessage({ text: input })
        setInput("")
    }

    return <div className="flex h-dvh flex-col bg-zinc-950 text-zinc-100">
        {error && <div className="text-red-500">{error.message}</div>}
        {
            messages.map((message) => (
                <div className="mb-4" key={message.id}>
                    <div className="font-semibold">
                        {message.role === 'user' ? 'you' : 'ai'}
                    </div>
                    {
                        message.parts.map((part, index) => {
                            switch (part.type) {
                                case "text":
                                    return <div className="whitespace-pre-wrap" key={`${message.id}-${index}`}>{part.text}</div>
                                default:
                                    return null
                            }
                        })
                    }
                </div>
            ))
        }
        {
            (status === "submitted" || status === 'streaming') && (
                <div className="flex items-center justify-center gap-3 py-6">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
                    <span className="text-sm text-zinc-400">AI is thinking...</span>
                </div>
            )
        }
        <form onSubmit={handleSubmit} action="" className="mt-auto w-full max-w-2xl mx-auto p-6">
            <div className="flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="how can i help you" className="flex-1 rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                {
                    status === "submitted" || status === "streaming" ? (
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
                    )
                }
            </div>
        </form>
    </div>
}