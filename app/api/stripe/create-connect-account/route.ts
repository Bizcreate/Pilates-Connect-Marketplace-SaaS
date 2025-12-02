import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an instructor
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_type, display_name, email")
      .eq("id", user.id)
      .single()

    if (profile?.account_type !== "instructor") {
      return NextResponse.json({ error: "Only instructors can connect Stripe accounts" }, { status: 403 })
    }

    // Check if they already have a Stripe account
    const { data: instructorProfile } = await supabase
      .from("instructor_profiles")
      .select("stripe_account_id")
      .eq("id", user.id)
      .single()

    if (instructorProfile?.stripe_account_id) {
      return NextResponse.json({ error: "Stripe account already exists" }, { status: 400 })
    }

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: "express",
      country: "AU", // Australia - change if needed
      email: profile.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: {
        instructor_id: user.id,
        platform: "pilates_connect",
      },
    })

    // Save Stripe account ID to database
    const { error: updateError } = await supabase
      .from("instructor_profiles")
      .update({
        stripe_account_id: account.id,
        stripe_onboarding_complete: false,
        stripe_charges_enabled: false,
        stripe_payouts_enabled: false,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Failed to save Stripe account ID:", updateError)
      return NextResponse.json({ error: "Failed to save account" }, { status: 500 })
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/instructor/connect-stripe`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/instructor/connect-stripe/success`,
      type: "account_onboarding",
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error: any) {
    console.error("Stripe Connect account creation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
