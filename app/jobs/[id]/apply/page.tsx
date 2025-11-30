"use client"

import type React from "react"

import { useState, use, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ArrowLeft, Send, Upload, X, Video, ImageIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [coverLetter, setCoverLetter] = useState("")
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [demoFiles, setDemoFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()

      console.log("[v0] Apply Page: Checking authentication...")

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      console.log("[v0] Apply Page: User result:", user ? `Found user ${user.id}` : "No user found", error)

      if (!user || error) {
        console.log("[v0] Apply Page: Redirecting to login...")
        router.replace(`/auth/login?redirect=/jobs/${id}/apply`)
        return
      }

      const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).maybeSingle()

      if (profile?.user_type !== "instructor") {
        toast({
          title: "Access Denied",
          description: "Only instructors can apply to jobs",
          variant: "destructive",
        })
        router.replace(`/jobs/${id}`)
        return
      }

      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [id, router, toast])

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "CV must be under 10MB",
          variant: "destructive",
        })
        return
      }
      setCvFile(file)
    }
  }

  const handleDemoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter((file) => {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} must be under 50MB`,
          variant: "destructive",
        })
        return false
      }
      return true
    })
    setDemoFiles((prev) => [...prev, ...validFiles])
  }

  const removeDemoFile = (index: number) => {
    setDemoFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setUploading(true)

    const supabase = createClient()

    try {
      console.log("[v0] Starting job application submission...")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log("[v0] User:", user?.id, "Job ID:", id)

      if (!user) {
        throw new Error("Not authenticated")
      }

      let cvUrl = null
      const demoUrls: string[] = []

      if (cvFile || demoFiles.length > 0) {
        console.log("[v0] Uploading files via API...")

        const formData = new FormData()
        formData.append("userId", user.id)
        formData.append("jobId", id)

        if (cvFile) {
          formData.append("files", cvFile)
        }

        demoFiles.forEach((file) => {
          formData.append("files", file)
        })

        const uploadResponse = await fetch("/api/upload-application-files", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json()
          throw new Error(error.details || "Failed to upload files")
        }

        const { urls } = await uploadResponse.json()
        console.log("[v0] Files uploaded successfully:", urls)

        // First URL is CV if CV was uploaded
        if (cvFile && urls.length > 0) {
          cvUrl = urls[0]
          // Remaining URLs are demo files
          demoUrls.push(...urls.slice(1))
        } else {
          // All URLs are demo files
          demoUrls.push(...urls)
        }
      }

      console.log("[v0] Inserting application into database...")
      const { data, error } = await supabase
        .from("job_applications")
        .insert({
          job_id: id,
          instructor_id: user.id,
          cover_letter: coverLetter || null,
          status: "pending",
          cv_url: cvUrl,
          demo_urls: demoUrls.length > 0 ? demoUrls : null,
        })
        .select()

      console.log("[v0] Application result:", { data, error })

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
      setUploading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
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
                Submit your application with your CV and optional demo videos or images to showcase your work
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cv">CV / Resume</Label>
                  <div className="flex items-center gap-3">
                    <Input id="cv" type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} className="hidden" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("cv")?.click()}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {cvFile ? cvFile.name : "Upload CV (PDF, DOC)"}
                    </Button>
                    {cvFile && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => setCvFile(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Optional - Max 10MB</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover-letter">Cover Letter (Optional)</Label>
                  <Textarea
                    id="cover-letter"
                    placeholder="Tell the studio why you're interested in this position and what makes you a great fit..."
                    rows={6}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="demo">Demo Videos/Images (Optional)</Label>
                  <div>
                    <Input
                      id="demo"
                      type="file"
                      accept="video/*,image/*"
                      multiple
                      onChange={handleDemoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("demo")?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Demo Files
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload videos or images showcasing your work - Max 50MB each
                  </p>

                  {demoFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {demoFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                          {file.type.startsWith("video/") ? (
                            <Video className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm flex-1 truncate">{file.name}</span>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeDemoFile(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="flex-1 bg-transparent"
                    disabled={isLoading}
                  >
                    <Link href={`/jobs/${id}`}>Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : isLoading ? "Submitting..." : "Submit Application"}
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
