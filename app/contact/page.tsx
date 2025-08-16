import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Leaf, Mail, Phone, MapPin, Send } from "lucide-react"

export default function Contact() {
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="font-serif font-bold text-4xl text-foreground mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">
            Get in touch with our team to learn more about environmental collaboration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="glass p-8">
            <h2 className="font-serif font-semibold text-2xl text-foreground mb-6">Send us a message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                    First Name
                  </label>
                  <Input id="firstName" placeholder="Arjun" />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                    Last Name
                  </label>
                  <Input id="lastName" placeholder="Patel" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <Input id="email" type="email" placeholder="arjun.patel@example.com" />
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-foreground mb-2">
                  Organization (Optional)
                </label>
                <Input id="organization" placeholder="Green Earth NGO" />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                  Subject
                </label>
                <Input id="subject" placeholder="Partnership Inquiry" />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  rows={6}
                  placeholder="Tell us about your environmental initiative or how we can help..."
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="glass p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-lg text-foreground">Email Us</h3>
                  <p className="text-muted-foreground">We'll respond within 24 hours</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-foreground">General: info@ecocollaborate.org</p>
                <p className="text-foreground">Support: support@ecocollaborate.org</p>
                <p className="text-foreground">Partnerships: partnerships@ecocollaborate.org</p>
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-lg text-foreground">Call Us</h3>
                  <p className="text-muted-foreground">Monday to Friday, 9 AM - 6 PM IST</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-foreground">India: +91 98765 43210</p>
                <p className="text-foreground">Support: +91 80 2345 6789</p>
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-lg text-foreground">Visit Us</h3>
                  <p className="text-muted-foreground">Our headquarters</p>
                </div>
              </div>
              <div>
                <p className="text-foreground">
                  EcoCollaborate Headquarters
                  <br />
                  Green Tech Park, Block A<br />
                  Bangalore, Karnataka 560001
                  <br />
                  India
                </p>
              </div>
            </Card>

            <Card className="glass p-6">
              <h3 className="font-serif font-semibold text-lg text-foreground mb-4">Office Hours</h3>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 6:00 PM IST</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 2:00 PM IST</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
