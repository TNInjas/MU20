import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GEMINI_API_KEY = "AIzaSyCkb5Z7HDcuZ_kvEAIUz4L-84h6CcusU8g";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

/**
 * POST /api/investments/calculate-split
 * Calculate equity/debt split for a goal using Gemini LLM
 * Uses user questionnaire answers and goal details as context
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
    const { goal_id, user_questionnaire_answers } = body;

    if (!goal_id) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 }
      );
    }

    // Fetch goal details
    const { data: goal, error: goalError } = await supabase
      .from("user_goals")
      .select("*")
      .eq("id", goal_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (goalError || !goal) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }

    // Build context from questionnaire answers
    const questionnaireContext = user_questionnaire_answers 
      ? `User Questionnaire Answers:
${JSON.stringify(user_questionnaire_answers, null, 2)}`
      : "No questionnaire answers provided";

    // Build prompt for Gemini
    const prompt = `You are a financial advisor helping determine the optimal equity/debt split for a user's investment goal.

${questionnaireContext}

Goal Details:
- Name: ${goal.name}
- Description: ${goal.description || "No description provided"}
- Target Amount: $${goal.target_amount.toLocaleString()}

Investment Strategy Guidelines:

🟩 Equity Mutual Funds are ideal for:
- Long-term wealth creation (5-15 years)
- Retirement corpus building
- Funding higher education or house down payment (5+ years)
- Age: 20-40 years
- Risk Tolerance: Medium to High
- Time Horizon: Long-term (at least 5-10 years)

🟦 Debt Mutual Funds are ideal for:
- Short to medium-term savings (1-5 years)
- Emergency fund or contingency planning
- Regular income or capital protection
- Age: 35+ years
- Risk Tolerance: Low to Moderate
- Time Horizon: Short to medium term (6 months to 5 years)

Based on the user's questionnaire answers and goal details, determine the optimal equity/debt percentage split.

Respond with ONLY a JSON object in this exact format (no other text):
{
  "percentage_equity": <number between 0 and 100>,
  "percentage_debt": <number between 0 and 100>
}

The percentages must sum to exactly 100.`;

    // Call Gemini API
    const contents = [{
      role: "user",
      parts: [{ text: prompt }],
    }];

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 256,
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

    const aiResponse = data.candidates[0].content.parts[0].text.trim();
    
    // Try to parse JSON from the response
    let splitResult;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        splitResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", aiResponse);
      // Fallback to default split
      splitResult = {
        percentage_equity: 60,
        percentage_debt: 40,
      };
    }

    // Validate and normalize percentages
    let percentage_equity = Math.max(0, Math.min(100, parseFloat(splitResult.percentage_equity) || 60));
    let percentage_debt = Math.max(0, Math.min(100, parseFloat(splitResult.percentage_debt) || 40));

    // Ensure they sum to 100
    const sum = percentage_equity + percentage_debt;
    if (Math.abs(sum - 100) > 0.01) {
      // Normalize to sum to 100
      percentage_equity = Math.round((percentage_equity / sum) * 100);
      percentage_debt = 100 - percentage_equity;
    }

    return NextResponse.json({
      percentage_equity: Math.round(percentage_equity),
      percentage_debt: Math.round(percentage_debt),
    }, { status: 200 });
  } catch (error) {
    console.error("Error calculating investment split:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

