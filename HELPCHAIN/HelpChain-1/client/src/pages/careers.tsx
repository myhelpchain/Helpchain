import { Navbar } from "@/components/layout/navbar";
import { HelpChainLogo } from "@/components/ui/helpchain-logo";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, MapPin, Clock, ArrowRight, Briefcase, Heart, Zap, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function CareersPage() {
  const perks = [
    { icon: Heart, title: "Health & Wellness", desc: "Comprehensive health insurance for you and your family" },
    { icon: Zap, title: "Remote First", desc: "Work from anywhere in Nigeria with flexible hours" },
    { icon: Users, title: "Team Culture", desc: "Join a passionate team building something meaningful" },
    { icon: Briefcase, title: "Growth", desc: "Learning budget and career development opportunities" },
  ];

  const openings = [
    { title: "Senior Frontend Engineer", department: "Engineering", location: "Remote", type: "Full-time" },
    { title: "Product Designer", department: "Design", location: "Lagos", type: "Full-time" },
    { title: "Community Manager", department: "Operations", location: "Remote", type: "Full-time" },
    { title: "Customer Support Lead", department: "Support", location: "Remote", type: "Full-time" },
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
              Join Our Team
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Build the Future of Work
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Join a passionate team on a mission to empower communities across Nigeria.
            </p>
          </motion.div>
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
            <h2 className="text-3xl font-bold mb-4">Why Join HelpChain?</h2>
            <p className="text-lg text-muted-foreground">
              We offer more than just a job - we offer a chance to make a real impact.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((perk, i) => (
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
                      <perk.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{perk.title}</h3>
                    <p className="text-sm text-muted-foreground">{perk.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
            <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
            <p className="text-lg text-muted-foreground">
              Find your next opportunity at HelpChain.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {openings.map((job, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.type}
                        </span>
                      </div>
                    </div>
                    <Button className="rounded-xl shrink-0">
                      Apply Now
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Don't see the right role?</p>
            <Button variant="outline" className="rounded-xl">
              Send us your resume
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
