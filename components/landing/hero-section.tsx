"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Typewriter } from "./typewriter";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="container mx-auto px-4 py-20 text-center sm:px-6 lg:px-8">
      <div
        className={`transition-all duration-1000 ${
          mounted
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }`}
      >
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          Your Financial{" "}
          <span className="bg-gradient-to-r from-[#5995ED] to-[#FFAD05] bg-clip-text text-transparent">
            <Typewriter
              words={["Roadmap", "Freedom", "Future", "Success"]}
              className="inline-block"
            />
          </span>
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Navigate Dave Ramsey's 7 Steps with AI guidance. Built for students.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="h-12 px-8">
            <Link href="/onboarding">Start Your Journey</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-8">
            <Link href="/progress">View Progress</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
