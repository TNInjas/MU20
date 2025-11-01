import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CreateInvestmentInput, UpdateInvestmentInput } from "@/types";

/**
 * GET /api/investments
 * Fetch all investments for the authenticated user
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

    // Fetch investments for the user
    const { data, error } = await supabase
      .from("user_investments")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching investments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/investments
 * Create a new investment for a goal
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
    const body: CreateInvestmentInput = await request.json();
    
    // Validate input
    if (!body.goal_id) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 }
      );
    }

    if (typeof body.percentage_debt !== "number" || body.percentage_debt < 0 || body.percentage_debt > 100) {
      return NextResponse.json(
        { error: "Percentage debt must be a number between 0 and 100" },
        { status: 400 }
      );
    }

    if (typeof body.percentage_equity !== "number" || body.percentage_equity < 0 || body.percentage_equity > 100) {
      return NextResponse.json(
        { error: "Percentage equity must be a number between 0 and 100" },
        { status: 400 }
      );
    }

    // Ensure percentages sum to 100
    const sum = body.percentage_debt + body.percentage_equity;
    if (Math.abs(sum - 100) > 0.01) {
      return NextResponse.json(
        { error: "Percentage debt and equity must sum to 100" },
        { status: 400 }
      );
    }

    // Verify the goal exists and belongs to the user
    const { data: goal, error: goalError } = await supabase
      .from("user_goals")
      .select("*")
      .eq("id", body.goal_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (goalError) {
      return NextResponse.json(
        { error: `Failed to verify goal: ${goalError.message}` },
        { status: 500 }
      );
    }

    if (!goal) {
      return NextResponse.json(
        { error: "Goal not found or you don't have permission to create investment for it" },
        { status: 404 }
      );
    }

    // Create investment
    const { data, error } = await supabase
      .from("user_investments")
      .insert({
        user_id: user.id,
        goal_id: body.goal_id,
        percentage_debt: body.percentage_debt,
        percentage_equity: body.percentage_equity,
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
    console.error("Error creating investment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/investments
 * Update an existing investment
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
    const body: UpdateInvestmentInput & { id: string } = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: "Investment ID is required" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Partial<UpdateInvestmentInput> = {};
    
    if (body.percentage_debt !== undefined) {
      if (typeof body.percentage_debt !== "number" || body.percentage_debt < 0 || body.percentage_debt > 100) {
        return NextResponse.json(
          { error: "Percentage debt must be a number between 0 and 100" },
          { status: 400 }
        );
      }
      updateData.percentage_debt = body.percentage_debt;
    }
    
    if (body.percentage_equity !== undefined) {
      if (typeof body.percentage_equity !== "number" || body.percentage_equity < 0 || body.percentage_equity > 100) {
        return NextResponse.json(
          { error: "Percentage equity must be a number between 0 and 100" },
          { status: 400 }
        );
      }
      updateData.percentage_equity = body.percentage_equity;
    }

    // If both are provided, ensure they sum to 100
    if (body.percentage_debt !== undefined && body.percentage_equity !== undefined) {
      const sum = body.percentage_debt + body.percentage_equity;
      if (Math.abs(sum - 100) > 0.01) {
        return NextResponse.json(
          { error: "Percentage debt and equity must sum to 100" },
          { status: 400 }
        );
      }
    } else if (body.percentage_debt !== undefined || body.percentage_equity !== undefined) {
      // If only one is provided, fetch the current investment and calculate the other
      const { data: currentInvestment, error: fetchError } = await supabase
        .from("user_investments")
        .select("*")
        .eq("id", body.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        return NextResponse.json(
          { error: `Failed to fetch investment: ${fetchError.message}` },
          { status: 500 }
        );
      }

      if (!currentInvestment) {
        return NextResponse.json(
          { error: "Investment not found or you don't have permission to update it" },
          { status: 404 }
        );
      }

      if (body.percentage_debt !== undefined) {
        updateData.percentage_equity = 100 - body.percentage_debt;
      } else {
        updateData.percentage_debt = 100 - body.percentage_equity!;
      }
    }

    // Update investment (ensuring user owns it)
    const { data, error } = await supabase
      .from("user_investments")
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
        { error: "Investment not found or you don't have permission to update it" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error updating investment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/investments
 * Delete an investment for the authenticated user
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

    // Get investment ID from query params
    const { searchParams } = new URL(request.url);
    const investmentId = searchParams.get("id");

    if (!investmentId) {
      return NextResponse.json(
        { error: "Investment ID is required" },
        { status: 400 }
      );
    }

    // Delete investment (ensuring user owns it)
    const { error } = await supabase
      .from("user_investments")
      .delete()
      .eq("id", investmentId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting investment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

