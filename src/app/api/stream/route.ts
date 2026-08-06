import { google } from "@ai-sdk/google";
import {  streamText } from "ai";


export async function POST(req: Request) {
    try{
        const {prompt } = await req.json();
        const result = streamText({
            model: google("gemini-2.5-flash"),
            prompt,
        });
        result.usage.then((usage) =>{
            console.log({
                inputToken: usage.inputTokens,
                OutputToken: usage.outputTokens,
                totalToken: usage.totalTokens,
            })
        })
        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("Error generating text",error);
        return Response.json({error:"failed to generate text"},{status: 500})
    }
    
}