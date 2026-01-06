"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Briefcase, TrendingUp, Shield, Award } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { AdminNav } from "@/components/admin-nav"
import Link from "next/link"

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState({
    totalInstructors: 0,
    totalStudios: 0,
    activeJobs: 0,
    pendingInsurance: 0,
    pendingCertifications: 0,
    totalApplications: 0,
  })

  useEffect(() => {
    checkAdminAccess()
  }, [])

  async function checkAdminAccess() {
    try {
      console.log("[v0] Admin: Checking admin access...")
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/auth/login")
        return
      }

      const { data: adminData, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", session.user.id)
        .single()

      if (error || !adminData) {
        console.log("[v0] Admin: User is not an admin")
        router.push("/instructor/dashboard")
        return
      }

      console.log("[v0] Admin: Access granted")
      setIsAdmin(true)
      await loadStats()
    } catch (error) {
      console.error("[v0] Admin: Error checking access:", error)
      router.push("/instructor/dashboard")
    }
  }

  async function loadStats() {
    try {
      const [instructorsRes, studiosRes, jobsRes] = await Promise.all([
        supabase
          .from("instructor_profiles")
          .select("id, insurance_documents, certification_documents", { count: "exact" }),
        supabase.from("studio_profiles").select("id", { count: "exact" }),
        supabase.from("jobs").select("id, status", { count: "exact" }).eq("status", "open"),
      ])

      // Count pending verifications
      let pendingInsurance = 0
      let pendingCertifications = 0

      if (instructorsRes.data) {
        instructorsRes.data.forEach((instructor: any) => {
          if (Array.isArray(instructor.insurance_documents)) {
            pendingInsurance += instructor.insurance_documents.filter((doc: any) => doc.status === "pending").length
          }
          if (Array.isArray(instructor.certification_documents)) {
            pendingCertifications += instructor.certification_documents.filter(
              (doc: any) => doc.status === "pending",
            ).length
          }
        })
      }

      const { count: applicationsCount } = await supabase
        .from("job_applications")
        .select("*", { count: "exact", head: true })

      setStats({
        totalInstructors: instructorsRes.count || 0,
        totalStudios: studiosRes.count || 0,
        activeJobs: jobsRes.count || 0,
        pendingInsurance,
        pendingCertifications,
        totalApplications: applicationsCount || 0,
      })

      console.log("[v0] Admin: Stats loaded:", {
        totalInstructors: instructorsRes.count,
        totalStudios: studiosRes.count,
        activeJobs: jobsRes.count,
        pendingInsurance,
        pendingCertifications,
      })
    } catch (error) {
      console.error("[v0] Admin: Error loading stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform overview and management</p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Instructors</p>
                    <p className="text-3xl font-bold">{stats.totalInstructors}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Studios</p>
                    <p className="text-3xl font-bold">{stats.totalStudios}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Jobs</p>
                    <p className="text-3xl font-bold">{stats.activeJobs}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Insurance Verification
                </CardTitle>
                <CardDescription>Review pending insurance documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats.pendingInsurance}</p>
                    <p className="text-sm text-muted-foreground">Pending review</p>
                  </div>
                  <Link href="/admin/insurance-review">
                    <Button>Review Now</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certification Verification
                </CardTitle>
                <CardDescription>Review pending certifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats.pendingCertifications}</p>
                    <p className="text-sm text-muted-foreground">Pending review</p>
                  </div>
                  <Link href="/admin/certification-review">
                    <Button>Review Now</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Activity</CardTitle>
                <CardDescription>Recent platform statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Applications</span>
                  <Badge variant="secondary">{stats.totalApplications}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Job Postings</span>
                  <Badge variant="secondary">{stats.activeJobs}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Verified Instructors</span>
                  <Badge variant="secondary">{stats.totalInstructors}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
                <CardDescription>Common admin tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/admin/instructors">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Manage Instructors
                  </Button>
                </Link>
                <Link href="/admin/studios">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Manage Studios
                  </Button>
                </Link>
                <Link href="/admin/jobs">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    View All Jobs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
