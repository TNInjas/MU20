"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, ArrowLeft, Plus, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { createCategory } from "@/services/categories";
import { createGoal } from "@/services/goals";
import { signInWithEmail, signInWithGoogle, TOAST_MESSAGES } from "@/services/auth";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { CreateCategoryInput } from "@/types";
import type { CreateGoalInput } from "@/types";

interface Question {
  id: number;
  question: string;
  description?: string;
  options: string[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is your main financial goal?",
    description: "This helps us personalize your experience",
    options: [
      "Build an emergency fund",
      "Pay off debt",
      "Save for retirement",
      "Buy a house",
      "Save for a specific purchase",
    ],
  },
  {
    id: 2,
    question: "How much do you have saved currently?",
    description: "Be honest - we're here to help you grow",
    options: [
      "Less than $1,000",
      "$1,000 - $5,000",
      "$5,000 - $10,000",
      "More than $10,000",
    ],
  },
  {
    id: 3,
    question: "Do you have any outstanding debt?",
    description: "Understanding your debt helps us guide you better",
    options: [
      "No debt",
      "Less than $5,000",
      "$5,000 - $20,000",
      "More than $20,000",
    ],
  },
];

interface CategoryForm {
  name: string;
  size: string;
}

interface GoalForm {
  name: string;
  description: string;
  target_amount: string;
}

// Step definitions
enum StepType {
  WELCOME = "welcome",
  QUESTION = "question",
  CATEGORIES = "categories",
  GOALS = "goals",
  COMPLETE = "complete",
}

interface Step {
  type: StepType;
  id: number;
}

const STEPS: Step[] = [
  { type: StepType.WELCOME, id: 0 },
  ...QUESTIONS.map((_, index) => ({ type: StepType.QUESTION, id: index + 1 })),
  { type: StepType.CATEGORIES, id: QUESTIONS.length + 1 },
  { type: StepType.GOALS, id: QUESTIONS.length + 2 },
  { type: StepType.COMPLETE, id: QUESTIONS.length + 3 },
];

const TOTAL_STEPS = STEPS.length;

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState("");
  
  // Signup state
  const [email, setEmail] = useState("");
  const [signupLoading, setSignupLoading] = useState<"email" | "google" | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Categories state
  const [categories, setCategories] = useState<CategoryForm[]>([
    { name: "", size: "" },
  ]);
  
  // Goals state
  const [goals, setGoals] = useState<GoalForm[]>([
    { name: "", description: "", target_amount: "" },
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<"forward" | "backward">("forward");

  const currentStep = STEPS[currentStepIndex];
  const isWelcomeStep = currentStep.type === StepType.WELCOME;
  const isQuestionStep = currentStep.type === StepType.QUESTION;
  const isCategoriesStep = currentStep.type === StepType.CATEGORIES;
  const isGoalsStep = currentStep.type === StepType.GOALS;
  const isCompleteStep = currentStep.type === StepType.COMPLETE;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOTAL_STEPS - 1;

  const question = isQuestionStep
    ? QUESTIONS[currentStep.id - 1]
    : null;

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // If authenticated and on welcome step, skip to first question
  useEffect(() => {
    if (isAuthenticated && isWelcomeStep) {
      setCurrentStepIndex(1);
    }
  }, [isAuthenticated, isWelcomeStep]);

  // Categories validation
  const areCategoriesValid = categories.every(
    (cat) => cat.name.trim() !== "" && cat.size.trim() !== "" && parseFloat(cat.size) > 0
  );

  // Goals validation
  const areGoalsValid = goals.every(
    (goal) => goal.name.trim() !== "" && goal.target_amount.trim() !== "" && parseFloat(goal.target_amount) > 0
  );

  const canProceed = isWelcomeStep
    ? isAuthenticated
    : isQuestionStep
    ? selectedAnswer !== ""
    : isCategoriesStep
    ? areCategoriesValid
    : isGoalsStep
    ? areGoalsValid
    : false;

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading("email");

    try {
      const { error } = await signInWithEmail(email);

      if (error) throw error;

      toast.success(TOAST_MESSAGES.MAGIC_LINK.title, {
        description: TOAST_MESSAGES.MAGIC_LINK.description,
      });

      // Move to next step after email is sent
      setTimeout(() => {
        setCurrentStepIndex(1);
        setTransitionDirection("forward");
      }, 500);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast.error(TOAST_MESSAGES.ERROR.title, {
        description: errorMsg || TOAST_MESSAGES.ERROR.description,
      });
    } finally {
      setSignupLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setSignupLoading("google");

    try {
      sessionStorage.setItem('postLoginRedirect', '/onboarding');
      const { error } = await signInWithGoogle();

      if (error) throw error;

      toast.info("Redirecting to Google", {
        description: "You'll be redirected to sign in with your Google account.",
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast.error(TOAST_MESSAGES.ERROR.title, {
        description: errorMsg || TOAST_MESSAGES.ERROR.description,
      });
      setSignupLoading(null);
    }
  };

  const handleNext = async () => {
    if (!canProceed) return;

    if (isQuestionStep && question) {
      // Save answer for question
      setAnswers((prev) => ({
        ...prev,
        [question.id]: selectedAnswer,
      }));

      // Move to next step
      setTransitionDirection("forward");
      setCurrentStepIndex((prev) => prev + 1);
      
      // Load next question's answer if exists
      if (currentStepIndex + 1 < TOTAL_STEPS) {
        const nextStep = STEPS[currentStepIndex + 1];
        if (nextStep.type === StepType.QUESTION) {
          const nextQuestion = QUESTIONS[nextStep.id - 1];
          setSelectedAnswer(answers[nextQuestion.id] || "");
        }
      }
    } else if (isCategoriesStep) {
      // Move to goals step
      setTransitionDirection("forward");
      setCurrentStepIndex((prev) => prev + 1);
    } else if (isGoalsStep) {
      // Complete onboarding
      await handleComplete();
    }
  };

  const handlePrevious = () => {
    if (isFirstStep) return;

    setTransitionDirection("backward");

    if (isQuestionStep && question) {
      // Save current answer
      if (selectedAnswer) {
        setAnswers((prev) => ({
          ...prev,
          [question.id]: selectedAnswer,
        }));
      }

      // Move to previous step
      setCurrentStepIndex((prev) => prev - 1);
      const prevStep = STEPS[currentStepIndex - 1];
      
      if (prevStep.type === StepType.QUESTION) {
        const prevQuestion = QUESTIONS[prevStep.id - 1];
        setSelectedAnswer(answers[prevQuestion.id] || "");
      }
    } else if (isCategoriesStep || isGoalsStep) {
      // Move back one step
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleAddCategory = () => {
    setCategories([...categories, { name: "", size: "" }]);
  };

  const handleRemoveCategory = (index: number) => {
    if (categories.length > 1) {
      setCategories(categories.filter((_, i) => i !== index));
    }
  };

  const handleCategoryChange = (index: number, field: keyof CategoryForm, value: string) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };
    setCategories(updated);
  };

  const handleAddGoal = () => {
    setGoals([...goals, { name: "", description: "", target_amount: "" }]);
  };

  const handleRemoveGoal = (index: number) => {
    if (goals.length > 1) {
      setGoals(goals.filter((_, i) => i !== index));
    }
  };

  const handleGoalChange = (index: number, field: keyof GoalForm, value: string) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: value };
    setGoals(updated);
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Create categories
      const validCategories = categories.filter(
        (cat) => cat.name.trim() !== "" && cat.size.trim() !== "" && parseFloat(cat.size) > 0
      );

      for (const category of validCategories) {
        try {
          await createCategory({
            name: category.name.trim(),
            size: parseFloat(category.size),
          });
        } catch (error) {
          console.error("Error creating category:", error);
          toast.error("Failed to create category: " + category.name);
        }
      }

      // Create goals
      const validGoals = goals.filter(
        (goal) => goal.name.trim() !== "" && goal.target_amount.trim() !== "" && parseFloat(goal.target_amount) > 0
      );

      for (const goal of validGoals) {
        try {
          await createGoal({
            name: goal.name.trim(),
            description: goal.description.trim() || undefined,
            target_amount: parseFloat(goal.target_amount),
          });
        } catch (error) {
          console.error("Error creating goal:", error);
          toast.error("Failed to create goal: " + goal.name);
        }
      }

      // Save onboarding answers
      localStorage.setItem("onboardingComplete", "true");
      localStorage.setItem("onboardingAnswers", JSON.stringify(answers));

      toast.success("Onboarding completed successfully!");
      
      // Move to complete step
      setTransitionDirection("forward");
      setCurrentStepIndex((prev) => prev + 1);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to complete onboarding. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToDashboard = () => {
    router.push("/dashboard");
  };

  // Load saved answer when question changes
  useEffect(() => {
    if (isQuestionStep && question) {
      const savedAnswer = answers[question.id];
      if (savedAnswer) {
        setSelectedAnswer(savedAnswer);
      } else {
        setSelectedAnswer("");
      }
    }
  }, [currentStepIndex, answers, isQuestionStep, question]);

  const renderStepContent = () => {
    if (isWelcomeStep) {
      return (
        <div className="space-y-8 max-w-md mx-auto">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Welcome to Lumos
            </h2>
            <p className="text-lg text-muted-foreground">
              Let's set up your financial journey. This will only take a few minutes.
            </p>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                  disabled={!!signupLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!!signupLoading}
            >
              {signupLoading === "email" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" /> Continue with Email
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            size="lg"
            onClick={handleGoogleSignIn}
            disabled={!!signupLoading}
          >
            {signupLoading === "google" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Continue with Google
              </>
            )}
          </Button>
        </div>
      );
    }

    if (isQuestionStep && question) {
      return (
        <div className="space-y-8 max-w-2xl mx-auto">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">
              {question.question}
            </h2>
            {question.description && (
              <p className="text-muted-foreground">
                {question.description}
              </p>
            )}
          </div>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  const questionId = question.id;
                  setSelectedAnswer(option);
                  
                  // Save answer immediately
                  setAnswers((prev) => ({
                    ...prev,
                    [questionId]: option,
                  }));
                  
                  // Auto-advance after selection (useEffect will handle loading next question)
                  setTimeout(() => {
                    if (currentStepIndex < TOTAL_STEPS - 1) {
                      setTransitionDirection("forward");
                      setCurrentStepIndex((prev) => prev + 1);
                    }
                  }, 300);
                }}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 hover:border-primary hover:bg-primary/5 ${
                  selectedAnswer === option
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background"
                }`}
              >
                <span className="text-base font-medium">{option}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (isCategoriesStep) {
      return (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Set Up Your Budget Categories
            </h2>
            <p className="text-muted-foreground">
              Define spending categories and their monthly budgets
            </p>
          </div>

          <div className="space-y-4">
            {categories.map((category, index) => (
              <div key={index} className="flex gap-3 items-end">
                <div className="flex-1">
                  <Label htmlFor={`category-name-${index}`} className="mb-2">
                    Category Name
                  </Label>
                  <Input
                    id={`category-name-${index}`}
                    placeholder="e.g., Groceries, Rent, Entertainment"
                    value={category.name}
                    onChange={(e) =>
                      handleCategoryChange(index, "name", e.target.value)
                    }
                  />
                </div>
                <div className="w-32">
                  <Label htmlFor={`category-size-${index}`} className="mb-2">
                    Monthly Budget ($)
                  </Label>
                  <Input
                    id={`category-size-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={category.size}
                    onChange={(e) =>
                      handleCategoryChange(index, "size", e.target.value)
                    }
                  />
                </div>
                {categories.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveCategory(index)}
                    className="mb-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={handleAddCategory}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Another Category
          </Button>
        </div>
      );
    }

    if (isGoalsStep) {
      return (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Set Up Your Financial Goals
            </h2>
            <p className="text-muted-foreground">
              Define your savings goals and target amounts
            </p>
          </div>

          <div className="space-y-4">
            {goals.map((goal, index) => (
              <div key={index} className="space-y-3 p-4 border rounded-lg">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Label htmlFor={`goal-name-${index}`} className="mb-2">
                      Goal Name
                    </Label>
                    <Input
                      id={`goal-name-${index}`}
                      placeholder="e.g., Emergency Fund, New Car, House Down Payment"
                      value={goal.name}
                      onChange={(e) =>
                        handleGoalChange(index, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="w-40">
                    <Label htmlFor={`goal-amount-${index}`} className="mb-2">
                      Target Amount ($)
                    </Label>
                    <Input
                      id={`goal-amount-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={goal.target_amount}
                      onChange={(e) =>
                        handleGoalChange(index, "target_amount", e.target.value)
                      }
                    />
                  </div>
                  {goals.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveGoal(index)}
                      className="mb-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <Label htmlFor={`goal-description-${index}`} className="mb-2">
                    Description (Optional)
                  </Label>
                  <Input
                    id={`goal-description-${index}`}
                    placeholder="Add a description for this goal..."
                    value={goal.description}
                    onChange={(e) =>
                      handleGoalChange(index, "description", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={handleAddGoal}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Another Goal
          </Button>
        </div>
      );
    }

    if (isCompleteStep) {
      return (
        <div className="space-y-8 max-w-md mx-auto text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">
              You're all set! 🎉
            </h2>
            <p className="text-lg text-muted-foreground">
              Your financial journey is ready to begin. Let's start tracking your progress.
            </p>
          </div>
          <Button
            onClick={handleContinueToDashboard}
            size="lg"
            className="w-full"
          >
            Continue to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    }

    return null;
  };

  // Calculate progress percentage
  const progress = ((currentStepIndex + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-muted">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div
          className={`w-full max-w-4xl transition-all duration-300 ${
            transitionDirection === "forward"
              ? "animate-in fade-in slide-in-from-right-4"
              : "animate-in fade-in slide-in-from-left-4"
          }`}
        >
          {/* Step Content */}
          <div className="min-h-[400px] flex items-center justify-center">
            {renderStepContent()}
          </div>

          {/* Navigation Controls */}
          {!isWelcomeStep && !isCompleteStep && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstStep || isLoading}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <span className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {TOTAL_STEPS}
              </span>

              <Button
                onClick={handleNext}
                disabled={!canProceed || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {isGoalsStep ? "Complete" : "Next"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
