import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-900"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Immersive Background */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background: "radial-gradient(circle at 30% 30%, #0C6B38 0%, transparent 50%), radial-gradient(circle at 70% 70%, #15A34A 0%, transparent 50%)"
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo Container */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2
          }}
          className="w-32 h-32 bg-white/10 backdrop-blur-3xl rounded-[40px] border border-white/20 flex items-center justify-center mb-8 shadow-[0_0_80px_rgba(12,107,56,0.3)]"
        >
          <motion.img
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.1, 1] }}
            transition={{ duration: 0.8, delay: 0.5 }}
            src="/images/helpchain-logo.png"
            className="w-16 h-16"
            alt="HelpChain"
          />
        </motion.div>

        {/* Text Animation */}
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            className="text-3xl font-black text-white tracking-tighter"
          >
            HelpChain
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-4 flex gap-1.5"
        >
           {[0, 0.1, 0.2].map(d => (
             <motion.div
               key={d}
               animate={{ y: [0, -5, 0] }}
               transition={{ duration: 0.6, repeat: Infinity, delay: d }}
               className="w-1.5 h-1.5 bg-green-400 rounded-full"
             />
           ))}
        </motion.div>
      </div>

      {/* Footer Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-12 flex flex-col items-center gap-1"
      >
        <p className="text-white text-[10px] font-black uppercase tracking-[0.3em]">
          Premium Ecosystem
        </p>
      </motion.div>
    </motion.div>
  );
}
