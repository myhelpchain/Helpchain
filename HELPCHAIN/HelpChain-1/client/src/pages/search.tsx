import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search, Filter, MapPin, Clock, Star, ChevronRight, X, Loader2, SlidersHorizontal
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useTasksApi } from "@/hooks/use-tasks-api";
import { useLocalizationStore } from "@/stores/localization-store";
import { format, formatDistanceToNow } from "date-fns";

const CATEGORIES = [
  "All", "Delivery", "Cleaning", "Tech Support", "Moving", "Education",
  "Photography", "Cooking", "Repairs", "Pet Care", "Errands", "Other"
];

const URGENCY_COLORS: Record<string, string> = {
  low:      "bg-gray-50 text-gray-600 border-gray-200",
  medium:   "bg-blue-50 text-blue-700 border-blue-200",
  high:     "bg-amber-50 text-amber-700 border-amber-200",
  urgent:   "bg-red-50 text-red-600 border-red-200",
  critical: "bg-red-100 text-red-700 border-red-300",
};

export default function SearchPage() {
  const { user } = useFirebaseAuth();
  const [, navigate] = useLocation();
  const { openTasks, openTasksLoading } = useTasksApi();
  const { formatLocal } = useLocalizationStore();

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxBudget, setMaxBudget] = useState(0);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return openTasks.filter((t) => {
      const matchesQuery = !query ||
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase()) ||
        (t.location || "").toLowerCase().includes(query.toLowerCase());
      const matchesCategory = selectedCategory === "All" ||
        t.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesBudget = maxBudget <= 0 || t.budget <= maxBudget;
      const matchesRemote = !remoteOnly || t.is_remote;
      return matchesQuery && matchesCategory && matchesBudget && matchesRemote;
    });
  }, [openTasks, query, selectedCategory, maxBudget, remoteOnly]);

  const handleTaskClick = (taskId: string) => {
    if (!user) { navigate("/auth"); return; }
    navigate(`/request/${taskId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-[#0D0D0D] mb-1">Find Tasks</h1>
          <p className="text-sm text-gray-400">Browse tasks posted by people who need help near you</p>
        </div>

        {/* Search bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks, locations..."
              className="pl-11 bg-white border-gray-200 rounded-xl h-11 text-sm shadow-sm"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 rounded-xl h-11 text-sm font-medium border transition-colors ${
              showFilters ? "bg-[#0C6B38] text-white border-[#0C6B38]" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Max Budget</p>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={maxBudget || ""}
                      onChange={(e) => setMaxBudget(Number(e.target.value))}
                      placeholder="No limit"
                      className="w-40 h-9 text-sm border-gray-200"
                    />
                    {maxBudget > 0 && (
                      <span className="text-sm text-[#0C6B38] font-medium">up to {formatLocal(maxBudget)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remoteOnly"
                    checked={remoteOnly}
                    onChange={(e) => setRemoteOnly(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#0C6B38]"
                  />
                  <label htmlFor="remoteOnly" className="text-sm text-gray-600">Remote tasks only</label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedCategory === cat
                  ? "bg-[#0C6B38] text-white border-[#0C6B38]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!openTasksLoading && (
          <p className="text-xs text-gray-400 mb-4 font-medium">
            {filtered.length === 0 ? "No tasks found" : `${filtered.length} task${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        )}

        {/* Task list */}
        {openTasksLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-[#0C6B38]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="font-semibold text-[#0D0D0D] mb-1">No tasks found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <button
                  onClick={() => handleTaskClick(task.id)}
                  className="w-full text-left bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-[#0C6B38]/20 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarImage src={task.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-[#0C6B38]/10 text-[#0C6B38] font-bold text-sm">
                        {task.profiles?.full_name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-semibold text-[#0D0D0D] text-sm leading-snug">{task.title}</h3>
                        {task.budget > 0 && (
                          <span className="text-sm font-bold shrink-0" style={{ color: "#0C6B38" }}>
                            {formatLocal(task.budget)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {task.urgency && task.urgency !== "medium" && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${URGENCY_COLORS[task.urgency] || URGENCY_COLORS.medium}`}>
                            {task.urgency}
                          </span>
                        )}
                        {task.is_remote && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            Remote
                          </span>
                        )}
                        {task.location && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="w-3 h-3" /> {task.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {(task.offers_count || 0) > 0 && (
                        <p className="text-xs text-[#0C6B38] font-medium mt-2">
                          {task.offers_count} offer{task.offers_count !== 1 ? "s" : ""} submitted
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {!user && filtered.length > 0 && (
          <div className="mt-8 text-center py-6 bg-white rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-500 mb-3">Sign in to apply for tasks or post your own</p>
            <Link href="/auth">
              <button className="text-sm font-semibold px-6 py-2.5 rounded-xl text-white" style={{ background: "#0C6B38" }}>
                Sign In
              </button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
