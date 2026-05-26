import { useState } from "react";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useTasksApi } from "@/hooks/use-tasks-api";
import { useWallet } from "@/hooks/use-wallet";
import {
  ShieldAlert, Loader2, CheckCircle, Clock, Users, ClipboardList,
  Wallet, TrendingUp, RefreshCw, Eye, ChevronRight, AlertCircle
} from "lucide-react";
import { Link, Redirect } from "wouter";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useLocalizationStore } from "@/stores/localization-store";

const ADMIN_EMAILS = [
  "admin@helpchain.ng",
  "noreply@helpchain.ng",
  "helpchainadmin@gmail.com",
];

const STATUS_COLORS: Record<string, string> = {
  open:        "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  completed:   "bg-green-50 text-green-700 border-green-200",
  cancelled:   "bg-red-50 text-red-700 border-red-200",
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const { myTasks, openTasks, tasksLoading, refetchTasks, refetchOpenTasks } = useTasksApi();
  const { availableBalance, escrowBalance } = useWallet();
  const { formatLocal } = useLocalizationStore();
  const [tab, setTab] = useState<"overview" | "tasks" | "open">("overview");

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAF8]">
        <Loader2 className="w-6 h-6 animate-spin text-[#0C6B38]" />
      </div>
    );
  }

  if (!user) return <Redirect to="/auth" />;

  const isAdmin = user.email && (
    ADMIN_EMAILS.includes(user.email) ||
    user.email.endsWith("@helpchain.ng") ||
    user.email.endsWith("@helpchain.app")
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAF8]">
        <MobileHeader title="Admin" />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4" style={{ border: "1px solid #FEE2E2" }}>
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[#0D0D0D] mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500 max-w-sm mb-6">
            You don't have permission to access the admin dashboard. This area is restricted to HelpChain administrators.
          </p>
          <Link href="/">
            <button className="text-sm font-semibold px-6 py-2.5 rounded-xl text-white" style={{ background: "#0C6B38" }}>
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const allTasks = [...myTasks, ...openTasks];
  const uniqueTasks = Array.from(new Map(allTasks.map(t => [t.id, t])).values());
  const completedTasks = uniqueTasks.filter(t => t.status === "completed");
  const inProgressTasks = uniqueTasks.filter(t => t.status === "in_progress");
  const openTasksList = uniqueTasks.filter(t => t.status === "open");

  const stats = [
    { label: "Total Tasks",   value: uniqueTasks.length,    icon: ClipboardList, color: "#0C6B38" },
    { label: "Open",          value: openTasksList.length,  icon: Clock,         color: "#1d4ed8" },
    { label: "In Progress",   value: inProgressTasks.length,icon: TrendingUp,    color: "#d97706" },
    { label: "Completed",     value: completedTasks.length, icon: CheckCircle,   color: "#059669" },
  ];

  const handleRefresh = () => {
    refetchTasks();
    refetchOpenTasks();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8]" style={{ paddingBottom: "80px" }}>
      <MobileHeader title="Admin Dashboard" />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(12,107,56,0.1)" }}>
                <ShieldAlert className="w-4 h-4 text-[#0C6B38]" />
              </div>
              <h1 className="text-xl font-bold text-[#0D0D0D]">Admin Dashboard</h1>
            </div>
            <p className="text-xs text-gray-400">Logged in as <span className="font-medium">{user.email}</span></p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #F0F0F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}15` }}>
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <p className="text-2xl font-bold text-[#0D0D0D]">{tasksLoading ? "—" : s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Wallet info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <div className="bg-white rounded-2xl p-5 flex flex-wrap gap-6" style={{ border: "1px solid #F0F0F0" }}>
            <div>
              <p className="text-xs text-gray-400 mb-1">Your Wallet Balance</p>
              <p className="text-2xl font-bold" style={{ color: "#0C6B38" }}>{formatLocal(availableBalance)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">In Escrow</p>
              <p className="text-2xl font-bold text-amber-600">{formatLocal(escrowBalance)}</p>
            </div>
            <div className="ml-auto flex items-center">
              <Link href="/wallet">
                <button className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border border-[#0C6B38]/30 text-[#0C6B38] hover:bg-[#0C6B38]/5 transition-colors">
                  <Wallet className="w-3.5 h-3.5" /> Manage Wallet
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white mb-5" style={{ border: "1px solid #F0F0F0" }}>
          {(["overview", "tasks", "open"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all capitalize ${
                tab === t ? "bg-[#0C6B38] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "overview" ? "Overview" : t === "tasks" ? "My Tasks" : "Open Tasks"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tasksLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#0C6B38]" />
          </div>
        ) : tab === "overview" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Recent activity */}
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #F0F0F0" }}>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid #F5F5F5" }}>
                <h3 className="text-sm font-semibold text-[#0D0D0D]">All Tasks</h3>
              </div>
              {uniqueTasks.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No tasks in the system yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {uniqueTasks.slice(0, 10).map((task) => {
                    const sc = STATUS_COLORS[task.status] || "bg-gray-50 text-gray-600 border-gray-200";
                    return (
                      <Link key={task.id} href={`/request/${task.id}`}>
                        <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F8FAF8] transition-colors cursor-pointer">
                          <div className="w-8 h-8 rounded-xl bg-[#E8F5EF] flex items-center justify-center shrink-0">
                            <ClipboardList className="w-4 h-4 text-[#0C6B38]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#0D0D0D] truncate">{task.title}</p>
                            <p className="text-xs text-gray-400">{task.category.replace(/_/g, " ")} · {format(new Date(task.created_at), "MMM d")}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${sc}`}>
                            {task.status.replace(/_/g, " ")}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ) : tab === "tasks" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #F0F0F0" }}>
              {myTasks.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No tasks yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {myTasks.map((task) => {
                    const sc = STATUS_COLORS[task.status] || "bg-gray-50 text-gray-600 border-gray-200";
                    return (
                      <Link key={task.id} href={`/request/${task.id}`}>
                        <div className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAF8] transition-colors cursor-pointer">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#0D0D0D] truncate">{task.title}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                              <span>{task.category.replace(/_/g, " ")}</span>
                              <span>·</span>
                              <span>{format(new Date(task.created_at), "MMM d, yyyy")}</span>
                              {task.budget > 0 && (
                                <>
                                  <span>·</span>
                                  <span className="font-semibold" style={{ color: "#0C6B38" }}>{formatLocal(task.budget)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${sc}`}>
                            {task.status.replace(/_/g, " ")}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #F0F0F0" }}>
              {openTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Eye className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No open tasks in the marketplace.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {openTasks.map((task) => (
                    <Link key={task.id} href={`/request/${task.id}`}>
                      <div className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAF8] transition-colors cursor-pointer">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#0D0D0D] truncate">{task.title}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                            <span>{task.category.replace(/_/g, " ")}</span>
                            <span>·</span>
                            <span>{(task.offers_count || 0)} offers</span>
                            {task.budget > 0 && (
                              <>
                                <span>·</span>
                                <span className="font-semibold" style={{ color: "#0C6B38" }}>{formatLocal(task.budget)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                          Open
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
