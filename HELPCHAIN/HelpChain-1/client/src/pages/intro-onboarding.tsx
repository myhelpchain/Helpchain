import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, Zap, DollarSign, Shield, Rocket } from "lucide-react";

const GREEN = "#0C6B38";

const SLIDES = [
  {
    icon: Zap,
    color: "#F97316",
    gradient: "linear-gradient(150deg, #FF6B35 0%, #F97316 50%, #EA580C 100%)",
    bgGradient: "linear-gradient(160deg, #FFF7ED 0%, #FFEDD5 50%, #FED7AA 100%)",
    title: "Get Help Fast",
    description: "Post any task and receive offers from verified helpers within minutes. From home repairs to creative work.",
    badge: "3 offers received!",
    badgeIcon: "⚡",
  },
  {
    icon: DollarSign,
    color: "#3B82F6",
    gradient: "linear-gradient(150deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%)",
    bgGradient: "linear-gradient(160deg, #EFF6FF 0%, #DBEAFE 50%, #BFDBFE 100%)",
    title: "Earn by Helping",
    description: "Turn your skills into real income. Browse open tasks near you and start earning money today.",
    badge: "₦45,000 earned",
    badgeIcon: "💰",
  },
  {
    icon: Shield,
    color: GREEN,
    gradient: "linear-gradient(150deg, #065f46 0%, #0C6B38 50%, #16A34A 100%)",
    bgGradient: "linear-gradient(160deg, #F0FDF4 0%, #DCFCE7 50%, #BBF7D0 100%)",
    title: "Safe & Secure",
    description: "Every payment is held in escrow until you approve. Zero risk, total peace of mind, always.",
    badge: "✓ Escrow protected",
    badgeIcon: "🔒",
  },
  {
    icon: Rocket,
    color: "#8B5CF6",
    gradient: "linear-gradient(150deg, #6D28D9 0%, #8B5CF6 50%, #A78BFA 100%)",
    bgGradient: "linear-gradient(160deg, #F5F3FF 0%, #EDE9FE 50%, #DDD6FE 100%)",
    title: "Start Now",
    description: "Join thousands of Nigerians already posting tasks and earning money on HelpChain every day.",
    badge: "🇳🇬 Nigeria's best",
    badgeIcon: "🚀",
  },
];

export default function IntroOnboardingPage() {
  const [current, setCurrent] = useState(0);
  const [, setLocation] = useLocation();
  const dragX = useMotionValue(0);

  const isLast = current === SLIDES.length - 1;
  const slide = SLIDES[current];

  const handleSkip = () => {
    localStorage.setItem("hc-intro-seen", "true");
    setLocation("/auth");
  };

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem("hc-intro-seen", "true");
      setLocation("/auth");
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 60;
    if (info.offset.x < -threshold && current < SLIDES.length - 1) {
      setCurrent((c) => c + 1);
    } else if (info.offset.x > threshold && current > 0) {
      setCurrent((c) => c - 1);
    }
    dragX.set(0);
  };

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ background: "#FAFAFA", fontFamily: "'Figtree', sans-serif" }}
    >
      {/* Status bar area */}
      <div className="flex items-center justify-between px-6 pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-2">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-[11px] flex items-center justify-center"
            style={{ background: "#F0FDF4" }}
          >
            <img
              src="/images/helpchain-logo.png"
              alt=""
              className="w-5 h-5 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
          <span className="font-bold text-[15px]" style={{ color: GREEN }}>HelpChain</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={handleSkip}
          className="text-sm font-semibold text-gray-400 px-3 py-1.5 rounded-xl transition-colors hover:text-gray-600"
        >
          Skip
        </motion.button>
      </div>

      {/* Slide area */}
      <div className="flex-1 flex flex-col px-5 pb-6">

        {/* Illustration */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          style={{ x: dragX }}
          className="cursor-grab active:cursor-grabbing"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.97 }}
              transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
              className="rounded-[28px] overflow-hidden relative"
              style={{ height: 280, background: slide.bgGradient }}
            >
              {/* Floating background shapes */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 3 + i * 0.7, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }}
                  className="absolute rounded-full"
                  style={{
                    width: 60 + i * 20,
                    height: 60 + i * 20,
                    background: `${slide.color}18`,
                    left: `${8 + i * 22}%`,
                    top: `${15 + (i % 2) * 40}%`,
                    filter: "blur(4px)",
                  }}
                />
              ))}

              {/* Main icon */}
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                <motion.div
                  initial={{ scale: 0.6, rotate: -15, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
                >
                  <motion.div
                    animate={{ y: [0, -7, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-28 h-28 rounded-[32px] flex items-center justify-center"
                    style={{
                      background: slide.gradient,
                      boxShadow: `0 16px 48px ${slide.color}50, 0 4px 16px ${slide.color}30, inset 0 1px 0 rgba(255,255,255,0.2)`,
                    }}
                  >
                    <slide.icon className="w-14 h-14 text-white" strokeWidth={1.6} />
                  </motion.div>
                </motion.div>

                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  className="px-4 py-2.5 rounded-full text-white text-xs font-bold"
                  style={{
                    background: slide.gradient,
                    boxShadow: `0 4px 16px ${slide.color}40`,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {slide.badgeIcon} {slide.badge}
                </motion.div>
              </div>

              {/* Corner decoration */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
                style={{ background: slide.color, transform: "translate(40%, -40%)", filter: "blur(20px)" }}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Text content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${current}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="mt-8 flex-1"
          >
            <h1
              className="text-[1.7rem] font-bold text-[#0D0D0D] mb-3 leading-tight"
              style={{ letterSpacing: "-0.025em" }}
            >
              {slide.title}
            </h1>
            <p className="text-[15px] text-gray-500 leading-relaxed">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Bottom controls */}
        <div className="mt-8 space-y-4">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2">
            {SLIDES.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setCurrent(i)}
                animate={{
                  width: i === current ? 28 : 8,
                  background: i === current ? slide.color : "#D1D5DB",
                  opacity: i === current ? 1 : 0.5,
                }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="h-2 rounded-full"
              />
            ))}
          </div>

          {/* Primary CTA */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            className="w-full h-[56px] rounded-[18px] text-white text-[15px] font-bold flex items-center justify-center gap-2.5"
            style={{
              background: slide.gradient,
              boxShadow: `0 8px 28px ${slide.color}45, 0 2px 8px ${slide.color}25`,
            }}
          >
            {isLast ? "Get Started" : "Continue"}
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowRight className="w-5 h-5" strokeWidth={2.2} />
            </motion.div>
          </motion.button>

          {/* Secondary action */}
          {isLast ? (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                localStorage.setItem("hc-intro-seen", "true");
                setLocation("/auth?mode=login");
              }}
              className="w-full text-sm text-gray-500 font-medium py-2"
            >
              Already have an account?{" "}
              <span className="font-bold" style={{ color: GREEN }}>Sign in</span>
            </motion.button>
          ) : (
            <div className="h-6" />
          )}
        </div>
      </div>
    </div>
  );
}
