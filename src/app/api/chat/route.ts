import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: modelMessages,
    });
    result.usage.then((usage) => {
      console.log({
        messageCount: messages.length,
        inputToken: usage.inputTokens,
        OutputToken: usage.outputTokens,
        totalToken: usage.totalTokens,
      });
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("error stream chat completion", error);
    return new Response("failed to stream chat completion:", { status: 500 });
  }
}
