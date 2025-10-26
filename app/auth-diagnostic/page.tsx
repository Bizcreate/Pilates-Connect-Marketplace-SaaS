"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AuthDiagnosticPage() {
  const [results, setResults] = useState<Record<string, any>>({})
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const addResult = (test: string, result: any) => {
    setResults((prev) => ({ ...prev, [test]: result }))
  }

  // Test 1: Check if cookies work at all
  const testCookies = () => {
    document.cookie = "test_cookie=test_value; path=/"
    const cookies = document.cookie
    const hasCookie = cookies.includes("test_cookie=test_value")
    addResult("Browser Cookies", {
      canSet: hasCookie,
      allCookies: cookies || "No cookies found",
      status: hasCookie ? "✅ Working" : "❌ Not Working",
    })
  }

  // Test 2: Check localStorage
  const testLocalStorage = () => {
    try {
      localStorage.setItem("test_key", "test_value")
      const value = localStorage.getItem("test_key")
      localStorage.removeItem("test_key")
      addResult("LocalStorage", {
        canWrite: value === "test_value",
        status: value === "test_value" ? "✅ Working" : "❌ Not Working",
      })
    } catch (error) {
      addResult("LocalStorage", {
        canWrite: false,
        error: String(error),
        status: "❌ Not Working",
      })
    }
  }

  // Test 3: Check current Supabase session
  const testSupabaseSession = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()
    addResult("Supabase Session", {
      hasSession: !!session,
      user: session?.user?.email || "No user",
      error: error?.message,
      status: session ? "✅ Has Session" : "❌ No Session",
    })
  }

  // Test 4: Try to login with Supabase
  const testSupabaseLogin = async () => {
    if (!email || !password) {
      addResult("Supabase Login", { error: "Please enter email and password" })
      return
    }

    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    addResult("Supabase Login", {
      success: !!data.session,
      user: data.user?.email,
      error: error?.message,
      status: data.session ? "✅ Login Success" : "❌ Login Failed",
    })

    // Immediately check if session persists
    setTimeout(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      addResult("Session Persistence (1s later)", {
        hasSession: !!session,
        user: session?.user?.email || "No user",
        status: session ? "✅ Session Persisted" : "❌ Session Lost",
      })
    }, 1000)

    setLoading(false)
  }

  // Test 5: Check Supabase storage mechanism
  const testSupabaseStorage = () => {
    const storageKeys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.includes("supabase")) {
        storageKeys.push(key)
      }
    }
    addResult("Supabase Storage Keys", {
      keys: storageKeys,
      count: storageKeys.length,
      status: storageKeys.length > 0 ? "✅ Found Keys" : "❌ No Keys",
    })
  }

  const runAllTests = async () => {
    setResults({})
    testCookies()
    testLocalStorage()
    testSupabaseStorage()
    await testSupabaseSession()
  }

  useEffect(() => {
    runAllTests()
  }, [])

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>v0 Authentication Diagnostic Tool</CardTitle>
          <CardDescription>Testing what authentication mechanisms work in the v0 runtime environment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Automatic Tests</h3>
            <Button onClick={runAllTests} className="w-full">
              Run All Tests
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Manual Login Test</h3>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
              />
            </div>
            <Button onClick={testSupabaseLogin} disabled={loading} className="w-full">
              {loading ? "Testing Login..." : "Test Supabase Login"}
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Test Results</h3>
            <div className="space-y-2">
              {Object.entries(results).map(([test, result]) => (
                <Card key={test}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{test}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">{JSON.stringify(result, null, 2)}</pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Instructions for Support</h3>
            <p className="text-sm text-muted-foreground">
              Navigate to <code className="bg-muted px-1 rounded">/auth-diagnostic</code> and run the tests. Share the
              results with Vercel support to demonstrate which authentication mechanisms work in v0.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
