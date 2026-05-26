import { MobileHeader } from "@/components/layout/MobileHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin, Star, ShieldCheck, MessageSquare, Calendar,
  ChevronLeft, Award, Briefcase, TrendingUp, CheckCircle, Loader2
} from "lucide-react";
import { useRoute, useLocation, Link } from "wouter";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useQuery } from "@tanstack/react-query";
import { useConversations } from "@/hooks/use-messaging";
import { motion } from "framer-motion";
import { format } from "date-fns";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const TASK_API = `${SUPABASE_URL}/functions/v1/task-api`;

export default function PublicProfilePage() {
  const { user, getIdToken } = useFirebaseAuth();
  const [, params] = useRoute("/public-profile/:userId");
  const [, navigate] = useLocation();
  const targetUserId = params?.userId;
  const { startConversation } = useConversations();

  const { data, isLoading } = useQuery({
    queryKey: ["public-profile", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      const token = await getIdToken();
      if (!token) return null;
      const res = await fetch(`${TASK_API}/public-profile/${targetUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return await res.json();
    },
    enabled: !!targetUserId && !!user,
  });

  const profile = data?.profile || null;
  const reviews = data?.reviews || [];
  const completedTasks = data?.completedTasks || 0;

  const handleSendMessage = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!targetUserId) return;
    try {
      const conv = await startConversation({ otherUserId: targetUserId });
      navigate(`/messages?conv=${conv.id}`);
    } catch {
      navigate("/messages");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8]">
        <MobileHeader title="Profile" />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-[#0C6B38]" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F8FAF8]">
        <MobileHeader title="Profile" />
        <div className="max-w-lg mx-auto px-4 pt-20 text-center">
          <p className="text-gray-400 mb-4">Profile not found</p>
          <Link href="/discover">
            <button className="text-sm font-semibold px-6 py-3 rounded-xl text-white" style={{ background: "#0C6B38" }}>
              Back to Discover
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile.full_name || "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const joinYear = profile.created_at ? new Date(profile.created_at).getFullYear() : new Date().getFullYear();
  const repScore = Number(profile.reputation_score) || 0;
  const totalReviews = Number(profile.total_reviews) || reviews.length;
  const avgRating = repScore > 0 ? repScore : (reviews.length > 0 ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length : 0);
  const isOwnProfile = user?.uid === targetUserId;

  return (
    <div className="min-h-screen bg-[#F8FAF8]" style={{ paddingBottom: "80px" }}>
      <MobileHeader title="Profile" />

      <div className="max-w-lg mx-auto px-4 pb-10">

        <div className="py-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0C6B38] transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white rounded-2xl overflow-hidden mb-4" style={{ border: "1px solid #F0F0F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="h-20" style={{ background: "linear-gradient(135deg, #0C6B38 0%, #0a5a30 100%)" }} />
            <div className="px-6 pb-6 -mt-10">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-20 h-20 border-4 border-white shadow-lg mb-3">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-white text-xl font-bold" style={{ background: "#0C6B38" }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-[#0D0D0D]">{displayName}</h1>
                  {profile.id_verified && (
                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>

                {profile.location && (
                  <p className="text-sm text-gray-400 flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3" /> {profile.location}
                  </p>
                )}

                {avgRating > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className={`w-4 h-4 ${i <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                    <span className="font-bold text-sm">{avgRating.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">({totalReviews} reviews)</span>
                  </div>
                )}

                {profile.bio && (
                  <p className="text-sm text-gray-500 mb-4 max-w-xs leading-relaxed">{profile.bio}</p>
                )}

                {profile.skills && profile.skills.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                    {profile.skills.map((skill: string) => (
                      <span key={skill} className="text-xs font-medium px-3 py-1 rounded-full bg-[#0C6B38]/8 text-[#0C6B38] border border-[#0C6B38]/15">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {!isOwnProfile && user && (
                  <button
                    onClick={handleSendMessage}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: "#0C6B38" }}
                  >
                    <MessageSquare className="w-4 h-4" /> Send Message
                  </button>
                )}
                {isOwnProfile && (
                  <Link href="/profile">
                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                      Edit Your Profile
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div className="grid grid-cols-3 gap-3 mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {[
            { icon: Briefcase, label: "Tasks Done", value: completedTasks },
            { icon: TrendingUp, label: "Rep Score", value: Math.round(repScore * 100) || 0 },
            { icon: Calendar, label: "Since", value: joinYear },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white rounded-2xl p-4 text-center" style={{ border: "1px solid #F0F0F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <Icon className="w-5 h-5 mx-auto mb-1 text-[#0C6B38]" />
              <p className="text-lg font-bold text-[#0D0D0D]">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Reviews */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #F0F0F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid #F5F5F5" }}>
              <Star className="w-4 h-4 text-amber-400" />
              <h2 className="font-semibold text-[#0D0D0D] text-sm">
                Reviews {reviews.length > 0 && `(${reviews.length})`}
              </h2>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-10">
                <Award className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No reviews yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {reviews.map((review: {
                  id: string;
                  rating: number;
                  comment: string | null;
                  created_at: string;
                  role: string;
                  reviewer?: { full_name: string; avatar_url: string | null };
                  task?: { title: string };
                }) => (
                  <div key={review.id} className="p-5">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-9 h-9 shrink-0">
                        <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                        <AvatarFallback className="bg-[#0C6B38]/10 text-[#0C6B38] font-semibold text-xs">
                          {review.reviewer?.full_name?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm text-[#0D0D0D]">
                            {review.reviewer?.full_name || "Anonymous"}
                          </p>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star key={i} className={`w-3 h-3 ${i <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                            ))}
                          </div>
                        </div>
                        {review.task?.title && (
                          <p className="text-xs text-[#0C6B38] font-medium mb-1">Re: {review.task.title}</p>
                        )}
                        {review.comment && (
                          <p className="text-sm text-gray-500 leading-relaxed">{review.comment}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1.5">
                          {format(new Date(review.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
