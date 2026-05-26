import { Navbar } from "@/components/layout/navbar";
import { HelpChainLogo } from "@/components/ui/helpchain-logo";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Download, Mail, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function PressPage() {
  const pressReleases = [
    { date: "December 2025", title: "HelpChain Reaches 50,000 Completed Tasks Milestone", excerpt: "The Nigerian task marketplace celebrates a major milestone as community adoption accelerates." },
    { date: "November 2025", title: "HelpChain Launches in 10 New Nigerian Cities", excerpt: "Expansion brings trusted local help to more communities across the nation." },
    { date: "October 2025", title: "HelpChain Raises Seed Funding to Expand Operations", excerpt: "Investment will fuel growth and development of new platform features." },
  ];

  const mediaKit = [
    { name: "HelpChain Logo Pack", format: "ZIP", size: "2.4 MB" },
    { name: "Brand Guidelines", format: "PDF", size: "1.8 MB" },
    { name: "Product Screenshots", format: "ZIP", size: "5.2 MB" },
    { name: "Founder Photos", format: "ZIP", size: "3.1 MB" },
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
              Press & Media
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Press Room
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Resources for journalists, bloggers, and media professionals.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-8">Latest News</h2>
              <div className="space-y-6">
                {pressReleases.map((pr, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <Badge variant="secondary" className="mb-3">{pr.date}</Badge>
                        <h3 className="font-semibold text-lg mb-2 hover:text-primary cursor-pointer transition-colors">
                          {pr.title}
                        </h3>
                        <p className="text-muted-foreground mb-4">{pr.excerpt}</p>
                        <Button variant="ghost" className="p-0 h-auto text-primary hover:text-primary/80">
                          Read more
                          <ExternalLink className="ml-2 w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-8">Media Kit</h2>
              <Card className="mb-8">
                <CardContent className="p-6 space-y-4">
                  {mediaKit.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.format} - {item.size}</p>
                      </div>
                      <Button size="icon" variant="ghost">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Media Contact</h3>
                  <p className="text-muted-foreground mb-4">
                    For press inquiries, interviews, or additional information, please contact our communications team.
                  </p>
                  <Button className="w-full rounded-xl">
                    <Mail className="mr-2 w-4 h-4" />
                    press@helpchain.ng
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
