import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useSearch } from "wouter";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, Loader2, ArrowLeft, Sparkles } from "lucide-react";

const GREEN = "#0C6B38";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const initialMode = new URLSearchParams(search).get("mode") || "login";

  const { user, signIn, signUp, signInWithGoogle, resetPassword, loading } = useFirebaseAuth();
  const { sendWelcomeNotification } = useNotifications();
  const { toast } = useToast();

  const [mode, setMode] = useState<"login" | "signup" | "reset">(
    initialMode === "signup" ? "signup" : initialMode === "reset" ? "reset" : "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (user) {
      const onboardingDone = localStorage.getItem("hc-onboarding-done");
      const onboardingSkipped = localStorage.getItem("hc-onboarding-skipped");
      setLocation((onboardingDone || onboardingSkipped) ? "/dashboard" : "/onboarding");
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        toast({ title: "Welcome back!" });
        setLocation("/dashboard");
      } else if (mode === "signup") {
        if (password !== confirmPassword) {
          toast({ title: "Passwords don't match", variant: "destructive" });
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
          setIsSubmitting(false);
          return;
        }
        await signUp(email, password, displayName);
        setTimeout(() => sendWelcomeNotification(displayName), 2000);
        toast({ title: "Account created!", description: "Welcome to HelpChain!" });
        setLocation("/onboarding");
      } else {
        await resetPassword(email);
        toast({ title: "Reset email sent", description: "Check your inbox." });
        setMode("login");
      }
    } catch (error: any) {
      let message = error.message || "An error occurred";
      if (message.includes("auth/invalid-credential")) message = "Invalid email or password";
      else if (message.includes("auth/email-already-in-use")) message = "Email already in use";
      else if (message.includes("auth/weak-password")) message = "Password too weak";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      const onboardingDone = localStorage.getItem("hc-onboarding-done");
      const onboardingSkipped = localStorage.getItem("hc-onboarding-skipped");
      setTimeout(() => sendWelcomeNotification(user?.displayName || undefined), 2000);
      toast({ title: "Welcome!" });
      setLocation((onboardingDone || onboardingSkipped) ? "/dashboard" : "/onboarding");
    } catch (error: any) {
      if (error?.message?.includes("cancelled") || error?.code === "auth/popup-closed-by-user") return;
      toast({ title: "Error", description: error.message || "Failed to sign in", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F7F5" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-[18px] flex items-center justify-center" style={{ background: "#F0FDF4" }}>
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: GREEN }} />
          </div>
          <p className="text-sm text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const modeTitle = mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password";
  const modeSub = mode === "login" ? "Sign in to continue" : mode === "signup" ? "Join HelpChain today" : "We'll send you a reset link";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F5F7F5", fontFamily: "'Figtree', sans-serif" }}
    >
      {/* Hero banner */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{
          height: 220,
          background: "linear-gradient(150deg, #0C6B38 0%, #085c30 55%, #063f22 100%)",
        }}
      >
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 right-0 rounded-full opacity-10"
            style={{ width: 260, height: 260, background: "white", transform: "translate(40%, -40%)", filter: "blur(1px)" }}
          />
          <div
            className="absolute bottom-0 left-0 rounded-full opacity-5"
            style={{ width: 180, height: 180, background: "white", transform: "translate(-40%, 40%)" }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] pb-0">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setLocation("/intro")}
            className="w-10 h-10 rounded-[13px] flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
          </motion.button>

          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.14)" }}
            >
              <img
                src="/images/helpchain-logo.png"
                alt="HelpChain"
                className="w-5 h-5 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <span className="text-white font-bold text-[15px]">HelpChain</span>
          </div>
          <div className="w-10" />
        </div>

        <div className="relative px-6 pt-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.24 }}
            >
              <h1
                className="text-[1.7rem] font-bold text-white"
                style={{ letterSpacing: "-0.025em" }}
              >
                {modeTitle}
              </h1>
              <p className="text-white/50 text-sm mt-1 font-medium">{modeSub}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 px-5 -mt-6 pb-8">
        <div
          className="rounded-[28px] p-6"
          style={{
            background: "white",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 16px 48px rgba(0,0,0,0.04)",
            border: "1px solid rgba(0,0,0,0.04)",
          }}
        >
          {mode !== "reset" && (
            <>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleSignIn}
                className="w-full h-[52px] rounded-[16px] flex items-center justify-center gap-3 text-sm font-semibold mb-5"
                style={{
                  background: "#F9FAFB",
                  border: "1.5px solid #E5E7EB",
                  color: "#374151",
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </motion.button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-semibold">or continue with email</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Full name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-11 h-[52px] rounded-[14px] border-gray-200 bg-gray-50/50 text-sm font-medium focus:bg-white transition-colors"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 h-[52px] rounded-[14px] border-gray-200 bg-gray-50/50 text-sm font-medium focus:bg-white transition-colors"
                required
              />
            </div>

            {mode !== "reset" && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-12 h-[52px] rounded-[14px] border-gray-200 bg-gray-50/50 text-sm font-medium focus:bg-white transition-colors"
                  required
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
              </div>
            )}

            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-11 h-[52px] rounded-[14px] border-gray-200 bg-gray-50/50 text-sm font-medium focus:bg-white transition-colors"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {mode === "login" && (
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="text-xs font-semibold"
                  style={{ color: GREEN }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[54px] rounded-[16px] text-white text-sm font-bold flex items-center justify-center gap-2.5 disabled:opacity-50 mt-1"
              style={{
                background: `linear-gradient(140deg, ${GREEN} 0%, #16A34A 100%)`,
                boxShadow: `0 8px 24px rgba(12,107,56,0.32), 0 2px 8px rgba(12,107,56,0.2)`,
              }}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === "login" && "Sign In"}
                  {mode === "signup" && "Create Account"}
                  {mode === "reset" && "Send Reset Link"}
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-500">
            {mode === "login" && (
              <p>
                New to HelpChain?{" "}
                <button onClick={() => setMode("signup")} className="font-bold" style={{ color: GREEN }}>
                  Create account
                </button>
              </p>
            )}
            {mode === "signup" && (
              <p>
                Already have an account?{" "}
                <button onClick={() => setMode("login")} className="font-bold" style={{ color: GREEN }}>
                  Sign in
                </button>
              </p>
            )}
            {mode === "reset" && (
              <p>
                <button onClick={() => setMode("login")} className="font-bold" style={{ color: GREEN }}>
                  Back to sign in
                </button>
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5 leading-relaxed">
          By continuing, you agree to our{" "}
          <span className="font-semibold" style={{ color: GREEN }}>Terms</span> and{" "}
          <span className="font-semibold" style={{ color: GREEN }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
