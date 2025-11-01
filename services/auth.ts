import { createClient } from "@/lib/supabase/client";

// Standardized toast messages for auth flows
export const TOAST_MESSAGES = {
  SIGN_OUT: { title: "Signed out", description: "You have been signed out successfully." },
  SIGN_IN:  { title: "Welcome!",    description: "You have successfully signed in." },
  MAGIC_LINK: { title: "Check your email", description: "We've sent you a magic link to sign in." },
  ERROR:    { title: "Error",      description: "Something went wrong. Please try again." },
};

// Browser-side client
const supabase = createClient();

// Get base URL from env or fallback to window.location.origin
function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");
}

/**
 * Send a magic link (OTP) to the given email.
 */
export function signInWithEmail(email: string, redirectTo?: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo ?? `${getBaseUrl()}/auth/callback`,
    },
  });
}

/**
 * Initiate OAuth sign-in with Google.
 */
export function signInWithGoogle(redirectTo?: string) {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo ?? `${getBaseUrl()}/auth/callback`,
    },
  });
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  // Redirect to home page after sign out
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}


