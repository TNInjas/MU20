/**
 * Shared TypeScript types for the application
 */

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

// Example types - adjust based on your backend API
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface DashboardData {
  // Define your dashboard data structure
  [key: string]: unknown;
}

export interface ProgressData {
  // Define your progress data structure
  [key: string]: unknown;
}

export interface SurplusData {
  // Define your surplus data structure
  [key: string]: unknown;
}

// User Category types
export interface UserCategory {
  id: string;
  user_id: string;
  name: string;
  size: number;
}

export interface CreateCategoryInput {
  name: string;
  size: number;
}

export interface UpdateCategoryInput {
  name?: string;
  size?: number;
}

// User Progress types
export interface UserProgress {
  id: string;
  user_id: string;
  current_step: number;
}

export interface CreateProgressInput {
  current_step: number;
}

export interface UpdateProgressInput {
  current_step: number;
}

// User Goal types
export interface UserGoal {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  target_amount: number;
  current_amount: number;
}

export interface CreateGoalInput {
  name: string;
  description?: string;
  target_amount: number;
}

export interface UpdateGoalInput {
  name?: string;
  description?: string;
  target_amount?: number;
  current_amount?: number;
}

export interface AllocateSurplusInput {
  goal_id: string;
  amount: number;
}

// User Transaction types
export interface UserTransaction {
  user_id: string;
  timestamp: string; // ISO timestamp string
  category: string;
  amount: number; // negative = outflow, positive = inflow
}

export interface CreateTransactionInput {
  category: string;
  amount: number;
  timestamp?: string; // Optional, defaults to NOW()
}

export interface UpdateTransactionInput {
  category?: string;
  amount?: number;
  timestamp?: string;
}

// Chat types
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

