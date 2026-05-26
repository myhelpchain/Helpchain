import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Shield, Heart, MapPin, Clock, Wallet, Star, AlertCircle, MessageSquare, FileText, Users } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="relative py-24 bg-gradient-to-br from-primary via-primary to-accent overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="mb-6 px-4 py-2 bg-white/20 text-white border-white/30 rounded-full">
              Simple Process
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How HelpChain Works
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Get tasks done or earn money helping others. It's quick, safe, and easy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-20 space-y-24">
        {/* For Seekers */}
        <section>
          <div className="mb-12">
            <h2 className="text-4xl font-heading font-bold mb-2 flex items-center gap-3">
              <Zap className="w-8 h-8 text-primary" /> For People Seeking Help
            </h2>
            <p className="text-lg text-muted-foreground">5 simple steps to get the help you need</p>
          </div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-5 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                step: 1,
                title: "Post Your Need",
                desc: "Describe what help you need, select a category, set location & urgency level. Include photos or documents if needed.",
                icon: FileText,
                color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
              },
              {
                step: 2,
                title: "Set Amount",
                desc: "Decide how much you can offer (₦0 for volunteer requests). Payment isn't charged until a helper accepts.",
                icon: Wallet,
                color: "bg-green-100 text-green-600 dark:bg-green-900/30",
              },
              {
                step: 3,
                title: "Review Offers",
                desc: "Receive offers from verified helpers. Check their ratings, reviews, and verification badges. Ask questions in chat.",
                icon: Users,
                color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30",
              },
              {
                step: 4,
                title: "Confirm Helper",
                desc: "Accept an offer and payment is processed. You'll receive real-time updates and direct messaging with your helper.",
                icon: CheckCircle2,
                color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30",
              },
              {
                step: 5,
                title: "Rate & Review",
                desc: "After help is complete, rate your helper and leave a detailed review. Honest feedback builds community trust.",
                icon: Star,
                color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30",
              },
            ].map((item) => (
              <motion.div key={item.step} variants={itemVariants}>
                <Card className="border-none shadow-lg hover:shadow-xl transition-all h-full flex flex-col hover:-translate-y-1">
                  <CardHeader className="space-y-4">
                    <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center`}>
                      <item.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <Badge variant="secondary" className="mb-2 text-xs">
                        Step {item.step}
                      </Badge>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* For Helpers */}
        <section>
          <div className="mb-12">
            <h2 className="text-4xl font-heading font-bold mb-2 flex items-center gap-3">
              <Heart className="w-8 h-8 text-primary" /> For Helpers
            </h2>
            <p className="text-lg text-muted-foreground">Earn trust and build your reputation in your community</p>
          </div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-5 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                step: 1,
                title: "Browse Requests",
                desc: "Search through posted requests by category, urgency, amount, and distance. Filter verified users only if preferred.",
                icon: MapPin,
                color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30",
              },
              {
                step: 2,
                title: "Offer Help",
                desc: "Find a request that matches your skills. Send an offer with a personalized message. No commitment until accepted.",
                icon: MessageSquare,
                color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30",
              },
              {
                step: 3,
                title: "Get Accepted",
                desc: "Once your offer is accepted, the payment is confirmed in your wallet. You receive seeker contact details & messaging.",
                icon: Wallet,
                color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30",
              },
              {
                step: 4,
                title: "Complete Task",
                desc: "Meet the seeker, complete the help, and upload proof if required (photos, documents). Mark as complete when done.",
                icon: CheckCircle2,
                color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30",
              },
              {
                step: 5,
                title: "Earn & Grow",
                desc: "Receive payment to your wallet. Build your rating through positive reviews. Unlock higher-value requests as you grow.",
                icon: Star,
                color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30",
              },
            ].map((item) => (
              <motion.div key={item.step} variants={itemVariants}>
                <Card className="border-none shadow-lg hover:shadow-xl transition-all h-full flex flex-col hover:-translate-y-1">
                  <CardHeader className="space-y-4">
                    <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center`}>
                      <item.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <Badge variant="secondary" className="mb-2 text-xs">
                        Step {item.step}
                      </Badge>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Payment & Fees */}
        <section className="bg-slate-50 dark:bg-zinc-900/50 rounded-2xl p-12">
          <h2 className="text-3xl font-heading font-bold mb-8">Payment & Fees</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-green-600" /> For Seekers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold mb-2">Offer Amount</p>
                  <p className="text-muted-foreground">Set any amount from ₦0 (volunteer) to ₦100,000+</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Platform Fee</p>
                  <p className="text-muted-foreground">
                    <span className="text-primary font-bold">6%</span> of your offer amount covers platform operations, safety, and support.
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                    Example: ₦10,000 offer = ₦10,600 total (6% fee = ₦600)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-6 h-6 text-primary" /> For Helpers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold mb-2">Earnings</p>
                  <p className="text-muted-foreground">You receive 100% of the agreed amount. No hidden fees or deductions.</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Wallet System</p>
                  <p className="text-muted-foreground">Earnings go directly to your HelpChain wallet after task completion.</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                    Withdraw anytime to your bank account. Zero transaction fees for helpers.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-orange-600" /> Escrow Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold mb-2">How It Works</p>
                  <p className="text-muted-foreground">Money is held safely in escrow until the helper completes the task.</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Dispute Resolution</p>
                  <p className="text-muted-foreground">If there's a disagreement, our support team reviews and resolves fairly.</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">
                    Your money is never at risk. Both parties are protected.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Safety & Trust */}
        <section>
          <h2 className="text-3xl font-heading font-bold mb-12">Safety & Trust</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Shield,
                title: "Identity Verification",
                desc: "All users must verify their phone number and email. Helpers can add ID verification, driver's license, or NIN for trust badges.",
              },
              {
                icon: Star,
                title: "Transparent Ratings",
                desc: "Every user has a public rating based on real reviews from completed tasks. Read past reviews to make informed decisions.",
              },
              {
                icon: AlertCircle,
                title: "Dispute Resolution",
                desc: "If issues arise, submit a report through the app. Our moderation team investigates and resolves disputes fairly within 48 hours.",
              },
              {
                icon: Heart,
                title: "Community Standards",
                desc: "Users with consistently low ratings or violations face consequences. We maintain a safe, trustworthy community for everyone.",
              },
              {
                icon: Clock,
                title: "Real-Time Updates",
                desc: "Get instant notifications about offers, messages, and task status. Track your helper's location in real-time during the task.",
              },
              {
                icon: MessageSquare,
                title: "In-App Messaging",
                desc: "All communication happens in HelpChain for safety. Never share personal numbers or meet outside the app until you're comfortable.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mt-1">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ Quick Links */}
        <section className="bg-primary/5 rounded-2xl p-12">
          <h2 className="text-3xl font-heading font-bold mb-8">Common Questions</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { q: "Is my money safe?", a: "Yes. Money is held in escrow until the task is completed. Our team resolves any disputes fairly." },
              { q: "How long does help arrive?", a: "Urgent requests often get offers within minutes. Most requests are fulfilled within 24 hours." },
              { q: "Can I cancel a request?", a: "Yes. Cancel anytime before a helper accepts. No charges if canceled before acceptance." },
              { q: "What if the helper doesn't show up?", a: "Report through the app. We'll investigate and refund your money. Repeat offenders are banned." },
              { q: "How do I become verified?", a: "Verify your phone/email (instant), then add ID verification for an extra badge (optional, 24hr review)." },
              { q: "Can helpers see my address?", a: "Only after you accept their offer. Keep your exact address private until you're ready to meet." },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border">
                  <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" /> {item.q}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of community members helping each other today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create-request">
                <Button size="lg" className="px-8 h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg">
                  Post a Need
                </Button>
              </Link>
              <Link href="/search">
                <Button size="lg" variant="outline" className="px-8 h-14 rounded-xl font-bold text-lg">
                  Become a Helper
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
