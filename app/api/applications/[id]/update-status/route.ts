import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const status = formData.get("status") as string

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase
      .from("job_applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw error

    return NextResponse.redirect(new URL("/studio/applicants", request.url))
  } catch (error: any) {
    console.error("[v0] Error updating application status:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
