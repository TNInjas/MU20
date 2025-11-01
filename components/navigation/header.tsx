"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navigation } from "./nav";

export function Header() {
  const pathname = usePathname();
  const [shouldShow, setShouldShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      // Don't show header on landing, signup, or onboarding pages
      const isLandingPage = pathname === "/";
      const isSignupPage = pathname === "/signup";
      const isOnboardingPage = pathname === "/onboarding";
      const isPublicFlowPage = isLandingPage || isSignupPage || isOnboardingPage;
      
      // Hide header on public flow pages (landing, signup, onboarding)
      if (isPublicFlowPage) {
        setShouldShow(false);
      } else {
        setShouldShow(true);
      }
      
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth state changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const isLandingPage = pathname === "/";
      const isSignupPage = pathname === "/signup";
      const isOnboardingPage = pathname === "/onboarding";
      const isPublicFlowPage = isLandingPage || isSignupPage || isOnboardingPage;
      
      if (isPublicFlowPage) {
        setShouldShow(false);
      } else {
        setShouldShow(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname]);

  // Don't render header if it shouldn't be shown
  if (!shouldShow || isLoading) {
    return null;
  }

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <Navigation />
      </div>
    </header>
  );
}

