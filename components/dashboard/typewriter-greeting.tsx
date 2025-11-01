"use client";

import { useEffect, useState } from "react";

interface TypewriterGreetingProps {
  userName: string;
}

export function TypewriterGreeting({ userName }: TypewriterGreetingProps) {
  const [displayText, setDisplayText] = useState("");
  const fullText = `Hella, ${userName}`;

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 50); // Speed of typing

    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
      {displayText}
      <span className="animate-pulse">|</span>
    </h1>
  );
}



