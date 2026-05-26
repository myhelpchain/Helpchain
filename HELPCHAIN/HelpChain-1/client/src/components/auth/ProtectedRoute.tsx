import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useFirebaseAuth();
  const [, setLocation] = useLocation();

  const onboardingDone = typeof localStorage !== "undefined"
    ? localStorage.getItem("hc-onboarding-done") === "true"
    : false;
  const onboardingSkipped = typeof localStorage !== "undefined"
    ? localStorage.getItem("hc-onboarding-skipped") === "true"
    : false;
  const needsOnboarding = !onboardingDone && !onboardingSkipped;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setLocation("/auth");
      return;
    }
    if (needsOnboarding) {
      setLocation("/onboarding");
    }
  }, [user, loading, needsOnboarding, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAF8" }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "#0C6B38 transparent transparent transparent" }}
          />
          <p className="text-sm text-gray-400 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (needsOnboarding) return null;

  return <>{children}</>;
}
