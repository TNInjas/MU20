import { createClient } from "@/lib/supabase/client";
import type { UserInvestment, CreateInvestmentInput, UpdateInvestmentInput } from "@/types";

const supabase = createClient();

/**
 * Get all investments for the current user
 */
export async function getUserInvestments(): Promise<UserInvestment[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("user_investments")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to fetch investments: ${error.message}`);
  }

  return data || [];
}

/**
 * Get investment for a specific goal
 */
export async function getInvestmentByGoalId(goalId: string): Promise<UserInvestment | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("user_investments")
    .select("*")
    .eq("goal_id", goalId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch investment: ${error.message}`);
  }

  return data || null;
}

/**
 * Create a new investment for a goal
 */
export async function createInvestment(input: CreateInvestmentInput): Promise<UserInvestment> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  if (!input.goal_id) {
    throw new Error("Goal ID is required");
  }

  if (typeof input.percentage_debt !== "number" || input.percentage_debt < 0 || input.percentage_debt > 100) {
    throw new Error("Percentage debt must be a number between 0 and 100");
  }

  if (typeof input.percentage_equity !== "number" || input.percentage_equity < 0 || input.percentage_equity > 100) {
    throw new Error("Percentage equity must be a number between 0 and 100");
  }

  // Ensure percentages sum to 100
  const sum = input.percentage_debt + input.percentage_equity;
  if (Math.abs(sum - 100) > 0.01) {
    throw new Error("Percentage debt and equity must sum to 100");
  }

  // Verify the goal exists and belongs to the user
  const { data: goal, error: goalError } = await supabase
    .from("user_goals")
    .select("*")
    .eq("id", input.goal_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (goalError) {
    throw new Error(`Failed to verify goal: ${goalError.message}`);
  }

  if (!goal) {
    throw new Error("Goal not found or you don't have permission to create investment for it");
  }

  const { data, error } = await supabase
    .from("user_investments")
    .insert({
      user_id: user.id,
      goal_id: input.goal_id,
      percentage_debt: input.percentage_debt,
      percentage_equity: input.percentage_equity,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create investment: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing investment
 */
export async function updateInvestment(
  investmentId: string,
  input: UpdateInvestmentInput
): Promise<UserInvestment> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const updateData: Partial<UpdateInvestmentInput> = {};
  
  if (input.percentage_debt !== undefined) {
    if (typeof input.percentage_debt !== "number" || input.percentage_debt < 0 || input.percentage_debt > 100) {
      throw new Error("Percentage debt must be a number between 0 and 100");
    }
    updateData.percentage_debt = input.percentage_debt;
  }
  
  if (input.percentage_equity !== undefined) {
    if (typeof input.percentage_equity !== "number" || input.percentage_equity < 0 || input.percentage_equity > 100) {
      throw new Error("Percentage equity must be a number between 0 and 100");
    }
    updateData.percentage_equity = input.percentage_equity;
  }

  // If both are provided, ensure they sum to 100
  if (input.percentage_debt !== undefined && input.percentage_equity !== undefined) {
    const sum = input.percentage_debt + input.percentage_equity;
    if (Math.abs(sum - 100) > 0.01) {
      throw new Error("Percentage debt and equity must sum to 100");
    }
  } else if (input.percentage_debt !== undefined || input.percentage_equity !== undefined) {
    // If only one is provided, fetch the current investment and calculate the other
    const { data: currentInvestment, error: fetchError } = await supabase
      .from("user_investments")
      .select("*")
      .eq("id", investmentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Failed to fetch investment: ${fetchError.message}`);
    }

    if (!currentInvestment) {
      throw new Error("Investment not found or you don't have permission to update it");
    }

    if (input.percentage_debt !== undefined) {
      updateData.percentage_equity = 100 - input.percentage_debt;
    } else {
      updateData.percentage_debt = 100 - input.percentage_equity!;
    }
  }

  const { data, error } = await supabase
    .from("user_investments")
    .update(updateData)
    .eq("id", investmentId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update investment: ${error.message}`);
  }

  if (!data) {
    throw new Error("Investment not found or you don't have permission to update it");
  }

  return data;
}

/**
 * Delete an investment
 */
export async function deleteInvestment(investmentId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("user_investments")
    .delete()
    .eq("id", investmentId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to delete investment: ${error.message}`);
  }
}

