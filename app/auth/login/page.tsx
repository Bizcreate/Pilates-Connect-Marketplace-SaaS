"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const email = searchParams.get("email") || ""
  const successMessage = searchParams.get("message") || null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const supabase = createBrowserClient()

    console.log("[v0] Login: Attempting login for", email)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.log("[v0] Login: Error", signInError.message)
      setError(signInError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      console.log("[v0] Login: No user returned")
      setError("Login failed. Please try again.")
      setLoading(false)
      return
    }

    console.log("[v0] Login: Success, user ID:", data.user.id)

    const storedSession = localStorage.getItem("supabase.auth.token")
    console.log("[v0] Login: Session stored in localStorage:", !!storedSession)

    // Get profile to determine redirect
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", data.user.id)
      .single()

    if (profileErr || !profile) {
      console.log("[v0] Login: Profile error or not found")
      router.replace("/")
      return
    }

    console.log("[v0] Login: Profile type:", profile.user_type)

    if (profile.user_type === "instructor") {
      console.log("[v0] Login: Redirecting to instructor dashboard")
      router.replace("/instructor/dashboard")
    } else if (profile.user_type === "studio") {
      console.log("[v0] Login: Redirecting to studio dashboard")
      router.replace("/studio/dashboard")
    } else {
      console.log("[v0] Login: Unknown user type, redirecting to home")
      router.replace("/")
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your Pilates Connect account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                {successMessage && (
                  <div className="rounded-md bg-green-50 p-3">
                    <p className="text-sm text-green-600">{successMessage}</p>
                  </div>
                )}
                {error && (
                  <div className="rounded-md bg-red-50 p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    defaultValue={email}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/sign-up" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
