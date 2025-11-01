import { createClient } from "@/lib/supabase/client";
import type { UserTransaction, CreateTransactionInput, UpdateTransactionInput } from "@/types";

const supabase = createClient();

/**
 * Get all transactions for the current user
 * Optionally filter by inflow/outflow
 */
export async function getUserTransactions(filter?: "inflow" | "outflow"): Promise<UserTransaction[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  let query = supabase
    .from("user_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("timestamp", { ascending: false });

  // Apply filter if provided
  if (filter === "inflow") {
    query = query.gt("amount", 0);
  } else if (filter === "outflow") {
    query = query.lt("amount", 0);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  return data || [];
}

/**
 * Get transactions for a specific date range
 */
export async function getUserTransactionsByDateRange(
  startDate: Date,
  endDate: Date,
  filter?: "inflow" | "outflow"
): Promise<UserTransaction[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  let query = supabase
    .from("user_transactions")
    .select("*")
    .eq("user_id", user.id)
    .gte("timestamp", startDate.toISOString())
    .lte("timestamp", endDate.toISOString())
    .order("timestamp", { ascending: false });

  // Apply filter if provided
  if (filter === "inflow") {
    query = query.gt("amount", 0);
  } else if (filter === "outflow") {
    query = query.lt("amount", 0);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  return data || [];
}

/**
 * Create a new transaction for the current user
 */
export async function createTransaction(input: CreateTransactionInput): Promise<UserTransaction> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  if (!input.category || input.category.trim() === "") {
    throw new Error("Category is required");
  }

  if (typeof input.amount !== "number" || input.amount === 0) {
    throw new Error("Amount must be a non-zero number");
  }

  const transactionData = {
    user_id: user.id,
    category: input.category.trim(),
    amount: input.amount,
    timestamp: input.timestamp || new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("user_transactions")
    .insert(transactionData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create transaction: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing transaction
 * Note: Since timestamp is part of the primary key, you may need to delete and recreate
 * if you want to change the timestamp
 */
export async function updateTransaction(
  user_id: string,
  timestamp: string,
  input: UpdateTransactionInput
): Promise<UserTransaction> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Ensure user owns the transaction
  if (user.id !== user_id) {
    throw new Error("You don't have permission to update this transaction");
  }

  const updateData: Partial<UpdateTransactionInput> = {};
  
  if (input.category !== undefined) {
    if (!input.category || input.category.trim() === "") {
      throw new Error("Category cannot be empty");
    }
    updateData.category = input.category.trim();
  }
  
  if (input.amount !== undefined) {
    if (typeof input.amount !== "number" || input.amount === 0) {
      throw new Error("Amount must be a non-zero number");
    }
    updateData.amount = input.amount;
  }
  
  // Note: Updating timestamp would require deleting and recreating since it's part of PK
  if (input.timestamp !== undefined && input.timestamp !== timestamp) {
    throw new Error("Cannot update timestamp. Please delete and recreate the transaction.");
  }

  const { data, error } = await supabase
    .from("user_transactions")
    .update(updateData)
    .eq("user_id", user.id) // Use authenticated user's ID for safety
    .eq("timestamp", timestamp)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update transaction: ${error.message}`);
  }

  if (!data) {
    throw new Error("Transaction not found or you don't have permission to update it");
  }

  return data;
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(user_id: string, timestamp: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Ensure user owns the transaction
  if (user.id !== user_id) {
    throw new Error("You don't have permission to delete this transaction");
  }

  const { error } = await supabase
    .from("user_transactions")
    .delete()
    .eq("user_id", user_id)
    .eq("timestamp", timestamp);

  if (error) {
    throw new Error(`Failed to delete transaction: ${error.message}`);
  }
}

/**
 * Get transaction summary (total inflow, total outflow, net)
 */
export async function getTransactionSummary(): Promise<{
  totalInflow: number;
  totalOutflow: number;
  net: number;
  transactionCount: number;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const transactions = await getUserTransactions();
  
  const totalInflow = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalOutflow = Math.abs(
    transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );
  
  const net = totalInflow - totalOutflow;

  return {
    totalInflow,
    totalOutflow,
    net,
    transactionCount: transactions.length,
  };
}
