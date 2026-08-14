import { google } from "@ai-sdk/google";
import { streamObject } from "ai";
import { pokemonSchema } from "./schema";

export async function POST(req: Request) {
  const { type } = await req.json();
  try {
    const result = streamObject({
      model: google("gemini-2.5-flash"),
      output: "array",
      schema: pokemonSchema,
      prompt: `Generate a list of 5  ${type} type pokemon`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error generating pokemon", error);
    return Response.json({ error: "failed to generate pokemon" }, { status: 500 });
  }
}
