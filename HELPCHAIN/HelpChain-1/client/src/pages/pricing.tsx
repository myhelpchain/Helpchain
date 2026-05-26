import { Navbar } from "@/components/layout/navbar";
import { HelpChainLogo } from "@/components/ui/helpchain-logo";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PricingPage() {
  const features = [
    { feature: "Post unlimited tasks", free: true, helper: true },
    { feature: "Browse all available tasks", free: true, helper: true },
    { feature: "Secure escrow payments", free: true, helper: true },
    { feature: "In-app messaging", free: true, helper: true },
    { feature: "Verified badge", free: false, helper: true },
    { feature: "Priority support", free: false, helper: true },
    { feature: "Featured profile listing", free: false, helper: true },
    { feature: "Lower platform fees", free: false, helper: true },
  ];

  const faqs = [
    {
      q: "How does HelpChain make money?",
      a: "We charge a small service fee (6%) on completed tasks. This fee covers payment processing, platform maintenance, and customer support."
    },
    {
      q: "Is it free to post a task?",
      a: "Yes! Posting tasks is completely free. You only pay when you choose a helper and the task is completed."
    },
    {
      q: "How does the escrow system work?",
      a: "When you hire a helper, your payment is held securely in escrow. The helper only receives payment once you confirm the task is complete."
    },
    {
      q: "Can I cancel a task?",
      a: "Yes, you can cancel a task before a helper is assigned. If a helper has already been assigned, cancellation terms may apply."
    },
    {
      q: "How do helpers get paid?",
      a: "Helpers receive payment directly to their bank account or mobile money within 24-48 hours after task completion is confirmed."
    },
  ];

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
              <HelpChainLogo size="sm" className="mr-2" />
              Simple Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Transparent & Fair Pricing
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              No hidden fees. Pay only when tasks are completed successfully.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">Free</CardTitle>
                  <CardDescription>For everyone</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">₦0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-center text-muted-foreground text-sm">
                    6% service fee on completed tasks
                  </p>
                  <div className="space-y-3 pt-4">
                    {features.filter(f => f.free).map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <span>{f.feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/create-request">
                    <Button className="w-full mt-6 rounded-xl" size="lg">
                      Get Started Free
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full border-2 border-primary relative hover:shadow-lg transition-shadow">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-1">Most Popular</Badge>
                </div>
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">Pro Helper</CardTitle>
                  <CardDescription>For serious helpers</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">₦2,500</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-center text-muted-foreground text-sm">
                    Only 4% service fee on completed tasks
                  </p>
                  <div className="space-y-3 pt-4">
                    {features.map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className={`w-5 h-5 ${f.helper ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={!f.helper ? 'text-muted-foreground' : ''}>{f.feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/discover">
                    <Button className="w-full mt-6 rounded-xl bg-primary" size="lg">
                      Upgrade to Pro
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about HelpChain pricing.</p>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-white dark:bg-slate-900 rounded-xl border px-6">
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
}
