"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { createCategory } from "@/services/categories";
import { createGoal } from "@/services/goals";
import { toast } from "sonner";
import type { CreateCategoryInput } from "@/types";
import type { CreateGoalInput } from "@/types";

interface Question {
  id: number;
  question: string;
  options: string[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is your current financial goal?",
    options: [
      "Build an emergency fund",
      "Pay off debt",
      "Save for retirement",
      "Buy a house",
    ],
  },
  {
    id: 2,
    question: "How much do you have saved currently?",
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
    options: [
      "No debt",
      "Less than $5,000",
      "$5,000 - $20,000",
      "More than $20,000",
    ],
  },
  {
    id: 4,
    question: "What is your monthly income range?",
    options: [
      "Less than $2,000",
      "$2,000 - $5,000",
      "$5,000 - $10,000",
      "More than $10,000",
    ],
  },
  {
    id: 5,
    question: "How comfortable are you with investing?",
    options: [
      "Very comfortable",
      "Somewhat comfortable",
      "Not very comfortable",
      "Not at all comfortable",
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

const TOTAL_STEPS = QUESTIONS.length + 2; // Questions + Categories + Goals

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState("");
  
  // Categories state
  const [categories, setCategories] = useState<CategoryForm[]>([
    { name: "", size: "" },
  ]);
  
  // Goals state
  const [goals, setGoals] = useState<GoalForm[]>([
    { name: "", description: "", target_amount: "" },
  ]);
  
  const [isLoading, setIsLoading] = useState(false);

  const isQuestionStep = currentStep < QUESTIONS.length;
  const isCategoriesStep = currentStep === QUESTIONS.length;
  const isGoalsStep = currentStep === QUESTIONS.length + 1;
  const isLastStep = currentStep === TOTAL_STEPS - 1;
  const isFirstStep = currentStep === 0;

  const question = isQuestionStep ? QUESTIONS[currentStep] : null;

  // Categories validation
  const areCategoriesValid = categories.every(
    (cat) => cat.name.trim() !== "" && cat.size.trim() !== "" && parseFloat(cat.size) > 0
  );

  // Goals validation
  const areGoalsValid = goals.every(
    (goal) => goal.name.trim() !== "" && goal.target_amount.trim() !== "" && parseFloat(goal.target_amount) > 0
  );

  const canProceed = isQuestionStep
    ? selectedAnswer !== ""
    : isCategoriesStep
    ? areCategoriesValid
    : isGoalsStep
    ? areGoalsValid
    : false;

  const handleNext = async () => {
    if (!canProceed) return;

    if (isQuestionStep && question) {
      // Save answer for question
      setAnswers((prev) => ({
        ...prev,
        [question.id]: selectedAnswer,
      }));

      // Move to next step
      setCurrentStep((prev) => prev + 1);
      if (currentStep + 1 < QUESTIONS.length) {
        const nextQuestionId = QUESTIONS[currentStep + 1].id;
        setSelectedAnswer(answers[nextQuestionId] || "");
      }
    } else if (isCategoriesStep) {
      // Move to goals step
      setCurrentStep((prev) => prev + 1);
    } else if (isGoalsStep) {
      // Complete onboarding
      await handleComplete();
    }
  };

  const handlePrevious = () => {
    if (isFirstStep) return;

    if (isCategoriesStep || isGoalsStep) {
      // Move back one step
      setCurrentStep((prev) => prev - 1);
    } else if (isQuestionStep && question) {
      // Save current answer
      if (selectedAnswer) {
        setAnswers((prev) => ({
          ...prev,
          [question.id]: selectedAnswer,
        }));
      }

      // Move to previous question
      setCurrentStep((prev) => prev - 1);
      const prevQuestionId = QUESTIONS[currentStep - 1].id;
      setSelectedAnswer(answers[prevQuestionId] || "");
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
      // Save final question answer
      if (question && selectedAnswer) {
        setAnswers((prev) => ({
          ...prev,
          [question.id]: selectedAnswer,
        }));
      }

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
      const finalAnswers = {
        ...answers,
      };

      localStorage.setItem("onboardingComplete", "true");
      localStorage.setItem("onboardingAnswers", JSON.stringify(finalAnswers));

      toast.success("Onboarding completed successfully!");
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to complete onboarding. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
  }, [currentStep, answers, isQuestionStep, question]);

  const renderStepContent = () => {
    if (isQuestionStep && question) {
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center">
            {question.question}
          </h2>

          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            className="space-y-3"
          >
            {question.options.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors"
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer text-base font-normal"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );
    }

    if (isCategoriesStep) {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-center">
              Set Up Your Budget Categories
            </h2>
            <p className="text-sm text-muted-foreground text-center">
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
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-center">
              Set Up Your Financial Goals
            </h2>
            <p className="text-sm text-muted-foreground text-center">
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

    return null;
  };

  const getStepTitle = () => {
    if (isQuestionStep) {
      return `Question ${currentStep + 1} of ${QUESTIONS.length}`;
    }
    if (isCategoriesStep) {
      return `Step ${currentStep + 1} of ${TOTAL_STEPS}: Categories`;
    }
    if (isGoalsStep) {
      return `Step ${currentStep + 1} of ${TOTAL_STEPS}: Goals`;
    }
    return `Step ${currentStep + 1} of ${TOTAL_STEPS}`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl shadow-xl my-auto max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="flex gap-2">
              {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? "w-8 bg-primary"
                      : index < currentStep
                      ? "w-2 bg-primary/50"
                      : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
          <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
          <CardDescription className="text-base">
            {isQuestionStep
              ? "Help us personalize your experience"
              : isCategoriesStep
              ? "Define your spending categories"
              : "Set your financial goals"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStepContent()}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep || isLoading}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed || isLoading}
              className="gap-2"
            >
              {isLastStep ? (
                isLoading ? (
                  "Saving..."
                ) : (
                  "Complete"
                )
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

