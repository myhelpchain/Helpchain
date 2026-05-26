import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { Loader2, ArrowRight, ShieldCheck, Zap, Heart } from "lucide-react";
import { motion } from "framer-motion";

const GREEN = "#0C6B38";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, loading } = useFirebaseAuth();

  useEffect(() => {
    if (!loading && user) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden flex flex-col pt-[env(safe-area-inset-top,0px)]">

      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none">
         <motion.div
           animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
           transition={{ duration: 10, repeat: Infinity }}
           className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-[#0C6B38]/20 rounded-full blur-[100px]"
         />
         <motion.div
           animate={{ scale: [1.2, 1, 1.2], x: [0, -30, 0] }}
           transition={{ duration: 12, repeat: Infinity }}
           className="absolute bottom-20 -right-20 w-[300px] h-[300px] bg-[#15A34A]/10 rounded-full blur-[80px]"
         />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
         <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[32px] border border-white/20 flex items-center justify-center mb-10 shadow-2xl"
         >
           <img src="/images/helpchain-logo.png" className="w-12 h-12" alt="Logo" />
         </motion.div>

         <motion.h1
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-4xl font-black text-white leading-tight tracking-tighter mb-4"
         >
           Help happens here. <br/>
           <span className="text-[#15A34A]">Fast and Secure.</span>
         </motion.h1>

         <motion.p
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="text-white/40 text-sm font-medium max-w-[280px] mx-auto leading-relaxed mb-12"
         >
           Nigeria's premium task marketplace. Connect with trusted helpers instantly.
         </motion.p>

         <div className="w-full max-w-xs space-y-4">
            <Link href="/auth?mode=signup">
               <motion.button
                 whileTap={{ scale: 0.95 }}
                 className="w-full h-16 bg-white text-gray-900 rounded-[24px] font-black text-sm flex items-center justify-center gap-2 shadow-xl"
               >
                 Get Started <ArrowRight size={18} strokeWidth={3} />
               </motion.button>
            </Link>
            <Link href="/auth?mode=login">
               <motion.button
                 whileTap={{ scale: 0.95 }}
                 className="w-full h-16 bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-[24px] font-black text-sm"
               >
                 Sign In
               </motion.button>
            </Link>
         </div>
      </div>

      {/* Feature Pills */}
      <div className="relative z-10 p-10 flex gap-4 overflow-x-auto scrollbar-hide">
         {[
           { label: 'Trusted', icon: ShieldCheck, color: 'text-blue-400' },
           { label: 'Fast', icon: Zap, color: 'text-amber-400' },
           { label: 'Fair Pay', icon: Heart, color: 'text-red-400' }
         ].map(f => (
           <div key={f.label} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 whitespace-nowrap">
             <f.icon size={14} className={f.color} />
             <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">{f.label}</span>
           </div>
         ))}
      </div>
    </div>
  );
}
