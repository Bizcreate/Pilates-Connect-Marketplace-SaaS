"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, CheckCircle2, Clock, XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface InsuranceDocument {
  type: string
  provider: string
  policy_number: string
  issue_date: string
  expiry_date: string
  document_url: string
  status: "pending" | "approved" | "rejected"
  verified_at?: string
  verified_by?: string
  rejection_reason?: string
  uploaded_at: string
}

export default function InstructorInsurance() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [documents, setDocuments] = useState<InsuranceDocument[]>([])
  const [profile, setProfile] = useState<any>(null)

  // Form state
  const [insuranceType, setInsuranceType] = useState("professional-indemnity")
  const [provider, setProvider] = useState("")
  const [policyNumber, setPolicyNumber] = useState("")
  const [issueDate, setIssueDate] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      console.log("[v0] Insurance: Loading profile...")
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/auth/login")
        return
      }

      const { data: profileData, error } = await supabase
        .from("instructor_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single()

      if (error) throw error

      setProfile(profileData)

      // Parse insurance documents
      const insuranceDocs = profileData.insurance_documents || []
      setDocuments(insuranceDocs)

      console.log("[v0] Insurance: Loaded", insuranceDocs.length, "documents")
    } catch (error) {
      console.error("[v0] Insurance: Error loading profile:", error)
      toast({
        title: "Error",
        description: "Failed to load insurance documents",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, JPG, or PNG file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
  }

  async function handleUpload() {
    if (!file || !provider || !policyNumber || !issueDate || !expiryDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and select a file",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      console.log("[v0] Insurance: Uploading document...")

      // Upload to Vercel Blob
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file")
      }

      const { url } = await uploadResponse.json()
      console.log("[v0] Insurance: File uploaded:", url)

      // Create new insurance document
      const newDocument: InsuranceDocument = {
        type: insuranceType,
        provider,
        policy_number: policyNumber,
        issue_date: issueDate,
        expiry_date: expiryDate,
        document_url: url,
        status: "pending",
        uploaded_at: new Date().toISOString(),
      }

      // Add to existing documents
      const updatedDocuments = [...documents, newDocument]

      // Update profile
      const { error } = await supabase
        .from("instructor_profiles")
        .update({ insurance_documents: updatedDocuments })
        .eq("id", profile.id)

      if (error) throw error

      console.log("[v0] Insurance: Document saved to profile")

      // Update local state
      setDocuments(updatedDocuments)

      // Reset form
      setProvider("")
      setPolicyNumber("")
      setIssueDate("")
      setExpiryDate("")
      setFile(null)
      setInsuranceType("professional-indemnity")

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ""

      toast({
        title: "Insurance uploaded",
        description: "Your insurance document has been submitted for review",
      })
    } catch (error) {
      console.error("[v0] Insurance: Upload error:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload insurance document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">Loading insurance documents...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Link
        href="/instructor/dashboard"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Insurance Documentation</h1>
        <p className="text-muted-foreground">
          Upload your professional indemnity and public liability insurance documents for verification
        </p>
      </div>

      {/* Upload New Insurance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload Insurance Document</CardTitle>
          <CardDescription>Provide your insurance details and upload a copy of your certificate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="insuranceType">Insurance Type</Label>
            <Select value={insuranceType} onValueChange={setInsuranceType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional-indemnity">Professional Indemnity</SelectItem>
                <SelectItem value="public-liability">Public Liability</SelectItem>
                <SelectItem value="combined">Combined Cover</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="provider">Insurance Provider</Label>
            <Input
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="e.g., Fitness Australia, Allianz"
            />
          </div>

          <div>
            <Label htmlFor="policyNumber">Policy Number</Label>
            <Input
              id="policyNumber"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              placeholder="Enter your policy number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input id="issueDate" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input id="expiryDate" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="document">Insurance Certificate (PDF, JPG, PNG - Max 10MB)</Label>
            <Input
              id="document"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {file && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <Button onClick={handleUpload} disabled={uploading || !file} className="w-full">
            {uploading ? (
              <>Uploading...</>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Insurance Document
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Documents */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Insurance Documents</h2>

        {documents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No insurance documents uploaded yet</p>
            </CardContent>
          </Card>
        ) : (
          documents.map((doc, index) => (
            <Card key={index}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium capitalize">{doc.type.replace("-", " ")}</h3>
                        <p className="text-sm text-muted-foreground">{doc.provider}</p>
                      </div>
                      {getStatusBadge(doc.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Policy Number</p>
                        <p className="font-medium">{doc.policy_number}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valid Period</p>
                        <p className="font-medium">
                          {new Date(doc.issue_date).toLocaleDateString()} -{" "}
                          {new Date(doc.expiry_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {doc.status === "rejected" && doc.rejection_reason && (
                      <div className="mt-4 p-3 bg-destructive/10 rounded-md">
                        <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
                        <p className="text-sm text-destructive/80">{doc.rejection_reason}</p>
                      </div>
                    )}

                    {doc.status === "approved" && doc.verified_at && (
                      <div className="mt-4 text-sm text-muted-foreground">
                        Verified on {new Date(doc.verified_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <Button variant="outline" size="sm" asChild>
                    <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                      View Document
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
