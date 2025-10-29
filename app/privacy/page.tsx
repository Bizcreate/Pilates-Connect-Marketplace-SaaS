import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Pilates Connect",
  description: "Learn how Pilates Connect collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-neutral max-w-none space-y-6">
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p>
              Pilates Connect collects information that you provide directly to us when you create an account, post a
              job, apply for positions, or use our services. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name, email address, and contact information</li>
              <li>Professional credentials and certifications</li>
              <li>Work history and experience</li>
              <li>Studio information and business details</li>
              <li>Payment and billing information</li>
              <li>Communications and messages sent through our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Connect instructors with studios and job opportunities</li>
              <li>Process payments and transactions</li>
              <li>Send you updates, notifications, and marketing communications</li>
              <li>Respond to your requests and provide customer support</li>
              <li>Detect and prevent fraud and abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
            <p>We share your information in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>With Studios and Instructors:</strong> When you apply for a job or post a position, relevant
                profile information is shared with the other party
              </li>
              <li>
                <strong>Service Providers:</strong> We work with third-party service providers who help us operate our
                platform
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our
                rights
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
              over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and receive a copy of your personal information</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to or restrict certain processing of your information</li>
              <li>Withdraw consent where we rely on consent to process your information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to collect information about your browsing activities and
              to provide personalized content and advertising. You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
            <p>
              Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal
              information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
              policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
              <br />
              <strong>Email:</strong> privacy@pilatesconnect.com.au
              <br />
              <strong>Address:</strong> Melbourne, Victoria, Australia
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
