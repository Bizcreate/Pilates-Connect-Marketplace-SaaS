"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, XCircle, Award, ExternalLink, User, FileText } from "lucide-react"
import Link from "next/link"

interface InstructorWithCertifications {
  id: string
  user_id: string
  full_name: string
  email: string
  certification_documents: any[]
}

export default function AdminCertificationReview() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [instructors, setInstructors] = useState<InstructorWithCertifications[]>([])
  const [rejectionReason, setRejectionReason] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/auth/login")
        return
      }

      const { data: adminData } = await supabase.from("admin_users").select("*").eq("user_id", session.user.id).single()

      if (!adminData) {
        router.push("/instructor/dashboard")
        toast({
          title: "Access Denied",
          description: "You do not have admin permissions",
          variant: "destructive",
        })
        return
      }

      setIsAdmin(true)
      await loadInstructors()
    } catch (error) {
      console.error("[v0] Admin: Error checking admin status:", error)
      router.push("/instructor/dashboard")
    }
  }

  async function loadInstructors() {
    try {
      const { data, error } = await supabase
        .from("instructor_profiles")
        .select("id, user_id, full_name, email, certification_documents")
        .not("certification_documents", "is", null)

      if (error) throw error

      const instructorsWithDocs = data.filter(
        (instructor: any) =>
          Array.isArray(instructor.certification_documents) && instructor.certification_documents.length > 0,
      )

      setInstructors(instructorsWithDocs)
    } catch (error) {
      console.error("[v0] Admin: Error loading certifications:", error)
      toast({
        title: "Error",
        description: "Failed to load certifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(instructorId: string, docIndex: number) {
    setProcessingId(`${instructorId}-${docIndex}`)

    try {
      const instructor = instructors.find((i) => i.id === instructorId)
      if (!instructor) return

      const updatedDocs = [...instructor.certification_documents]
      updatedDocs[docIndex] = {
        ...updatedDocs[docIndex],
        status: "approved",
        verified_at: new Date().toISOString(),
        verified_by: (await supabase.auth.getSession()).data.session?.user.id,
      }

      const { error } = await supabase
        .from("instructor_profiles")
        .update({ certification_documents: updatedDocs })
        .eq("id", instructorId)

      if (error) throw error

      toast({
        title: "Certification Approved",
        description: "The certification has been verified",
      })

      await loadInstructors()
    } catch (error) {
      console.error("[v0] Admin: Error approving certification:", error)
      toast({
        title: "Error",
        description: "Failed to approve certification",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  async function handleReject(instructorId: string, docIndex: number) {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }

    setProcessingId(`${instructorId}-${docIndex}`)

    try {
      const instructor = instructors.find((i) => i.id === instructorId)
      if (!instructor) return

      const updatedDocs = [...instructor.certification_documents]
      updatedDocs[docIndex] = {
        ...updatedDocs[docIndex],
        status: "rejected",
        rejection_reason: rejectionReason,
        verified_at: new Date().toISOString(),
        verified_by: (await supabase.auth.getSession()).data.session?.user.id,
      }

      const { error } = await supabase
        .from("instructor_profiles")
        .update({ certification_documents: updatedDocs })
        .eq("id", instructorId)

      if (error) throw error

      toast({
        title: "Certification Rejected",
        description: "The instructor will be notified",
      })

      setRejectionReason("")
      await loadInstructors()
    } catch (error) {
      console.error("[v0] Admin: Error rejecting certification:", error)
      toast({
        title: "Error",
        description: "Failed to reject certification",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const pendingDocs = instructors.filter((i) => i.certification_documents.some((doc) => doc.status === "pending"))
  const approvedDocs = instructors.filter((i) => i.certification_documents.some((doc) => doc.status === "approved"))
  const rejectedDocs = instructors.filter((i) => i.certification_documents.some((doc) => doc.status === "rejected"))

  if (loading || !isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Certification Review</h1>
        <p className="text-muted-foreground">Review and verify instructor certifications</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingDocs.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedDocs.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedDocs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingDocs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending certifications to review</p>
              </CardContent>
            </Card>
          ) : (
            pendingDocs.map((instructor) => (
              <Card key={instructor.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5" />
                      <div>
                        <CardTitle>{instructor.full_name}</CardTitle>
                        <CardDescription>{instructor.email}</CardDescription>
                      </div>
                    </div>
                    <Link href={`/instructors/${instructor.user_id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {instructor.certification_documents
                    .filter((doc) => doc.status === "pending")
                    .map((doc, docIndex) => (
                      <div key={docIndex} className="border rounded-lg p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Type</p>
                            <p className="text-sm text-muted-foreground capitalize">{doc.type} Pilates</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Organization</p>
                            <p className="text-sm text-muted-foreground">{doc.issuing_organization}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Cert Number</p>
                            <p className="text-sm text-muted-foreground">{doc.certification_number}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Issue Date</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(doc.issue_date).toLocaleDateString()}
                            </p>
                          </div>
                          {doc.expiry_date && (
                            <div>
                              <p className="text-sm font-medium">Expiry Date</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(doc.expiry_date).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>

                        <Button variant="outline" className="w-full bg-transparent" asChild>
                          <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="w-4 h-4 mr-2" />
                            View Certificate Document
                          </a>
                        </Button>

                        <Textarea
                          placeholder="Rejection reason (required if rejecting)"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                        />

                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            onClick={() => handleApprove(instructor.id, docIndex)}
                            disabled={processingId === `${instructor.id}-${docIndex}`}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleReject(instructor.id, docIndex)}
                            disabled={processingId === `${instructor.id}-${docIndex}` || !rejectionReason.trim()}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedDocs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No approved certifications yet</p>
              </CardContent>
            </Card>
          ) : (
            approvedDocs.map((instructor) => (
              <Card key={instructor.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{instructor.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {instructor.certification_documents.filter((d) => d.status === "approved").length} verified
                        certification(s)
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedDocs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <XCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No rejected certifications</p>
              </CardContent>
            </Card>
          ) : (
            rejectedDocs.map((instructor) => (
              <Card key={instructor.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{instructor.full_name}</p>
                      <p className="text-sm text-muted-foreground">{instructor.email}</p>
                    </div>
                    <Badge variant="destructive">
                      <XCircle className="w-3 h-3 mr-1" />
                      Rejected
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
