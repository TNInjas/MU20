import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { AllocateSurplusInput } from "@/types";

/**
 * POST /api/goals/allocate
 * Allocate surplus money to a specific goal or multiple goals
 * 
 * Body:
 * - Single allocation: { goal_id: string, amount: number }
 * - Multiple allocations: { allocations: Array<{ goal_id: string, amount: number }> }
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

    // Parse request body
    const body = await request.json();
    
    // Check if it's a single allocation or multiple allocations
    if (body.allocations && Array.isArray(body.allocations)) {
      // Multiple allocations
      if (body.allocations.length === 0) {
        return NextResponse.json(
          { error: "At least one allocation is required" },
          { status: 400 }
        );
      }

      // Validate all allocations
      for (const allocation of body.allocations) {
        if (!allocation.goal_id || typeof allocation.goal_id !== "string") {
          return NextResponse.json(
            { error: "All allocations must have a valid goal_id" },
            { status: 400 }
          );
        }
        if (typeof allocation.amount !== "number" || allocation.amount <= 0) {
          return NextResponse.json(
            { error: "All allocation amounts must be positive numbers" },
            { status: 400 }
          );
        }
      }

      // Fetch all goals to verify ownership
      const goalIds = body.allocations.map((a: AllocateSurplusInput) => a.goal_id);
      const { data: goals, error: fetchError } = await supabase
        .from("user_goals")
        .select("*")
        .eq("user_id", user.id)
        .in("id", goalIds);

      if (fetchError) {
        return NextResponse.json(
          { error: fetchError.message },
          { status: 500 }
        );
      }

      if (goals.length !== goalIds.length) {
        return NextResponse.json(
          { error: "One or more goals not found or you don't have permission to update them" },
          { status: 404 }
        );
      }

      // Update each goal
      const updatedGoals = [];
      
      for (const allocation of body.allocations) {
        const goal = goals.find((g: any) => g.id === allocation.goal_id);
        if (!goal) continue;

        const newCurrentAmount = parseFloat(goal.current_amount.toString()) + allocation.amount;

        const { data, error } = await supabase
          .from("user_goals")
          .update({
            current_amount: newCurrentAmount,
          })
          .eq("id", allocation.goal_id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) {
          return NextResponse.json(
            { error: `Failed to allocate to goal ${allocation.goal_id}: ${error.message}` },
            { status: 500 }
          );
        }

        if (data) {
          updatedGoals.push(data);
        }
      }

      return NextResponse.json({ data: updatedGoals }, { status: 200 });

    } else if (body.goal_id && body.amount) {
      // Single allocation
      const allocation: AllocateSurplusInput = body;

      // Validate input
      if (!allocation.goal_id || typeof allocation.goal_id !== "string") {
        return NextResponse.json(
          { error: "Goal ID is required" },
          { status: 400 }
        );
      }

      if (typeof allocation.amount !== "number" || allocation.amount <= 0) {
        return NextResponse.json(
          { error: "Amount must be a positive number" },
          { status: 400 }
        );
      }

      // First, get the current goal to check ownership and current amount
      const { data: goal, error: fetchError } = await supabase
        .from("user_goals")
        .select("*")
        .eq("id", allocation.goal_id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        return NextResponse.json(
          { error: fetchError.message },
          { status: 500 }
        );
      }

      if (!goal) {
        return NextResponse.json(
          { error: "Goal not found or you don't have permission to update it" },
          { status: 404 }
        );
      }

      // Calculate new current amount
      const newCurrentAmount = parseFloat(goal.current_amount.toString()) + allocation.amount;

      // Update the goal with new current amount
      const { data, error } = await supabase
        .from("user_goals")
        .update({
          current_amount: newCurrentAmount,
        })
        .eq("id", allocation.goal_id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { error: "Failed to allocate surplus: No data returned" },
          { status: 500 }
        );
      }

      return NextResponse.json({ data }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Invalid request body. Provide either { goal_id, amount } or { allocations: [...] }" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error allocating surplus:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

