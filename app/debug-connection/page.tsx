"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DebugConnectionPage() {
  const [envStatus, setEnvStatus] = useState<any>(null)
  const [dbStatus, setDbStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkConnection() {
      // Check environment variables
      const envRes = await fetch("/api/debug-env")
      const envData = await envRes.json()
      setEnvStatus(envData)

      // Check database connection
      const supabase = createBrowserClient()
      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      setDbStatus({
        connected: !error,
        error: error?.message,
        data: data,
      })

      setLoading(false)
    }

    checkConnection()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Checking connection...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Database Connection Diagnostics</h1>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>Checking if Supabase credentials are available</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span>NEXT_PUBLIC_SUPABASE_URL:</span>
            <Badge variant={envStatus?.hasSupabaseUrl ? "default" : "destructive"}>
              {envStatus?.hasSupabaseUrl ? "Set" : "Missing"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
            <Badge variant={envStatus?.hasSupabaseAnonKey ? "default" : "destructive"}>
              {envStatus?.hasSupabaseAnonKey ? "Set" : "Missing"}
            </Badge>
          </div>
          {envStatus?.supabaseUrl && (
            <div className="text-sm text-muted-foreground mt-4">URL Preview: {envStatus.supabaseUrl}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Connection</CardTitle>
          <CardDescription>Testing actual database query</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span>Connection Status:</span>
            <Badge variant={dbStatus?.connected ? "default" : "destructive"}>
              {dbStatus?.connected ? "Connected" : "Failed"}
            </Badge>
          </div>
          {dbStatus?.error && (
            <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
              <p className="font-semibold">Error:</p>
              <p className="text-sm">{dbStatus.error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {!envStatus?.hasSupabaseUrl || !envStatus?.hasSupabaseAnonKey ? (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Action Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Add these environment variables to your Vercel project:</p>
            <div className="bg-muted p-4 rounded-md font-mono text-sm space-y-2">
              <div>NEXT_PUBLIC_SUPABASE_URL=https://jeahpbmwgzeokihpdywk.supabase.co</div>
              <div>
                NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplYWhwYm13Z3plb2tpaHBkeXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTUxOTMsImV4cCI6MjA3NjkzMTE5M30.ybEMWDkDvuD_2zGJj250VlEmcqmQTFbSf-8gx88OvQ8
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Go to your Vercel project → Settings → Environment Variables and add these.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
