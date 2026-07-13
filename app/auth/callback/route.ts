import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      const userRole = data.user.user_metadata?.role || data.user.user_metadata?.user_type;
      
      if (userRole === "founder") {
        return NextResponse.redirect(`${origin}/dashboard`);
      } else if (userRole === "investor") {
        return NextResponse.redirect(`${origin}/directory`);
      }
      
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If code exchange fails, redirect back to auth page with error details
  return NextResponse.redirect(
    `${origin}/auth?mode=signin&error=verification_failed`
  );
}
