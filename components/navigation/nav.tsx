"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { signOut, TOAST_MESSAGES } from "@/services/auth";
import { toast } from "sonner";
import { APP_NAME } from "@/lib/constants";

// Authenticated navigation items (excludes Home/landing page)
const authenticatedNavigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Progress", href: "/progress" },
  { name: "Surplus", href: "/surplus" },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      if (user) {
        setUser({
          email: user.email,
          name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
        });
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth state changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
      if (session?.user) {
        setUser({
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  // Don't show navbar if still loading or not authenticated
  if (isLoading || !isAuthenticated) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success(TOAST_MESSAGES.SIGN_OUT.title, {
        description: TOAST_MESSAGES.SIGN_OUT.description,
      });
      setShowUserMenu(false);
      router.push("/");
    } catch (error) {
      toast.error("Error signing out", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  return (
    <nav className="flex items-center justify-between w-full gap-4">
      {/* Logo/Brand on the left */}
      <Link href="/dashboard" className="flex items-center space-x-2 flex-shrink-0">
        <Image 
          src="/logo.png" 
          alt={APP_NAME} 
          width={32} 
          height={32}
          className="h-8 w-8 sm:h-10 sm:w-10"
        />
      </Link>

      {/* Navigation links in the center */}
      <div className="flex items-center gap-3 sm:gap-6 flex-1 justify-center">
        {authenticatedNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-xs sm:text-sm font-medium transition-colors hover:text-foreground whitespace-nowrap",
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

      {/* User menu on the right */}
      <div className="relative flex-shrink-0" ref={userMenuRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2 rounded-full px-2 sm:px-3 py-2 text-sm font-medium transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="User menu"
          aria-expanded={showUserMenu}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <span className="hidden md:inline text-muted-foreground">{user?.name || "User"}</span>
          <svg
            className={cn(
              "h-4 w-4 transition-transform",
              showUserMenu && "rotate-180"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-48 rounded-md border bg-background shadow-lg z-50">
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-medium text-foreground">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <div className="py-1">
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
