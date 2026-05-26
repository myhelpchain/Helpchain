import { useState } from "react";
import { useLocation, Redirect } from "wouter";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useProfileApi } from "@/hooks/use-profile-api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Loader2, ChevronRight, ChevronLeft,
  Sparkles, User, Briefcase, Check, Navigation,
  Users, Award, SlidersHorizontal, Phone, Globe,
  Clock, ArrowRight, CheckCircle2, X
} from "lucide-react";

/* ── constants ───────────────────────────────────────────── */
const GREEN = "#0C6B38";

const STEPS = [
  { icon: Sparkles,          label: "Welcome"     },
  { icon: Users,             label: "Your Role"   },
  { icon: User,              label: "About You"   },
  { icon: Award,             label: "Background"  },
  { icon: Briefcase,         label: "Skills"      },
  { icon: SlidersHorizontal, label: "Preferences" },
];

const SKILL_CATEGORIES = [
  {
    label: "Tech & Digital",
    skills: ["Web Development", "Mobile Apps", "UI/UX Design", "Data Analysis", "DevOps", "Cybersecurity", "IT Support", "API Development"],
  },
  {
    label: "Creative",
    skills: ["Graphic Design", "Logo Design", "Video Editing", "Photography", "Animation", "Illustration", "Music Production", "3D Modeling"],
  },
  {
    label: "Writing & Content",
    skills: ["Content Writing", "Copywriting", "Technical Writing", "Translation", "Proofreading", "SEO Writing", "Social Media", "Scriptwriting"],
  },
  {
    label: "Business",
    skills: ["Virtual Assistant", "Data Entry", "Research", "Customer Support", "Project Management", "Marketing", "Sales", "Accounting"],
  },
  {
    label: "Physical / Local",
    skills: ["Home Cleaning", "Moving Help", "Handyman", "Delivery", "Cooking", "Gardening", "Pet Care", "Personal Training", "Errands"],
  },
];

const ALL_SKILLS = SKILL_CATEGORIES.flatMap((c) => c.skills);

const ACCOUNT_TYPES = [
  { id: "client", title: "Post Tasks", sub: "I need help with tasks and hire workers", emoji: "💼" },
  { id: "worker", title: "Do Tasks",   sub: "I want to earn money by helping others",  emoji: "🛠️" },
  { id: "both",   title: "Both",       sub: "I'll post tasks and also work for others", emoji: "⚡" },
];

const EXPERIENCE_LEVELS = [
  { id: "entry",    label: "Just starting out",  sub: "0–1 years"  },
  { id: "junior",   label: "Some experience",    sub: "1–3 years"  },
  { id: "mid",      label: "Experienced",        sub: "3–7 years"  },
  { id: "senior",   label: "Very experienced",   sub: "7–15 years" },
  { id: "expert",   label: "Expert / Veteran",   sub: "15+ years"  },
];

const EDUCATION_LEVELS = [
  "High School", "Some College", "Associate Degree", "Bachelor's Degree",
  "Master's Degree", "PhD / Doctorate", "Self-taught / Bootcamp",
];

const AVAILABILITY_OPTIONS = [
  { id: "full_time", label: "Full-time",    icon: Clock  },
  { id: "part_time", label: "Part-time",    icon: Clock  },
  { id: "weekends",  label: "Weekends",     icon: Clock  },
  { id: "evenings",  label: "Evenings",     icon: Clock  },
  { id: "flexible",  label: "Flexible",     icon: Clock  },
];

/* ── helpers ─────────────────────────────────────────────── */
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            height: 6,
            width: i === current ? 20 : i < current ? 6 : 6,
            background: i < current ? GREEN : i === current ? GREEN : "#E5E7EB",
            opacity: i > current ? 0.4 : 1,
          }}
        />
      ))}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-3xl p-7 sm:p-8"
      style={{
        background: "white",
        border: "1px solid #E9F0E9",
        boxShadow: "0 4px 24px rgba(12,107,56,0.06), 0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {children}
    </div>
  );
}

function PillBtn({
  selected, onClick, children, disabled,
}: {
  selected: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 disabled:opacity-30"
      style={{
        background: selected ? GREEN : "white",
        color: selected ? "white" : "#4B5563",
        borderColor: selected ? GREEN : "#E5E7EB",
        boxShadow: selected ? `0 2px 8px ${GREEN}30` : "none",
      }}
    >
      {selected && <Check className="w-3 h-3 shrink-0" />}
      {children}
    </button>
  );
}

function NavBtns({
  onBack, onNext, onSkip, nextLabel = "Next", nextDisabled = false, saving = false,
}: {
  onBack?: () => void; onNext: () => void; onSkip?: () => void;
  nextLabel?: string; nextDisabled?: boolean; saving?: boolean;
}) {
  return (
    <div className="mt-6 space-y-3">
      <div className="flex gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex-1 h-12 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all hover:bg-gray-50"
            style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        <button
          onClick={onNext}
          disabled={nextDisabled || saving}
          className="flex-1 h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
          style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)`, boxShadow: `0 4px 16px ${GREEN}40` }}
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          ) : (
            <>{nextLabel} {nextLabel === "Next" ? <ChevronRight className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}</>
          )}
        </button>
      </div>
      {onSkip && (
        <button
          onClick={onSkip}
          className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
        >
          Skip this step →
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ONBOARDING PAGE
══════════════════════════════════════════════════════════ */
export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading, updateUserProfile } = useFirebaseAuth();
  const { updateProfile } = useProfileApi();
  const { toast } = useToast();

  /* step */
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  /* step 1 — role */
  const [accountType, setAccountType] = useState<"client" | "worker" | "both">("both");

  /* step 2 — about */
  const [fullName, setFullName] = useState(user?.displayName || "");
  const [phone, setPhone] = useState("");
  const [location, setLocationVal] = useState("");

  /* step 3 — background */
  const [bio, setBio] = useState("");
  const [profession, setProfession] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [educationLevel, setEducationLevel] = useState("");

  /* step 4 — skills */
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  /* step 5 — preferences */
  const [availability, setAvailability] = useState<string[]>([]);
  const [languages, setLanguages] = useState("English");
  const [rateMin, setRateMin] = useState("");
  const [rateMax, setRateMax] = useState("");

  const toggleSkill = (skill: string) =>
    setSelectedSkills((p) => p.includes(skill) ? p.filter((s) => s !== skill) : [...p, skill]);

  const toggleAvail = (id: string) =>
    setAvailability((p) => p.includes(id) ? p.filter((a) => a !== id) : [...p, id]);

  /* geolocation */
  const getCurrentLocation = () => {
    setGettingLocation(true);
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || "";
          const country = data.address?.country || "";
          setLocationVal(city ? `${city}, ${country}` : country || `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`);
        } catch {
          setLocationVal(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        }
        setGettingLocation(false);
      },
      () => { setGettingLocation(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /* skip entire setup */
  const handleSkipAll = () => {
    localStorage.setItem("hc-onboarding-skipped", "true");
    setLocation("/dashboard");
  };

  /* complete setup */
  const handleComplete = async () => {
    setSaving(true);

    /* save all data to localStorage immediately (never blocks navigation) */
    const localData = {
      accountType, fullName, phone, location, bio, profession,
      experienceLevel, educationLevel, selectedSkills,
      availability, languages, rateMin, rateMax,
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem("hc-onboarding-data", JSON.stringify(localData));
    localStorage.setItem("hc-onboarding-done", "true");

    /* try API (graceful failure — never blocks navigation) */
    try {
      await updateProfile({
        fullName: fullName.trim() || user?.displayName || "User",
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        skills: selectedSkills,
        email: user?.email || undefined,
      });
      if (fullName.trim() && fullName.trim() !== user?.displayName) {
        await updateUserProfile({ displayName: fullName.trim() });
      }
    } catch (_) {
      /* silently ignore — data is already saved locally */
    } finally {
      setSaving(false);
      toast({ title: "You're all set! 🎉", description: "Welcome to HelpChain." });
      setLocation("/dashboard");
    }
  };

  /* guards */
  if (authLoading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center" style={{ background: "#F8FAF8" }}>
        <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${GREEN} transparent transparent transparent` }} />
      </div>
    );
  }
  if (!user) return <Redirect to="/auth" />;
  if (localStorage.getItem("hc-onboarding-done") === "true") return <Redirect to="/dashboard" />;

  const progress = (step / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: "linear-gradient(135deg, #F0FDF4 0%, #F8FAF8 50%, #EFF6FF 100%)", paddingBottom: "env(safe-area-inset-bottom, 20px)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-4 shrink-0">
        <div className="flex items-center gap-2">
          <img
            src="/images/helpchain-logo.png" alt="HelpChain"
            className="h-7 w-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <span className="font-bold text-lg" style={{ color: GREEN }}>HelpChain</span>
        </div>
        <button
          onClick={handleSkipAll}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors px-3 py-1.5 rounded-full hover:bg-gray-100"
        >
          <X className="w-3 h-3" /> Skip setup
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="w-full max-w-md mx-auto">

          {/* Dots + progress */}
          <div className="mb-6 space-y-3">
            <StepDots current={step} total={STEPS.length} />
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: GREEN }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>
            <p className="text-center text-xs text-gray-400">
              Step {step + 1} of {STEPS.length} — <span className="font-medium">{STEPS[step].label}</span>
            </p>
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 0: WELCOME ── */}
            {step === 0 && (
              <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.28 }}>
                <Card>
                  <div className="text-center">
                    <div className="relative inline-block mb-6">
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
                        style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)`, boxShadow: `0 8px 24px ${GREEN}40` }}
                      >
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center shadow-sm">
                        <span className="text-xs font-black text-yellow-900">✦</span>
                      </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Welcome{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}!
                    </h1>
                    <p className="text-sm text-gray-500 leading-relaxed mb-7 max-w-xs mx-auto">
                      Let's take 2 minutes to set up your profile so you can post tasks or start earning right away.
                    </p>
                    <div className="space-y-3 mb-8 text-left">
                      {[
                        "Post tasks and get offers from vetted workers",
                        "Earn money by helping people near you",
                        "All payments secured by escrow protection",
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "#F0FDF4", border: `1px solid #BBF7D0` }}>
                            <Check className="w-3 h-3" style={{ color: GREEN }} />
                          </div>
                          <span className="text-sm text-gray-600">{item}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="w-full h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                      style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)`, boxShadow: `0 4px 16px ${GREEN}40` }}
                    >
                      Get Started <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ── STEP 1: ROLE ── */}
            {step === 1 && (
              <motion.div key="role" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.28 }}>
                <Card>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">How will you use HelpChain?</h2>
                    <p className="text-sm text-gray-400 mt-1">You can always change this later in settings.</p>
                  </div>
                  <div className="space-y-3">
                    {ACCOUNT_TYPES.map((type) => {
                      const sel = accountType === type.id;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setAccountType(type.id as any)}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all"
                          style={{
                            borderColor: sel ? GREEN : "#E5E7EB",
                            background: sel ? "#F0FDF4" : "white",
                          }}
                        >
                          <span className="text-2xl">{type.emoji}</span>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">{type.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{type.sub}</p>
                          </div>
                          <div
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                            style={{ borderColor: sel ? GREEN : "#E5E7EB", background: sel ? GREEN : "white" }}
                          >
                            {sel && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <NavBtns onBack={() => setStep(0)} onNext={() => setStep(2)} />
                </Card>
              </motion.div>
            )}

            {/* ── STEP 2: ABOUT YOU ── */}
            {step === 2 && (
              <motion.div key="about" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.28 }}>
                <Card>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Tell us about yourself</h2>
                    <p className="text-sm text-gray-400 mt-1">This is shown on your public profile.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Full Name *</label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g., Adaeze Okonkwo"
                        className="h-12 rounded-xl border-gray-200 focus:border-[#0C6B38] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Phone Number <span className="normal-case font-normal text-gray-400">(optional)</span></label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+234 800 000 0000"
                          className="h-12 pl-10 rounded-xl border-gray-200 focus:border-[#0C6B38] text-sm"
                          type="tel"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Location <span className="normal-case font-normal text-gray-400">(optional)</span></label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            value={location}
                            onChange={(e) => setLocationVal(e.target.value)}
                            placeholder="e.g., Lagos, Nigeria"
                            className="h-12 pl-10 rounded-xl border-gray-200 focus:border-[#0C6B38] text-sm"
                          />
                        </div>
                        <button
                          type="button" onClick={getCurrentLocation} disabled={gettingLocation}
                          className="h-12 px-3 rounded-xl border text-sm font-medium flex items-center gap-1.5 transition-all hover:bg-gray-50 disabled:opacity-50 shrink-0"
                          style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
                        >
                          {gettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                          <span className="hidden sm:inline">Detect</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <NavBtns onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!fullName.trim()} />
                </Card>
              </motion.div>
            )}

            {/* ── STEP 3: BACKGROUND ── */}
            {step === 3 && (
              <motion.div key="background" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.28 }}>
                <Card>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Your background</h2>
                    <p className="text-sm text-gray-400 mt-1">Helps clients and workers understand your experience.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">Short Bio</label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="What do you do? What are you good at?"
                        className="rounded-2xl bg-gray-50 border-none focus:ring-[#0C6B38]/10 text-sm min-h-[90px] resize-none p-4"
                        maxLength={400}
                      />
                      <p className="text-[10px] text-gray-300 mt-1 text-right font-black">{bio.length}/400</p>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">Profession</label>
                      <Input
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        placeholder="e.g., Software Engineer"
                        className="h-14 rounded-2xl bg-gray-50 border-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Experience</label>
                      <div className="grid grid-cols-1 gap-2">
                        {EXPERIENCE_LEVELS.map((lvl) => {
                          const sel = experienceLevel === lvl.id;
                          return (
                            <button
                              key={lvl.id}
                              onClick={() => setExperienceLevel(lvl.id)}
                              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all text-left ${sel ? 'bg-[#0C6B38] border-[#0C6B38] text-white shadow-green' : 'bg-white border-gray-50 text-gray-400'}`}
                            >
                              <div>
                                <p className={`text-sm font-black ${sel ? 'text-white' : 'text-gray-900'}`}>{lvl.label}</p>
                                <p className={`text-[10px] font-bold ${sel ? 'text-white/60' : 'text-gray-400'}`}>{lvl.sub}</p>
                              </div>
                              {sel && <CheckCircle2 size={18} className="text-white" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <NavBtns onBack={() => setStep(2)} onNext={() => setStep(4)} onSkip={() => setStep(4)} />
                </Card>
              </motion.div>
            )}

            {/* ── STEP 4: SKILLS ── */}
            {step === 4 && (
              <motion.div key="skills" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.28 }}>
                <Card>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">What are your skills?</h2>
                    <p className="text-sm text-gray-400 mt-1">Select all that apply — this can be changed anytime.</p>
                  </div>
                  <div className="space-y-5">
                    {SKILL_CATEGORIES.map((cat) => (
                      <div key={cat.label}>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{cat.label}</p>
                        <div className="flex flex-wrap gap-2">
                          {cat.skills.map((skill) => (
                            <PillBtn key={skill} selected={selectedSkills.includes(skill)} onClick={() => toggleSkill(skill)}>
                              {skill}
                            </PillBtn>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedSkills.length > 0 && (
                    <p className="text-xs mt-3 font-semibold" style={{ color: GREEN }}>
                      {selectedSkills.length} skill{selectedSkills.length !== 1 ? "s" : ""} selected
                    </p>
                  )}
                  <NavBtns onBack={() => setStep(3)} onNext={() => setStep(5)} onSkip={() => setStep(5)} />
                </Card>
              </motion.div>
            )}

            {/* ── STEP 5: PREFERENCES ── */}
            {step === 5 && (
              <motion.div key="prefs" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.28 }}>
                <Card>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Your preferences</h2>
                    <p className="text-sm text-gray-400 mt-1">Help us match you with the right tasks and clients.</p>
                  </div>
                  <div className="space-y-5">
                    {/* Availability */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-2.5 uppercase tracking-wider">Availability <span className="normal-case font-normal text-gray-400">(optional)</span></label>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABILITY_OPTIONS.map((opt) => (
                          <PillBtn key={opt.id} selected={availability.includes(opt.id)} onClick={() => toggleAvail(opt.id)}>
                            {opt.label}
                          </PillBtn>
                        ))}
                      </div>
                    </div>
                    {/* Languages */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Languages Spoken <span className="normal-case font-normal text-gray-400">(optional)</span></label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          value={languages}
                          onChange={(e) => setLanguages(e.target.value)}
                          placeholder="e.g., English, Yoruba, Hausa"
                          className="h-12 pl-10 rounded-xl border-gray-200 focus:border-[#0C6B38] text-sm"
                        />
                      </div>
                    </div>
                    {/* Budget / Rate range */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                        {accountType === "client" ? "Typical Task Budget (₦)" : "Expected Hourly Rate (₦)"}{" "}
                        <span className="normal-case font-normal text-gray-400">(optional)</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">₦</span>
                          <Input
                            value={rateMin}
                            onChange={(e) => setRateMin(e.target.value.replace(/\D/g, ""))}
                            placeholder="Min"
                            className="h-12 pl-8 rounded-xl border-gray-200 focus:border-[#0C6B38] text-sm"
                            type="text"
                            inputMode="numeric"
                          />
                        </div>
                        <span className="text-gray-400 text-sm font-medium">to</span>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">₦</span>
                          <Input
                            value={rateMax}
                            onChange={(e) => setRateMax(e.target.value.replace(/\D/g, ""))}
                            placeholder="Max"
                            className="h-12 pl-8 rounded-xl border-gray-200 focus:border-[#0C6B38] text-sm"
                            type="text"
                            inputMode="numeric"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Complete Setup */}
                  <NavBtns
                    onBack={() => setStep(4)}
                    onNext={handleComplete}
                    nextLabel="Complete Setup"
                    saving={saving}
                  />
                  <button
                    onClick={handleSkipAll}
                    className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-2 mt-1"
                  >
                    I'll fill this in later
                  </button>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
