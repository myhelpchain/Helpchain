import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle, Mail, Phone, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "Getting Started",
      items: [
        { q: "How do I sign up?", a: "Click 'Get Started', verify your email and phone, then create your profile. Takes about 2 minutes!" },
        { q: "Is there a signup fee?", a: "No! Signing up is completely free. You only pay when you accept an offer as a seeker." },
        { q: "Can I use HelpChain on mobile?", a: "Yes! We have apps for iOS and Android. You can also use our mobile-friendly website." }
      ]
    },
    {
      category: "Posting Requests",
      items: [
        { q: "What if no one offers to help?", a: "We recommend re-posting, adjusting your offer amount, or trying again during peak hours." },
        { q: "Can I post multiple requests?", a: "Yes! You can post as many requests as you need. Each one can be active simultaneously." },
        { q: "How long does a request stay active?", a: "Requests stay active for 30 days. You can renew or delete them anytime." }
      ]
    },
    {
      category: "Payments",
      items: [
        { q: "When is payment charged?", a: "Payment is charged only after you accept a helper's offer, not when you post." },
        { q: "What's the platform fee?", a: "We charge 6% of your offer amount to cover operations, safety, and customer support." },
        { q: "Can I get a refund?", a: "Yes. If the helper doesn't complete the task, you get a full refund. See our dispute policy for details." }
      ]
    },
    {
      category: "Offering Help",
      items: [
        { q: "Do I get paid immediately?", a: "Payments go to your wallet after task completion. Withdraw anytime to your bank account." },
        { q: "What if the seeker claims the task wasn't done?", a: "We review both sides and make a fair decision. Upload photos/videos as proof if needed." },
        { q: "How do I increase my rating?", a: "Complete tasks reliably and encourage seekers to leave reviews. Higher ratings unlock better opportunities." }
      ]
    },
    {
      category: "Safety",
      items: [
        { q: "Is my personal information shared?", a: "No. Addresses are only shared after accepting an offer. Phone numbers are never shared on the platform." },
        { q: "What if I feel unsafe?", a: "Cancel immediately and report through the app. Our safety team responds within 24 hours." },
        { q: "Are background checks performed?", a: "Yes. All helpers undergo automated background screening and manual review." }
      ]
    }
  ];

  const filteredFaqs = faqs.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="relative py-24 bg-gradient-to-br from-primary via-primary to-accent overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Badge className="mb-6 px-4 py-2 bg-white/20 text-white border-white/30 rounded-full">
            Support
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Help Center</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Find answers to common questions. We're here to help.
          </p>
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-white/50"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex-1 container mx-auto px-4 py-20">
        {/* FAQs */}
        <div className="max-w-3xl mx-auto space-y-12">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((category, catIdx) => (
              <motion.div
                key={catIdx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-heading font-bold mb-6">{category.category}</h2>
                <div className="space-y-3">
                  {category.items.map((item, idx) => (
                    <FAQItem key={idx} question={item.q} answer={item.a} />
                  ))}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No results found for "{searchQuery}"</p>
              <p className="text-sm text-muted-foreground mt-2">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: MessageCircle,
              title: "Chat Support",
              desc: "Message us directly in-app for immediate help.",
              action: "Open Chat"
            },
            {
              icon: Mail,
              title: "Email Support",
              desc: "support@helpchain.com - Response within 24 hours",
              action: "Send Email"
            },
            {
              icon: Phone,
              title: "Phone Support",
              desc: "Call us Mon-Fri, 9 AM - 6 PM UTC",
              action: "Call Now"
            }
          ].map((item, i) => (
            <Card key={i} className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  <item.icon className="w-6 h-6" />
                </div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                <button className="w-full px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-bold transition-colors">
                  {item.action}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* More Resources */}
        <div className="mt-20 bg-primary/5 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-heading font-bold mb-6">Looking for more?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/safety" className="px-6 py-3 bg-white dark:bg-zinc-900 rounded-lg font-bold hover:shadow-md transition-all">
              Safety Guide
            </a>
            <a href="/how-it-works" className="px-6 py-3 bg-white dark:bg-zinc-900 rounded-lg font-bold hover:shadow-md transition-all">
              How It Works
            </a>
            <a href="/blog" className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-all">
              Read Blog
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setOpen(!open)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-lg">{question}</CardTitle>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </CardHeader>
      {open && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
        </CardContent>
      )}
    </Card>
  );
}
