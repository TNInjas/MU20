"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const EXAMPLE_PROMPTS = [
  "Should I buy a Lambo?",
  "What is compound interest?",
  "How much should I save for emergencies?",
  "Is this purchase a good idea?",
  "Explain the 50/30/20 budget rule",
  "What's the difference between stocks and bonds?",
];

interface ExamplePromptsProps {
  onPromptClick: (prompt: string) => void;
  compact?: boolean;
}

export function ExamplePrompts({ onPromptClick, compact = false }: ExamplePromptsProps) {
  return (
    <div className={cn("space-y-2", compact && "space-y-1")}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        <span>Try asking:</span>
      </div>
      <div className={cn("flex flex-wrap gap-2", compact && "gap-1")}>
        {EXAMPLE_PROMPTS.slice(0, compact ? 3 : EXAMPLE_PROMPTS.length).map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            size={compact ? "sm" : "default"}
            className="text-xs h-auto py-1.5 px-3 whitespace-nowrap"
            onClick={() => onPromptClick(prompt)}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
}

