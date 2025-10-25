"use client"

import type React from "react"

import { useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ArrowLeft, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("applications").insert({
        job_id: id,
        instructor_id: user.id,
        cover_letter: coverLetter || null,
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Application submitted!",
        description: "The studio will review your application and contact you if interested.",
      })

      router.push(`/jobs/${id}`)
    } catch (error) {
      console.error("[v0] Error submitting application:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8 max-w-2xl">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href={`/jobs/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Job
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Apply for this Position</CardTitle>
              <CardDescription>
                Submit your application to express interest. The studio will review your profile and contact you if
                interested.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cover-letter">Cover Letter (Optional)</Label>
                  <Textarea
                    id="cover-letter"
                    placeholder="Tell the studio why you're interested in this position and what makes you a great fit..."
                    rows={8}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your profile information will be automatically shared with the studio
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
                    <Link href={`/jobs/${id}`}>Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    {isLoading ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
