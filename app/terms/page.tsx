import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Pilates Connect",
  description: "Read the terms and conditions for using Pilates Connect's platform and services.",
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-neutral max-w-none space-y-6">
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Pilates Connect, you agree to be bound by these Terms of Service and all applicable
              laws and regulations. If you do not agree with any of these terms, you are prohibited from using this
              platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
            <p>To use certain features of our platform, you must create an account. You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Post false, misleading, or fraudulent information</li>
              <li>Impersonate any person or entity</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Interfere with or disrupt the platform's operation</li>
              <li>Use automated systems to access the platform without permission</li>
              <li>Collect or harvest user information without consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Job Postings and Applications</h2>
            <p>
              <strong>For Studios:</strong> You represent that all job postings are legitimate, accurate, and comply
              with employment laws. You are responsible for your hiring decisions and employment relationships.
            </p>
            <p>
              <strong>For Instructors:</strong> You represent that your credentials, certifications, and experience are
              accurate and current. You are responsible for maintaining valid certifications and insurance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Payments and Subscriptions</h2>
            <p>
              Studios subscribing to paid plans agree to pay all fees as described in the pricing page. Fees are
              non-refundable except as required by law. We reserve the right to change our fees with 30 days notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p>
              The platform and its content, features, and functionality are owned by Pilates Connect and are protected
              by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or
              create derivative works without our permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
            <p>
              The platform is provided "as is" and "as available" without warranties of any kind. We do not guarantee
              that the platform will be uninterrupted, secure, or error-free. We do not verify the accuracy of user
              information or guarantee employment outcomes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Pilates Connect shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising from your use of the platform. Our total liability
              shall not exceed the amount you paid us in the past 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Pilates Connect from any claims, damages, losses, liabilities,
              and expenses arising from your use of the platform or violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time for any reason, including violation
              of these terms. Upon termination, your right to use the platform will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of Victoria, Australia, without
              regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of material changes via email
              or platform notification. Continued use after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us at:
              <br />
              <strong>Email:</strong> legal@pilatesconnect.com.au
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
