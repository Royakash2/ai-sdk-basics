import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
    const { prompt } = await req.json();

    const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: prompt,
    })

    return Response.json({
        text
    })
}