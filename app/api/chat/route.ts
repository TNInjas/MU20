import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage } from "@/types";

const GEMINI_API_KEY = "AIzaSyCkb5Z7HDcuZ_kvEAIUz4L-84h6CcusU8g";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

/**
 * POST /api/chat
 * Send a message to Gemini Flash and get a financial advice response
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get user's financial data for context
    const { data: categories } = await supabase
      .from("user_categories")
      .select("*")
      .eq("user_id", user.id);

    const { data: progress } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // Build context about user's financial situation
    const userContext = `
User Financial Context:
${categories && categories.length > 0 ? `Budget Categories: ${categories.map((c: any) => `${c.name} ($${c.size})`).join(", ")}` : "No budget categories set yet"}
${progress ? `Current Financial Step: ${progress.current_step}` : "No progress tracked yet"}
`.trim();

    // Construct the system prompt with user context
    const systemPrompt = `You are a helpful financial assistant and teacher. Your role is to:
1. Explain financial concepts in simple, easy-to-understand terms
2. Provide thoughtful advice about spending decisions
3. Help users understand their financial situation better
4. Be supportive and educational, not preachy

When answering questions about purchases or expenditures, consider:
- The user's financial goals and current situation
- Whether the purchase aligns with their budget
- Long-term financial implications
- Provide both pros and cons when appropriate

Keep responses conversational, helpful, and educational.

${userContext}

Based on the user's financial context above, provide personalized advice.`;

    // Build conversation history for context (last 10 messages to avoid token limits)
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    
    // Add conversation history
    const recentHistory = conversationHistory.slice(-10);
    const isFirstMessage = recentHistory.length === 0;
    
    // If this is the first message, prepend system context
    const currentMessage = isFirstMessage 
      ? `${systemPrompt}\n\nUser question: ${message}`
      : message;

    // Add conversation history
    recentHistory.forEach((msg: ChatMessage) => {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    });

    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: currentMessage }],
    });

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: "Failed to get response from AI" },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json(
        { error: "Invalid response from AI" },
        { status: 500 }
      );
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    return NextResponse.json(
      { 
        message: aiResponse,
        conversationId: data.candidates[0]?.content?.parts?.[0]?.text ? "conversation-id" : undefined
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

