import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertCircle, CheckCircle2, Lock, Eye, Users, FileText, MessageSquare, PhoneCall } from "lucide-react";
import { motion } from "framer-motion";

export default function SafetyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 to-transparent py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="px-4 py-2 mb-6 bg-primary/10 text-primary border-primary/20 rounded-full">
            Trust & Safety
          </Badge>
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">Your Safety Is Our Priority</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We've built multiple layers of protection into HelpChain to keep our community safe.
          </p>
        </div>
      </section>

      <div className="flex-1 container mx-auto px-4 py-20 space-y-20">
        {/* Verification */}
        <section>
          <h2 className="text-3xl font-heading font-bold mb-12 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" /> Identity & Verification
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Required Verification",
                desc: "All users must verify their email and phone number before posting or offering help.",
                items: ["Email verification", "Phone number verification", "Location confirmation"]
              },
              {
                title: "Optional Trust Badges",
                desc: "Add more verification to boost your credibility and access higher-value requests.",
                items: ["Government ID (NIN)", "Driver's License", "Passport", "Bank Account Verification"]
              },
              {
                title: "Background Screening",
                desc: "We perform automatic background checks on all helpers. Serious offenders are permanently banned.",
                items: ["Automated screening system", "Manual review for flags", "Regular re-screening"]
              },
              {
                title: "Profile Transparency",
                desc: "Every user's verification status is clearly displayed on their profile for full transparency.",
                items: ["Public rating display", "Verification badges visible", "Review history open"]
              }
            ].map((item, i) => (
              <Card key={i} className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-primary" /> {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                  <ul className="space-y-2">
                    {item.items.map((it, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Payment Safety */}
        <section className="bg-slate-50 dark:bg-zinc-900/50 rounded-2xl p-12">
          <h2 className="text-3xl font-heading font-bold mb-12 flex items-center gap-3">
            <Lock className="w-8 h-8 text-primary" /> Payment & Escrow Protection
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Escrow System</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground">Payment is never transferred directly between users. Instead, funds are held securely in our escrow system.</p>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
                  <p className="text-xs font-semibold text-green-700">✓ Funds are only released after task completion</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Dispute Resolution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground">If there's a disagreement, both parties can submit evidence. Our team reviews and resolves fairly within 48 hours.</p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-semibold text-blue-700">✓ Refund issued if helper fails to deliver</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Payment Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground">All payments processed through Korapay for PCI compliance and fraud protection.</p>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded border border-purple-200 dark:border-purple-800">
                  <p className="text-xs font-semibold text-purple-700">✓ SSL encrypted transactions</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Communication Safety */}
        <section>
          <h2 className="text-3xl font-heading font-bold mb-12 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" /> Safe Communication
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "In-App Messaging Only",
                desc: "All conversations happen within HelpChain. Never exchange phone numbers, emails, or social media until after you're comfortable.",
                icon: MessageSquare
              },
              {
                title: "Message Moderation",
                desc: "Our system automatically flags suspicious messages (threats, harassment, etc.) and alerts our support team.",
                icon: Eye
              },
              {
                title: "Block & Report",
                desc: "Uncomfortable with someone? Block them instantly. Report harassment and threats directly through the app.",
                icon: AlertCircle
              },
              {
                title: "Transparent History",
                desc: "All messages are timestamped and stored. In disputes, we can review the full conversation history.",
                icon: FileText
              }
            ].map((item, i) => (
              <Card key={i} className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <item.icon className="w-6 h-6 text-primary" /> {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Meeting Safety */}
        <section className="bg-primary/5 rounded-2xl p-12">
          <h2 className="text-3xl font-heading font-bold mb-8">Safe Meeting Tips</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            {[
              "Meet in public locations during daylight when possible",
              "Tell a friend or family member where you're going",
              "Share real-time location with someone you trust via phone",
              "Don't carry large amounts of cash - use digital payments",
              "Trust your instincts - if something feels off, cancel",
              "Ask for ID to verify the helper's identity",
              "Take photos/videos as proof of task completion",
              "Report any suspicious behavior immediately"
            ].map((tip, i) => (
              <div key={i} className="flex gap-3 bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p>{tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Community Guidelines */}
        <section>
          <h2 className="text-3xl font-heading font-bold mb-12 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" /> Community Standards
          </h2>
          <div className="space-y-4">
            {[
              { title: "Zero Tolerance for Violence", desc: "Any threats, harassment, or violence results in immediate permanent ban." },
              { title: "No Discrimination", desc: "We do not tolerate racism, sexism, or discrimination of any kind." },
              { title: "Honest Transactions", desc: "Scams, fraud, or dishonesty will result in account closure and legal action if needed." },
              { title: "Respect Privacy", desc: "Never share someone's personal information or photos without consent." },
              { title: "Professional Conduct", desc: "Keep all interactions respectful and focused on the task at hand." },
              { title: "Report Issues", desc: "If you witness violations, report them immediately. We investigate every report." }
            ].map((item, i) => (
              <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all">
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Support */}
        <section className="text-center py-12">
          <h2 className="text-3xl font-heading font-bold mb-4">Have a Safety Concern?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our safety team is available 24/7 to help. Report any issues immediately.
          </p>
          <Button size="lg" className="px-8 h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold">
            Report an Issue
          </Button>
        </section>
      </div>

      <Footer />
    </div>
  );
}
