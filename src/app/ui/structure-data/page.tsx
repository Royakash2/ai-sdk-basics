"use client"

import { useState } from "react"

export default function StructureData() {
    const [dishName,setDishName]= useState("");

     return <div className="flex min-h-dvh flex-col bg-zinc-950 text-zinc-100">
        {/* structure data goes here */}

        <form action="" className="flex mt-auto mx-auto w-full max-w-2xl p-6 gap-2">
            <input type="text" className="flex-1 min-w-0 rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
            <button className="shrink-0 rounded-lg bg-zinc-100 px-5 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-300">generate</button>
        </form>
     </div>
    
}