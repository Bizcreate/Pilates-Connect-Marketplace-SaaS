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

    // Create new account link
    const accountLink = await stripe.accountLinks.create({
      account: instructorProfile.stripe_account_id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/instructor/connect-stripe`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/instructor/connect-stripe/success`,
      type: "account_onboarding",
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error: any) {
    console.error("Account link creation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
