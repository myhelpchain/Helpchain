import { Navbar } from "@/components/layout/navbar";
import { HelpChainLogo } from "@/components/ui/helpchain-logo";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function CookiesPage() {
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
              Legal
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Cookie Policy
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Last updated: January 2026
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2>What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
            </p>

            <h2>How We Use Cookies</h2>
            <p>HelpChain uses cookies for the following purposes:</p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for the website to function properly, including authentication and security.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website so we can improve the user experience.</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences for future visits.</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements and track campaign performance.</li>
            </ul>

            <h2>Types of Cookies We Use</h2>
            <h3>Strictly Necessary Cookies</h3>
            <p>
              These cookies are essential for you to browse the website and use its features. Without these cookies, services like secure login cannot be provided.
            </p>

            <h3>Performance Cookies</h3>
            <p>
              These cookies collect information about how visitors use our website, such as which pages are visited most often. This data helps us optimize the site's performance.
            </p>

            <h3>Functionality Cookies</h3>
            <p>
              These cookies allow the website to remember choices you make (such as your language preference) and provide enhanced, more personal features.
            </p>

            <h2>Managing Cookies</h2>
            <p>
              Most web browsers allow you to control cookies through their settings. You can set your browser to block or delete cookies, but this may affect the functionality of our website.
            </p>
            <p>
              To learn more about managing cookies in your browser, visit your browser's help documentation.
            </p>

            <h2>Third-Party Cookies</h2>
            <p>
              Some cookies are placed by third-party services that appear on our pages. We do not control these cookies and recommend reviewing the privacy policies of these third parties.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about our use of cookies, please contact us at privacy@helpchain.ng
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
