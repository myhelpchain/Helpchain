import { BottomNav } from "./BottomNav";
import { motion } from "framer-motion";

interface MobileLayoutProps {
  children: React.ReactNode;
  hideBottomNav?: boolean;
  className?: string;
  noPadding?: boolean;
}

export function MobileLayout({ children, hideBottomNav, className, noPadding }: MobileLayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden"
      style={{
        background: "#F5F7F5",
        fontFamily: "'Figtree', sans-serif",
      }}
    >
      <div
        className={`flex-1 overflow-y-auto ${className || ""}`}
        style={{
          paddingBottom: hideBottomNav || noPadding ? "20px" : "calc(100px + env(safe-area-inset-bottom, 0px))",
          WebkitOverflowScrolling: "touch"
        }}
      >
        {children}
      </div>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
