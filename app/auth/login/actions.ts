"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.log("[v0] Server login error:", error.message)
    return { error: error.message }
  }

  console.log("[v0] Server login successful, user:", data.user?.id)

  // Get user profile to determine redirect
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", data.user.id).single()

  console.log("[v0] Server login profile:", profile)

  // Redirect based on user type
  if (profile?.user_type === "instructor") {
    redirect("/instructor/dashboard")
  } else if (profile?.user_type === "studio") {
    redirect("/studio/dashboard")
  } else {
    redirect("/dashboard")
  }
}
