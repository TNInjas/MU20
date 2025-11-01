"use client";

import { useState, useEffect } from "react";
import { TypewriterGreeting } from "@/components/dashboard/typewriter-greeting";
import { getRandomQuote } from "@/lib/constants/quotes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, DollarSign, Target, Loader2 } from "lucide-react";
import { getUserCategories, createCategory, deleteCategory } from "@/services/categories";
import { getUserGoals, createGoal, deleteGoal } from "@/services/goals";
import type { UserCategory, UserGoal } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DashboardPage() {
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);
  const [totalFunds] = useState(12500); // Mock total funds
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [categories, setCategories] = useState<UserCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  
  // Form state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySize, setNewCategorySize] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  
  // Goal form state
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState<string>("");
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  
  // Dialog state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);

  // Load user, categories, and goals on mount
  useEffect(() => {
    loadUserAndCategories();
    loadGoals();
  }, []);

  // Set quote on mount (client-side only to avoid hydration mismatch)
  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  const loadUserAndCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        setUser({
          name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
          email: authUser.email || "",
        });
      }

      // Load categories
      const userCategories = await getUserCategories();
      setCategories(userCategories);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadGoals = async () => {
    try {
      setGoalsLoading(true);
      setError(null);
      const userGoals = await getUserGoals();
      setGoals(userGoals);
    } catch (err) {
      console.error("Error loading goals:", err);
      setError(err instanceof Error ? err.message : "Failed to load goals");
    } finally {
      setGoalsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    const trimmedName = newCategoryName.trim();
    const size = parseFloat(newCategorySize);

    // Validation
    if (!trimmedName) {
      setError("Category name is required");
      return;
    }

    if (isNaN(size) || size < 0) {
      setError("Size must be a valid non-negative number");
      return;
    }

    // Check for duplicate names
    if (categories.some((cat) => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError("Category with this name already exists");
      return;
    }

    try {
      setIsAdding(true);
      setError(null);

      const newCategory = await createCategory({
        name: trimmedName,
        size: size,
      });

      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      setNewCategorySize("");
      setIsCategoryDialogOpen(false);
    } catch (err) {
      console.error("Error creating category:", err);
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveCategory = async (categoryId: string) => {
    try {
      setError(null);
      await deleteCategory(categoryId);
      setCategories(categories.filter((cat) => cat.id !== categoryId));
    } catch (err) {
      console.error("Error deleting category:", err);
      setError(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  const handleAddGoal = async () => {
    const trimmedName = newGoalName.trim();
    const target = parseFloat(newGoalTarget);

    // Validation
    if (!trimmedName) {
      setError("Goal name is required");
      return;
    }

    if (isNaN(target) || target <= 0) {
      setError("Target amount must be a valid positive number");
      return;
    }

    try {
      setIsAddingGoal(true);
      setError(null);

      const newGoal = await createGoal({
        name: trimmedName,
        description: newGoalDescription.trim() || undefined,
        target_amount: target,
      });

      setGoals([...goals, newGoal]);
      setNewGoalName("");
      setNewGoalDescription("");
      setNewGoalTarget("");
      setIsGoalDialogOpen(false);
    } catch (err) {
      console.error("Error creating goal:", err);
      setError(err instanceof Error ? err.message : "Failed to create goal");
    } finally {
      setIsAddingGoal(false);
    }
  };

  const handleCategoryDialogClose = (open: boolean) => {
    setIsCategoryDialogOpen(open);
    if (!open) {
      setNewCategoryName("");
      setNewCategorySize("");
      setError(null);
    }
  };

  const handleGoalDialogClose = (open: boolean) => {
    setIsGoalDialogOpen(open);
    if (!open) {
      setNewGoalName("");
      setNewGoalDescription("");
      setNewGoalTarget("");
      setError(null);
    }
  };

  const handleRemoveGoal = async (goalId: string) => {
    try {
      setError(null);
      await deleteGoal(goalId);
      setGoals(goals.filter((goal) => goal.id !== goalId));
    } catch (err) {
      console.error("Error deleting goal:", err);
      setError(err instanceof Error ? err.message : "Failed to delete goal");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Section with Typewriter Greeting and Quote */}
        <div className="space-y-4">
          <TypewriterGreeting userName={user?.name || "User"} />
          {quote && (
            <p className="text-lg text-muted-foreground italic">
              &quot;{quote.text}&quot; — {quote.author}
            </p>
          )}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Section */}
          <div className="space-y-6">
            {/* Total Funds Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Total Funds
                </CardTitle>
                <CardDescription>
                  Your current total available funds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  ${totalFunds.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            {/* Goals List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Goals
                </CardTitle>
                <CardDescription>
                  Track your financial goals and progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Goal Button */}
                <Button
                  onClick={() => setIsGoalDialogOpen(true)}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Goal
                </Button>

                {/* Goals List */}
                {goalsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : goals.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No goals yet. Add your first goal above!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {goals.map((goal) => {
                      const progress = goal.target_amount > 0 
                        ? (goal.current_amount / goal.target_amount) * 100 
                        : 0;
                      return (
                        <div key={goal.id} className="space-y-2 rounded-lg border p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 space-y-1">
                              <div className="font-medium">{goal.name}</div>
                              {goal.description && (
                                <div className="text-sm text-muted-foreground">
                                  {goal.description}
                                </div>
                              )}
                              <div className="text-sm text-muted-foreground">
                                ${goal.current_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / $
                                {goal.target_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveGoal(goal.id)}
                              className="h-8 w-8 flex-shrink-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {progress.toFixed(1)}% complete
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Categorical Spending */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Categorical Spending</CardTitle>
                <CardDescription>
                  Manage your spending categories and fund sizes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Category Button */}
                <Button
                  onClick={() => setIsCategoryDialogOpen(true)}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>

                {/* Categories List */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : categories.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No categories yet. Add your first category above!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{category.name}</Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Fund Size: <span className="font-medium">${category.size.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveCategory(category.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={handleCategoryDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new spending category with a fund size.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="dialog-category-name">Category Name</Label>
              <Input
                id="dialog-category-name"
                placeholder="e.g., Food, Shopping"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isAdding) {
                    handleAddCategory();
                  }
                }}
                disabled={isAdding}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-category-size">Fund Size ($)</Label>
              <Input
                id="dialog-category-size"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={newCategorySize}
                onChange={(e) => setNewCategorySize(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isAdding) {
                    handleAddCategory();
                  }
                }}
                disabled={isAdding}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCategoryDialogOpen(false)}
              disabled={isAdding}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={isAdding || !newCategoryName.trim() || !newCategorySize}
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Goal Dialog */}
      <Dialog open={isGoalDialogOpen} onOpenChange={handleGoalDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Goal</DialogTitle>
            <DialogDescription>
              Create a new financial goal with a target amount.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="dialog-goal-name">Goal Name</Label>
              <Input
                id="dialog-goal-name"
                placeholder="e.g., Emergency Fund, New Car"
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isAddingGoal && e.shiftKey === false) {
                    e.preventDefault();
                    handleAddGoal();
                  }
                }}
                disabled={isAddingGoal}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-goal-description">Description (Optional)</Label>
              <Textarea
                id="dialog-goal-description"
                placeholder="Add a description for this goal..."
                value={newGoalDescription}
                onChange={(e) => setNewGoalDescription(e.target.value)}
                disabled={isAddingGoal}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-goal-target">Target Amount ($)</Label>
              <Input
                id="dialog-goal-target"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isAddingGoal) {
                    handleAddGoal();
                  }
                }}
                disabled={isAddingGoal}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGoalDialogOpen(false)}
              disabled={isAddingGoal}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddGoal}
              disabled={isAddingGoal || !newGoalName.trim() || !newGoalTarget}
            >
              {isAddingGoal ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Goal
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
