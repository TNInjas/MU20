import { createClient } from "@/lib/supabase/client";
import type { UserCategory, CreateCategoryInput, UpdateCategoryInput } from "@/types";

const supabase = createClient();

/**
 * Get all categories for the current user
 */
export async function getUserCategories(): Promise<UserCategory[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("user_categories")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return data || [];
}

/**
 * Create a new category for the current user
 */
export async function createCategory(input: CreateCategoryInput): Promise<UserCategory> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("user_categories")
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      size: input.size,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create category: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing category
 */
export async function updateCategory(
  categoryId: string,
  input: UpdateCategoryInput
): Promise<UserCategory> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("user_categories")
    .update({
      ...(input.name && { name: input.name.trim() }),
      ...(input.size !== undefined && { size: input.size }),
    })
    .eq("id", categoryId)
    .eq("user_id", user.id) // Ensure user owns the category
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update category: ${error.message}`);
  }

  if (!data) {
    throw new Error("Category not found or you don't have permission to update it");
  }

  return data;
}

/**
 * Delete a category
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("user_categories")
    .delete()
    .eq("id", categoryId)
    .eq("user_id", user.id); // Ensure user owns the category

  if (error) {
    throw new Error(`Failed to delete category: ${error.message}`);
  }
}

