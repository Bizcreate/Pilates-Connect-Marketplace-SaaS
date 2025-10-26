"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteHeader } from "@/components/site-header"
import { Users, Briefcase, DollarSign, TrendingUp, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { mockPlatformStats, mockInstructors, mockStudios, mockJobs, mockCoverRequests } from "@/lib/mock-data"

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState(mockPlatformStats)

  useEffect(() => {
    async function checkAdminAccess() {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Check if user is admin
      const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

      if (profile?.user_type !== "admin") {
        router.push("/")
        return
      }

      setIsAdmin(true)
      setLoading(false)
    }

    checkAdminAccess()
  }, [router])

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
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform overview and management</p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    <p className="text-xs text-green-600 mt-1">+{stats.newUsersThisMonth} this month</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Jobs</p>
                    <p className="text-2xl font-bold">{stats.activeJobs}</p>
                    <p className="text-xs text-muted-foreground mt-1">Across all studios</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Covers</p>
                    <p className="text-2xl font-bold">{stats.completedCovers}</p>
                    <p className="text-xs text-muted-foreground mt-1">All time</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                    <p className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      +12% vs last month
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="jobs">Jobs & Covers</TabsTrigger>
              <TabsTrigger value="verifications">
                Verifications
                {stats.pendingVerifications > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {stats.pendingVerifications}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Instructors ({stats.activeInstructors})</CardTitle>
                    <CardDescription>Manage instructor accounts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockInstructors.slice(0, 5).map((instructor) => (
                        <div key={instructor.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <img
                              src={instructor.avatar_url || "/placeholder.svg"}
                              alt={instructor.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium">{instructor.name}</p>
                              <p className="text-sm text-muted-foreground">{instructor.location}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                            <Button size="sm" variant="ghost">
                              Suspend
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Studios ({stats.activeStudios})</CardTitle>
                    <CardDescription>Manage studio accounts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockStudios.map((studio) => (
                        <div key={studio.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <img
                              src={studio.avatar_url || "/placeholder.svg"}
                              alt={studio.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium">{studio.name}</p>
                              <p className="text-sm text-muted-foreground">{studio.location}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                            <Button size="sm" variant="ghost">
                              Suspend
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Jobs & Covers Tab */}
            <TabsContent value="jobs" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Job Postings</CardTitle>
                    <CardDescription>Monitor permanent positions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockJobs.map((job) => (
                        <div key={job.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{job.title}</p>
                              <p className="text-sm text-muted-foreground">{job.studio_name}</p>
                            </div>
                            <Badge>{job.applications} applications</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Review
                            </Button>
                            <Button size="sm" variant="ghost">
                              Flag
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cover Requests</CardTitle>
                    <CardDescription>Monitor urgent cover needs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockCoverRequests.map((cover) => (
                        <div key={cover.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{cover.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {cover.date} at {cover.time}
                              </p>
                            </div>
                            <Badge variant={cover.status === "urgent" ? "destructive" : "secondary"}>
                              {cover.status}
                            </Badge>
                          </div>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Verifications Tab */}
            <TabsContent value="verifications">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Verifications</CardTitle>
                  <CardDescription>Review and approve certifications and insurance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        id: 1,
                        name: "Jessica Brown",
                        type: "Reformer Certification",
                        submitted: "2 days ago",
                      },
                      { id: 2, name: "Michael Lee", type: "Insurance Document", submitted: "3 days ago" },
                      { id: 3, name: "Emma Wilson", type: "Mat Certification", submitted: "5 days ago" },
                      { id: 4, name: "Core Studio", type: "Business License", submitted: "1 week ago" },
                      { id: 5, name: "David Chen", type: "First Aid Certificate", submitted: "1 week ago" },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Clock className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.type} • Submitted {item.submitted}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="ghost">
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Growth</CardTitle>
                    <CardDescription>User acquisition trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { month: "October", instructors: 23, studios: 8 },
                        { month: "September", instructors: 31, studios: 12 },
                        { month: "August", instructors: 28, studios: 9 },
                        { month: "July", instructors: 25, studios: 7 },
                      ].map((data) => (
                        <div key={data.month} className="flex items-center justify-between p-3 border rounded-lg">
                          <p className="font-medium">{data.month}</p>
                          <div className="flex gap-4 text-sm">
                            <span className="text-muted-foreground">{data.instructors} instructors</span>
                            <span className="text-muted-foreground">{data.studios} studios</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                    <CardDescription>Platform performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium">API Status</span>
                        </div>
                        <Badge variant="default">Operational</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium">Database</span>
                        </div>
                        <Badge variant="default">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                          <span className="font-medium">Email Service</span>
                        </div>
                        <Badge variant="secondary">Degraded</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium">Payment Processing</span>
                        </div>
                        <Badge variant="default">Operational</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
