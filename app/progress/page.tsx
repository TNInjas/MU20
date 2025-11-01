"use client";

import { useState, useEffect } from "react";
import { BABY_STEPS } from "@/lib/constants/steps";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Check,
  Lock,
  Trophy,
  Coins,
  PiggyBank,
  TrendingUp,
  GraduationCap,
  Home,
  Sparkles,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserTransactions, getTransactionSummary } from "@/services/transactions";
import type { UserTransaction } from "@/types";

// Mock data - replace with real data from your backend/state management
const MOCK_DATA = {
  currentStep: 2.3, // Current active step (can be between steps, e.g., 2.3 means between step 2 and 3)
  completedSteps: [1], // Steps that are completed
};

// Step icons for better visuals
const STEP_ICONS = [
  { icon: PiggyBank, color: "text-yellow-600" },
  { icon: Coins, color: "text-orange-600" },
  { icon: TrendingUp, color: "text-green-600" },
  { icon: TrendingUp, color: "text-blue-600" },
  { icon: GraduationCap, color: "text-indigo-600" },
  { icon: Home, color: "text-red-600" },
  { icon: Trophy, color: "text-purple-600" },
];

// Helper to get next step criteria
const getNextStepCriteria = (stepNumber: number): string => {
  const step = BABY_STEPS.find((s) => s.number === stepNumber);
  if (!step) return "";

  // Extract criteria based on step number
  switch (stepNumber) {
    case 1:
      return "Have $1,000 saved in emergency fund";
    case 2:
      return "All non-mortgage debt paid off";
    case 3:
      return "3-6 months of expenses saved";
    case 4:
      return "Investing 15% of income in retirement";
    case 5:
      return "College fund established and contributing";
    case 6:
      return "Mortgage paid off completely";
    case 7:
      return "All previous steps completed";
    default:
      return "";
  }
};

// Helper to format tooltip content
const getTooltipContent = (stepNumber: number) => {
  const step = BABY_STEPS.find((s) => s.number === stepNumber);
  const nextStep = BABY_STEPS.find((s) => s.number === stepNumber + 1);

  if (!step) return null;

  return {
    title: step.title,
    description: step.description,
    whyItMatters: step.whyItMatters,
    nextStepCriteria: nextStep
      ? `Next: ${getNextStepCriteria(stepNumber + 1)}`
      : "Final step completed",
  };
};

// User avatar component for showing position on the dotted line
function UserAvatar({
  position,
  isVisible,
}: {
  position: number; // position as percentage (0-100)
  isVisible: boolean;
}) {
  if (!isVisible) return null;

  return (
    <div
      className="absolute left-8 -translate-x-1/2 z-30 transition-all duration-500"
      style={{ top: `${position}%`, transform: "translate(-50%, -50%)" }}
    >
      <div className="relative">
        <div className="rounded-full bg-gradient-to-br from-blue-500 to-blue-700 p-2.5 shadow-xl border-2 border-blue-300">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-6 w-6 text-white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="9" r="3" fill="currentColor" />
            <path
              d="M12 13 C9 13 5 14.5 5 19 L19 19 C19 14.5 15 13 12 13 Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1.5 w-8 bg-black/20 rounded-full blur-sm" />
      </div>
    </div>
  );
}

// Cashflow Ledger Component
function CashflowLedger() {
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [inflow, setInflow] = useState<UserTransaction[]>([]);
  const [outflow, setOutflow] = useState<UserTransaction[]>([]);
  const [summary, setSummary] = useState<{
    totalInflow: number;
    totalOutflow: number;
    net: number;
    transactionCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "inflow" | "outflow">("all");

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const allTransactions = await getUserTransactions();
      const allInflow = await getUserTransactions("inflow");
      const allOutflow = await getUserTransactions("outflow");
      const summaryData = await getTransactionSummary();

      setTransactions(allTransactions);
      setInflow(allInflow);
      setOutflow(allOutflow);
      setSummary(summaryData);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const displayTransactions =
    filter === "inflow"
      ? inflow
      : filter === "outflow"
      ? outflow
      : transactions;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Cashflow Ledger</span>
          <div className="flex gap-2">
            <Badge
              variant={filter === "all" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter("all")}
            >
              All
            </Badge>
            <Badge
              variant={filter === "inflow" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter("inflow")}
            >
              <ArrowUpCircle className="h-3 w-3 mr-1" />
              Inflow
            </Badge>
            <Badge
              variant={filter === "outflow" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter("outflow")}
            >
              <ArrowDownCircle className="h-3 w-3 mr-1" />
              Outflow
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Your recent transactions filtered by {filter}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : displayTransactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No transactions found.
          </p>
        ) : (
          <div className="space-y-4">
            {summary && (
              <div className="grid grid-cols-3 gap-4 pb-4 border-b">
                <div>
                  <p className="text-xs text-muted-foreground">Total Inflow</p>
                  <p className="text-lg font-semibold text-green-600">
                    ${summary.totalInflow.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Outflow</p>
                  <p className="text-lg font-semibold text-red-600">
                    ${summary.totalOutflow.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Net</p>
                  <p
                    className={cn(
                      "text-lg font-semibold",
                      summary.net >= 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    ${summary.net.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            )}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayTransactions.slice(0, 10).map((transaction, index) => (
                    <TableRow key={`${transaction.user_id}-${transaction.timestamp}-${index}`}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{formatDate(transaction.timestamp)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(transaction.timestamp)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{transaction.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            "font-semibold",
                            transaction.amount >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                        >
                          {transaction.amount >= 0 ? "+" : ""}
                          ${Math.abs(transaction.amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {displayTransactions.length > 10 && (
              <p className="text-xs text-center text-muted-foreground">
                Showing 10 of {displayTransactions.length} transactions
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProgressPage() {
  const { currentStep, completedSteps } = MOCK_DATA;

  // Determine node status
  const getNodeStatus = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) {
      return "completed";
    }
    const stepFloor = Math.floor(currentStep);
    if (stepNumber === stepFloor) {
      return "active";
    }
    if (stepNumber < stepFloor) {
      return "completed"; // Past steps are completed
    }
    return "locked";
  };

  // Calculate user position on the vertical line
  const getUserPosition = () => {
    const stepCount = BABY_STEPS.length;
    const stepFloor = Math.floor(currentStep);
    const stepProgress = currentStep - stepFloor;

    if (stepProgress === 0) {
      const checkpointIndex = Math.max(0, stepFloor - 1);
      return checkpointIndex === 0 ? 0 : (checkpointIndex / (stepCount - 1)) * 100;
    } else {
      const startIndex = stepFloor - 1;
      const endIndex = stepFloor;
      const startPos = startIndex === 0 ? 0 : (startIndex / (stepCount - 1)) * 100;
      const endPos = endIndex === 0 ? 0 : (endIndex / (stepCount - 1)) * 100;
      return startPos + (endPos - startPos) * stepProgress;
    }
  };

  const userPosition = getUserPosition();
  const isUserBetweenSteps =
    currentStep % 1 !== 0 &&
    Math.floor(currentStep) > 0 &&
    Math.floor(currentStep) < BABY_STEPS.length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <TooltipProvider delayDuration={200}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left side - Progress Path */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Progress</CardTitle>
                  <CardDescription>
                    Track your journey through the 7 baby steps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative h-[600px] py-12 px-8">
                    {/* Vertical Dotted Line */}
                    <div className="absolute left-8 top-12 bottom-12 w-0.5 z-0">
                      <div className="h-full border-l-2 border-dashed border-muted" />
                    </div>

                    {/* User Avatar on the line */}
                    <UserAvatar position={userPosition} isVisible={true} />

                    {/* Steps/Checkpoints */}
                    <div className="relative w-full h-full z-10">
                      {BABY_STEPS.map((step, index) => {
                        const status = getNodeStatus(step.number);
                        const isCompleted = status === "completed";
                        const isActive = status === "active";
                        const isLocked = status === "locked";
                        const isLast = step.number === BABY_STEPS.length;
                        const tooltipContent = getTooltipContent(step.number);
                        const StepIcon = STEP_ICONS[index]?.icon || Trophy;
                        const iconColor = STEP_ICONS[index]?.color || "text-blue-600";

                        const positionPercent =
                          index === 0 ? 0 : (index / (BABY_STEPS.length - 1)) * 100;

                        return (
                          <Tooltip key={step.number}>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute left-0 right-0 flex items-center w-full"
                                style={{
                                  top: `${positionPercent}%`,
                                  transform: "translateY(-50%)",
                                }}
                              >
                                {/* Checkpoint Circle on the line */}
                                <div className="absolute left-8 -translate-x-1/2 z-20">
                                  <div
                                    className={cn(
                                      "flex h-14 w-14 items-center justify-center rounded-full border-4 shadow-lg transition-all",
                                      isCompleted &&
                                        "border-green-600 bg-gradient-to-br from-green-400 to-green-600",
                                      isActive &&
                                        "border-yellow-500 bg-gradient-to-br from-yellow-400 to-yellow-600 animate-pulse ring-4 ring-yellow-200",
                                      isLocked && "border-muted bg-muted"
                                    )}
                                  >
                                    {isCompleted && !isLast && (
                                      <Check className="h-7 w-7 text-white" />
                                    )}
                                    {isCompleted && isLast && (
                                      <Trophy className="h-7 w-7 text-yellow-300" />
                                    )}
                                    {isActive && (
                                      <StepIcon className={cn("h-7 w-7", iconColor)} />
                                    )}
                                    {isLocked && (
                                      <Lock className="h-7 w-7 text-muted-foreground" />
                                    )}
                                  </div>

                                  {/* Sparkles for completed steps */}
                                  {isCompleted && (
                                    <div className="absolute -inset-2 pointer-events-none">
                                      <div className="absolute top-0 left-0 animate-ping">
                                        <Sparkles className="h-3 w-3 text-yellow-400" />
                                      </div>
                                      <div className="absolute top-0 right-0 animate-ping delay-200">
                                        <Sparkles className="h-3 w-3 text-yellow-400" />
                                      </div>
                                      <div className="absolute bottom-0 left-0 animate-ping delay-300">
                                        <Sparkles className="h-3 w-3 text-yellow-400" />
                                      </div>
                                      <div className="absolute bottom-0 right-0 animate-ping delay-500">
                                        <Sparkles className="h-3 w-3 text-yellow-400" />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Checkpoint Card to the right */}
                                <Card
                                  className={cn(
                                    "relative ml-24 mr-auto cursor-pointer group transition-all duration-300 w-full max-w-md",
                                    isCompleted &&
                                      "border-green-500 bg-green-50 shadow-lg hover:shadow-xl",
                                    isActive &&
                                      "border-yellow-500 bg-yellow-50 shadow-xl ring-2 ring-yellow-300 ring-opacity-50",
                                    isLocked && "border-muted bg-muted opacity-60",
                                    !isLocked && "hover:scale-105"
                                  )}
                                >
                                  <div className="flex flex-col gap-2 p-4">
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant={
                                          isActive
                                            ? "default"
                                            : isCompleted
                                            ? "outline"
                                            : "secondary"
                                        }
                                        className={cn(
                                          "text-xs font-bold",
                                          isActive &&
                                            "bg-yellow-500 text-yellow-900",
                                          isCompleted &&
                                            "border-green-500 bg-green-100 text-green-800",
                                          isLocked && "opacity-60"
                                        )}
                                      >
                                        Step {step.number}
                                      </Badge>
                                      {isLast && (
                                        <Badge
                                          variant="outline"
                                          className="border-purple-500 text-purple-700 bg-purple-50 text-xs"
                                        >
                                          Financial Literacy
                                        </Badge>
                                      )}
                                    </div>
                                    <h3
                                      className={cn(
                                        "font-semibold text-sm leading-tight line-clamp-2",
                                        isActive && "text-yellow-900",
                                        isCompleted && "text-green-900",
                                        isLocked && "text-muted-foreground"
                                      )}
                                    >
                                      {step.title}
                                    </h3>
                                  </div>
                                </Card>
                              </div>
                            </TooltipTrigger>
                            {tooltipContent && (
                              <TooltipContent
                                side="right"
                                className="max-w-xs bg-popover p-4 text-popover-foreground shadow-xl border-2"
                              >
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-sm">
                                    {tooltipContent.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {tooltipContent.description}
                                  </p>
                                  <div className="pt-2 border-t border-border">
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                      <span className="font-medium">Why needed: </span>
                                      {tooltipContent.whyItMatters}
                                    </p>
                                  </div>
                                  <div className="pt-2 border-t border-border">
                                    <p className="text-xs font-medium text-primary">
                                      {tooltipContent.nextStepCriteria}
                                    </p>
                                  </div>
                                </div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right side - Cashflow Ledger */}
            <div className="lg:col-span-1">
              <CashflowLedger />
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}