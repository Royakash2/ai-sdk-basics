import { google } from "@ai-sdk/google";
import { streamObject } from "ai";
import { recipeSchema } from "./schema";

export async function POST(req: Request) {
  const { dish } = await req.json();
  try {
    const result = streamObject({
      model: google("gemini-2.5-flash"),
      schema: recipeSchema,
      prompt: `Generate recipe for ${dish}`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error generating text", error);
    return Response.json({ error: "failed to generate dish" }, { status: 500 });
  }
}
