import { useState } from "react";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useRoute, useLocation, Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocalizationStore } from "@/stores/localization-store";
import { useTask, useTaskOffers, useCompleteTask, useSubmitReview } from "@/hooks/use-tasks-api";
import {
  MapPin, Calendar, Clock, Star, ChevronLeft, Check, X,
  Globe, Shield, Users, CheckCircle2, CircleDot, Circle, Play,
  Send, TrendingUp, AlertCircle, Loader2, MessageCircle, ArrowLeft,
  Share2, MoreVertical, Briefcase, Award
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const GREEN = "#0C6B38";

const CATEGORY_LABELS: Record<string, string> = {
  physical_help: "Physical Help", errands: "Errands", tech_help: "Tech Help",
  home_repairs: "Home Repairs", tutoring: "Tutoring", design: "Design",
  programming: "Programming", marketing: "Marketing", other: "Other",
};

const CATEGORY_IMAGES: Record<string, string> = {
  design: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800",
  tech_help: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800",
  physical_help: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800",
  home_repairs: "https://images.unsplash.com/photo-1581244276891-9955cf47d27e?auto=format&fit=crop&q=80&w=800",
  errands: "https://images.unsplash.com/photo-1534452203294-49c8913721b2?auto=format&fit=crop&q=80&w=800",
  other: "https://images.unsplash.com/photo-1454165833267-028cc21e76bc?auto=format&fit=crop&q=80&w=800",
};

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string, color: string, bg: string }> = {
    published: { label: "Open", color: "#1D4ED8", bg: "#EFF6FF" },
    in_progress: { label: "In Progress", color: "#D97706", bg: "#FFFBEB" },
    completed: { label: "Completed", color: "#059669", bg: "#F0FDF4" },
    cancelled: { label: "Cancelled", color: "#DC2626", bg: "#FEF2F2" },
  };
  const config = configs[status] || configs.published;
  return (
    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-current opacity-80"
      style={{ color: config.color, backgroundColor: config.bg }}>
      {config.label}
    </span>
  );
}

export default function RequestDetails() {
  const [, params] = useRoute("/request/:id");
  const [, navigate] = useLocation();
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const taskId = params?.id;

  const { formatLocal } = useLocalizationStore();
  const { data: task, isLoading: taskLoading } = useTask(taskId);
  const { offers, isLoading: offersLoading, submitOffer, submitPending, acceptOffer, acceptPending, rejectOffer } = useTaskOffers(taskId);
  const completeTask = useCompleteTask();
  const submitReview = useSubmitReview();

  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [pitchText, setPitchText] = useState("");
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [deliveryTime, setDeliveryTime] = useState("");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const handleSubmitOffer = async () => {
    if (!taskId) return;
    try {
      await submitOffer({
        amount: offerAmount,
        message: pitchText,
        delivery_time: deliveryTime,
      });
      toast({ title: "Offer Sent", description: "Your offer has been submitted successfully." });
      setShowOfferDialog(false);
      setPitchText("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleAcceptOffer = async (offerId: string, workerName: string) => {
    try {
      await acceptOffer(offerId);
      toast({ title: "Worker Hired", description: `You have hired ${workerName} for this task.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeclineOffer = async (offerId: string) => {
    try {
      await rejectOffer(offerId);
      toast({ title: "Offer Declined" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleCompleteTask = async () => {
    if (!task || !task.helperId) return;
    const acceptedOffer = offers.find(o => o.status === 'accepted');
    if (!acceptedOffer) return;

    try {
      await completeTask.mutateAsync({
        taskId: task.id,
        workerId: task.helperId,
        amount: acceptedOffer.amount
      });
      toast({ title: "Task Completed", description: "Payment has been released to the worker." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSubmitReview = async () => {
    if (!task || !task.helperId) return;
    try {
      await submitReview.mutateAsync({
        task_id: task.id,
        reviewer_id: user?.uid,
        reviewee_id: task.helperId,
        rating: reviewRating,
        comment: reviewComment,
      });
      toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
      setShowReviewDialog(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (taskLoading) return (
    <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-[#0C6B38]" />
    </div>
  );

  if (!task) return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-white rounded-[32px] shadow-premium flex items-center justify-center mb-6">
        <AlertCircle size={32} className="text-gray-200" />
      </div>
      <h2 className="text-xl font-black text-gray-900">Task not found</h2>
      <p className="text-gray-400 text-sm mt-2 mb-8">The task you're looking for doesn't exist.</p>
      <Link href="/discover">
        <button className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold">Go Back</button>
      </Link>
    </div>
  );

  const isCreator = user?.uid === task.creatorId;
  const myOffer = offers.find(o => o.worker_id === user?.uid);
  const hasApplied = !!myOffer;
  const coverImage = CATEGORY_IMAGES[task.category] || CATEGORY_IMAGES.other;

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-32">

      {/* Immersive Header */}
      <div className="relative h-[280px] w-full overflow-hidden">
        <img src={coverImage} className="w-full h-full object-cover" alt="Task Cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAF9] via-[#F8FAF9]/20 to-black/30" />

        {/* Navigation Bar */}
        <div className="absolute top-12 left-0 right-0 px-6 flex items-center justify-between">
           <motion.button
             whileTap={{ scale: 0.9 }}
             onClick={() => window.history.back()}
             className="w-11 h-11 glass-card rounded-2xl flex items-center justify-center border-white/20"
           >
             <ArrowLeft size={20} className="text-gray-900" strokeWidth={3} />
           </motion.button>

           <div className="flex gap-2">
             <motion.button whileTap={{ scale: 0.9 }} className="w-11 h-11 glass-card rounded-2xl flex items-center justify-center border-white/20">
               <Share2 size={20} className="text-gray-900" />
             </motion.button>
           </div>
        </div>
      </div>

      <div className="px-6 -mt-16 relative z-10 space-y-6">

        {/* Main Info Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-[40px] p-8 shadow-premium border border-gray-100"
        >
          <div className="flex justify-between items-start mb-6">
            <StatusBadge status={task.status} />
            <div className="text-right">
              <p className="text-[#0C6B38] text-2xl font-black tracking-tighter">{formatLocal(task.budget)}</p>
              <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest">Fixed Budget</p>
            </div>
          </div>

          <h1 className="text-2xl font-black text-gray-900 leading-tight mb-4">{task.title}</h1>

          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
              <MapPin size={14} className="text-gray-400" />
              <span className="text-xs font-bold text-gray-600">{task.locationType === 'remote' ? 'Remote' : (task.location || 'Local')}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
              <Clock size={14} className="text-gray-400" />
              <span className="text-xs font-bold text-gray-600">{task.urgency}</span>
            </div>
          </div>

          <div className="space-y-3">
             <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Description</h3>
             <p className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-line">
               {task.description}
             </p>
          </div>
        </motion.div>

        {/* Creator Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[32px] p-6 border border-gray-50 shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 ring-2 ring-[#0C6B38]/10">
              <AvatarImage src={task.profiles?.avatar_url || undefined} />
              <AvatarFallback className="bg-gray-100 text-gray-400 font-bold">{task.profiles?.full_name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Requested by</p>
               <h4 className="text-gray-900 font-bold">{task.profiles?.full_name || 'Anonymous'}</h4>
            </div>
          </div>
          <Link href={`/public-profile/${task.creatorId}`}>
             <motion.button whileTap={{ scale: 0.95 }} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
               <ChevronRight size={20} className="text-gray-400" />
             </motion.button>
          </Link>
        </motion.div>

        {/* Offers Section */}
        <div className="space-y-4 pt-4">
           <div className="flex items-center justify-between">
             <h2 className="text-lg font-black text-gray-900">Worker Offers</h2>
             <span className="text-gray-400 text-xs font-bold">{offers.length} total</span>
           </div>

           {offers.length === 0 ? (
             <div className="bg-gray-100/50 rounded-[32px] p-10 text-center border-2 border-dashed border-gray-200">
                <Briefcase size={32} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 text-sm font-bold">No offers yet</p>
             </div>
           ) : (
             <div className="space-y-4">
               {offers.map((offer) => (
                 <motion.div
                   key={offer.id}
                   layoutId={offer.id}
                   className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm"
                 >
                   <div className="flex items-start justify-between mb-4">
                     <div className="flex items-center gap-3">
                       <Avatar className="h-10 w-10">
                         <AvatarImage src={offer.profiles?.avatar_url} />
                         <AvatarFallback className="bg-green-50 text-[#0C6B38] font-bold">{offer.profiles?.full_name?.[0]}</AvatarFallback>
                       </Avatar>
                       <div>
                         <h4 className="text-sm font-black text-gray-900">{offer.profiles?.full_name}</h4>
                         <div className="flex items-center gap-1 mt-0.5">
                            <Star size={10} className="fill-amber-400 text-amber-400" />
                            <span className="text-[10px] font-black text-gray-400">
                              {offer.profiles?.reputation_score || 'New'} · {offer.profiles?.total_tasks_done || 0} Jobs
                            </span>
                         </div>
                       </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[#0C6B38] text-sm font-black">{formatLocal(offer.amount)}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">{offer.delivery_time || 'Quick delivery'}</p>
                     </div>
                   </div>

                   <p className="text-xs text-gray-500 font-medium leading-relaxed mb-4 line-clamp-2">
                     {offer.message}
                   </p>

                   {isCreator && task.status === 'published' && offer.status === 'pending' && (
                     <div className="flex gap-2">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAcceptOffer(offer.id, offer.profiles?.full_name)}
                          disabled={acceptPending}
                          className="flex-1 bg-[#0C6B38] text-white py-2.5 rounded-2xl text-xs font-black shadow-green"
                        >
                          {acceptPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Hire Worker"}
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeclineOffer(offer.id)}
                          className="px-6 bg-gray-50 text-gray-400 py-2.5 rounded-2xl text-xs font-black"
                        >
                          Decline
                        </motion.button>
                     </div>
                   )}
                 </motion.div>
               ))}
             </div>
           )}
        </div>
      </div>

      {/* Floating Action Bar */}
      {!isCreator && task.status === 'published' && (
        <div className="fixed bottom-0 left-0 right-0 p-6 z-50">
          <div className="mx-auto max-w-lg glass-card rounded-[32px] p-4 flex items-center justify-between shadow-premium-lg border-white/60">
            <div className="px-4">
               <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Starting at</p>
               <p className="text-gray-900 text-lg font-black">{formatLocal(task.budget)}</p>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setOfferAmount(task.budget); setShowOfferDialog(true); }}
              className="bg-gray-900 text-white px-8 h-14 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl"
            >
              Send Offer <ArrowUpRight size={18} strokeWidth={3} />
            </motion.button>
          </div>
        </div>
      )}

      {/* Hire Completion Bar */}
      {isCreator && task.status === 'in_progress' && (
         <div className="fixed bottom-0 left-0 right-0 p-6 z-50">
           <div className="mx-auto max-w-lg bg-gray-900 rounded-[32px] p-4 flex items-center justify-between shadow-premium-lg">
             <div className="px-4">
                <p className="text-green-400 text-[10px] font-black uppercase tracking-widest">Work in Progress</p>
                <p className="text-white text-sm font-bold">Release payment when done</p>
             </div>
             <motion.button
               whileTap={{ scale: 0.95 }}
               onClick={handleCompleteTask}
               className="bg-green-500 text-white px-6 h-14 rounded-2xl font-black text-sm shadow-xl"
             >
               Approve Work
             </motion.button>
           </div>
         </div>
      )}

      {/* Review Prompt */}
      {isCreator && task.status === 'completed' && task.helperId && (
         <div className="fixed bottom-0 left-0 right-0 p-6 z-50">
            <motion.button
               whileTap={{ scale: 0.95 }}
               onClick={() => setShowReviewDialog(true)}
               className="mx-auto max-w-lg w-full bg-amber-400 text-amber-950 h-16 rounded-[32px] font-black flex items-center justify-center gap-3 shadow-premium-lg"
            >
              <Star size={20} className="fill-amber-950" /> Rate Experience
            </motion.button>
         </div>
      )}

      {/* Dialogs - Kept mostly same but with rounded-3xl styling */}
      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent className="rounded-[40px] p-8 border-none shadow-premium-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-gray-900">Send an Offer</DialogTitle>
            <DialogDescription className="text-sm font-medium text-gray-400">
              Let the creator know why you're the best fit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">My Quote (₦)</label>
                 <Input type="number" value={offerAmount} onChange={e => setOfferAmount(Number(e.target.value))} className="h-14 rounded-2xl bg-gray-50 border-none font-bold" />
               </div>
               <div>
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Timeframe</label>
                 <Input value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} placeholder="e.g. 2 days" className="h-14 rounded-2xl bg-gray-50 border-none font-bold" />
               </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Message</label>
              <Textarea value={pitchText} onChange={e => setPitchText(e.target.value)} className="min-h-[120px] rounded-[24px] bg-gray-50 border-none font-medium text-sm" placeholder="I have 5 years of experience in..." />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmitOffer}
              disabled={submitPending || pitchText.length < 10}
              className="w-full bg-[#0C6B38] text-white h-16 rounded-[24px] font-black shadow-green flex items-center justify-center gap-2"
            >
              {submitPending ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Submit Offer</>}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
