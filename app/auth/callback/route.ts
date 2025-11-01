import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Always redirect to onboarding (user completes unified signup/onboarding flow)
  const redirectTo = "/onboarding?auth=success&postLogin=1";

  return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);
}

