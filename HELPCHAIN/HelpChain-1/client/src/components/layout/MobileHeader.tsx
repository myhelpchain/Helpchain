import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

interface MobileHeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  transparent?: boolean;
  subtitle?: string;
}

export function MobileHeader({ title, onBack, right, transparent, subtitle }: MobileHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div
      className="sticky top-0 z-40 flex items-center justify-between px-4"
      style={{
        height: subtitle ? 68 : 60,
        background: transparent ? "transparent" : "rgba(245,247,245,0.97)",
        backdropFilter: transparent ? "none" : "blur(24px)",
        WebkitBackdropFilter: transparent ? "none" : "blur(24px)",
        borderBottom: transparent ? "none" : "1px solid rgba(0,0,0,0.05)",
        paddingTop: "env(safe-area-inset-top, 0px)",
        fontFamily: "'Figtree', sans-serif",
      }}
    >
      <motion.button
        whileTap={{ scale: 0.86 }}
        onClick={handleBack}
        className="w-10 h-10 rounded-[13px] flex items-center justify-center shrink-0"
        style={{
          background: transparent ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.04)",
          border: transparent ? "1px solid rgba(255,255,255,0.15)" : "none",
        }}
      >
        <ChevronLeft
          className="w-5 h-5"
          strokeWidth={2.2}
          style={{ color: transparent ? "white" : "#0D0D0D" }}
        />
      </motion.button>

      <div className="absolute left-1/2 -translate-x-1/2 text-center">
        <h1
          className="text-[15px] font-bold leading-tight"
          style={{ color: transparent ? "white" : "#0D0D0D", letterSpacing: "-0.015em" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-[11px] font-medium mt-0.5"
            style={{ color: transparent ? "rgba(255,255,255,0.5)" : "#9CA3AF" }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div className="w-10 h-10 flex items-center justify-center shrink-0">
        {right || null}
      </div>
    </div>
  );
}
