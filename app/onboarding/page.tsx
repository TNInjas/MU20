"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft } from "lucide-react";

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

export default function OnboardingPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState("");

  const question = QUESTIONS[currentQuestion];
  const isLastQuestion = currentQuestion === QUESTIONS.length - 1;
  const isFirstQuestion = currentQuestion === 0;
  const canProceed = selectedAnswer !== "";

  const handleNext = () => {
    if (!canProceed) return;

    // Save answer
    setAnswers((prev) => ({
      ...prev,
      [question.id]: selectedAnswer,
    }));

    if (isLastQuestion) {
      // Submit all answers and redirect to dashboard
      handleComplete();
    } else {
      // Move to next question
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(answers[QUESTIONS[currentQuestion + 1].id] || "");
    }
  };

  const handlePrevious = () => {
    if (isFirstQuestion) return;

    // Save current answer
    if (selectedAnswer) {
      setAnswers((prev) => ({
        ...prev,
        [question.id]: selectedAnswer,
      }));
    }

    // Move to previous question
    setCurrentQuestion((prev) => prev - 1);
    const prevQuestionId = QUESTIONS[currentQuestion - 1].id;
    setSelectedAnswer(answers[prevQuestionId] || "");
  };

  const handleComplete = async () => {
    // Save final answer
    const finalAnswers = {
      ...answers,
      [question.id]: selectedAnswer,
    };

    // TODO: Send answers to backend
    console.log("Onboarding answers:", finalAnswers);

    // Mark onboarding as complete
    localStorage.setItem("onboardingComplete", "true");
    localStorage.setItem("onboardingAnswers", JSON.stringify(finalAnswers));

    // Redirect to dashboard
    router.push("/dashboard");
  };

  // Load saved answer when question changes
  useEffect(() => {
    const savedAnswer = answers[question.id];
    if (savedAnswer) {
      setSelectedAnswer(savedAnswer);
    } else {
      setSelectedAnswer("");
    }
  }, [currentQuestion, answers, question.id]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4 overflow-y-auto">
        <Card className="w-full max-w-2xl shadow-xl my-auto">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="flex gap-2">
              {QUESTIONS.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentQuestion
                      ? "w-8 bg-primary"
                      : index < currentQuestion
                      ? "w-2 bg-primary/50"
                      : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
          <CardTitle className="text-2xl">
            Question {currentQuestion + 1} of {QUESTIONS.length}
          </CardTitle>
          <CardDescription className="text-base">
            Help us personalize your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="gap-2"
            >
              {isLastQuestion ? "Complete" : "Next"}
              {!isLastQuestion && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

