"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ScheduleCreationForm } from "@/components/schedule-creation-form"
import { ScheduleListView } from "@/components/schedule-list-view"
import { AlertCircle, Loader2, Plus } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { RecurringSchedule } from "@/lib/types"

export default function RecurringSchedulesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [studioId, setStudioId] = useState<string | null>(null)
  const [schedules, setSchedules] = useState<RecurringSchedule[]>([])
  const [instructors, setInstructors] = useState<Array<{ id: string; name: string }>>([])
  const [activeTab, setActiveTab] = useState("list")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .maybeSingle()

      if (!profileData || profileData.user_type !== "studio") {
        router.push("/studio/dashboard")
        return
      }

      setStudioId(user.id)

      // For now, we'll use mock data since Supabase is paused
      // Once DB is live, replace with real query
      setSchedules([])

      // Load instructor list
      // Mock data - replace with real query when DB is available
      setInstructors([
        { id: "1", name: "Sarah Johnson" },
        { id: "2", name: "Emma Wilson" },
        { id: "3", name: "Jessica Lee" },
      ])

      setError(null)
    } catch (err) {
      console.error("[v0] Error loading data:", err)
      setError("Failed to load schedules. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSchedule = async (schedule: Omit<RecurringSchedule, "id" | "created_at" | "updated_at">) => {
    if (!studioId) return

    try {
      setIsSubmitting(true)

      // Once DB is live, implement real submission:
      // const { data, error } = await supabase
      //   .from("recurring_schedules")
      //   .insert([{ ...schedule, studio_id: studioId }])
      //   .select()

      // For now, add mock data
      const mockSchedule: RecurringSchedule = {
        id: Date.now().toString(),
        ...schedule,
        studio_id: studioId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setSchedules((prev) => [...prev, mockSchedule])
      setActiveTab("list")
      setError(null)
    } catch (err) {
      console.error("[v0] Error creating schedule:", err)
      setError("Failed to create schedule. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) {
      return
    }

    try {
      // Once DB is live, implement real deletion:
      // const { error } = await supabase
      //   .from("recurring_schedules")
      //   .delete()
      //   .eq("id", scheduleId)

      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId))
      setError(null)
    } catch (err) {
      console.error("[v0] Error deleting schedule:", err)
      setError("Failed to delete schedule. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading schedules...</p>
          </div>
        </div>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container max-w-6xl py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Recurring Schedules</h1>
            <p className="mt-2 text-muted-foreground">Manage your studio's recurring class schedules</p>
          </div>

          {error && (
            <Card className="mb-6 border-destructive/50 bg-destructive/5">
              <CardContent className="flex gap-3 pt-6">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-destructive">{error}</p>
                  <Button variant="link" size="sm" className="mt-1 h-auto p-0" onClick={loadData}>
                    Try again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="list" className="flex gap-2">
                Schedules ({schedules.length})
              </TabsTrigger>
              <TabsTrigger value="create" className="flex gap-2">
                <Plus className="h-4 w-4" />
                Create New
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <ScheduleListView schedules={schedules} onDelete={handleDeleteSchedule} isLoading={isSubmitting} />
            </TabsContent>

            <TabsContent value="create">
              <ScheduleCreationForm
                studioId={studioId || ""}
                instructors={instructors}
                onSubmit={handleCreateSchedule}
                isLoading={isSubmitting}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
