import { useState, useEffect } from "react";
import { Link } from "wouter";
import { X, AlertCircle, ArrowRight } from "lucide-react";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";

const DISMISS_KEY = "hc-banner-dismissed-at";
const DISMISS_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export function OnboardingBanner() {
  const { user } = useFirebaseAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user) { setVisible(false); return; }

    const onboardingDone = localStorage.getItem("hc-onboarding-done") === "true";
    if (onboardingDone) { setVisible(false); return; }

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DURATION_MS) { setVisible(false); return; }
    }

    setVisible(true);
  }, [user]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
      style={{ background: "#FFFBEB", borderBottom: "1px solid #FDE68A" }}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#D97706" }} />
        <span className="text-yellow-900 font-medium truncate">
          Your profile is incomplete — finish setup to unlock all features and get better task matches.
        </span>
        <Link href="/onboarding">
          <span
            className="flex-shrink-0 flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full transition-all hover:opacity-90"
            style={{ background: "#D97706", color: "white" }}
          >
            Complete profile <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-yellow-200 transition-colors text-yellow-700"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
