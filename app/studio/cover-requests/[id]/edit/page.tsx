"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ArrowLeft, Save } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function EditCoverRequestPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [coverRequest, setCoverRequest] = useState<any>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    async function loadCoverRequest() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase
        .from("cover_requests")
        .select("*")
        .eq("id", params.id)
        .eq("studio_id", user.id)
        .single()

      if (error || !data) {
        toast({
          title: "Error",
          description: "Cover request not found",
          variant: "destructive",
        })
        router.push("/studio/dashboard")
        return
      }

      setCoverRequest(data)
      setLoading(false)
    }

    loadCoverRequest()
  }, [params.id, router, supabase, toast])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const updateData = {
        class_type: formData.get("class-type") as string,
        date: formData.get("date") as string,
        start_time: formData.get("start-time") as string,
        end_time: formData.get("end-time") as string,
        notes: formData.get("notes") as string,
      }

      const { error } = await supabase.from("cover_requests").update(updateData).eq("id", params.id)

      if (error) throw error

      toast({
        title: "Cover request updated!",
        description: "Your changes have been saved.",
      })

      router.push("/studio/dashboard")
    } catch (error) {
      console.error("[v0] Error updating cover request:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update cover request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading cover request...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8 max-w-2xl">
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/studio/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Edit Cover Request</h1>
            <p className="text-muted-foreground mt-1">Update your cover request details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cover Request Details</CardTitle>
                <CardDescription>Update the information for this cover request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="class-type">Class Type *</Label>
                  <Input
                    id="class-type"
                    name="class-type"
                    defaultValue={coverRequest?.class_type || ""}
                    placeholder="e.g., Reformer Pilates"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" name="date" type="date" defaultValue={coverRequest?.date || ""} required />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time *</Label>
                    <Input
                      id="start-time"
                      name="start-time"
                      type="time"
                      defaultValue={coverRequest?.start_time || ""}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time *</Label>
                    <Input
                      id="end-time"
                      name="end-time"
                      type="time"
                      defaultValue={coverRequest?.end_time || ""}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    defaultValue={coverRequest?.notes || ""}
                    placeholder="Any special requirements or details..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" size="lg" onClick={() => router.back()} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
