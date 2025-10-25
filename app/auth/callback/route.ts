import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Create profile after email confirmation
      const metadata = data.user.user_metadata

      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: data.user.email!,
        display_name: metadata.display_name,
        user_type: metadata.user_type,
      })

      if (!profileError) {
        // Create type-specific profile
        if (metadata.user_type === "studio") {
          await supabase.from("studio_profiles").insert({
            id: data.user.id,
            studio_name: metadata.display_name,
          })
        } else {
          await supabase.from("instructor_profiles").insert({
            id: data.user.id,
          })
        }
      }

      // Redirect based on user type
      const redirectPath = metadata.user_type === "studio" ? "/studio/dashboard" : "/instructor/dashboard"

      return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
    }
  }

  // Redirect to error page if something went wrong
  return NextResponse.redirect(new URL("/auth/error", requestUrl.origin))
}
