import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, CheckCircle2, X, ArrowRight, ArrowLeft, Banknote, Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";

interface WalletWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type WithdrawMethod = "bank" | "crypto";
type Step = "amount" | "method" | "details" | "confirm" | "processing" | "success";

const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "First Bank", code: "011" },
  { name: "GT Bank", code: "058" },
  { name: "UBA", code: "033" },
  { name: "Zenith Bank", code: "057" },
  { name: "Fidelity Bank", code: "070" },
  { name: "Kuda Bank", code: "090267" },
  { name: "Opay", code: "100004" },
  { name: "Palmpay", code: "100033" },
  { name: "Polaris Bank", code: "076" },
  { name: "Sterling Bank", code: "232" },
  { name: "Union Bank", code: "032" },
  { name: "Wema Bank", code: "035" },
  { name: "Moniepoint", code: "50515" },
];

const CRYPTO_NETWORKS = [
  { id: "usdt", label: "USDT", sub: "TRC20 / ERC20" },
  { id: "btc",  label: "Bitcoin", sub: "BTC Network" },
  { id: "eth",  label: "Ethereum", sub: "ERC20 Network" },
  { id: "sol",  label: "Solana", sub: "SOL Network" },
];

const PRESETS = [5000, 10000, 20000];

const STEPS: Step[] = ["amount", "method", "details", "confirm"];

function StepDots({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((_, i) => (
        <div
          key={i}
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: i === idx ? 20 : 6,
            background: i <= idx ? "#0C6B38" : "#D1FAE5",
          }}
        />
      ))}
    </div>
  );
}

export function WalletWithdrawModal({ isOpen, onClose }: WalletWithdrawModalProps) {
  const [step, setStep] = useState<Step>("amount");
  const [rawAmount, setRawAmount] = useState("");
  const [method, setMethod] = useState<WithdrawMethod>("bank");
  const [bank, setBank] = useState({ name: "", code: "", accountNumber: "", accountName: "" });
  const [cryptoNet, setCryptoNet] = useState("usdt");
  const [cryptoAddress, setCryptoAddress] = useState("");

  const { balance, isWithdrawalLocked, withdraw, withdrawPending } = useWallet();
  const { toast } = useToast();

  const amount = parseInt(rawAmount.replace(/\D/g, "")) || 0;
  const locked = isWithdrawalLocked();

  const handleClose = () => {
    if (step === "processing") return;
    onClose();
    setTimeout(() => {
      setStep("amount");
      setRawAmount("");
      setBank({ name: "", code: "", accountNumber: "", accountName: "" });
      setCryptoAddress("");
      setCryptoNet("usdt");
    }, 300);
  };

  const handleAmountNext = () => {
    if (locked) {
      toast({ title: "Withdrawal Locked", description: "Complete or cancel your active offer first.", variant: "destructive" });
      return;
    }
    if (amount < 1000) {
      toast({ title: "Minimum ₦1,000", description: "Enter at least ₦1,000 to withdraw.", variant: "destructive" });
      return;
    }
    if (amount > balance) {
      toast({ title: "Insufficient funds", description: `Balance is ₦${balance.toLocaleString()}.`, variant: "destructive" });
      return;
    }
    setStep("method");
  };

  const handleMethodNext = () => setStep("details");

  const handleDetailsNext = () => {
    if (method === "bank") {
      if (!bank.code || !bank.accountNumber || !bank.accountName) {
        toast({ title: "Incomplete details", description: "Fill in all bank fields.", variant: "destructive" });
        return;
      }
      if (bank.accountNumber.length !== 10) {
        toast({ title: "Invalid account number", description: "Must be exactly 10 digits.", variant: "destructive" });
        return;
      }
    } else {
      if (!cryptoAddress || cryptoAddress.length < 20) {
        toast({ title: "Invalid address", description: "Enter a valid wallet address.", variant: "destructive" });
        return;
      }
    }
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setStep("processing");
    try {
      if (method === "bank") {
        await withdraw(amount, bank.code, bank.accountNumber, bank.accountName);
      } else {
        await withdraw(amount, undefined, undefined, undefined, cryptoAddress);
      }
      setStep("success");
      setTimeout(() => handleClose(), 3000);
    } catch (error: any) {
      toast({ title: "Withdrawal failed", description: error?.message || "Please try again.", variant: "destructive" });
      setStep("confirm");
    }
  };

  const back = () => {
    if (step === "method") setStep("amount");
    else if (step === "details") setStep("method");
    else if (step === "confirm") setStep("details");
  };

  const cryptoLabel = CRYPTO_NETWORKS.find((n) => n.id === cryptoNet)?.label ?? "Crypto";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 gap-0 overflow-hidden sm:max-w-md rounded-2xl border-0 shadow-2xl">
        <AnimatePresence mode="wait">

          {/* ── AMOUNT ── */}
          {step === "amount" && (
            <motion.div key="amount" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              {/* Header */}
              <div className="relative px-6 pt-6 pb-5" style={{ background: "linear-gradient(135deg, #0C6B38 0%, #0a5a2f 100%)" }}>
                <button onClick={handleClose} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                    <Banknote className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Withdraw</p>
                    <h2 className="text-white text-lg font-bold leading-tight">Cash Out</h2>
                  </div>
                </div>
                <div className="mt-4 bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-white/70 text-sm">Available balance</span>
                  <span className="text-white font-bold text-base">₦{balance.toLocaleString()}</span>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4 bg-white">
                {locked && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-start rounded-xl p-3.5 border border-red-200 bg-red-50">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-700">Withdrawal Locked</p>
                      <p className="text-xs text-red-500 mt-0.5">You have funds in escrow. Complete or cancel your active offer first.</p>
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Amount to withdraw</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">₦</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      disabled={locked}
                      value={amount > 0 ? amount.toLocaleString() : ""}
                      onChange={(e) => setRawAmount(e.target.value.replace(/\D/g, ""))}
                      className="w-full pl-10 pr-4 h-16 text-3xl font-bold text-gray-900 border-2 rounded-xl outline-none transition-colors placeholder:text-gray-200 disabled:opacity-40"
                      style={{ borderColor: amount > 0 ? "#0C6B38" : "#E5E7EB" }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <p className="text-xs text-gray-400">Minimum: ₦1,000</p>
                    <button
                      onClick={() => setRawAmount(balance.toString())}
                      disabled={locked}
                      className="text-xs font-semibold disabled:opacity-40"
                      style={{ color: "#0C6B38" }}
                    >
                      Withdraw all
                    </button>
                  </div>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-3 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      disabled={locked || p > balance}
                      onClick={() => setRawAmount(Math.min(p, balance).toString())}
                      className="py-2.5 rounded-xl text-sm font-semibold border transition-all disabled:opacity-30"
                      style={amount === p ? { background: "#0C6B38", borderColor: "#0C6B38", color: "white" } : { background: "#F8FAF8", borderColor: "#E5E7EB", color: "#374151" }}
                    >
                      ₦{p / 1000}k
                    </button>
                  ))}
                </div>

                {/* Summary strip */}
                <AnimatePresence>
                  {amount >= 1000 && amount <= balance && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: "#BBF7D0", background: "#F0FDF4" }}>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Withdrawal amount</span>
                          <span className="font-bold text-gray-900">₦{amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Processing fee</span>
                          <span className="font-bold" style={{ color: "#0C6B38" }}>FREE</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                          <span className="text-sm font-semibold text-gray-700">You'll receive</span>
                          <span className="font-bold text-base" style={{ color: "#0C6B38" }}>₦{amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-white border-t border-gray-100 flex gap-3">
                <Button variant="outline" onClick={handleClose} className="flex-1 h-12 rounded-xl font-semibold">Cancel</Button>
                <Button
                  onClick={handleAmountNext}
                  disabled={amount < 1000 || amount > balance || locked}
                  className="flex-1 h-12 rounded-xl font-bold text-white"
                  style={{ background: "#0C6B38" }}
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── METHOD ── */}
          {step === "method" && (
            <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>
              {/* Header */}
              <div className="px-6 pt-6 pb-5" style={{ background: "linear-gradient(135deg, #0C6B38 0%, #0a5a2f 100%)" }}>
                <div className="flex items-center justify-between mb-4">
                  <button onClick={back} className="text-white/70 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <StepDots current="method" />
                  <button onClick={handleClose} className="text-white/60 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-white text-lg font-bold">Withdrawal Method</h2>
                <p className="text-white/70 text-sm mt-0.5">Choose where to receive ₦{amount.toLocaleString()}</p>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-3 bg-white">
                {[
                  { id: "bank" as WithdrawMethod, icon: Banknote, label: "Bank Transfer", sub: "All Nigerian banks · Instant to 24h" },
                  { id: "crypto" as WithdrawMethod, icon: Coins, label: "Crypto Wallet", sub: "USDT, BTC, ETH, SOL" },
                ].map(({ id, icon: Icon, label, sub }) => (
                  <button
                    key={id}
                    onClick={() => { setMethod(id); handleMethodNext(); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all hover:border-green-400 hover:bg-green-50 group"
                    style={{ borderColor: method === id ? "#0C6B38" : "#E5E7EB" }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#F0FDF4" }}>
                      <Icon className="w-6 h-6" style={{ color: "#0C6B38" }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                    </div>
                    <div className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: "#F0FDF4", color: "#0C6B38" }}>FREE</div>
                  </button>
                ))}
              </div>

              <div className="px-6 py-4 bg-white border-t border-gray-100">
                <Button variant="outline" onClick={back} className="w-full h-12 rounded-xl font-semibold">Back</Button>
              </div>
            </motion.div>
          )}

          {/* ── DETAILS ── */}
          {step === "details" && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>
              {/* Header */}
              <div className="px-6 pt-6 pb-5" style={{ background: "linear-gradient(135deg, #0C6B38 0%, #0a5a2f 100%)" }}>
                <div className="flex items-center justify-between mb-4">
                  <button onClick={back} className="text-white/70 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <StepDots current="details" />
                  <button onClick={handleClose} className="text-white/60 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-white text-lg font-bold">{method === "bank" ? "Bank Details" : "Wallet Address"}</h2>
                <p className="text-white/70 text-sm mt-0.5">
                  {method === "bank" ? "Where should we send your money?" : "Enter your crypto wallet address"}
                </p>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4 bg-white">
                {method === "bank" ? (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Bank</label>
                      <select
                        value={bank.code}
                        onChange={(e) => {
                          const found = NIGERIAN_BANKS.find((b) => b.code === e.target.value);
                          setBank({ ...bank, code: e.target.value, name: found?.name ?? "" });
                        }}
                        className="w-full h-12 px-3.5 rounded-xl border-2 bg-white text-sm font-medium outline-none transition-colors"
                        style={{ borderColor: bank.code ? "#0C6B38" : "#E5E7EB" }}
                      >
                        <option value="">Select your bank</option>
                        {NIGERIAN_BANKS.map((b) => (
                          <option key={b.code} value={b.code}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Account Number</label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="10-digit account number"
                        value={bank.accountNumber}
                        onChange={(e) => setBank({ ...bank, accountNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                        className="h-12 font-mono text-base rounded-xl border-2 outline-none"
                        style={{ borderColor: bank.accountNumber.length === 10 ? "#0C6B38" : "#E5E7EB" }}
                        maxLength={10}
                      />
                      <p className="text-xs text-gray-400 mt-1">{bank.accountNumber.length}/10 digits</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Account Name</label>
                      <Input
                        type="text"
                        placeholder="Name on bank account"
                        value={bank.accountName}
                        onChange={(e) => setBank({ ...bank, accountName: e.target.value })}
                        className="h-12 rounded-xl border-2"
                        style={{ borderColor: bank.accountName ? "#0C6B38" : "#E5E7EB" }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Network</label>
                      <div className="grid grid-cols-4 gap-2">
                        {CRYPTO_NETWORKS.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => setCryptoNet(n.id)}
                            className="py-2.5 rounded-xl text-xs font-bold border-2 transition-all"
                            style={cryptoNet === n.id ? { background: "#0C6B38", borderColor: "#0C6B38", color: "white" } : { background: "#F8FAF8", borderColor: "#E5E7EB", color: "#374151" }}
                          >
                            {n.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{cryptoLabel} Address</label>
                      <textarea
                        placeholder={`Paste your ${cryptoLabel} wallet address`}
                        value={cryptoAddress}
                        onChange={(e) => setCryptoAddress(e.target.value.trim())}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 font-mono text-sm resize-none outline-none transition-colors"
                        style={{ borderColor: cryptoAddress.length >= 20 ? "#0C6B38" : "#E5E7EB" }}
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2 items-start rounded-xl p-3.5 border border-amber-200 bg-amber-50">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">Double-check your details. Incorrect information may result in lost funds.</p>
                </div>
              </div>

              <div className="px-6 py-4 bg-white border-t border-gray-100 flex gap-3">
                <Button variant="outline" onClick={back} className="flex-1 h-12 rounded-xl font-semibold">Back</Button>
                <Button onClick={handleDetailsNext} className="flex-1 h-12 rounded-xl font-bold text-white" style={{ background: "#0C6B38" }}>
                  Review <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── CONFIRM ── */}
          {step === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>
              <div className="px-6 pt-6 pb-5" style={{ background: "linear-gradient(135deg, #0C6B38 0%, #0a5a2f 100%)" }}>
                <div className="flex items-center justify-between mb-4">
                  <button onClick={back} className="text-white/70 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <StepDots current="confirm" />
                  <button onClick={handleClose} className="text-white/60 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-white text-lg font-bold">Confirm Withdrawal</h2>
                <p className="text-white/70 text-sm mt-0.5">Review before sending</p>
              </div>

              <div className="px-6 py-5 space-y-4 bg-white">
                {/* Amount hero */}
                <div className="text-center py-4 rounded-2xl" style={{ background: "#F0FDF4" }}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Withdrawing</p>
                  <p className="text-4xl font-black" style={{ color: "#0C6B38" }}>₦{amount.toLocaleString()}</p>
                </div>

                {/* Details */}
                <div className="rounded-2xl border divide-y" style={{ borderColor: "#E5E7EB" }}>
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-gray-500">Method</span>
                    <span className="text-sm font-semibold">{method === "bank" ? "Bank Transfer" : `${cryptoLabel} Wallet`}</span>
                  </div>
                  {method === "bank" ? (
                    <>
                      <div className="flex justify-between px-4 py-3">
                        <span className="text-sm text-gray-500">Bank</span>
                        <span className="text-sm font-semibold">{bank.name}</span>
                      </div>
                      <div className="flex justify-between px-4 py-3">
                        <span className="text-sm text-gray-500">Account</span>
                        <span className="text-sm font-semibold font-mono">{bank.accountNumber}</span>
                      </div>
                      <div className="flex justify-between px-4 py-3">
                        <span className="text-sm text-gray-500">Name</span>
                        <span className="text-sm font-semibold">{bank.accountName}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between px-4 py-3 gap-4">
                      <span className="text-sm text-gray-500 flex-shrink-0">Address</span>
                      <span className="text-xs font-mono text-gray-700 text-right break-all">{cryptoAddress}</span>
                    </div>
                  )}
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-gray-500">Fee</span>
                    <span className="text-sm font-bold" style={{ color: "#0C6B38" }}>FREE</span>
                  </div>
                </div>

                <p className="text-xs text-center text-gray-400">
                  {method === "bank" ? "Bank transfers process within 2–3 business days." : "Crypto withdrawals process within 1–2 hours."}
                </p>
              </div>

              <div className="px-6 py-4 bg-white border-t border-gray-100 flex gap-3">
                <Button variant="outline" onClick={back} className="flex-1 h-12 rounded-xl font-semibold">Back</Button>
                <Button onClick={handleConfirm} className="flex-1 h-12 rounded-xl font-bold text-white" style={{ background: "#0C6B38" }}>
                  Confirm &amp; Send
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── PROCESSING ── */}
          {step === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-20 px-8 bg-white">
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(12,107,56,0.15)" }} />
                <div className="relative w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "#F0FDF4" }}>
                  <Loader2 className="w-9 h-9 animate-spin" style={{ color: "#0C6B38" }} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Withdrawal</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Sending ₦{amount.toLocaleString()} via {method === "bank" ? "Bank Transfer" : `${cryptoLabel} Wallet`}…
              </p>
            </motion.div>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-16 px-8 bg-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ background: "#F0FDF4" }}
              >
                <CheckCircle2 className="w-10 h-10" style={{ color: "#0C6B38" }} />
              </motion.div>
              <h3 className="text-2xl font-black mb-2" style={{ color: "#0C6B38" }}>Withdrawal Sent!</h3>
              <p className="text-sm text-gray-500 max-w-xs mb-6">
                ₦{amount.toLocaleString()} is on its way to your {method === "bank" ? "bank account" : `${cryptoLabel} wallet`}.
              </p>
              <div className="w-full rounded-xl border p-4 text-sm text-gray-600" style={{ borderColor: "#BBF7D0", background: "#F0FDF4" }}>
                {method === "bank" ? "Expected: 2–3 business days" : "Expected: 1–2 hours"}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
