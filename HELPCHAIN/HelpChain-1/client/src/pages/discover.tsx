import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Input } from "@/components/ui/input";
import {
  Search, MapPin, Clock, Globe, Users, X, Loader2,
  ChevronRight, SlidersHorizontal, Briefcase, Sparkles,
  ArrowUpRight, Plus
} from "lucide-react";
import { Link, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useTasksApi, type TaskData } from "@/hooks/use-tasks-api";
import { useLocalizationStore } from "@/stores/localization-store";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const GREEN = "#0C6B38";

const CATEGORY_MAP: Record<string, string> = {
  physical_help: "Physical Help", errands: "Errands", tech_help: "Tech Help",
  guidance: "Guidance", transportation: "Transportation", home_repairs: "Home Repairs",
  childcare: "Childcare", pet_care: "Pet Care", tutoring: "Tutoring",
  digital_work: "Digital Work", design: "Design", writing: "Writing",
  programming: "Programming", marketing: "Marketing", research: "Research",
  education: "Education", translation: "Translation", consulting: "Consulting",
  home_services: "Home Services", photography: "Photography",
  event_planning: "Event Planning", fitness: "Fitness & Health",
  cooking: "Cooking & Catering", personal_shopping: "Personal Shopping",
  legal: "Legal & Finance", other: "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  tech_help:    "#3B82F6",
  design:       "#8B5CF6",
  writing:      "#10B981",
  marketing:    "#EC4899",
  home_repairs: "#F59E0B",
  errands:      "#6366F1",
  other:        "#6B7280",
};

const FILTER_CATEGORIES = [
  "All", "Physical Help", "Errands", "Tech Help", "Design", "Writing",
  "Education", "Home Services", "Photography", "Programming"
];

function TaskCard({ task, formatLocal, index }: { task: TaskData; formatLocal: (n: number) => string; index: number }) {
  const catColor = CATEGORY_COLORS[task.category] || "#6B7280";
  const catLabel = CATEGORY_MAP[task.category] || task.category;

  const date = task.createdAt?.toDate?.() || new Date(task.createdAt);
  const timeLabel = isNaN(date.getTime()) ? "Recently" : new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    -Math.floor((Date.now() - date.getTime()) / 86400000), 'day'
  );

  return (
    <Link href={`/request/${task.id}`}>
      <motion.div
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, type: "spring", stiffness: 260, damping: 20 }}
        className="group bg-white rounded-[32px] p-5 border border-gray-100 shadow-premium hover:border-[#0C6B38]/20 transition-all mb-4"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-100">
               <div className="w-2 h-2 rounded-full" style={{ background: catColor }} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {catLabel}
            </span>
          </div>
          <div className="bg-[#F0FDF4] px-3 py-1.5 rounded-2xl">
            <span className="text-[#0C6B38] text-sm font-black tracking-tight">
              {formatLocal(task.budget)}
            </span>
          </div>
        </div>

        <h3 className="text-[17px] font-black text-gray-900 leading-tight mb-2 group-hover:text-[#0C6B38] transition-colors">
          {task.title}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2 mb-5 font-medium leading-relaxed">
          {task.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-gray-400">
              <MapPin size={14} strokeWidth={2.5} />
              <span className="text-[11px] font-bold">{task.locationType === 'remote' ? 'Remote' : (task.location || 'Local')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Users size={14} strokeWidth={2.5} />
              <span className="text-[11px] font-bold">{task.offers_count || 0} Offers</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-gray-300">
             <Clock size={12} strokeWidth={2.5} />
             <span className="text-[10px] font-black uppercase">{timeLabel}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function DiscoverPage() {
  const [searchInput, setSearchInput] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const { openTasks, openTasksLoading } = useTasksApi();
  const { formatLocal } = useLocalizationStore();
  const { user } = useFirebaseAuth();

  const filtered = openTasks.filter((task) => {
    const q = searchInput.toLowerCase();
    const matchesSearch = !q || task.title.toLowerCase().includes(q) || task.description?.toLowerCase().includes(q);
    const matchesCat = activeFilter === "All" || (CATEGORY_MAP[task.category] || "").toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <MobileLayout>
      <div className="min-h-full bg-[#F8FAF9]">

        {/* Header Section */}
        <div className="px-6 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] pb-4 bg-white rounded-b-[40px] shadow-sm sticky top-0 z-50">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Explore</h1>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${showFilters ? 'bg-[#0C6B38] text-white' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}
            >
              <SlidersHorizontal size={20} strokeWidth={2.5} />
            </motion.button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={2.5} />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="What do you need help with?"
              className="pl-12 h-[56px] rounded-2xl border-none bg-gray-50 text-sm font-bold placeholder:text-gray-400 focus-visible:ring-[#0C6B38]/20"
            />
            {searchInput && (
              <button onClick={() => setSearchInput("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                <X size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showFilters && (
               <motion.div
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="pt-4"
               >
                 <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {FILTER_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${activeFilter === cat ? 'bg-[#0C6B38] text-white shadow-green' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}
                      >
                        {cat}
                      </button>
                    ))}
                 </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Area */}
        <div className="px-6 pt-6 pb-20">
          <div className="flex items-center justify-between mb-6">
             <span className="text-gray-400 text-xs font-black uppercase tracking-widest">
               {openTasksLoading ? 'Scanning...' : `${filtered.length} Results Found`}
             </span>
             {user && (
               <Link href="/create-request">
                 <motion.button whileTap={{ scale: 0.95 }} className="text-[#0C6B38] text-xs font-black flex items-center gap-1">
                   Post Task <Plus size={14} strokeWidth={3} />
                 </motion.button>
               </Link>
             )}
          </div>

          {openTasksLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 rounded-[32px] bg-white border border-gray-100 shimmer" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
               <div className="w-20 h-20 bg-white rounded-[32px] shadow-premium flex items-center justify-center mx-auto mb-6">
                 <Briefcase className="text-gray-200" size={32} strokeWidth={2} />
               </div>
               <h3 className="text-lg font-black text-gray-900">No tasks found</h3>
               <p className="text-gray-400 text-sm mt-2 max-w-[200px] mx-auto leading-relaxed">
                 Try changing your search or category filters.
               </p>
            </div>
          ) : (
            <div>
              {filtered.map((task, i) => (
                <TaskCard key={task.id} task={task} formatLocal={formatLocal} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Create Float for Non-Creators */}
        <div className="fixed bottom-28 right-6 z-50">
           <Link href="/create-request">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-premium-lg"
              >
                <Plus size={24} strokeWidth={3} />
              </motion.button>
           </Link>
        </div>
      </div>
    </MobileLayout>
  );
}
