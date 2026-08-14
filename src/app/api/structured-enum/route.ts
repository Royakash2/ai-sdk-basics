import { google } from "@ai-sdk/google";
import { generateObject, } from "ai";

export async function POST(req: Request) {
  const { text } = await req.json();
  try {
    const result = generateObject({
      model: google("gemini-2.5-flash"),
      output: "enum",
      enum: ["bhalo", "karap", "majhari"],
      prompt: `classify the sentiment with this ${text}`,
    });

    return (await result).toJsonResponse();
  } catch (error) {
    console.error("Error generating sentiment", error);
    return Response.json({ error: "failed to generate sentiment" }, { status: 500 });
  }
}
