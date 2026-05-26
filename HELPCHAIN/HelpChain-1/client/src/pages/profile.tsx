import { useState, useEffect, useRef } from "react";
import { Link, Redirect } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useProfileApi } from "@/hooks/use-profile-api";
import { useWallet } from "@/hooks/use-wallet";
import { useLocalizationStore } from "@/stores/localization-store";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Camera, Edit2, ChevronRight, Wallet, Settings, HelpCircle,
  Shield, MapPin, LogOut, ClipboardList, Bell, Loader2, Star,
  Award, ShieldCheck, Zap, Share2
} from "lucide-react";

const GREEN = "#0C6B38";

export default function ProfilePage() {
  const { user, logout } = useFirebaseAuth();
  const { profile, isLoading: profileLoading, updateProfile, updateProfilePending } = useProfileApi();
  const { availableBalance } = useWallet();
  const { formatLocal } = useLocalizationStore();
  const { toast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name || "");
      setEditBio(profile.bio || "");
      setEditLocation(profile.location || "");
      setEditSkills((profile.skills || []).join(", "));
    }
  }, [profile]);

  if (!user) return <Redirect to="/auth" />;

  const displayName = profile?.full_name || user.displayName || "User";
  const bio = profile?.bio || "No bio yet.";
  const location = profile?.location || "Nigeria";
  const skills = profile?.skills || [];
  const avatar = profile?.avatar_url || user.photoURL;

  const handleSaveProfile = async () => {
    try {
      const skillsArr = editSkills.split(",").map(s => s.trim()).filter(Boolean);
      await updateProfile({
        fullName: editName,
        bio: editBio,
        location: editLocation,
        skills: skillsArr,
      });
      toast({ title: "Profile updated!" });
      setEditOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    try { await logout(); } catch {}
  };

  return (
    <MobileLayout>
      <div className="min-h-full bg-[#F8FAF9] pb-24">

        {/* Profile Premium Header */}
        <div className="relative h-[300px] w-full overflow-hidden bg-gray-900 rounded-b-[60px] shadow-xl">
           {/* Animated Background */}
           <motion.div
             animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="absolute inset-0 opacity-40"
             style={{
               background: "radial-gradient(circle at 20% 20%, #0C6B38 0%, transparent 40%), radial-gradient(circle at 80% 80%, #15A34A 0%, transparent 40%)"
             }}
           />

           <div className="relative z-10 px-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] h-full flex flex-col items-center justify-center text-center">
              <div className="absolute top-12 left-0 right-0 px-6 flex justify-between">
                 <motion.button whileTap={{ scale: 0.9 }} onClick={handleLogout} className="w-11 h-11 glass-dark rounded-2xl flex items-center justify-center border-white/10">
                    <LogOut size={20} className="text-white/60" />
                 </motion.button>
                 <Link href="/settings">
                    <motion.button whileTap={{ scale: 0.9 }} className="w-11 h-11 glass-dark rounded-2xl flex items-center justify-center border-white/10 text-white">
                      <Settings size={20} />
                    </motion.button>
                 </Link>
              </div>

              {/* Avatar area */}
              <div className="relative mb-4 group">
                 <motion.div whileHover={{ scale: 1.05 }} className="p-1 rounded-[40px] bg-white/10 backdrop-blur-xl border border-white/20">
                    <Avatar className="h-24 w-24 rounded-[36px]">
                       <AvatarImage src={avatar || undefined} className="object-cover" />
                       <AvatarFallback className="bg-[#0C6B38] text-white text-2xl font-black">{displayName[0]}</AvatarFallback>
                    </Avatar>
                 </motion.div>
                 <motion.button
                   whileTap={{ scale: 0.9 }}
                   onClick={() => profileImageInputRef.current?.click()}
                   className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-xl text-gray-900"
                 >
                   <Camera size={18} strokeWidth={2.5} />
                 </motion.button>
                 <input ref={profileImageInputRef} type="file" className="hidden" />
              </div>

              <div className="flex items-center gap-2 mb-1">
                 <h1 className="text-white text-2xl font-black tracking-tight">{displayName}</h1>
                 {profile?.id_verified && <ShieldCheck size={20} className="text-green-400 fill-green-400/20" />}
              </div>
              <div className="flex items-center gap-1.5 text-white/50 text-xs font-bold uppercase tracking-widest">
                 <MapPin size={12} />
                 {location}
              </div>
           </div>
        </div>

        {/* Reputation Glass Card */}
        <div className="px-6 -mt-12 relative z-20">
           <motion.div
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             className="bg-white rounded-[40px] p-8 shadow-premium border border-gray-100 flex items-center justify-between"
           >
              <div className="flex flex-col gap-1">
                 <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Reputation</span>
                 <div className="flex items-center gap-2">
                    <Award className="text-amber-400" size={24} />
                    <span className="text-3xl font-black text-gray-900">{profile?.reputation_score || '0'}</span>
                 </div>
              </div>

              <div className="h-12 w-px bg-gray-50" />

              <div className="flex flex-col gap-1 items-end text-right">
                 <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Success Rate</span>
                 <div className="flex items-center gap-2">
                    <Zap className="text-blue-500" size={20} fill="#3B82F633" />
                    <span className="text-xl font-black text-gray-900">{profile?.success_rate || '100'}%</span>
                 </div>
              </div>
           </motion.div>
        </div>

        {/* Content Tabs/Menu */}
        <div className="px-6 mt-8 space-y-8">

           {/* Wallet Widget */}
           <section>
              <div className="flex items-center justify-between mb-4 px-2">
                 <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Financials</h3>
                 <Link href="/wallet">
                    <span className="text-[#0C6B38] text-[10px] font-black uppercase tracking-widest">View History</span>
                 </Link>
              </div>
              <Link href="/wallet">
                <motion.div whileTap={{ scale: 0.98 }} className="bg-[#0C6B38]/5 rounded-[32px] p-6 border border-[#0C6B38]/10 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#0C6B38] text-white rounded-2xl flex items-center justify-center shadow-green">
                         <Wallet size={24} strokeWidth={2.5} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-[#0C6B38] uppercase tracking-widest">Wallet Balance</p>
                         <h4 className="text-xl font-black text-gray-900">{formatLocal(availableBalance)}</h4>
                      </div>
                   </div>
                   <ChevronRight size={20} className="text-[#0C6B38]/30" />
                </motion.div>
              </Link>
           </section>

           {/* Skills Bubbles */}
           <section>
              <div className="flex items-center justify-between mb-4 px-2">
                 <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Expertise</h3>
                 <button onClick={() => setEditOpen(true)} className="text-gray-400">
                    <Edit2 size={14} />
                 </button>
              </div>
              <div className="flex flex-wrap gap-2">
                 {skills.length > 0 ? skills.map(skill => (
                   <div key={skill} className="px-5 py-2.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-xs font-black text-gray-700">
                      {skill}
                   </div>
                 )) : (
                   <p className="text-gray-300 text-xs italic px-2">Add your skills to stand out</p>
                 )}
              </div>
           </section>

           {/* Action Menu */}
           <section className="space-y-3">
              {[
                { label: "Edit Profile", icon: Edit2, action: () => setEditOpen(true), color: "text-blue-500", bg: "bg-blue-50" },
                { label: "Share Profile", icon: Share2, color: "text-purple-500", bg: "bg-purple-50" },
                { label: "Security & Trust", icon: Shield, href: "/settings", color: "text-green-500", bg: "bg-green-50" },
                { label: "Help & Support", icon: HelpCircle, href: "/help", color: "text-amber-500", bg: "bg-amber-50" },
              ].map(item => (
                <Link key={item.label} href={item.href || "#"}>
                   <motion.div
                     whileTap={{ scale: 0.98 }}
                     onClick={item.action}
                     className="bg-white p-5 rounded-[28px] border border-gray-50 shadow-sm flex items-center justify-between group"
                   >
                      <div className="flex items-center gap-4">
                         <div className={`w-11 h-11 ${item.bg} ${item.color} rounded-xl flex items-center justify-center`}>
                            <item.icon size={20} strokeWidth={2.5} />
                         </div>
                         <span className="text-sm font-black text-gray-700 group-hover:text-gray-900">{item.label}</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-200" />
                   </motion.div>
                </Link>
              ))}
           </section>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-[40px] p-8 border-none shadow-premium-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-gray-900">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
             <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Display Name</label>
                <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-14 rounded-2xl bg-gray-50 border-none font-bold" />
             </div>
             <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Short Bio</label>
                <Textarea value={editBio} onChange={e => setEditBio(e.target.value)} className="min-h-[100px] rounded-[24px] bg-gray-50 border-none font-medium text-sm" />
             </div>
             <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Skills (comma separated)</label>
                <Input value={editSkills} onChange={e => setEditSkills(e.target.value)} className="h-14 rounded-2xl bg-gray-50 border-none font-bold" />
             </div>
             <motion.button
               whileTap={{ scale: 0.95 }}
               onClick={handleSaveProfile}
               disabled={updateProfilePending}
               className="w-full bg-[#0C6B38] text-white h-16 rounded-[24px] font-black shadow-green flex items-center justify-center gap-2"
             >
               {updateProfilePending ? <Loader2 className="animate-spin" /> : "Save Changes"}
             </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
