"use client"

export default function ChatPage() {

    return <div className="flex h-dvh flex-col bg-zinc-950 text-zinc-100">
        {/* message will go here  */}

        <form action="" className="mt-auto w-full max-w-2xl mx-auto p-6">
            <div className="flex gap-2">
                <input placeholder="how can i help you" className="flex-1 rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                <button type="submit" className="rounded-lg bg-zinc-100 px-5 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-300">
                    send
                </button>
            </div>
        </form>
    </div>
}