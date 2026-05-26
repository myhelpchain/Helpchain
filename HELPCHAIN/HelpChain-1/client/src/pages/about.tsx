import { Navbar } from "@/components/layout/navbar";
import { HelpChainLogo } from "@/components/ui/helpchain-logo";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Shield, Users, Target, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function AboutPage() {
  const values = [
    { icon: Heart, title: "Community First", desc: "We believe in the power of neighbors helping neighbors. Every connection strengthens our community." },
    { icon: Shield, title: "Trust & Safety", desc: "Your safety is our priority. We verify helpers and protect all payments through escrow." },
    { icon: Target, title: "Accessibility", desc: "Quality help should be available to everyone, regardless of location or background." },
    { icon: Users, title: "Empowerment", desc: "We empower helpers to earn a living doing what they love while building their reputation." },
  ];

  const team = [
    { name: "Oluwaseun Adeyemi", role: "CEO & Co-Founder", image: "https://i.pravatar.cc/150?img=60" },
    { name: "Ngozi Okafor", role: "CTO & Co-Founder", image: "https://i.pravatar.cc/150?img=48" },
    { name: "Emeka Nnamdi", role: "Head of Operations", image: "https://i.pravatar.cc/150?img=53" },
    { name: "Aisha Bello", role: "Head of Community", image: "https://i.pravatar.cc/150?img=44" },
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
              Our Story
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Building Stronger Communities
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              We're on a mission to connect people who need help with those who can give it, creating a more helpful and connected Nigeria.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                HelpChain was born from a simple observation: in our communities, there are people who need help with everyday tasks, and there are capable people who want to help and earn.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                We bridge this gap by creating a trusted platform where neighbors can connect, tasks can get done, and everyone benefits. Whether it's moving furniture, running errands, or tutoring a child, HelpChain makes it easy to find reliable help.
              </p>
              <div className="space-y-4">
                {["Over 50,000 tasks completed", "15,000+ verified helpers", "Serving all 36 states in Nigeria", "₦2 billion+ paid to helpers"].map((stat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="font-medium">{stat}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <div className="text-center">
                  <HelpChainLogo size="xl" className="mx-auto mb-4" />
                  <p className="text-muted-foreground">Video coming soon</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground">
              These principles guide everything we do at HelpChain.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <value.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground">
              The passionate people behind HelpChain.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Join the HelpChain Community</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Whether you need help or want to help others, there's a place for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create-request">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-xl">
                Post a Task
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/discover">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-xl">
                Become a Helper
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
