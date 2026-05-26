import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import {
  X, ArrowRight, ShieldCheck, CheckCircle2,
  Loader2, Banknote, CreditCard, Smartphone,
  ChevronRight, Wallet, Zap,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────── */
declare global {
  interface Window {
    PaystackPop?: {
      setup: (opts: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref?: string;
        metadata?: Record<string, unknown>;
        callback: (res: { reference: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

/* ─── Constants ─────────────────────────────────────────── */
const GREEN = "#0C6B38";
const PRESETS = [1000, 2000, 5000, 10000, 25000, 50000];
const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string;
const PAYSTACK_SCRIPT = "https://js.paystack.co/v1/inline.js";

/* ─── Helpers ───────────────────────────────────────────── */
function fmt(n: number) {
  return n.toLocaleString("en-NG");
}
function makeRef() {
  return `hc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) { resolve(); return; }
    if (document.querySelector(`script[src="${PAYSTACK_SCRIPT}"]`)) {
      const existing = document.querySelector(`script[src="${PAYSTACK_SCRIPT}"]`)!;
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.src = PAYSTACK_SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

/* ─── Step indicators ───────────────────────────────────── */
type Step = "amount" | "processing" | "success";

const STEPS_META: { id: Step; label: string }[] = [
  { id: "amount",     label: "Amount"     },
  { id: "processing", label: "Payment"    },
  { id: "success",    label: "Done"       },
];

/* ══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */
interface WalletDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletDepositModal({ isOpen, onClose }: WalletDepositModalProps) {
  const { user } = useFirebaseAuth();
  const { balance, verifyDeposit, refetchWallet } = useWallet();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("amount");
  const [rawAmt, setRawAmt] = useState("");
  const [loading, setLoading] = useState(false);
  const [depositedAmount, setDepositedAmount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const amount = parseInt(rawAmt.replace(/\D/g, ""), 10) || 0;
  const isValid = amount >= 100;

  /* focus input when modal opens */
  useEffect(() => {
    if (isOpen && step === "amount") {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, step]);

  /* reset when closed */
  const handleClose = () => {
    if (loading) return;
    onClose();
    setTimeout(() => { setStep("amount"); setRawAmt(""); setLoading(false); }, 320);
  };

  /* ── Pay via Paystack inline popup ──────────────────── */
  const handlePay = async () => {
    if (!isValid) return;
    if (!user?.email) {
      toast({ title: "Sign in required", description: "Please sign in to make a deposit.", variant: "destructive" });
      return;
    }
    if (!PAYSTACK_KEY) {
      toast({ title: "Config error", description: "Paystack is not configured. Contact support.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setStep("processing");

    try {
      await loadPaystackScript();

      if (!window.PaystackPop) throw new Error("Paystack failed to load");

      const ref = makeRef();

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: user.email,
        amount: amount * 100,          // Paystack uses kobo
        currency: "NGN",
        ref,
        metadata: { userId: user.uid, source: "helpchain_wallet" },

        callback: async (res) => {
          /* Payment completed — verify with backend */
          setDepositedAmount(amount);
          try {
            await verifyDeposit(res.reference);
            await refetchWallet();
          } catch {
            /* verification failed — still show success; backend webhook will reconcile */
          }
          setStep("success");
          setLoading(false);
        },

        onClose: () => {
          /* User closed Paystack popup without paying */
          setStep("amount");
          setLoading(false);
        },
      });

      handler.openIframe();
    } catch (err: any) {
      toast({
        title: "Could not open payment",
        description: err?.message || "Please check your connection and try again.",
        variant: "destructive",
      });
      setStep("amount");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 gap-0 overflow-hidden rounded-3xl border-0 shadow-2xl sm:max-w-[420px]">

        <AnimatePresence mode="wait">

          {/* ══ STEP: AMOUNT ══════════════════════════════ */}
          {step === "amount" && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22 }}
            >
              {/* ── Header ── */}
              <div
                className="relative px-6 pt-7 pb-6"
                style={{ background: `linear-gradient(140deg, ${GREEN} 0%, #0a5a2f 100%)` }}
              >
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-white" />
                </button>

                {/* Icon + title */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Fund wallet</p>
                    <h2 className="text-white text-xl font-bold leading-tight">Add Money</h2>
                  </div>
                </div>

                {/* Balance chip */}
                <div className="flex items-center justify-between bg-white/10 rounded-2xl px-4 py-3">
                  <span className="text-white/60 text-xs font-medium">Current balance</span>
                  <span className="text-white font-bold text-sm">₦{fmt(balance)}</span>
                </div>
              </div>

              {/* ── Body ── */}
              <div className="bg-white px-6 py-5 space-y-5">

                {/* Amount input */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Enter amount
                  </label>
                  <div
                    className="flex items-center rounded-2xl border-2 transition-colors overflow-hidden"
                    style={{ borderColor: isValid ? GREEN : amount > 0 ? "#FCA5A5" : "#E5E7EB" }}
                  >
                    <span
                      className="pl-4 text-2xl font-black select-none"
                      style={{ color: isValid ? GREEN : "#D1D5DB" }}
                    >
                      ₦
                    </span>
                    <input
                      ref={inputRef}
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={amount > 0 ? fmt(amount) : ""}
                      onChange={(e) => setRawAmt(e.target.value.replace(/\D/g, ""))}
                      className="flex-1 pl-2 pr-4 h-16 text-3xl font-black text-gray-900 outline-none bg-transparent placeholder:text-gray-200"
                    />
                    {isValid && (
                      <div className="pr-4">
                        <CheckCircle2 className="w-5 h-5" style={{ color: GREEN }} />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 ml-1">Minimum: ₦100</p>
                </div>

                {/* Preset pills */}
                <div className="grid grid-cols-3 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setRawAmt(p.toString())}
                      className="h-11 rounded-xl text-sm font-bold border-2 transition-all active:scale-95"
                      style={
                        amount === p
                          ? { background: GREEN, borderColor: GREEN, color: "white" }
                          : { background: "#F8FAF8", borderColor: "#E5E7EB", color: "#374151" }
                      }
                    >
                      ₦{p >= 1000 ? `${p / 1000}k` : p}
                    </button>
                  ))}
                </div>

                {/* What you get */}
                <AnimatePresence>
                  {isValid && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="rounded-2xl px-4 py-3.5 flex items-center justify-between"
                        style={{ background: "#F0FDF4", border: `1.5px solid #BBF7D0` }}
                      >
                        <div>
                          <p className="text-xs text-gray-500 font-medium">You'll add</p>
                          <p className="text-2xl font-black" style={{ color: GREEN }}>₦{fmt(amount)}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <div className="text-right">
                          <p className="text-xs text-gray-500 font-medium">New balance</p>
                          <p className="text-sm font-bold text-gray-800">₦{fmt(balance + amount)}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Payment methods row */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5">Accepted via</p>
                  <div className="flex gap-2">
                    {[
                      { icon: CreditCard, label: "Card" },
                      { icon: Banknote,   label: "Bank Transfer" },
                      { icon: Smartphone, label: "USSD" },
                    ].map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl bg-gray-50 border border-gray-100"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center">
                          <Icon className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <span className="text-[10px] text-gray-500 font-semibold text-center leading-tight">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trust badge */}
                <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 bg-gray-50 border border-gray-100">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: GREEN }} />
                  <p className="text-xs text-gray-500">
                    Secured by <span className="font-bold text-gray-700">Paystack</span> — Nigeria's most trusted payment processor
                  </p>
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="px-6 pb-6 bg-white flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 h-13 py-3.5 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePay}
                  disabled={!isValid}
                  className="flex-1 h-13 py-3.5 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-35 disabled:hover:translate-y-0 active:scale-95"
                  style={isValid ? { background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)`, boxShadow: `0 6px 20px ${GREEN}40` } : { background: "#E5E7EB" }}
                >
                  Pay with Paystack <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ══ STEP: PROCESSING ══════════════════════════ */}
          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col items-center justify-center text-center py-16 px-8 bg-white min-h-[420px]"
            >
              <div className="relative mb-7">
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: `${GREEN}18` }}
                />
                <div
                  className="relative w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${GREEN}15 0%, #16A34A10 100%)`, border: `2px solid ${GREEN}25` }}
                >
                  <Zap className="w-10 h-10" style={{ color: GREEN }} />
                </div>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Opening Paystack</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                A secure Paystack window is opening. Complete your payment there — this screen will update automatically.
              </p>
              <div className="flex items-center gap-2 mt-6 text-xs text-gray-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Waiting for payment confirmation…
              </div>
            </motion.div>
          )}

          {/* ══ STEP: SUCCESS ══════════════════════════════ */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
              className="flex flex-col items-center justify-center text-center py-16 px-8 bg-white min-h-[420px]"
            >
              {/* Burst circle */}
              <div className="relative mb-7">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)`, boxShadow: `0 12px 40px ${GREEN}50` }}
                >
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GREEN }}>Payment Successful</p>
                <h3 className="text-3xl font-black text-gray-900 mb-1">₦{fmt(depositedAmount)}</h3>
                <p className="text-sm text-gray-500 mb-7">has been added to your wallet 🎉</p>

                <div className="rounded-2xl px-5 py-4 mb-7 text-left" style={{ background: "#F0FDF4", border: `1.5px solid #BBF7D0` }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">New balance</span>
                    <span className="text-base font-black" style={{ color: GREEN }}>₦{fmt(balance)}</span>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full h-13 py-3.5 rounded-2xl text-sm font-black text-white transition-all hover:-translate-y-0.5 active:scale-95"
                  style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)`, boxShadow: `0 6px 20px ${GREEN}40` }}
                >
                  Done
                </button>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
