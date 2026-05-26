import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function SitemapPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Sitemap</h1>
            <p className="text-muted-foreground text-lg mb-12">Navigate through all sections of HelpChain</p>

            <div className="space-y-8">
              {/* Main */}
              <Card className="border-none shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Main</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <li><Link href="/" className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Home</Link></li>
                    <li><Link href="/search" className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Find Offers</Link></li>
                    <li><Link href="/create-request" className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Post a Need</Link></li>
                    <li><Link href="/create-offer" className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Offer Help</Link></li>
                  </ul>
                </CardContent>
              </Card>

              {/* Platform */}
              <Card className="border-none shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Platform</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <li><Link href="/how-it-works" className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> How it Works</Link></li>
                    <li><Link href="/safety" className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Safety & Trust</Link></li>
                    <li><Link href="/dashboard" className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Dashboard</Link></li>
                    <li><Link href="/profile" className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> My Profile</Link></li>
                  </ul>
                </CardContent>
              </Card>

              {/* Community */}
              <Card className="border-none shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Community</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <li><Link href="/stories" className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Success Stories</Link></li>
                    <li><Link href="/volunteers" className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Top Volunteers</Link></li>
                    <li><Link href="/blog" className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Blog</Link></li>
                    <li><Link href="/events" className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Events</Link></li>
                  </ul>
                </CardContent>
              </Card>

              {/* Support */}
              <Card className="border-none shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Support</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <li><Link href="/help" className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Help Center</Link></li>
                    <li><Link href="/contact" className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Contact Us</Link></li>
                    <li><Link href="/privacy" className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Privacy Policy</Link></li>
                    <li><Link href="/terms" className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Terms of Service</Link></li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
