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
import { CheckCircle2, XCircle, FileText, ExternalLink, User } from "lucide-react"
import Link from "next/link"

interface InstructorWithInsurance {
  id: string
  user_id: string
  full_name: string
  email: string
  insurance_documents: any[]
}

export default function AdminInsuranceReview() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [instructors, setInstructors] = useState<InstructorWithInsurance[]>([])
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

      // Check if user is admin
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
      console.log("[v0] Admin: Loading instructors with insurance...")

      const { data, error } = await supabase
        .from("instructor_profiles")
        .select("id, user_id, full_name, email, insurance_documents")
        .not("insurance_documents", "is", null)

      if (error) throw error

      // Filter instructors who have insurance documents
      const instructorsWithDocs = data.filter(
        (instructor: any) => Array.isArray(instructor.insurance_documents) && instructor.insurance_documents.length > 0,
      )

      setInstructors(instructorsWithDocs)
      console.log("[v0] Admin: Loaded", instructorsWithDocs.length, "instructors")
    } catch (error) {
      console.error("[v0] Admin: Error loading instructors:", error)
      toast({
        title: "Error",
        description: "Failed to load insurance documents",
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

      const updatedDocs = [...instructor.insurance_documents]
      updatedDocs[docIndex] = {
        ...updatedDocs[docIndex],
        status: "approved",
        verified_at: new Date().toISOString(),
        verified_by: (await supabase.auth.getSession()).data.session?.user.id,
      }

      const { error } = await supabase
        .from("instructor_profiles")
        .update({ insurance_documents: updatedDocs })
        .eq("id", instructorId)

      if (error) throw error

      toast({
        title: "Insurance Approved",
        description: "The insurance document has been verified",
      })

      await loadInstructors()
    } catch (error) {
      console.error("[v0] Admin: Error approving insurance:", error)
      toast({
        title: "Error",
        description: "Failed to approve insurance",
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

      const updatedDocs = [...instructor.insurance_documents]
      updatedDocs[docIndex] = {
        ...updatedDocs[docIndex],
        status: "rejected",
        rejection_reason: rejectionReason,
        verified_at: new Date().toISOString(),
        verified_by: (await supabase.auth.getSession()).data.session?.user.id,
      }

      const { error } = await supabase
        .from("instructor_profiles")
        .update({ insurance_documents: updatedDocs })
        .eq("id", instructorId)

      if (error) throw error

      toast({
        title: "Insurance Rejected",
        description: "The instructor will be notified",
      })

      setRejectionReason("")
      await loadInstructors()
    } catch (error) {
      console.error("[v0] Admin: Error rejecting insurance:", error)
      toast({
        title: "Error",
        description: "Failed to reject insurance",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const pendingDocs = instructors.filter((i) => i.insurance_documents.some((doc) => doc.status === "pending"))

  const approvedDocs = instructors.filter((i) => i.insurance_documents.some((doc) => doc.status === "approved"))

  const rejectedDocs = instructors.filter((i) => i.insurance_documents.some((doc) => doc.status === "rejected"))

  if (loading || !isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Insurance Document Review</h1>
        <p className="text-muted-foreground">Review and verify instructor insurance documentation</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Review ({pendingDocs.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedDocs.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedDocs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingDocs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending insurance documents to review</p>
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
                  {instructor.insurance_documents
                    .filter((doc) => doc.status === "pending")
                    .map((doc, docIndex) => (
                      <div key={docIndex} className="border rounded-lg p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Insurance Type</p>
                            <p className="text-sm text-muted-foreground capitalize">{doc.type.replace("-", " ")}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Provider</p>
                            <p className="text-sm text-muted-foreground">{doc.provider}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Policy Number</p>
                            <p className="text-sm text-muted-foreground">{doc.policy_number}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Valid Period</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(doc.issue_date).toLocaleDateString()} -{" "}
                              {new Date(doc.expiry_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <Button variant="outline" className="w-full bg-transparent" asChild>
                          <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="w-4 h-4 mr-2" />
                            View Insurance Certificate
                          </a>
                        </Button>

                        <div className="space-y-2">
                          <Textarea
                            placeholder="Rejection reason (required if rejecting)"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={3}
                          />
                        </div>

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
                <p>No approved insurance documents yet</p>
              </CardContent>
            </Card>
          ) : (
            approvedDocs.map((instructor) => (
              <Card key={instructor.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{instructor.full_name}</p>
                      <p className="text-sm text-muted-foreground">{instructor.email}</p>
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
                <p>No rejected insurance documents</p>
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
