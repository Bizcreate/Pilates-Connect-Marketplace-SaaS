"use client"

import type React from "react"
import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const supabase = createClient()

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      if (!data.user) {
        setError("Login failed. Please try again.")
        return
      }

      // Fetch profile to determine dashboard
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", data.user.id)
        .single()

      if (profileError || !profile) {
        setError("Profile not found. Please contact support.")
        return
      }

      // Redirect to appropriate dashboard
      const redirectPath =
        profile.user_type === "instructor"
          ? "/instructor/dashboard"
          : profile.user_type === "studio"
            ? "/studio/dashboard"
            : profile.user_type === "admin"
              ? "/admin/dashboard"
              : "/"

      router.push(redirectPath)
      router.refresh()
    } catch (err) {
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
