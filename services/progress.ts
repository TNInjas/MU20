import { createClient } from "@/lib/supabase/client";
import type { UserProgress, CreateProgressInput, UpdateProgressInput } from "@/types";

const supabase = createClient();

/**
 * Get the current user's progress
 */
export async function getUserProgress(): Promise<UserProgress | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch progress: ${error.message}`);
  }

  return data || null;
}

/**
 * Create a new progress entry for the current user
 */
export async function createProgress(input: CreateProgressInput): Promise<UserProgress> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("user_progress")
    .insert({
      user_id: user.id,
      current_step: input.current_step,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create progress: ${error.message}`);
  }

  return data;
}

/**
 * Update the user's progress
 */
export async function updateProgress(input: UpdateProgressInput): Promise<UserProgress> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  // First, check if progress exists for this user
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
        current_step: input.current_step,
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
        current_step: input.current_step,
      })
      .select()
      .single();
    
    data = result.data;
    error = result.error;
  }

  if (error) {
    throw new Error(`Failed to update progress: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to update progress: No data returned");
  }

  return data;
}


