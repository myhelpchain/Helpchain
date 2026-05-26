import { cn } from "@/lib/utils";

const LOGO_PATH = "/images/helpchain-logo.png";

interface HelpChainLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-6 w-6",
  md: "h-9 w-9",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

export function HelpChainLogo({ size = "md", className }: HelpChainLogoProps) {
  return (
    <img
      src={LOGO_PATH}
      alt="HelpChain"
      className={cn(sizeMap[size], "object-contain", className)}
    />
  );
}
