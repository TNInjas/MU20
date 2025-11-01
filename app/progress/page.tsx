"use client";

import { BABY_STEPS } from "@/lib/constants/steps";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  Lock,
  Building2,
  Flag,
  Trophy,
  Coins,
  PiggyBank,
  TrendingUp,
  GraduationCap,
  Home,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data - replace with real data from your backend/state management
const MOCK_DATA = {
  currentStep: 2, // Current active step (1-indexed)
  completedSteps: [1], // Steps that are completed
};

// Step icons for better visuals
const STEP_ICONS = [
  { icon: PiggyBank, color: "text-yellow-600" },
  { icon: Coins, color: "text-orange-600" },
  { icon: Trophy, color: "text-purple-600" },
  { icon: TrendingUp, color: "text-green-600" },
  { icon: GraduationCap, color: "text-blue-600" },
  { icon: Home, color: "text-red-600" },
  { icon: Sparkles, color: "text-pink-600" },
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

// Animated Walking User Component
function WalkingUser({ position }: { position: "left" | "right" }) {
  return (
    <div
      className={cn(
        "absolute top-1/2 -translate-y-1/2 z-30",
        position === "left" ? "-right-14" : "-left-14"
      )}
    >
      <div className="relative">
        {/* Walking animation container */}
        <div className="relative animate-walk">
          {/* User character */}
          <div className="rounded-full bg-gradient-to-br from-blue-500 to-blue-700 p-3 shadow-2xl border-4 border-blue-300 relative">
            {/* Walking user icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-10 w-10 text-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Head */}
              <circle cx="12" cy="9" r="3.5" fill="currentColor" />
              {/* Body */}
              <path
                d="M12 13 C9 13 5 14.5 5 19 L19 19 C19 14.5 15 13 12 13 Z"
                fill="currentColor"
              />
              {/* Walking legs */}
              <path
                d="M10 19 L10 22 M14 19 L14 22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {/* Walking direction indicator */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-blue-300 opacity-60" />
          </div>
          {/* Walking shadow - pulsing */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-2 bg-black/30 rounded-full blur-sm animate-shadow-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const { currentStep, completedSteps } = MOCK_DATA;

  // Determine node status
  const getNodeStatus = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) {
      return "completed";
    }
    if (stepNumber === currentStep) {
      return "active";
    }
    if (stepNumber < currentStep) {
      return "completed"; // Past steps are completed
    }
    return "locked";
  };

  // Calculate positions for zig-zag layout
  // Steps alternate between left and right
  const getStepPosition = (index: number) => {
    return index % 2 === 0 ? "left" : "right";
  };

  // Calculate positions for all steps
  const stepPositions = BABY_STEPS.map((_, index) => {
    const position: "left" | "right" = getStepPosition(index);
    const topPercent = 5 + (index * 90) / (BABY_STEPS.length - 1); // Distribute from 5% to 95%
    const horizontalOffset = position === "left" ? "10%" : "90%";
    return { position, topPercent, horizontalOffset };
  });

  // Calculate line coordinates for roads between checkpoints
  const getRoadLines = () => {
    const lines = [];
    for (let i = 0; i < stepPositions.length - 1; i++) {
      const startPos = stepPositions[i];
      const endPos = stepPositions[i + 1];
      
      // Convert percentage to approximate pixel coordinates
      // Left position: ~5% of container, Right position: ~95% of container
      const startX = startPos.position === "left" ? 5 : 95;
      const startY = startPos.topPercent;
      const endX = endPos.position === "left" ? 5 : 95;
      const endY = endPos.topPercent;
      
      lines.push({
        x1: `${startX}%`,
        y1: `${startY}%`,
        x2: `${endX}%`,
        y2: `${endY}%`,
      });
    }
    return lines;
  };

  const roadLines = getRoadLines();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-sky-100 to-green-50 p-4 overflow-hidden">
        <div className="relative h-full w-full max-w-6xl">
          {/* Bank Building - positioned on the left side */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden md:block animate-pulse">
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-2xl bg-gradient-to-br from-blue-200 to-blue-300 p-8 shadow-2xl border-4 border-blue-400 hover:scale-110 transition-transform">
                <Building2 className="h-16 w-16 text-blue-800" />
              </div>
              <Badge className="bg-blue-600 text-white font-bold">Bank</Badge>
            </div>
          </div>

          {/* Road Path */}
          <div className="relative h-full w-full ml-0 md:ml-24">
            {/* SVG Roads - connecting lines between checkpoints */}
            <svg
              className="absolute left-0 top-0 h-full w-full overflow-visible pointer-events-none"
              style={{ zIndex: 0 }}
            >
              <defs>
                {/* Road texture pattern */}
                <pattern
                  id="roadTexture"
                  x="0"
                  y="0"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <rect width="40" height="40" fill="#4b5563" />
                  <circle cx="10" cy="10" r="0.5" fill="#6b7280" opacity="0.4" />
                  <circle cx="30" cy="10" r="0.5" fill="#6b7280" opacity="0.4" />
                  <circle cx="20" cy="20" r="0.5" fill="#6b7280" opacity="0.4" />
                  <circle cx="10" cy="30" r="0.5" fill="#6b7280" opacity="0.4" />
                  <circle cx="30" cy="30" r="0.5" fill="#6b7280" opacity="0.4" />
                </pattern>
                {/* Gradient for road edge */}
                <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#525252" stopOpacity="1" />
                  <stop offset="50%" stopColor="#404040" stopOpacity="1" />
                  <stop offset="100%" stopColor="#525252" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* Render road lines between each checkpoint pair */}
              {roadLines.map((line, index) => (
                <g key={index}>
                  {/* Road shadow/edge - thickest layer */}
                  <line
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="#1f2937"
                    strokeWidth="85"
                    className="opacity-70 transition-all duration-500"
                    strokeLinecap="round"
                  />
                  
                  {/* Main road surface */}
                  <line
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="url(#roadGradient)"
                    strokeWidth="70"
                    className="transition-all duration-500"
                    strokeLinecap="round"
                  />
                  
                  {/* Road texture overlay */}
                  <line
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="url(#roadTexture)"
                    strokeWidth="65"
                    className="opacity-30 transition-all duration-500"
                    strokeLinecap="round"
                  />

                  {/* Road edge lines */}
                  <line
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="#1f2937"
                    strokeWidth="3"
                    className="opacity-80 transition-all duration-500"
                    strokeLinecap="round"
                  />

                  {/* Center dashed line (road markings) */}
                  <line
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="#fbbf24"
                    strokeWidth="4"
                    strokeDasharray="20 15"
                    className="transition-all duration-500"
                    strokeLinecap="round"
                  />
                </g>
              ))}
            </svg>

            {/* Steps/Checkpoints */}
            {BABY_STEPS.map((step, index) => {
              const status = getNodeStatus(step.number);
              const isCompleted = status === "completed";
              const isActive = status === "active";
              const isLocked = status === "locked";
              const pos = stepPositions[index];
              const tooltipContent = getTooltipContent(step.number);
              const StepIcon = STEP_ICONS[index]?.icon || Flag;
              const iconColor = STEP_ICONS[index]?.color || "text-blue-600";

              return (
                <Tooltip key={step.number}>
                  <TooltipTrigger asChild>
                    <div
                      className="absolute cursor-pointer group"
                      style={{
                        top: `${pos.topPercent}%`,
                        left: pos.position === "left" ? "5%" : "auto",
                        right: pos.position === "right" ? "5%" : "auto",
                        transform: "translateY(-50%)",
                        zIndex: 10,
                      }}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {/* Checkpoint Flag/Milestone */}
                        <div className="relative">
                          {/* Flag pole base */}
                          <div
                            className={cn(
                              "absolute bottom-0 left-1/2 -translate-x-1/2 w-2 rounded-t-lg transition-all",
                              isCompleted && "h-16 bg-green-600",
                              isActive && "h-20 bg-yellow-500 animate-pulse",
                              isLocked && "h-12 bg-gray-400"
                            )}
                          />

                          {/* Checkpoint Circle/Flag */}
                          <div
                            className={cn(
                              "relative flex h-20 w-20 items-center justify-center rounded-full border-4 shadow-2xl transition-all sm:h-24 sm:w-24 group-hover:scale-110",
                              isCompleted &&
                                "border-green-600 bg-gradient-to-br from-green-400 to-green-600 ring-4 ring-green-200",
                              isActive &&
                                "border-yellow-500 bg-gradient-to-br from-yellow-400 to-yellow-600 ring-4 ring-yellow-300 ring-opacity-75 animate-pulse",
                              isLocked && "border-gray-400 bg-gray-200 opacity-60",
                              !isLocked && "hover:shadow-2xl"
                            )}
                          >
                            {isCompleted && (
                              <>
                                <Check className="h-10 w-10 text-white sm:h-12 sm:w-12" />
                                <div className="absolute -top-2 -right-2 animate-bounce">
                                  <Trophy className="h-6 w-6 text-yellow-400" />
                                </div>
                              </>
                            )}
                            {isActive && (
                              <>
                                <StepIcon
                                  className={cn(
                                    "h-10 w-10 sm:h-12 sm:w-12",
                                    iconColor
                                  )}
                                />
                                <div className="absolute -inset-2 rounded-full border-2 border-yellow-400 animate-ping" />
                              </>
                            )}
                            {isLocked && (
                              <Lock className="h-10 w-10 text-gray-500 sm:h-12 sm:w-12" />
                            )}
                          </div>

                          {/* Walking User - only show at current step */}
                          {isActive && <WalkingUser position={pos.position} />}

                          {/* Completed sparkles */}
                          {isCompleted && (
                            <div className="absolute -inset-4">
                              <div className="absolute top-0 left-0 animate-ping">
                                <Sparkles className="h-4 w-4 text-yellow-400" />
                              </div>
                              <div className="absolute top-0 right-0 animate-ping delay-200">
                                <Sparkles className="h-4 w-4 text-yellow-400" />
                              </div>
                              <div className="absolute bottom-0 left-0 animate-ping delay-300">
                                <Sparkles className="h-4 w-4 text-yellow-400" />
                              </div>
                              <div className="absolute bottom-0 right-0 animate-ping delay-500">
                                <Sparkles className="h-4 w-4 text-yellow-400" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Step Label Badge */}
                        <Badge
                          variant={
                            isActive
                              ? "default"
                              : isCompleted
                              ? "outline"
                              : "secondary"
                          }
                          className={cn(
                            "text-center text-xs font-bold sm:max-w-[180px] shadow-lg",
                            isActive && "bg-yellow-500 text-yellow-900 animate-pulse",
                            isCompleted &&
                              "border-green-500 bg-green-100 text-green-800",
                            isLocked && "opacity-60"
                          )}
                        >
                          Step {step.number}
                        </Badge>
                      </div>
                    </div>
                  </TooltipTrigger>
                  {tooltipContent && (
                    <TooltipContent
                      side={pos.position === "left" ? "right" : "left"}
                      className="max-w-xs bg-popover p-3 text-popover-foreground shadow-xl border-2"
                    >
                      <div className="space-y-2">
                        <h4 className="font-semibold text-xs">
                          {tooltipContent.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {tooltipContent.description}
                        </p>
                        <div className="pt-1.5 border-t border-border">
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            <span className="font-medium">Why needed: </span>
                            {tooltipContent.whyItMatters}
                          </p>
                        </div>
                        <div className="pt-1.5 border-t border-border">
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
      </div>
    </TooltipProvider>
  );
}
