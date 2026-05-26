import { useState, useEffect } from "react";
import { Link, Redirect } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  Bell, Eye, EyeOff, Plus, Search, Wallet, MessageCircle,
  ChevronRight, ClipboardList, CheckCircle, Activity, TrendingUp,
  Loader2, Star, Zap, ArrowUpRight, Sparkles, ArrowRight
} from "lucide-react";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useWallet } from "@/hooks/use-wallet";
import { useTasksApi } from "@/hooks/use-tasks-api";
import { useLocalizationStore } from "@/stores/localization-store";
import { useNotifications } from "@/hooks/use-notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const GREEN = "#0C6B38";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 }
  }
};

export default function Dashboard() {
  const { user } = useFirebaseAuth();
  const { availableBalance, escrowBalance } = useWallet();
  const { formatLocal } = useLocalizationStore();
  const { myTasks, tasksLoading } = useTasksApi();
  const { unreadCount } = useNotifications();
  const [hideBalance, setHideBalance] = useState(false);

  if (!user) return <Redirect to="/auth" />;

  const displayName = user.displayName || "User";
  const firstName = displayName.split(" ")[0];
  const avatar = user.photoURL;

  const myPostedTasks = myTasks.filter((t) => t.creatorId === user.uid);
  const activeTasks = myPostedTasks.filter((t) => ["published", "in_progress"].includes(t.status));
  const completedTasks = myPostedTasks.filter((t) => t.status === "completed");

  const recentTasks = [...myTasks]
    .sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || new Date(a.createdAt).getTime() || 0;
      const timeB = b.createdAt?.toMillis?.() || new Date(b.createdAt).getTime() || 0;
      return timeB - timeA;
    })
    .slice(0, 3);

  return (
    <MobileLayout>
      <div className="min-h-full bg-[#F8FAF9] pb-10">

        {/* Premium Header */}
        <header className="px-6 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] pb-8 bg-white border-b border-gray-100 rounded-b-[40px] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Avatar className="h-14 w-14 ring-4 ring-[#0C6B38]/5">
                  <AvatarImage src={avatar || undefined} />
                  <AvatarFallback className="bg-gradient-green text-white font-bold text-lg">
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full" />
              </motion.div>
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">HelpChain</p>
                <h1 className="text-[#0D0D0D] font-black text-2xl tracking-tight leading-tight">
                  Hi, {firstName}
                </h1>
              </div>
            </div>

            <Link href="/settings">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="relative w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100"
              >
                <Bell className="w-6 h-6 text-gray-700" strokeWidth={2} />
                {unreadCount > 0 && (
                  <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm" />
                )}
              </motion.button>
            </Link>
          </div>

          {/* Balance Card - Premium Look */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 rounded-[32px] relative overflow-hidden shadow-green-lg"
            style={{ background: "linear-gradient(135deg, #0C6B38 0%, #15A34A 100%)" }}
          >
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }} />

            <div className="relative z-10">
              <div className="flex items-center justify-between opacity-80 mb-1">
                <span className="text-white text-xs font-bold uppercase tracking-wider">Available Balance</span>
                <motion.button onClick={() => setHideBalance(!hideBalance)} className="text-white/60">
                  {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                </motion.button>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-white/70 text-lg font-bold">₦</span>
                <h2 className="text-4xl font-black text-white tracking-tighter">
                  {hideBalance ? "••••••" : availableBalance.toLocaleString()}
                </h2>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                  <p className="text-white/80 text-[10px] font-bold uppercase">
                    Escrow Locked: {hideBalance ? "•••" : formatLocal(escrowBalance)}
                  </p>
                </div>
                <Link href="/wallet">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-[#0C6B38] px-5 py-2.5 rounded-2xl text-sm font-black flex items-center gap-2 shadow-sm"
                  >
                    Top Up <ArrowUpRight size={16} />
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="px-6 mt-8 space-y-8"
        >
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-premium">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <ClipboardList className="text-blue-600 w-5 h-5" />
              </div>
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Total Tasks</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{myPostedTasks.length}</h3>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-premium">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="text-green-600 w-5 h-5" />
              </div>
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Completed</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{completedTasks.length}</h3>
            </motion.div>
          </div>

          {/* Active Tasks Section */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-900">Your Activities</h2>
              <Link href="/discover">
                <span className="text-[#0C6B38] text-sm font-bold flex items-center gap-1">
                  View all <ChevronRight size={16} />
                </span>
              </Link>
            </div>

            {tasksLoading ? (
               <div className="flex items-center justify-center py-10">
                 <Loader2 className="w-8 h-8 animate-spin text-[#0C6B38]" />
               </div>
            ) : recentTasks.length === 0 ? (
              <div className="bg-white rounded-[32px] p-8 text-center border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="text-gray-300 w-8 h-8" />
                </div>
                <h4 className="text-gray-900 font-bold">No recent tasks</h4>
                <p className="text-gray-400 text-xs mt-1">Start by posting your first help request.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <Link key={task.id} href={`/request/${task.id}`}>
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className="bg-white p-4 rounded-[24px] border border-gray-50 shadow-premium flex items-center gap-4 group"
                    >
                      <div className="w-12 h-12 bg-[#F0FDF4] rounded-2xl flex items-center justify-center shrink-0">
                        <Activity className="text-[#0C6B38] w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#0C6B38] transition-colors">{task.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-bold uppercase">
                            {task.status.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(task.createdAt?.toDate?.() || task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-gray-300 group-hover:text-[#0C6B38] transition-colors" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </motion.section>

          {/* Explore Promo Card */}
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-[32px] relative overflow-hidden bg-gray-900"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#0C6B38]/30 rounded-full blur-3xl" />
             <div className="relative z-10 flex flex-col gap-2">
               <span className="text-green-400 text-[10px] font-black uppercase tracking-widest">Marketplace</span>
               <h3 className="text-white text-xl font-bold">Discover new tasks near you</h3>
               <p className="text-white/60 text-xs">Help others and earn rewards instantly.</p>
               <Link href="/discover">
                 <motion.button
                   whileTap={{ scale: 0.95 }}
                   className="mt-4 bg-[#0C6B38] text-white px-6 py-3 rounded-2xl text-sm font-bold w-fit shadow-lg"
                 >
                   Explore Now
                 </motion.button>
               </Link>
             </div>
          </motion.div>

        </motion.div>
      </div>
    </MobileLayout>
  );
}
