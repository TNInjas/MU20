"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Progress", href: "/progress" },
  { name: "Surplus", href: "/surplus" },
];

export function Navigation() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth state changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isActive
                  ? "text-foreground border-b-2 border-primary pb-1"
                  : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
      {!isLoading && !isAuthenticated && (
        <Button asChild size="sm">
          <Link href="/signup">Get Started</Link>
        </Button>
      )}
    </nav>
  );
}
