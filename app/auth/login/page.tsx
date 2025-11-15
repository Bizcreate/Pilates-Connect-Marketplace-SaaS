"use client"

import type React from "react"
import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState(searchParams.get("email") || "")
  const [password, setPassword] = useState("")

  const successMessage = searchParams.get("message") || null
  const redirectTo = searchParams.get("redirect") || null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const supabase = createClient()
      
      console.log("[v0] Login: Starting login for email:", email)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.log("[v0] Login: Sign-in error:", signInError)
        setError(signInError.message)
        return
      }

      if (!data.user) {
        console.log("[v0] Login: No user returned from sign-in")
        setError("Login failed. Please try again.")
        return
      }

      console.log("[v0] Login: User authenticated:", data.user.id)

      if (redirectTo) {
        console.log("[v0] Login: Redirecting to:", redirectTo)
        router.push(redirectTo)
        router.refresh()
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", data.user.id)
        .single()

      console.log("[v0] Login: Profile query result:", { profile, profileError })

      if (profileError) {
        console.error("[v0] Login: Profile error:", profileError)
        setError(`Profile error: ${profileError.message}. Your account may need to be set up. Please contact support.`)
        return
      }

      if (!profile) {
        console.error("[v0] Login: No profile found for user:", data.user.id)
        setError("Profile not found. Your account needs to be set up. Please contact support with your email address.")
        return
      }

      console.log("[v0] Login: Profile found, user_type:", profile.user_type)

      const redirectPath =
        profile.user_type === "instructor"
          ? "/instructor/dashboard"
          : profile.user_type === "studio"
            ? "/studio/dashboard"
            : profile.user_type === "admin"
              ? "/admin/dashboard"
              : "/"

      console.log("[v0] Login: Redirecting to dashboard:", redirectPath)
      router.push(redirectPath)
      router.refresh()
    } catch (err) {
      console.error("[v0] Login: Unexpected error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Welcome back</CardTitle>
                <CardDescription>Loading...</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
