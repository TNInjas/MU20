"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "./auth-modal";

interface SignUpButtonProps {
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
  children?: React.ReactNode;
}

export function SignUpButton({ 
  size = "default", 
  variant = "default",
  className = "",
  children 
}: SignUpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        size={size} 
        variant={variant}
        className={className}
        onClick={() => setIsOpen(true)}
      >
        {children || "Sign Up"}
      </Button>
      <AuthModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

