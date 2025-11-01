import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CreateGoalInput, UpdateGoalInput, AllocateSurplusInput } from "@/types";

/**
 * GET /api/goals
 * Fetch all goals for the authenticated user
 */
export async function GET(request: NextRequest) {
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

    // Fetch goals for the user
    const { data, error } = await supabase
      .from("user_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/goals
 * Create a new goal for the authenticated user
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
    const body: CreateGoalInput = await request.json();
    
    // Validate input
    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json(
        { error: "Goal name is required" },
        { status: 400 }
      );
    }

    if (typeof body.target_amount !== "number" || body.target_amount <= 0) {
      return NextResponse.json(
        { error: "Target amount must be a positive number" },
        { status: 400 }
      );
    }

    // Create goal
    const { data, error } = await supabase
      .from("user_goals")
      .insert({
        user_id: user.id,
        name: body.name.trim(),
        description: body.description?.trim() || null,
        target_amount: body.target_amount,
        current_amount: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/goals
 * Update an existing goal
 */
export async function PUT(request: NextRequest) {
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
    const body: UpdateGoalInput & { id: string } = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Partial<UpdateGoalInput> = {};
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim() === "") {
        return NextResponse.json(
          { error: "Goal name must be a non-empty string" },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }
    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null;
    }
    if (body.target_amount !== undefined) {
      if (typeof body.target_amount !== "number" || body.target_amount <= 0) {
        return NextResponse.json(
          { error: "Target amount must be a positive number" },
          { status: 400 }
        );
      }
      updateData.target_amount = body.target_amount;
    }
    if (body.current_amount !== undefined) {
      if (typeof body.current_amount !== "number" || body.current_amount < 0) {
        return NextResponse.json(
          { error: "Current amount must be a non-negative number" },
          { status: 400 }
        );
      }
      updateData.current_amount = body.current_amount;
    }

    // Update goal (ensuring user owns it)
    const { data, error } = await supabase
      .from("user_goals")
      .update(updateData)
      .eq("id", body.id)
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
        { error: "Goal not found or you don't have permission to update it" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/goals
 * Delete a goal for the authenticated user
 */
export async function DELETE(request: NextRequest) {
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

    // Get goal ID from query params
    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get("id");

    if (!goalId) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 }
      );
    }

    // Delete goal (ensuring user owns it)
    const { error } = await supabase
      .from("user_goals")
      .delete()
      .eq("id", goalId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

