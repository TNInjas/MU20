"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BABY_STEPS } from "@/lib/constants/steps";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ScrollRoadmap() {
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    stepRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleSteps((prev) => new Set(prev).add(index));
            }
          });
        },
        {
          threshold: 0.2,
          rootMargin: "-50px",
        }
      );

      observer.observe(ref);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <div className="relative py-16">
      {/* Vertical line connecting steps */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-[#5995ED] to-[#85BB65] opacity-20 md:left-1/2 md:-translate-x-0.5"></div>

      <div className="space-y-12">
        {BABY_STEPS.map((step, index) => {
          const isVisible = visibleSteps.has(index);
          const isEven = index % 2 === 0;

          return (
            <div
              key={step.number}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              className={cn(
                "relative flex items-center gap-8",
                isEven ? "md:flex-row" : "md:flex-row-reverse"
              )}
            >
              {/* Step number on the line */}
              <div className="relative z-10 flex-shrink-0">
                <Badge
                  variant="default"
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-full border-4 text-xl font-bold shadow-lg transition-all duration-700",
                    isVisible
                      ? "scale-100 bg-primary text-primary-foreground"
                      : "scale-0 bg-muted"
                  )}
                >
                  {step.number}
                </Badge>
              </div>

              {/* Step content card */}
              <Card
                className={cn(
                  "flex-1 transition-all duration-700",
                  isVisible
                    ? "translate-x-0 translate-y-0 opacity-100"
                    : isEven
                      ? "translate-x-8 opacity-0"
                      : "-translate-x-8 opacity-0"
                )}
              >
                <CardHeader>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/progress?step=${step.number}`}>
                      Learn More
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
