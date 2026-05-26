import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface KorapayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: () => void;
}

export function KorapayModal({ isOpen, onClose, amount, onSuccess }: KorapayModalProps) {
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const { toast } = useToast();

  // Calculate Fee (6%)
  const fee = amount * 0.06;
  const total = amount + fee;

  const handlePay = async () => {
    setStep('processing');
    // Simulate Korapay processing delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    setStep('success');
    // Auto close after success
    setTimeout(() => {
      onSuccess();
      onClose();
      setStep('details'); // Reset for next time
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <span className="bg-primary/10 p-2 rounded-lg text-primary">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  Secure Deposit via Korapay
                </DialogTitle>
                <DialogDescription>
                  To verify your request, please deposit the help amount. 
                  Funds are held securely in escrow until help is received.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-6 space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-3 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Offer Amount</span>
                    <span className="font-medium">₦{amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee (6%)</span>
                    <span className="font-medium">₦{fee.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between text-lg font-bold text-primary">
                    <span>Total to Pay</span>
                    <span>₦{total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start gap-2 border-primary/50 bg-primary/5">
                      <CreditCard className="w-4 h-4" /> Card
                    </Button>
                    <Button variant="outline" className="justify-start gap-2" disabled>
                      Bank Transfer
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handlePay} className="bg-[#3BB273] hover:bg-[#2fa062] text-white font-bold shadow-lg shadow-green-900/20">
                  Pay ₦{total.toLocaleString()}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                <div className="relative bg-white p-4 rounded-full shadow-xl">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              </div>
              <h3 className="text-lg font-semibold">Processing Payment...</h3>
              <p className="text-sm text-muted-foreground max-w-[200px]">
                Please wait while we securely connect with Korapay.
              </p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="bg-green-100 p-4 rounded-full text-green-600 mb-2">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-green-700">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground">
                Your request has been verified and is now being posted.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}