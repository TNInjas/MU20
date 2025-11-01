import { createClient } from "@/lib/supabase/client";
import type { UserGoal, CreateGoalInput, UpdateGoalInput } from "@/types";

const supabase = createClient();

/**
 * Get all goals for the current user
 */
export async function getUserGoals(): Promise<UserGoal[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("user_goals")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to fetch goals: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a specific goal by ID for the current user
 */
export async function getUserGoal(goalId: string): Promise<UserGoal | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("user_goals")
    .select("*")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch goal: ${error.message}`);
  }

  return data || null;
}

/**
 * Create a new goal for the current user
 * Automatically creates an investment with equity/debt split using Gemini LLM
 */
export async function createGoal(input: CreateGoalInput): Promise<UserGoal> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  if (!input.name || input.name.trim() === "") {
    throw new Error("Goal name is required");
  }

  if (typeof input.target_amount !== "number" || input.target_amount <= 0) {
    throw new Error("Target amount must be a positive number");
  }

  // Get questionnaire answers from localStorage if available
  let questionnaireAnswers = null;
  if (typeof window !== "undefined") {
    const savedAnswers = localStorage.getItem("onboardingAnswers");
    if (savedAnswers) {
      try {
        questionnaireAnswers = JSON.parse(savedAnswers);
      } catch (e) {
        console.error("Failed to parse questionnaire answers:", e);
      }
    }
  }

  // Call API route which handles both goal creation and investment creation
  const response = await fetch("/api/goals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...input,
      user_questionnaire_answers: questionnaireAnswers,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create goal");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Update an existing goal
 */
export async function updateGoal(
  goalId: string,
  input: UpdateGoalInput
): Promise<UserGoal> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const updateData: Partial<UpdateGoalInput> = {};
  
  if (input.name !== undefined) {
    if (!input.name || input.name.trim() === "") {
      throw new Error("Goal name cannot be empty");
    }
    updateData.name = input.name.trim();
  }
  
  if (input.description !== undefined) {
    updateData.description = input.description?.trim() || null;
  }
  
  if (input.target_amount !== undefined) {
    if (typeof input.target_amount !== "number" || input.target_amount <= 0) {
      throw new Error("Target amount must be a positive number");
    }
    updateData.target_amount = input.target_amount;
  }
  
  if (input.current_amount !== undefined) {
    if (typeof input.current_amount !== "number" || input.current_amount < 0) {
      throw new Error("Current amount must be a non-negative number");
    }
    updateData.current_amount = input.current_amount;
  }

  const { data, error } = await supabase
    .from("user_goals")
    .update(updateData)
    .eq("id", goalId)
    .eq("user_id", user.id) // Ensure user owns the goal
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update goal: ${error.message}`);
  }

  if (!data) {
    throw new Error("Goal not found or you don't have permission to update it");
  }

  return data;
}

/**
 * Delete a goal
 */
export async function deleteGoal(goalId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("user_goals")
    .delete()
    .eq("id", goalId)
    .eq("user_id", user.id); // Ensure user owns the goal

  if (error) {
    throw new Error(`Failed to delete goal: ${error.message}`);
  }
}

/**
 * Allocate surplus money to a specific goal
 * This increments the current_amount by the specified amount
 */
export async function allocateSurplusToGoal(
  goalId: string,
  amount: number
): Promise<UserGoal> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  if (typeof amount !== "number" || amount <= 0) {
    throw new Error("Amount must be a positive number");
  }

  // First, get the current goal to check ownership and current amount
  const { data: goal, error: fetchError } = await supabase
    .from("user_goals")
    .select("*")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to fetch goal: ${fetchError.message}`);
  }

  if (!goal) {
    throw new Error("Goal not found or you don't have permission to update it");
  }

  // Calculate new current amount
  const newCurrentAmount = parseFloat(goal.current_amount.toString()) + amount;

  // Update the goal with new current amount
  const { data, error } = await supabase
    .from("user_goals")
    .update({
      current_amount: newCurrentAmount,
    })
    .eq("id", goalId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to allocate surplus: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to allocate surplus: No data returned");
  }

  return data;
}

/**
 * Allocate surplus money to multiple goals at once
 * Returns the updated goals
 */
export async function allocateSurplusToMultipleGoals(
  allocations: Array<{ goal_id: string; amount: number }>
): Promise<UserGoal[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Validate all allocations
  for (const allocation of allocations) {
    if (typeof allocation.amount !== "number" || allocation.amount <= 0) {
      throw new Error(`Invalid amount for goal ${allocation.goal_id}: amount must be positive`);
    }
    if (!allocation.goal_id) {
      throw new Error("All allocations must have a valid goal_id");
    }
  }

  // Fetch all goals to verify ownership
  const goalIds = allocations.map(a => a.goal_id);
  const { data: goals, error: fetchError } = await supabase
    .from("user_goals")
    .select("*")
    .eq("user_id", user.id)
    .in("id", goalIds);

  if (fetchError) {
    throw new Error(`Failed to fetch goals: ${fetchError.message}`);
  }

  if (goals.length !== goalIds.length) {
    throw new Error("One or more goals not found or you don't have permission to update them");
  }

  // Update each goal
  const updatedGoals: UserGoal[] = [];
  
  for (const allocation of allocations) {
    const goal = goals.find(g => g.id === allocation.goal_id);
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
      throw new Error(`Failed to allocate to goal ${allocation.goal_id}: ${error.message}`);
    }

    if (data) {
      updatedGoals.push(data);
    }
  }

  return updatedGoals;
}

