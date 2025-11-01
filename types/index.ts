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
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryInput {
  name: string;
  size: number;
}

export interface UpdateCategoryInput {
  name?: string;
  size?: number;
}

