import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

const PLATFORM_FEE_PERCENTAGE = 0.05 // 5% platform fee

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { instructorId, bookingId, amount, bookingType, bookingDate } = body

    const supabase = await createServerClient()

    // Get studio user (the one making payment)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user is a studio
    const { data: studioProfile } = await supabase.from("profiles").select("account_type").eq("id", user.id).single()

    if (studioProfile?.account_type !== "studio") {
      return NextResponse.json({ error: "Only studios can make bookings" }, { status: 403 })
    }

    // Get instructor's Stripe account
    const { data: instructorProfile } = await supabase
      .from("instructor_profiles")
      .select("stripe_account_id, stripe_charges_enabled")
      .eq("id", instructorId)
      .single()

    if (!instructorProfile?.stripe_account_id || !instructorProfile.stripe_charges_enabled) {
      return NextResponse.json({ error: "Instructor cannot accept payments yet" }, { status: 400 })
    }

    // Get or create Stripe customer for studio
    const { data: studioStripeProfile } = await supabase
      .from("studio_profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()

    let customerId = studioStripeProfile?.stripe_customer_id

    if (!customerId) {
      const { data: profile } = await supabase.from("profiles").select("email, display_name").eq("id", user.id).single()

      const customer = await stripe.customers.create({
        email: profile?.email,
        name: profile?.display_name,
        metadata: {
          studio_id: user.id,
        },
      })

      customerId = customer.id

      // Save customer ID
      await supabase.from("studio_profiles").update({ stripe_customer_id: customerId }).eq("id", user.id)
    }

    // Calculate fees
    const amountInCents = Math.round(amount * 100)
    const platformFee = Math.round(amountInCents * PLATFORM_FEE_PERCENTAGE)
    const instructorAmount = amountInCents - platformFee

    // Create payment intent with destination charge
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "aud",
      customer: customerId,
      transfer_data: {
        destination: instructorProfile.stripe_account_id,
        amount: instructorAmount,
      },
      application_fee_amount: platformFee,
      metadata: {
        studio_id: user.id,
        instructor_id: instructorId,
        booking_id: bookingId,
        booking_type: bookingType,
        booking_date: bookingDate,
      },
      description: `Pilates booking with instructor`,
    })

    // Record payment in database
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        studio_id: user.id,
        instructor_id: instructorId,
        booking_id: bookingId,
        amount_total: amountInCents,
        platform_fee: platformFee,
        instructor_amount: instructorAmount,
        stripe_payment_intent_id: paymentIntent.id,
        status: "pending",
        booking_type: bookingType,
        booking_date: bookingDate,
      })
      .select()
      .single()

    if (paymentError) {
      console.error("Failed to record payment:", paymentError)
      // Payment intent created but not recorded - should handle this
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment?.id,
    })
  } catch (error: any) {
    console.error("Payment creation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
