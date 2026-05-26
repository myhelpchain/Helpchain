import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="relative py-24 bg-gradient-to-br from-primary via-primary to-accent overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Badge className="mb-6 px-4 py-2 bg-white/20 text-white border-white/30 rounded-full">
            Legal
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Privacy Policy</h1>
          <p className="text-white/80">Last updated: January 2026</p>
        </div>
      </section>

      <div className="flex-1 container mx-auto px-4 py-20 max-w-3xl">
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              HelpChain ("we", "us", "our") operates the HelpChain website and mobile application (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">2. Information Collection and Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect several different types of information for various purposes to provide and improve our Service to you.
            </p>
            <h3 className="text-lg font-bold mb-2">Types of Data Collected:</h3>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li><strong>Account Information:</strong> Name, email address, phone number, location</li>
              <li><strong>Profile Data:</strong> Avatar, bio, skills, verification status</li>
              <li><strong>Transaction Data:</strong> Requests posted, offers made, payments processed</li>
              <li><strong>Communication Data:</strong> Messages exchanged through the platform</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent, actions taken</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              HelpChain uses the collected data for various purposes:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features</li>
              <li>To provide customer care and support</li>
              <li>To gather analysis or valuable information for improving our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical and security issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">4. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">5. Information Sharing</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not share your personal information with third parties except:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>With service providers who assist us in operating our website and conducting our business</li>
              <li>For payment processing through Korapay</li>
              <li>When required by law or to protect our legal rights</li>
              <li>With your consent for specific purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">6. Address Visibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your complete address is never shared publicly. Only approximate location (city, state) is displayed in request listings. Your exact address is only shared with the helper you accept an offer from, and only after confirmation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">7. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              HelpChain uses cookies to store information about your preferences and to personalize content and advertisements. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">8. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to certain processing of your data</li>
              <li>Request restriction of processing</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">9. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "effective date" at the top of this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at: privacy@helpchain.com
            </p>
          </section>

          <div className="mt-12 p-6 bg-primary/5 border border-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Your privacy is important to us. For any concerns or requests, please reach out to our privacy team.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
