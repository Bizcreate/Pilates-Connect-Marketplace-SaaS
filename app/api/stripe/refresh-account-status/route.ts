import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get instructor's Stripe account ID
    const { data: instructorProfile } = await supabase
      .from("instructor_profiles")
      .select("stripe_account_id")
      .eq("id", user.id)
      .single()

    if (!instructorProfile?.stripe_account_id) {
      return NextResponse.json({ error: "No Stripe account found" }, { status: 404 })
    }

    // Fetch account details from Stripe
    const account = await stripe.accounts.retrieve(instructorProfile.stripe_account_id)

    // Update database with current status
    const { error: updateError } = await supabase
      .from("instructor_profiles")
      .update({
        stripe_onboarding_complete: account.details_submitted,
        stripe_charges_enabled: account.charges_enabled,
        stripe_payouts_enabled: account.payouts_enabled,
      })
      .eq("id", user.id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
    }

    return NextResponse.json({
      onboarding_complete: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
    })
  } catch (error: any) {
    console.error("Account status refresh error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
