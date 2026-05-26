import { Switch, Route, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FirebaseAuthProvider } from "@/contexts/FirebaseAuthContext";
import { MobileMenuProvider } from "@/contexts/mobile-menu-context";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { AnimatePresence, motion } from "framer-motion";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Chatbot } from "@/components/chatbot/chatbot";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

import NotFound from "@/pages/not-found";
// ... (rest of imports)
import Home from "@/pages/home";
import IntroOnboardingPage from "@/pages/intro-onboarding";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import CreateRequest from "@/pages/create-request";
import CreateOfferPage from "@/pages/create-offer";
import AdminDashboard from "@/pages/admin-dashboard";
import DiscoverPage from "@/pages/discover";
import ProfilePage from "@/pages/profile";
import PublicProfilePage from "@/pages/public-profile";
import RequestDetails from "@/pages/request-details";
import BatchManagementPage from "@/pages/batch-management";
import MessagesPage from "@/pages/messages";
import WalletPage from "@/pages/wallet";
import SettingsPage from "@/pages/settings";
import OnboardingPage from "@/pages/onboarding";
import HowItWorks from "@/pages/how-it-works";
import SafetyPage from "@/pages/safety";
import StoriesPage from "@/pages/stories";
import VolunteersPage from "@/pages/volunteers";
import BlogPage from "@/pages/blog";
import EventsPage from "@/pages/events";
import HelpPage from "@/pages/help";
import ContactPage from "@/pages/contact";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import SitemapPage from "@/pages/sitemap";
import AboutPage from "@/pages/about";
import PricingPage from "@/pages/pricing";
import CareersPage from "@/pages/careers";
import PressPage from "@/pages/press";
import CookiesPage from "@/pages/cookies";

function P({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

const pageVariants = {
  initial: { opacity: 0, x: 100 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 }
  },
};

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      style={{
        minHeight: "100%",
        width: "100%",
        position: "absolute",
        background: "#F8FAF9"
      }}
    >
      {children}
    </motion.div>
  );
}

function Router() {
  const [location] = useLocation();

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <Switch key={location} location={location}>
          <Route path="/"              component={Home} />
          <Route path="/intro"         component={IntroOnboardingPage} />
          <Route path="/auth"          component={AuthPage} />
          <Route path="/onboarding"    component={OnboardingPage} />

          <Route path="/discover">
            {() => <AnimatedPage><DiscoverPage /></AnimatedPage>}
          </Route>
          <Route path="/search">
            {() => <AnimatedPage><DiscoverPage /></AnimatedPage>}
          </Route>

          <Route path="/request/:id">
            {(params) => <AnimatedPage><RequestDetails id={params.id} /></AnimatedPage>}
          </Route>
          <Route path="/public-profile/:userId">
            {(params) => <AnimatedPage><PublicProfilePage userId={params.userId} /></AnimatedPage>}
          </Route>

          <Route path="/dashboard">
            {() => <P><AnimatedPage><Dashboard /></AnimatedPage></P>}
          </Route>
          <Route path="/create-request">
            {() => <P><AnimatedPage><CreateRequest /></AnimatedPage></P>}
          </Route>
          <Route path="/create-offer">
            {() => <P><AnimatedPage><CreateOfferPage /></AnimatedPage></P>}
          </Route>
          <Route path="/admin">
            {() => <P><AnimatedPage><AdminDashboard /></AnimatedPage></P>}
          </Route>
          <Route path="/messages">
            {() => <P><AnimatedPage><MessagesPage /></AnimatedPage></P>}
          </Route>
          <Route path="/wallet">
            {() => <P><AnimatedPage><WalletPage /></AnimatedPage></P>}
          </Route>
          <Route path="/settings">
            {() => <P><AnimatedPage><SettingsPage /></AnimatedPage></P>}
          </Route>
          <Route path="/profile">
            {() => <P><AnimatedPage><ProfilePage /></AnimatedPage></P>}
          </Route>
          <Route path="/batch/:id">
            {(params) => <P><AnimatedPage><BatchManagementPage id={params.id} /></AnimatedPage></P>}
          </Route>

          <Route component={NotFound} />
        </Switch>
      </AnimatePresence>
    </div>
  );
}

function AppShell() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem("hc-splash-shown");
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem("hc-splash-shown", "true");
    setShowSplash(false);
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>
      {!showSplash && (
        <>
          <Router />
          <Chatbot />
        </>
      )}
    </>
  );
}

function App() {
  useEffect(() => {
    // Edge-to-edge support for Mobile Devices
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: true }).catch(console.error);
      StatusBar.setStyle({ style: Style.Dark }).catch(console.error);
    }
  }, []);

  return (
    <FirebaseAuthProvider>
      <MobileMenuProvider>
        <QueryClientProvider client={queryClient}>
          <RealtimeProvider>
            <TooltipProvider>
              <Toaster />
              <AppShell />
            </TooltipProvider>
          </RealtimeProvider>
        </QueryClientProvider>
      </MobileMenuProvider>
    </FirebaseAuthProvider>
  );
}

export default App;
