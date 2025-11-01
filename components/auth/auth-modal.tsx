"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  signInWithEmail,
  signInWithGoogle,
  TOAST_MESSAGES,
} from "@/services/auth";

interface AuthModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<"email" | "google" | null>(null);

  const controlledOpen = open !== undefined ? open : isOpen;
  const handleOpenChange = onOpenChange || setIsOpen;

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("email");
    try {
      // Store the current path for post-login redirect
      sessionStorage.setItem('postLoginRedirect', window.location.pathname + window.location.search);

      const { error } = await signInWithEmail(email);

      if (error) throw error;

      toast.success(TOAST_MESSAGES.MAGIC_LINK.title, {
        description: TOAST_MESSAGES.MAGIC_LINK.description,
      });

      setIsOpen(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast.error(TOAST_MESSAGES.ERROR.title, {
        description: errorMsg || TOAST_MESSAGES.ERROR.description,
      });
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading("google");
    try {
      // Store the current path for post-login redirect
      sessionStorage.setItem('postLoginRedirect', window.location.pathname + window.location.search);

      const { error } = await signInWithGoogle();

      if (error) throw error;

      toast.info("Redirecting to Google", {
        description: "You'll be redirected to sign in with your Google account.",
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast.error(TOAST_MESSAGES.ERROR.title, {
        description: errorMsg || TOAST_MESSAGES.ERROR.description,
      });
      setLoading(null);
    }
  };

  return (
    <Dialog open={controlledOpen} onOpenChange={(o) => loading || handleOpenChange(o)}>
      {!onOpenChange && (
        <DialogTrigger asChild>
          <Button variant="ghost" className="text-foreground/80 hover:text-foreground">
            Sign In
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign in to your account</DialogTitle>
          <DialogDescription>
            Choose your preferred sign in method below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEmailSignIn} className="space-y-4 py-2">
          <Input
            id="email"
            placeholder="name@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!loading}
            required
          />

          <Button type="submit" className="w-full" disabled={!!loading}>
            {loading === "email" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" /> Sign in with Email
              </>
            )}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={!!loading}
        >
          {loading === "google" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting to Google...
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Google
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

