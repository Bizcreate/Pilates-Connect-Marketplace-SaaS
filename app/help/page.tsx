import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { MessageSquare, Mail, Phone } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Help & FAQ | Pilates Connect",
  description:
    "Get answers to common questions about Pilates Connect. Learn how to post jobs, find instructors, and make the most of our platform.",
  keywords: "pilates help, faq, support, how to use pilates connect, instructor help, studio help",
}

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-12 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Help & FAQ</h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions and learn how to use Pilates Connect
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-12">
            <Card>
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Live Chat</CardTitle>
                <CardDescription>Chat with our support team</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Start Chat</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Mail className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Email Support</CardTitle>
                <CardDescription>Get help via email</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <a href="mailto:support@pilatesconnect.com.au">Send Email</a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Phone className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Phone Support</CardTitle>
                <CardDescription>Call us during business hours</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <a href="tel:+61234567890">Call Now</a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">For Instructors</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I create an instructor profile?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">Creating your instructor profile is easy! Follow these steps:</p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Click "Sign Up" and select "Instructor"</li>
                      <li>Fill in your basic information (name, email, location)</li>
                      <li>Add your certifications and experience</li>
                      <li>Upload your CV and insurance documents</li>
                      <li>Add photos and videos showcasing your teaching style</li>
                      <li>Set your availability and hourly rate</li>
                    </ol>
                    <p className="mt-4">
                      Your profile will be visible to studios once you complete all required fields.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>How do I apply for jobs?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">Browse available jobs and apply with just a few clicks:</p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Go to the "Jobs" page</li>
                      <li>Use filters to find jobs that match your skills and location</li>
                      <li>Click on a job to view full details</li>
                      <li>Click "Apply Now" and write a brief cover letter</li>
                      <li>Track your applications in your dashboard</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>How do cover requests work?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">Cover requests are urgent opportunities to fill in for other instructors:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Studios post cover requests when they need immediate help</li>
                      <li>You'll see available cover requests in your dashboard</li>
                      <li>Click "Accept Cover" to take the opportunity</li>
                      <li>The studio will be notified and will contact you with details</li>
                      <li>Cover requests are typically paid at your standard rate or higher</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>How do I post my availability?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">Let studios know when you're available to work:</p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Go to your dashboard and click "Post Availability"</li>
                      <li>Select the date and time range you're available</li>
                      <li>Add any notes about equipment or class types you prefer</li>
                      <li>Studios can see your availability and contact you directly</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>How does the referral program work?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">Earn rewards by referring other instructors or studios:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Get your unique referral link from your dashboard</li>
                      <li>Share it with instructors or studios you know</li>
                      <li>Earn $50 for every successful referral who signs up</li>
                      <li>Earn $100 when they complete their first job or hire</li>
                      <li>Track your referrals and earnings in the Referrals tab</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">For Studios</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="studio-1">
                  <AccordionTrigger>How do I post a job?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">Post jobs to find qualified Pilates instructors:</p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Click "Post Job" from your dashboard</li>
                      <li>Fill in job details (title, type, location, compensation)</li>
                      <li>Describe the role and requirements</li>
                      <li>Set application deadline and start date</li>
                      <li>Review and publish your job posting</li>
                    </ol>
                    <p className="mt-4">Your job will be visible to all instructors on the platform immediately.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="studio-2">
                  <AccordionTrigger>How do I request urgent cover?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">Need someone to cover a class at short notice?</p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Click "Request Cover" from your dashboard</li>
                      <li>Enter the class details (date, time, type)</li>
                      <li>Add any special requirements or notes</li>
                      <li>Available instructors will see your request immediately</li>
                      <li>Accept an instructor's offer and confirm the booking</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="studio-3">
                  <AccordionTrigger>How do I review applications?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">Manage applications through your hiring pipeline:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>View all applications in your dashboard</li>
                      <li>Click on an application to see the instructor's full profile</li>
                      <li>Move candidates through stages: Applied → Interview → Offer → Hired</li>
                      <li>Message instructors directly through the platform</li>
                      <li>Accept or reject applications with one click</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="studio-4">
                  <AccordionTrigger>What are the subscription plans?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">Choose the plan that fits your studio's needs:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>
                        <strong>Basic (Free):</strong> Post 1 job per month, basic search, limited messaging
                      </li>
                      <li>
                        <strong>Professional ($49/month):</strong> Unlimited jobs, advanced search, priority support
                      </li>
                      <li>
                        <strong>Enterprise ($149/month):</strong> Multiple locations, team accounts, analytics, API
                        access
                      </li>
                    </ul>
                    <p className="mt-4">
                      <Link href="/pricing" className="text-primary hover:underline">
                        View detailed pricing →
                      </Link>
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="studio-5">
                  <AccordionTrigger>How do I find the right instructor?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">Use our advanced search and filters to find perfect matches:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Search by location, certifications, and specializations</li>
                      <li>Filter by experience level and availability</li>
                      <li>View instructor profiles with videos and photos</li>
                      <li>Check ratings and reviews from other studios</li>
                      <li>Contact instructors directly through messaging</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Account & Billing</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="billing-1">
                  <AccordionTrigger>How do I upgrade my subscription?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">Upgrade your plan anytime:</p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Go to Settings → Subscription</li>
                      <li>Choose your new plan</li>
                      <li>Enter payment details</li>
                      <li>Your upgrade takes effect immediately</li>
                    </ol>
                    <p className="mt-4">
                      You'll only be charged the prorated difference for the current billing period.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="billing-2">
                  <AccordionTrigger>Can I cancel my subscription?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">Yes, you can cancel anytime:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Go to Settings → Subscription</li>
                      <li>Click "Cancel Subscription"</li>
                      <li>You'll retain access until the end of your billing period</li>
                      <li>No refunds for partial months</li>
                      <li>You can reactivate anytime</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="billing-3">
                  <AccordionTrigger>How do I update my payment method?</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Go to Settings → Billing and click "Update Payment Method". You can add a new card or update your
                      existing payment details.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="billing-4">
                  <AccordionTrigger>Is my payment information secure?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">Yes, absolutely. We use Stripe for payment processing, which is:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>PCI DSS Level 1 certified (highest security standard)</li>
                      <li>Used by millions of businesses worldwide</li>
                      <li>Encrypted with bank-level security</li>
                      <li>We never store your full card details on our servers</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Technical Support</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="tech-1">
                  <AccordionTrigger>I can't log in to my account</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">Try these steps:</p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Check that you're using the correct email address</li>
                      <li>Click "Forgot Password" to reset your password</li>
                      <li>Check your spam folder for the reset email</li>
                      <li>Clear your browser cache and cookies</li>
                      <li>Try a different browser or device</li>
                    </ol>
                    <p className="mt-4">
                      Still having issues? Contact support at{" "}
                      <a href="mailto:support@pilatesconnect.com.au" className="text-primary hover:underline">
                        support@pilatesconnect.com.au
                      </a>
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tech-2">
                  <AccordionTrigger>How do I upload documents and photos?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">Upload files from your profile page:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Supported formats: PDF, DOC, DOCX for documents</li>
                      <li>Supported formats: JPG, PNG for images</li>
                      <li>Supported formats: MP4, MOV for videos</li>
                      <li>Maximum file size: 10MB per file</li>
                      <li>Click the upload area or drag and drop files</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tech-3">
                  <AccordionTrigger>Is there a mobile app?</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Not yet, but our website is fully mobile-responsive and works great on all devices. A dedicated
                      mobile app is coming soon! You can add our website to your home screen for a native app-like
                      experience.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>
          </div>

          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Still need help?</CardTitle>
              <CardDescription>Our support team is here to assist you</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="flex-1">
                <a href="mailto:support@pilatesconnect.com.au">Email Support</a>
              </Button>
              <Button variant="outline" asChild className="flex-1 bg-transparent">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
