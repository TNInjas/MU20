import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CreateProgressInput, UpdateProgressInput } from "@/types";

/**
 * GET /api/progress
 * Fetch the current user's progress
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

    // Fetch progress for the user
    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || null }, { status: 200 });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/progress
 * Create a new progress entry for the authenticated user
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
    const body: CreateProgressInput = await request.json();
    
    // Validate input
    if (typeof body.current_step !== "number" || body.current_step < 1) {
      return NextResponse.json(
        { error: "current_step must be a number greater than or equal to 1" },
        { status: 400 }
      );
    }

    // Check if progress already exists for this user
    const { data: existingProgress } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingProgress) {
      return NextResponse.json(
        { error: "Progress already exists for this user. Use PUT to update." },
        { status: 409 }
      );
    }

    // Create progress
    const { data, error } = await supabase
      .from("user_progress")
      .insert({
        user_id: user.id,
        current_step: body.current_step,
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
    console.error("Error creating progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/progress
 * Update the user's progress (creates if doesn't exist)
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
    const body: UpdateProgressInput = await request.json();
    
    // Validate input
    if (typeof body.current_step !== "number" || body.current_step < 1) {
      return NextResponse.json(
        { error: "current_step must be a number greater than or equal to 1" },
        { status: 400 }
      );
    }

    // Check if progress exists for this user
    const { data: existingProgress } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    let data;
    let error;

    if (existingProgress) {
      // Update existing progress
      const result = await supabase
        .from("user_progress")
        .update({
          current_step: body.current_step,
        })
        .eq("user_id", user.id)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    } else {
      // Create new progress if it doesn't exist
      const result = await supabase
        .from("user_progress")
        .insert({
          user_id: user.id,
          current_step: body.current_step,
        })
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Failed to update progress: No data returned" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


