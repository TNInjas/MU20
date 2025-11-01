import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type AuthStateChangeCallback = (user: User | null) => void;

export function useAuth() {
  const supabase = createClient();

  const onAuthStateChange = useCallback(
    (callback: AuthStateChangeCallback) => {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ?? null);
      });

      return () => {
        subscription.unsubscribe();
      };
    },
    [supabase]
  );

  return { onAuthStateChange };
}


