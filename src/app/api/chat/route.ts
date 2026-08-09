import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: google("gemini-2.5-flash"),
      instructions:
         "Classify the sentiment of a message as Positive, Negative, or Neutral.\n\n" +
  "Message: I love this new update!\nSentiment: Positive\n\n" +
  "Message: This bug is driving me crazy.\nSentiment: Negative\n\n" +
  "Message: The app opened fine.\nSentiment: Neutral\n\n" +
  "Now classify: ",
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
