import { useRoute, Link } from "wouter";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { useTask, useTaskOffers } from "@/hooks/use-tasks-api";
import { useLocalizationStore } from "@/stores/localization-store";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronLeft, Loader2, ClipboardList, Users, CheckCircle,
  Clock, Star, DollarSign, AlertCircle, ThumbsUp, ThumbsDown, MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-50 text-amber-700 border-amber-200",
  accepted:  "bg-green-50 text-green-700 border-green-200",
  rejected:  "bg-red-50 text-red-700 border-red-200",
  withdrawn: "bg-gray-50 text-gray-500 border-gray-200",
  completed: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function BatchManagementPage() {
  const [, params] = useRoute("/batch/:id");
  const taskId = params?.id;
  const { user } = useFirebaseAuth();
  const { formatLocal } = useLocalizationStore();
  const { toast } = useToast();
  const [actingOfferId, setActingOfferId] = useState<string | null>(null);

  const { data: task, isLoading: taskLoading } = useTask(taskId);
  const { offers, isLoading: offersLoading, acceptOffer, rejectOffer } = useTaskOffers(taskId);

  const isRequester = task?.creatorId === user?.uid;

  if (taskLoading || offersLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8]">
        <MobileHeader title="Task Management" />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-7 h-7 animate-spin text-[#0C6B38]" />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-[#F8FAF8]">
        <MobileHeader title="Task Management" />
        <div className="max-w-lg mx-auto px-4 pt-20 text-center">
          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Task not found</p>
          <Link href="/dashboard">
            <button className="text-sm font-semibold px-6 py-3 rounded-xl text-white" style={{ background: "#0C6B38" }}>
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const pendingOffers = offers.filter(o => o.status === "pending");
  const acceptedOffers = offers.filter(o => o.status === "accepted");
  const rejectedOffers = offers.filter(o => o.status === "rejected");

  const handleAccept = async (offerId: string) => {
    setActingOfferId(offerId);
    try {
      await acceptOffer(offerId);
      toast({ title: "Offer accepted", description: "The helper has been hired for this task." });
    } catch (e: unknown) {
      const err = e as Error;
      toast({ title: "Failed to accept", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setActingOfferId(null);
    }
  };

  const handleReject = async (offerId: string) => {
    setActingOfferId(offerId);
    try {
      await rejectOffer(offerId);
      toast({ title: "Offer declined" });
    } catch (e: unknown) {
      const err = e as Error;
      toast({ title: "Failed to decline", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setActingOfferId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8]" style={{ paddingBottom: "80px" }}>
      <MobileHeader title="Task Management" />

      <main className="max-w-3xl mx-auto px-4 pb-10">
        <div className="py-4">
          <Link href={`/request/${taskId}`}>
            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0C6B38] transition-colors font-medium">
              <ChevronLeft className="w-4 h-4" /> Back to Task
            </button>
          </Link>
        </div>

        {/* Task header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white rounded-2xl p-6 mb-5" style={{ border: "1px solid #F0F0F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5 text-[#0C6B38]" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-[#0D0D0D] mb-1">{task.title}</h1>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{task.description}</p>
                <div className="flex flex-wrap gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <DollarSign className="w-3.5 h-3.5" /> Budget: <strong className="text-[#0C6B38]">{formatLocal(task.budget)}</strong>
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Users className="w-3.5 h-3.5" /> {offers.length} offer{offers.length !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> {task.createdAt && format(new Date(task.createdAt?.toDate?.() || task.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Pending", value: pendingOffers.length, color: "#d97706", icon: Clock },
            { label: "Accepted", value: acceptedOffers.length, color: "#059669", icon: CheckCircle },
            { label: "Declined", value: rejectedOffers.length, color: "#dc2626", icon: AlertCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl p-4 text-center" style={{ border: "1px solid #F0F0F0" }}>
              <Icon className="w-5 h-5 mx-auto mb-1" style={{ color }} />
              <p className="text-xl font-bold text-[#0D0D0D]">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Offers list */}
        {offers.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl p-12 text-center" style={{ border: "1px solid #F0F0F0" }}>
              <Users className="w-10 h-10 text-gray-200 mx-auto mb-4" />
              <p className="font-semibold text-[#0D0D0D] mb-1">No offers yet</p>
              <p className="text-sm text-gray-400">Helpers will show up here once they submit their offers.</p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {/* Pending section */}
            {pendingOffers.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 mb-2 px-1">Pending Review ({pendingOffers.length})</h2>
                {pendingOffers.map((offer, i) => (
                  <motion.div key={offer.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="bg-white rounded-2xl p-5 mb-3" style={{ border: "1px solid #F0F0F0", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarImage src={offer.profiles?.avatar_url || undefined} />
                          <AvatarFallback className="bg-[#0C6B38]/10 text-[#0C6B38] font-bold text-sm">
                            {offer.profiles?.full_name?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="font-semibold text-[#0D0D0D] text-sm">{offer.profiles?.full_name || "Helper"}</p>
                            <span className="text-sm font-bold" style={{ color: "#0C6B38" }}>
                              {offer.amount > 0 ? formatLocal(offer.amount) : "Open"}
                            </span>
                          </div>
                          {offer.profiles?.location && (
                            <p className="text-xs text-gray-400 mb-2">{offer.profiles.location}</p>
                          )}
                          {(offer.profiles?.total_tasks_done || 0) > 0 && (
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span className="text-xs text-gray-500">
                                {offer.profiles?.reputation_score?.toFixed(1)} · {offer.profiles?.total_tasks_done} tasks done
                              </span>
                            </div>
                          )}
                          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{offer.message}</p>
                          {offer.delivery_time && (
                            <p className="text-xs text-gray-400 mb-3">
                              <Clock className="w-3 h-3 inline mr-1" />Delivery: {offer.delivery_time}
                            </p>
                          )}
                          {isRequester && task.status === "published" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAccept(offer.id)}
                                disabled={actingOfferId === offer.id}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                                style={{ background: "#0C6B38" }}
                              >
                                {actingOfferId === offer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                                Hire
                              </button>
                              <button
                                onClick={() => handleReject(offer.id)}
                                disabled={actingOfferId === offer.id}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                              >
                                <ThumbsDown className="w-4 h-4" /> Decline
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Accepted section */}
            {acceptedOffers.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 mb-2 px-1">Hired ({acceptedOffers.length})</h2>
                {acceptedOffers.map((offer) => (
                  <div key={offer.id} className="bg-white rounded-2xl p-5 mb-3" style={{ border: "1px solid #F0F0F0" }}>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarImage src={offer.profiles?.avatar_url || undefined} />
                        <AvatarFallback className="bg-green-50 text-green-700 font-bold text-sm">
                          {offer.profiles?.full_name?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0D0D0D] text-sm">{offer.profiles?.full_name || "Helper"}</p>
                        <p className="text-xs text-gray-400 truncate">{offer.message}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-green-50 text-green-700 border-green-200">Hired</span>
                        {offer.amount > 0 && (
                          <span className="text-sm font-bold" style={{ color: "#0C6B38" }}>{formatLocal(offer.amount)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rejected section */}
            {rejectedOffers.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 mb-2 px-1">Declined ({rejectedOffers.length})</h2>
                {rejectedOffers.map((offer) => (
                  <div key={offer.id} className="bg-white rounded-2xl p-5 mb-3 opacity-60" style={{ border: "1px solid #F0F0F0" }}>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarImage src={offer.profiles?.avatar_url || undefined} />
                        <AvatarFallback className="bg-gray-100 text-gray-500 font-bold text-sm">
                          {offer.profiles?.full_name?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0D0D0D] text-sm">{offer.profiles?.full_name || "Helper"}</p>
                        <p className="text-xs text-gray-400 truncate">{offer.message}</p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-red-50 text-red-600 border-red-200 shrink-0">Declined</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
