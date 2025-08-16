import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Leaf } from "lucide-react"

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-serif font-bold text-xl text-foreground">EcoCollaborate</span>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="font-serif font-bold text-4xl text-foreground mb-4">Terms of Service</h1>
          <p className="text-lg text-muted-foreground">Last updated: December 2024</p>
        </div>

        <Card className="glass p-8 lg:p-12">
          <div className="prose prose-lg max-w-none">
            <h2 className="font-serif font-semibold text-2xl text-foreground mb-4">Acceptance of Terms</h2>
            <p className="text-muted-foreground mb-6">
              By accessing and using EcoCollaborate, you accept and agree to be bound by the terms and provision of this
              agreement. If you do not agree to abide by the above, please do not use this service. Our platform is
              designed to facilitate environmental collaboration between governments, NGOs, researchers, and
              communities.
            </p>

            <h2 className="font-serif font-semibold text-2xl text-foreground mb-4">User Responsibilities</h2>
            <p className="text-muted-foreground mb-6">
              Users are responsible for maintaining the confidentiality of their account information and for all
              activities that occur under their account. You agree to provide accurate, current, and complete
              information about environmental projects and initiatives. Users must not misuse the platform for any
              illegal or unauthorized purpose.
            </p>

            <h2 className="font-serif font-semibold text-2xl text-foreground mb-4">Platform Usage</h2>
            <p className="text-muted-foreground mb-6">
              EcoCollaborate provides tools for environmental data sharing, project collaboration, and impact tracking.
              Users may access role-specific dashboards, participate in environmental initiatives, and contribute to
              sustainability metrics. The platform is intended for legitimate environmental conservation and climate
              action purposes only.
            </p>

            <h2 className="font-serif font-semibold text-2xl text-foreground mb-4">Intellectual Property</h2>
            <p className="text-muted-foreground mb-6">
              The service and its original content, features, and functionality are and will remain the exclusive
              property of EcoCollaborate and its licensors. Environmental data and research shared on the platform
              remains the property of the contributing organizations, subject to agreed-upon sharing permissions for
              collaborative purposes.
            </p>

            <h2 className="font-serif font-semibold text-2xl text-foreground mb-4">Data and Privacy</h2>
            <p className="text-muted-foreground mb-6">
              We are committed to protecting your privacy and handling environmental data responsibly. Our data
              practices are governed by our Privacy Policy, which forms part of these Terms of Service. Users consent to
              the collection and use of information in accordance with our Privacy Policy.
            </p>

            <h2 className="font-serif font-semibold text-2xl text-foreground mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground mb-6">
              EcoCollaborate shall not be liable for any indirect, incidental, special, consequential, or punitive
              damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
              resulting from your use of the service.
            </p>

            <h2 className="font-serif font-semibold text-2xl text-foreground mb-4">Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us at legal@ecocollaborate.org or
              through our contact page. We reserve the right to update these terms at any time, and users will be
              notified of significant changes.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
