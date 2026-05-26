import { Twitter, Facebook, Instagram, Linkedin, Mail, Globe, Shield, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { HelpChainLogo } from "@/components/ui/helpchain-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950" />
      <div className="relative z-10">
        <div className="container mx-auto px-4 pt-20 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-6">
                <HelpChainLogo size="md" className="rounded-xl" />
                <span className="text-2xl font-bold tracking-tight text-white">HelpChain</span>
              </div>
              <p className="text-slate-400 leading-relaxed mb-8 max-w-sm">
                The global task marketplace connecting clients with workers worldwide. Secure escrow payments, trusted reputation, and flexible work arrangements.
              </p>
              <div className="flex gap-3">
                {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              <h3 className="font-semibold mb-6 text-white">Platform</h3>
              <ul className="space-y-4">
                {[
                  { label: "Find Tasks", href: "/discover" },
                  { label: "Post a Task", href: "/create-request" },
                  { label: "How it Works", href: "/how-it-works" },
                  { label: "Pricing", href: "/pricing" },
                ].map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                      {link.label}
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h3 className="font-semibold mb-6 text-white">Resources</h3>
              <ul className="space-y-4">
                {[
                  { label: "How Payments Work", href: "/help" },
                  { label: "What Is Escrow", href: "/help" },
                  { label: "Withdrawing Earnings", href: "/help" },
                  { label: "Trust & Safety", href: "/safety" },
                  { label: "Blockchain Security", href: "/help" },
                ].map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                      {link.label}
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-4">
              <h3 className="font-semibold mb-6 text-white">Stay Updated</h3>
              <p className="text-slate-400 text-sm mb-4">Get the latest updates on new features and marketplace news.</p>
              <div className="flex gap-2 mb-6">
                <Input placeholder="Enter your email" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:border-primary" />
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-xl px-6 shrink-0">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <Shield className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium">Secure & Trusted</p>
                  <p className="text-slate-400 text-xs">All payments protected by escrow</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Globe className="w-4 h-4" />
              <span>Building a trusted helper community</span>
            </div>
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} HelpChain. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
