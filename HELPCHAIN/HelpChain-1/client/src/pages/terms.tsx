import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="relative py-24 bg-gradient-to-br from-primary via-primary to-accent overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Badge className="mb-6 px-4 py-2 bg-white/20 text-white border-white/30 rounded-full">
            Legal
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Terms of Service</h1>
          <p className="text-white/80">Last updated: January 2026</p>
        </div>
      </section>

      <div className="flex-1 container mx-auto px-4 py-20 max-w-3xl">
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using HelpChain, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">2. Use License</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on HelpChain for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on HelpChain</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">3. Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              The materials on HelpChain are provided "as is". HelpChain makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">4. Limitations</h2>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall HelpChain or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on HelpChain, even if HelpChain or a HelpChain authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">5. Accuracy of Materials</h2>
            <p className="text-muted-foreground leading-relaxed">
              The materials appearing on HelpChain could include technical, typographical, or photographic errors. HelpChain does not warrant that any of the materials on the website are accurate, complete, or current. HelpChain may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">6. Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              HelpChain has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by HelpChain of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">7. Modifications</h2>
            <p className="text-muted-foreground leading-relaxed">
              HelpChain may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">8. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which HelpChain operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">9. User Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              As a user of HelpChain, you agree to:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Provide accurate and truthful information</li>
              <li>Not engage in any fraudulent or illegal activities</li>
              <li>Respect the rights and privacy of other users</li>
              <li>Not post harassing, defamatory, or offensive content</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">10. Payment Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you post a request with an offer amount:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Payment is processed only after accepting a helper's offer</li>
              <li>A 6% platform fee is charged on the offer amount</li>
              <li>Funds are held in escrow until task completion</li>
              <li>Refunds are issued if disputes are resolved in your favor</li>
            </ul>
          </section>

          <div className="mt-12 p-6 bg-primary/5 border border-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground">
              If you have any questions about these Terms, please contact us at support@helpchain.com
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
