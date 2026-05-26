import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet, type Transaction } from "@/hooks/use-wallet";
import { useLocalizationStore } from "@/stores/localization-store";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Wallet, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle,
  Shield, CircleDollarSign, Eye, EyeOff, Download, Upload, Loader2,
  CreditCard, Building, RefreshCw, ChevronRight, TrendingUp, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const GREEN = "#0C6B38";

const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "GTBank", code: "058" },
  { name: "Kuda Bank", code: "090267" },
  { name: "Moniepoint", code: "50515" },
  { name: "OPay", code: "999992" },
  { name: "United Bank for Africa", code: "033" },
  { name: "Zenith Bank", code: "057" },
];

function TxIcon({ type }: { type: string }) {
  switch (type) {
    case "deposit":        return <Download size={14} className="text-green-600" />;
    case "withdrawal":     return <Upload size={14} className="text-red-600" />;
    case "earning":        return <TrendingUp size={14} className="text-blue-600" />;
    case "escrow_lock":    return <Shield size={14} className="text-amber-600" />;
    default:               return <CircleDollarSign size={14} className="text-gray-400" />;
  }
}

function WalletContent() {
  const {
    availableBalance, escrowBalance, transactions, isLoading, transactionsLoading,
    initializeDeposit, verifyDeposit, withdraw, depositPending, withdrawPending,
  } = useWallet();
  const { user } = useFirebaseAuth();
  const { formatLocal } = useLocalizationStore();
  const { toast } = useToast();

  const [hideBalance, setHideBalance] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const handleDeposit = async () => {
    const amt = parseFloat(depositAmount);
    if (!amt || amt < 500) {
      toast({ title: "Min deposit ₦500", variant: "destructive" });
      return;
    }

    // In a premium app, we'd trigger Paystack here.
    // For now, we'll request the deposit in Firestore.
    try {
      await initializeDeposit(amt);
      toast({ title: "Deposit Initialized", description: "Waiting for payment verification..." });
      setDepositOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt > availableBalance) {
      toast({ title: "Insufficient balance", variant: "destructive" });
      return;
    }
    try {
      await withdraw({ amount: amt, bank: selectedBank, accountNumber, accountName });
      toast({ title: "Withdrawal Requested", description: "Funds will be sent to your bank shortly." });
      setWithdrawOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <MobileLayout>
      <div className="min-h-full bg-[#F8FAF9] pb-24">
        <header className="px-6 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] pb-8 bg-white rounded-b-[40px] shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => window.history.back()}
                className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center"
              >
                <ChevronLeft size={20} className="text-gray-900" strokeWidth={3} />
              </motion.button>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">My Wallet</h1>
              <div className="w-11" />
           </div>

           {/* Premium Balance Card */}
           <motion.div
             initial={{ scale: 0.95, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="relative p-8 rounded-[40px] bg-gray-900 text-white overflow-hidden shadow-2xl"
           >
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#0C6B38]/30 rounded-full blur-3xl" />

              <div className="relative z-10">
                 <div className="flex items-center justify-between opacity-50 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Available Funds</span>
                    <button onClick={() => setHideBalance(!hideBalance)}>
                       {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                 </div>

                 <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-[#15A34A]">₦</span>
                    <h2 className="text-4xl font-black tracking-tighter">
                       {hideBalance ? "••••••" : availableBalance.toLocaleString()}
                    </h2>
                 </div>

                 <div className="mt-8 flex gap-3">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDepositOpen(true)}
                      className="flex-1 bg-[#0C6B38] h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-sm shadow-green"
                    >
                       <Download size={18} strokeWidth={3} /> Add
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setWithdrawOpen(true)}
                      className="flex-1 bg-white/10 backdrop-blur-md h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-sm border border-white/5"
                    >
                       <Upload size={18} strokeWidth={3} /> Send
                    </motion.button>
                 </div>
              </div>
           </motion.div>
        </header>

        <div className="px-6 mt-8 space-y-8">

           {/* Escrow Tracker */}
           <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-premium flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                    <ShieldCheck size={24} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Escrow Locked</p>
                    <h4 className="text-lg font-black text-gray-900">{formatLocal(escrowBalance)}</h4>
                 </div>
              </div>
              <div className="px-3 py-1 bg-amber-50 rounded-full">
                 <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider">Secured</span>
              </div>
           </section>

           {/* Transactions */}
           <section>
              <div className="flex items-center justify-between mb-6 px-2">
                 <h2 className="text-lg font-black text-gray-900 tracking-tight">Recent Activity</h2>
                 <button className="text-[#0C6B38] text-xs font-black uppercase tracking-widest">Filter</button>
              </div>

              {transactionsLoading ? (
                 <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-20 rounded-[28px] bg-white border border-gray-50 shimmer" />)}
                 </div>
              ) : transactions.length === 0 ? (
                 <div className="py-12 text-center bg-white rounded-[40px] border border-gray-50 shadow-premium">
                    <CircleDollarSign size={40} className="text-gray-100 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm font-bold tracking-tight">No transactions yet</p>
                 </div>
              ) : (
                <div className="space-y-3">
                   {transactions.map((tx, i) => (
                     <motion.div
                       key={tx.id}
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.05 }}
                       className="bg-white p-5 rounded-[28px] border border-gray-50 shadow-premium flex items-center justify-between"
                     >
                        <div className="flex items-center gap-4">
                           <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center">
                              <TxIcon type={tx.type} />
                           </div>
                           <div>
                              <h4 className="text-sm font-black text-gray-900">{tx.description}</h4>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                {new Date(tx.createdAt?.toDate?.() || tx.createdAt).toLocaleDateString()}
                              </p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className={`text-sm font-black ${['deposit', 'earning'].includes(tx.type) ? 'text-green-600' : 'text-gray-900'}`}>
                             {['deposit', 'earning'].includes(tx.type) ? '+' : '-'}{formatLocal(tx.amount)}
                           </p>
                           <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{tx.status}</span>
                        </div>
                     </motion.div>
                   ))}
                </div>
              )}
           </section>
        </div>
      </div>

      {/* Deposit Dialog */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="rounded-[40px] p-8 border-none shadow-premium-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-gray-900">Add Funds</DialogTitle>
            <DialogDescription className="text-sm font-medium text-gray-400">
               Enter the amount you want to deposit into your HelpChain wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-6">
             <div className="bg-gray-50 p-6 rounded-[32px] text-center">
                <span className="text-gray-400 text-xs font-black uppercase tracking-widest block mb-2">Amount to Add</span>
                <div className="flex items-center justify-center gap-2">
                   <span className="text-2xl font-black text-gray-300">₦</span>
                   <input
                     type="number"
                     value={depositAmount}
                     onChange={e => setDepositAmount(e.target.value)}
                     className="text-4xl font-black text-gray-900 bg-transparent w-full max-w-[150px] text-center focus:outline-none"
                     placeholder="0"
                   />
                </div>
             </div>

             <div className="grid grid-cols-3 gap-2">
                {[1000, 5000, 10000].map(amt => (
                  <button key={amt} onClick={() => setDepositAmount(amt.toString())} className="py-3 bg-gray-50 rounded-2xl text-xs font-black text-gray-500 hover:bg-[#0C6B38]/5 hover:text-[#0C6B38] transition-all">
                    ₦{amt/1000}K
                  </button>
                ))}
             </div>

             <motion.button
               whileTap={{ scale: 0.95 }}
               onClick={handleDeposit}
               disabled={depositPending}
               className="w-full bg-[#0C6B38] text-white h-16 rounded-[24px] font-black shadow-green flex items-center justify-center gap-2"
             >
               {depositPending ? <Loader2 className="animate-spin" /> : "Proceed to Payment"}
             </motion.button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="rounded-[40px] p-8 border-none shadow-premium-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-gray-900">Withdraw Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
             <div className="bg-gray-50 p-6 rounded-[32px]">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Amount (₦)</Label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="w-full bg-transparent text-2xl font-black text-gray-900 focus:outline-none mt-1"
                  placeholder="0"
                />
                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">Available: {formatLocal(availableBalance)}</p>
             </div>

             <div className="space-y-4">
                <div>
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Bank</Label>
                   <select
                     value={selectedBank}
                     onChange={e => setSelectedBank(e.target.value)}
                     className="w-full h-14 bg-gray-50 rounded-2xl px-4 mt-2 font-bold text-sm border-none appearance-none"
                   >
                      <option value="">Choose a bank...</option>
                      {NIGERIAN_BANKS.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                   </select>
                </div>
                <div>
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Number</Label>
                   <Input
                     value={accountNumber}
                     onChange={e => setAccountNumber(e.target.value)}
                     className="h-14 rounded-2xl bg-gray-50 border-none font-bold mt-2"
                   />
                </div>
             </div>

             <motion.button
               whileTap={{ scale: 0.95 }}
               onClick={handleWithdraw}
               disabled={withdrawPending}
               className="w-full bg-gray-900 text-white h-16 rounded-[24px] font-black shadow-xl flex items-center justify-center gap-2 mt-4"
             >
               {withdrawPending ? <Loader2 className="animate-spin" /> : "Confirm Withdrawal"}
             </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}

function ChevronLeft(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  );
}

export default function WalletPage() {
  return (
    <ProtectedRoute>
      <WalletContent />
    </ProtectedRoute>
  );
}
