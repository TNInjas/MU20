import type { ChatMessage } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/**
 * Send a message to the chat API
 */
export async function sendChatMessage(
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      conversationHistory,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send message");
  }

  const data = await response.json();
  return data.message;
}

