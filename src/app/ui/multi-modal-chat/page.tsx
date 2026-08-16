"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"

export default function MultiModalChatPage() {
    const { messages, sendMessage, status, error, stop } = useChat({
        transport: new DefaultChatTransport({ api: "/api/multi-modal-chat" })
    })

    const [input, setInput] = useState("")
    const [attachments, setAttachments] = useState<{ file: File; preview: string }[]>([])

    const fileInputRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    const isBusy = status === "submitted" || status === "streaming"
    const canSend = status === "ready" && (input.trim().length > 0 || attachments.length > 0)

    // keep the newest content in view as messages stream in
    useEffect(() => {
        const el = scrollRef.current
        if (el) el.scrollTop = el.scrollHeight
    }, [messages, status])

    const revokePreviews = () =>
        attachments.forEach((a) => a.preview && URL.revokeObjectURL(a.preview))

    const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files
        revokePreviews()
        setAttachments(
            selected && selected.length > 0
                ? Array.from(selected).map((file) => ({
                      file,
                      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
                  }))
                : []
        )
        e.target.value = "" // allow re-selecting the same file
    }

    const removeFile = (index: number) => {
        const removed = attachments[index]
        if (removed?.preview) URL.revokeObjectURL(removed.preview)
        setAttachments((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!canSend) return
        // rebuild a FileList for the API; the hook converts it into file parts
        const dt = new DataTransfer()
        attachments.forEach((a) => dt.items.add(a.file))
        sendMessage({ text: input, files: dt.files })
        setInput("")
        revokePreviews()
        setAttachments([])
        if (textareaRef.current) textareaRef.current.style.height = "auto"
    }

    const autoResize = () => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = "auto"
        el.style.height = `${Math.min(el.scrollHeight, 160)}px`
    }

    return (
        <div className="flex h-dvh flex-col bg-zinc-950 text-zinc-100">
            {/* header */}
            <header className="border-b border-zinc-800/80 px-6 py-4">
                <div className="mx-auto flex w-full max-w-2xl items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 text-zinc-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3l1.9 5.7 5.6 1.3-5.6 1.3L12 17l-1.9-5.7L4.5 10l5.6-1.3L12 3z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold leading-tight">Multi-modal chat</h1>
                        <p className="text-xs text-zinc-500">Gemini 2.5 Flash</p>
                    </div>
                </div>
            </header>

            {/* message area */}
            <main ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">
                <div className={`mx-auto flex w-full max-w-2xl flex-col gap-4 p-6 ${messages.length === 0 && !isBusy ? "min-h-full justify-center" : ""}`}>
                    {error && (
                        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            <span>{error.message}</span>
                            <button type="button" onClick={() => window.location.reload()} className="shrink-0 text-xs underline underline-offset-2 hover:text-red-300">
                                Retry
                            </button>
                        </div>
                    )}

                    {messages.length === 0 && !isBusy && (
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-zinc-200">Ask anything</p>
                                <p className="mt-1 text-sm text-zinc-500">Attach an image, PDF, or document — or just type a question.</p>
                            </div>
                        </div>
                    )}

                    {messages.map((message) => {
                        const isUser = message.role === "user"
                        return (
                            <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] ${isUser ? "rounded-2xl rounded-br-md bg-zinc-800 px-4 py-2.5" : "min-w-0"}`}>
                                    {!isUser && <div className="mb-1 text-xs font-semibold text-zinc-400">AI</div>}
                                    <div className="flex flex-col gap-2">
                                        {message.parts.map((part, index) => {
                                            switch (part.type) {
                                                case "text":
                                                    return <div className="whitespace-pre-wrap break-words" key={`${message.id}-${index}`}>{part.text}</div>
                                                case "file":
                                                    return part.mediaType.startsWith("image/") || part.mediaType === "image" ? (
                                                        <Image src={part.url} alt={part.filename ?? "attachment"} width={512} height={512} unoptimized className="h-auto max-h-56 w-auto rounded-lg border border-zinc-700" key={`${message.id}-${index}`} />
                                                    ) : (
                                                        <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-300" key={`${message.id}-${index}`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                            </svg>
                                                            <span className="truncate">{part.filename ?? "Attachment"}</span>
                                                        </div>
                                                    )
                                                default:
                                                    return null
                                            }
                                        })}
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {isBusy && (
                        <div className="flex items-center gap-3 py-2">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
                            <span className="text-sm text-zinc-400">AI is thinking...</span>
                        </div>
                    )}
                </div>
            </main>

            {/* composer */}
            <form onSubmit={handleSubmit} className="mx-auto mt-auto w-full max-w-2xl p-6 pt-2">
                <div className="flex flex-col rounded-2xl border border-zinc-700 bg-zinc-900 transition-colors focus-within:border-zinc-500">
                    {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 px-3 pt-3">
                            {attachments.map(({ file, preview }, index) => (
                                preview ? (
                                    <div key={`${file.name}-${index}`} className="relative" title={file.name}>
                                        <Image src={preview} alt={file.name} width={64} height={64} unoptimized className="h-16 w-16 rounded-lg border border-zinc-700 object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            aria-label={`Remove ${file.name}`}
                                            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-400 shadow ring-1 ring-zinc-700 transition-colors hover:bg-red-500 hover:text-white"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ) : (
                                    <div key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                        <span className="max-w-40 truncate">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            aria-label={`Remove ${file.name}`}
                                            className="text-zinc-500 transition-colors hover:text-red-400"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                )
                            ))}
                        </div>
                    )}

                    <div className="flex items-end gap-2 p-3">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            aria-label="Attach files"
                            className="shrink-0 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        </button>
                        <input ref={fileInputRef} type="file" multiple onChange={handleFilesChange} className="hidden" />

                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => { setInput(e.target.value); autoResize() }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    e.currentTarget.form?.requestSubmit()
                                }
                            }}
                            rows={1}
                            placeholder="Ask anything — attach an image, PDF, or document"
                            className="max-h-40 flex-1 resize-none bg-transparent py-2 text-[15px] text-zinc-100 placeholder-zinc-500 focus:outline-none"
                        />

                        {isBusy ? (
                            <button
                                type="button"
                                onClick={stop}
                                aria-label="Stop generating"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400 transition-colors hover:bg-red-500/25"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <rect x="6" y="6" width="12" height="12" rx="2" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={!canSend}
                                aria-label="Send message"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 transition-all hover:bg-zinc-300 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                <p className="mt-2 text-center text-xs text-zinc-600">AI can make mistakes — check important info.</p>
            </form>
        </div>
    )
}
