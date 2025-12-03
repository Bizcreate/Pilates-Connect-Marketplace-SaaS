"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Award, Upload, X, Plus, FileText, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const PREDEFINED_CERTIFICATIONS = [
  "Pilates Reformer Certification",
  "Pilates Mat Certification",
  "Classical Pilates Certification",
  "Contemporary Pilates Certification",
  "STOTT PILATES Certification",
  "Basi Pilates Certification",
  "Peak Pilates Certification",
  "Balanced Body Certification",
  "Polestar Pilates Certification",
  "Fletcher Pilates Certification",
]

type CertificationFile = {
  name: string
  url: string
  uploadedAt: string
}

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<string[]>([])
  const [selectedCert, setSelectedCert] = useState<string>("")
  const [customCert, setCustomCert] = useState<string>("")
  const [certFiles, setCertFiles] = useState<CertificationFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadCertifications()
  }, [])

  const loadCertifications = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("instructor_profiles")
        .select("certifications, qualifications_url")
        .eq("id", user.id)
        .single()

      if (error) throw error

      setCertifications(data?.certifications || [])

      // Parse qualifications URL if it's stored as JSON array
      if (data?.qualifications_url) {
        try {
          const files =
            typeof data.qualifications_url === "string" ? JSON.parse(data.qualifications_url) : data.qualifications_url
          if (Array.isArray(files)) {
            setCertFiles(files)
          }
        } catch (e) {
          console.log("[v0] qualifications_url is not JSON, treating as single file")
        }
      }
    } catch (error) {
      console.error("[v0] Error loading certifications:", error)
      toast({
        title: "Error",
        description: "Failed to load certifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addCertification = async () => {
    const newCert = selectedCert === "custom" ? customCert : selectedCert
    if (!newCert || certifications.includes(newCert)) return

    const updatedCerts = [...certifications, newCert]

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from("instructor_profiles")
        .update({ certifications: updatedCerts })
        .eq("id", user.id)

      if (error) throw error

      setCertifications(updatedCerts)
      setSelectedCert("")
      setCustomCert("")
      toast({
        title: "Success",
        description: "Certification added successfully",
      })
    } catch (error) {
      console.error("[v0] Error adding certification:", error)
      toast({
        title: "Error",
        description: "Failed to add certification",
        variant: "destructive",
      })
    }
  }

  const removeCertification = async (cert: string) => {
    const updatedCerts = certifications.filter((c) => c !== cert)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from("instructor_profiles")
        .update({ certifications: updatedCerts })
        .eq("id", user.id)

      if (error) throw error

      setCertifications(updatedCerts)
      toast({
        title: "Success",
        description: "Certification removed",
      })
    } catch (error) {
      console.error("[v0] Error removing certification:", error)
      toast({
        title: "Error",
        description: "Failed to remove certification",
        variant: "destructive",
      })
    }
  }

  const uploadCertificate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { url } = await response.json()

      const newFile: CertificationFile = {
        name: file.name,
        url,
        uploadedAt: new Date().toISOString(),
      }

      const updatedFiles = [...certFiles, newFile]
      setCertFiles(updatedFiles)

      // Save to database
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("instructor_profiles")
        .update({ qualifications_url: JSON.stringify(updatedFiles) })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Certificate uploaded successfully",
      })

      // Reset input
      e.target.value = ""
    } catch (error) {
      console.error("[v0] Error uploading certificate:", error)
      toast({
        title: "Error",
        description: "Failed to upload certificate",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const removeCertificateFile = async (index: number) => {
    const updatedFiles = certFiles.filter((_, i) => i !== index)
    setCertFiles(updatedFiles)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from("instructor_profiles")
        .update({ qualifications_url: JSON.stringify(updatedFiles) })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Certificate file removed",
      })
    } catch (error) {
      console.error("[v0] Error removing certificate:", error)
      toast({
        title: "Error",
        description: "Failed to remove certificate",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Certifications</h1>
          <p className="text-muted-foreground mt-2">
            Manage your Pilates certifications and upload supporting documents
          </p>
        </div>

        {/* Add Certification */}
        <Card>
          <CardHeader>
            <CardTitle>Add Certification</CardTitle>
            <CardDescription>Select from common certifications or add a custom one</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="certification">Certification Type</Label>
                <Select value={selectedCert} onValueChange={setSelectedCert}>
                  <SelectTrigger id="certification">
                    <SelectValue placeholder="Select certification" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_CERTIFICATIONS.map((cert) => (
                      <SelectItem key={cert} value={cert}>
                        {cert}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Certification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedCert === "custom" && (
                <div className="flex-1">
                  <Label htmlFor="custom-cert">Custom Certification Name</Label>
                  <Input
                    id="custom-cert"
                    placeholder="Enter certification name"
                    value={customCert}
                    onChange={(e) => setCustomCert(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-end">
                <Button
                  onClick={addCertification}
                  disabled={!selectedCert || (selectedCert === "custom" && !customCert)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Your Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {certifications.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert) => (
                  <Badge key={cert} variant="secondary" className="text-sm py-2 px-3 pr-1">
                    {cert}
                    <button
                      onClick={() => removeCertification(cert)}
                      className="ml-2 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No certifications added yet</p>
            )}
          </CardContent>
        </Card>

        {/* Upload Certificate Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Certificate Documents</CardTitle>
            <CardDescription>Upload scanned copies of your certification documents (PDF or images)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cert-upload" className="cursor-pointer">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Click to upload certificate</p>
                  <p className="text-xs text-muted-foreground">PDF, JPG, or PNG (max 10MB)</p>
                </div>
              </Label>
              <Input
                id="cert-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={uploadCertificate}
                disabled={uploading}
              />
            </div>

            {uploading && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading...</span>
              </div>
            )}

            {certFiles.length > 0 && (
              <div className="space-y-2">
                {certFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeCertificateFile(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {certFiles.length === 0 && !uploading && (
              <p className="text-sm text-muted-foreground text-center py-4">No certificate documents uploaded</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
