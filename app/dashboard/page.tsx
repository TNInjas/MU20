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
import type { UserCategory } from "@/types";
import { createClient } from "@/lib/supabase/client";

// Mock goals data - replace with real data
const MOCK_GOALS = [
  { id: 1, title: "Emergency Fund", target: 10000, current: 3500 },
  { id: 2, title: "Vacation", target: 5000, current: 2000 },
  { id: 3, title: "New Car", target: 25000, current: 8500 },
];

export default function DashboardPage() {
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);
  const [totalFunds] = useState(12500); // Mock total funds
  const [goals] = useState(MOCK_GOALS);
  const [categories, setCategories] = useState<UserCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  
  // Form state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySize, setNewCategorySize] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);

  // Load user and categories on mount
  useEffect(() => {
    loadUserAndCategories();
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
              <CardContent>
                <div className="space-y-4">
                  {goals.map((goal) => {
                    const progress = (goal.current / goal.target) * 100;
                    return (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{goal.title}</span>
                          <span className="text-sm text-muted-foreground">
                            ${goal.current.toLocaleString()} / $
                            {goal.target.toLocaleString()}
                          </span>
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
                {/* Error Message */}
                {error && (
                  <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {/* Add Category Form */}
                <div className="space-y-3 rounded-lg border p-3">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input
                      id="category-name"
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
                    <Label htmlFor="category-size">Fund Size ($)</Label>
                    <Input
                      id="category-size"
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
                  <Button 
                    onClick={handleAddCategory} 
                    disabled={isAdding || !newCategoryName.trim() || !newCategorySize}
                    className="w-full"
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
                </div>

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
    </div>
  );
}
