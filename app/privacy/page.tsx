import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Leaf } from "lucide-react"

export default function PrivacyPolicy() {
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
          <h1 className="font-serif font-bold text-4xl text-foreground mb-4">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">Last updated: December 2024</p>
        </div>

        <Card className="glass p-8 lg:p-12">
          <div className="prose prose-lg max-w-none">
            <h2 className="font-serif font-semibold text-2xl text-foreground mb-4">Information We Collect</h2>
            <p className="text-muted-foreground mb-6">
              At EcoCollaborate, we collect information you provide directly to us, such as when you create an account,
              participate in environmental projects, or contact us for support. This includes your name, email address,
              organization details, and project contributions.
            </p>

            <h2 className="font-serif font-semibold text-2xl text-foreground mb-4">How We Use Your Information</h2>
            <p className="text-muted-foreground mb-6">
              We use the information we collect to provide, maintain, and improve our environmental collaboration
              platform. This includes facilitating connections between governments, NGOs, researchers, and communities,
              tracking environmental impact metrics, and providing personalized dashboards for different user roles.
            </p>

            <h2 className="font-serif font-semibold text-2xl text-foreground mb-4">Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground mb-6">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your
              consent, except as described in this policy. We may share aggregated, non-personally identifiable
              information about environmental impact metrics to promote transparency in climate action initiatives.
            </p>

            <h2 className="font-serif font-semibold text-2xl text-foreground mb-4">Data Security</h2>
            <p className="text-muted-foreground mb-6">
              We implement appropriate security measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction. This includes encryption of sensitive data and regular
              security audits of our platform infrastructure.
            </p>

            <h2 className="font-serif font-semibold text-2xl text-foreground mb-4">Your Rights</h2>
            <p className="text-muted-foreground mb-6">
              You have the right to access, update, or delete your personal information at any time. You can also
              opt-out of certain communications and data processing activities. To exercise these rights, please contact
              us using the information provided below.
            </p>

            <h2 className="font-serif font-semibold text-2xl text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at privacy@ecocollaborate.org or
              through our contact page. We are committed to addressing your concerns and maintaining the highest
              standards of data protection.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
