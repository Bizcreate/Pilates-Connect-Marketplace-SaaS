import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminNav } from "@/components/admin-nav"
import { InstructorsClient } from "../instructors-client"

export default async function AdminInstructors() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  const { data: adminData } = await supabase.from("admin_users").select("*").eq("user_id", session.user.id).single()

  if (!adminData) {
    redirect("/instructor/dashboard")
  }

  const { data: instructors } = await supabase
    .from("instructor_profiles")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="flex min-h-screen">
      <AdminNav />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Instructors</h1>
            <p className="text-muted-foreground">Manage all instructor accounts</p>
          </div>

          <InstructorsClient instructors={instructors || []} />
        </div>
      </main>
    </div>
  )
}
