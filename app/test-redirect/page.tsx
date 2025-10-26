"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestRedirectPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Redirect Test Page</CardTitle>
          <CardDescription>Test if client-side redirects work in v0 environment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => {
              console.log("[v0] Test: Attempting redirect to /instructor/dashboard")
              router.push("/instructor/dashboard")
            }}
            className="w-full"
          >
            Test Redirect to Instructor Dashboard
          </Button>

          <Button
            onClick={() => {
              console.log("[v0] Test: Attempting redirect to /auth/login")
              router.push("/auth/login")
            }}
            variant="outline"
            className="w-full"
          >
            Test Redirect to Login
          </Button>

          <Button
            onClick={() => {
              console.log("[v0] Test: Attempting redirect to /")
              router.push("/")
            }}
            variant="secondary"
            className="w-full"
          >
            Test Redirect to Home
          </Button>

          <div className="mt-4 rounded-lg bg-muted p-4 text-sm">
            <p className="font-semibold mb-2">Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click each button to test redirects</li>
              <li>Check if you're redirected to the correct page</li>
              <li>Check debug logs for console messages</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
