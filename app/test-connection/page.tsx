"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function TestConnectionPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false) // Declare isAuthenticated here

  const addResult = (test: string, data: any, status: "success" | "warning" | "error") => {
    setResults((prev) => [...prev, { test, data, status, timestamp: new Date().toISOString() }])
  }

  const runAllTests = async () => {
    setResults([])
    setLoading(true)

    const supabase = createClient()
    let authUserId: string | undefined

    // Test 1: Check authentication
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      setIsAuthenticated(!!session) // Update isAuthenticated state here
      authUserId = session?.user?.id
      addResult(
        "Authentication",
        {
          authenticated: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          userType: session?.user?.user_metadata?.user_type,
          error: error?.message,
        },
        !!session ? "success" : "error",
      )
    } catch (error: any) {
      addResult("Authentication", { error: error.message }, "error")
    }

    // Test 2: Check profiles table
    try {
      const { data, error, count } = await supabase.from("profiles").select("*", { count: "exact", head: false })
      const hasProfiles = (count || 0) > 0
      addResult(
        "Profiles Table",
        {
          count,
          hasData: hasProfiles,
          sampleData: data?.slice(0, 2),
          error: error?.message,
        },
        error ? "error" : hasProfiles ? "success" : "warning",
      )
    } catch (error: any) {
      addResult("Profiles Table", { error: error.message }, "error")
    }

    // Test 3: Check if current user has a profile
    if (isAuthenticated && authUserId) {
      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", authUserId).single()
        addResult(
          "Current User Profile",
          {
            exists: !!data,
            profile: data,
            error: error?.message,
          },
          error ? "error" : data ? "success" : "warning",
        )
      } catch (error: any) {
        addResult("Current User Profile", { error: error.message }, "error")
      }
    }

    // Test 4: Check jobs table
    try {
      console.log("[v0] Fetching all jobs...")
      const { data, error, count } = await supabase
        .from("jobs")
        .select("*, studio:studio_id(id, display_name, studio_profiles(studio_name))", {
          count: "exact",
          head: false,
        })
      console.log("[v0] Jobs query result:", { count, dataLength: data?.length, error: error?.message })
      const hasJobs = (count || 0) > 0
      addResult(
        "Jobs Table",
        {
          count,
          totalRecords: data?.length,
          hasData: hasJobs,
          sampleData: data?.slice(0, 2),
          error: error?.message,
        },
        error ? "error" : hasJobs ? "success" : "warning",
      )
    } catch (error: any) {
      console.error("[v0] Jobs query error:", error)
      addResult("Jobs Table", { error: error.message }, "error")
    }

    // Test 5: Check cover requests table
    try {
      const { data, error, count } = await supabase
        .from("cover_requests")
        .select("*, studio:studio_id(display_name)", { count: "exact", head: false })
      const hasData = (count || 0) > 0
      addResult(
        "Cover Requests Table",
        {
          count,
          hasData,
          sampleData: data?.slice(0, 2),
          error: error?.message,
        },
        error ? "error" : hasData ? "success" : "warning",
      )
    } catch (error: any) {
      addResult("Cover Requests Table", { error: error.message }, "error")
    }

    // Test 6: Check instructors with profiles
    try {
      const { data, error, count } = await supabase
        .from("profiles")
        .select("*, instructor_profiles(*)", { count: "exact", head: false })
        .eq("user_type", "instructor")
      const hasData = (count || 0) > 0
      addResult(
        "Instructors",
        {
          count,
          hasData,
          sampleData: data?.slice(0, 2),
          error: error?.message,
        },
        error ? "error" : hasData ? "success" : "warning",
      )
    } catch (error: any) {
      addResult("Instructors", { error: error.message }, "error")
    }

    // Test 7: Check availability slots
    try {
      const { data, error, count } = await supabase
        .from("availability_slots")
        .select("*", { count: "exact", head: false })
      const hasData = (count || 0) > 0
      addResult(
        "Availability Slots",
        {
          count,
          hasData,
          sampleData: data?.slice(0, 2),
          error: error?.message,
        },
        error ? "error" : hasData ? "success" : "warning",
      )
    } catch (error: any) {
      addResult("Availability Slots", { error: error.message }, "error")
    }

    // Test 8: Check studio profiles
    try {
      const { data, error, count } = await supabase.from("studio_profiles").select("*", { count: "exact", head: false })
      const hasData = (count || 0) > 0
      addResult(
        "Studio Profiles",
        {
          count,
          hasData,
          sampleData: data?.slice(0, 2),
          error: error?.message,
        },
        error ? "error" : hasData ? "success" : "warning",
      )
    } catch (error: any) {
      addResult("Studio Profiles", { error: error.message }, "error")
    }

    // Test 9: Check instructor profiles
    try {
      const { data, error, count } = await supabase
        .from("instructor_profiles")
        .select("*", { count: "exact", head: false })
      const hasData = (count || 0) > 0
      addResult(
        "Instructor Profiles",
        {
          count,
          hasData,
          sampleData: data?.slice(0, 2),
          error: error?.message,
        },
        error ? "error" : hasData ? "success" : "warning",
      )
    } catch (error: any) {
      addResult("Instructor Profiles", { error: error.message }, "error")
    }

    // Generate summary
    const errorCount = results.filter((r) => r.status === "error").length
    const warningCount = results.filter((r) => r.status === "warning").length
    const successCount = results.filter((r) => r.status === "success").length

    setSummary({
      total: results.length,
      errors: errorCount,
      warnings: warningCount,
      success: successCount,
      authenticated: isAuthenticated,
    })

    setLoading(false)
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
          <CardDescription>Test all Supabase tables and authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runAllTests} disabled={loading} className="w-full">
            {loading ? "Running Tests..." : "Run All Tests"}
          </Button>

          {summary && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Test Summary</AlertTitle>
              <AlertDescription>
                <div className="space-y-1 text-sm mt-2">
                  <div>Total Tests: {summary.total}</div>
                  <div className="text-green-600">✓ Success: {summary.success}</div>
                  <div className="text-yellow-600">⚠ Warnings: {summary.warnings}</div>
                  <div className="text-red-600">✗ Errors: {summary.errors}</div>
                  <div className="mt-2 pt-2 border-t">
                    Authentication: {summary.authenticated ? "✓ Logged In" : "✗ Not Logged In"}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!isAuthenticated && results.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Authenticated</AlertTitle>
              <AlertDescription>
                You need to be logged in to test database operations. Please sign in first.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {results.map((result, index) => (
              <Card
                key={index}
                className={
                  result.status === "error"
                    ? "border-red-500"
                    : result.status === "warning"
                      ? "border-yellow-500"
                      : "border-green-500"
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{result.test}</CardTitle>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        result.status === "error"
                          ? "bg-red-100 text-red-700"
                          : result.status === "warning"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {result.status}
                    </span>
                  </div>
                  <CardDescription className="text-xs">{result.timestamp}</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-64">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
