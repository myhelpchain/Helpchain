import { Link, useLocation } from "wouter";
import { OnboardingBanner } from "@/components/ui/onboarding-banner";
import { HelpChainLogo } from "@/components/ui/helpchain-logo";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { useMobileMenu } from "@/contexts/mobile-menu-context";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Menu, X, Bell, LogOut, User, MessageCircle, Search, 
  Home, ChevronDown,
  LayoutDashboard, Wallet, ClipboardList, Settings, HelpCircle, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  variant?: 'default' | 'transparent';
}

export function Navbar({ variant = 'default' }: NavbarProps) {
  const { user, logout, loading } = useFirebaseAuth();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [location, setLocation] = useLocation();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();
  const [scrolled, setScrolled] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const isLandingPage = location === '/';
  const shouldBeTransparent = (variant === 'transparent' || isLandingPage) && !scrolled;

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.75;
      setScrolled(window.scrollY > heroHeight);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const savedImage = localStorage.getItem("profilePicture");
    if (savedImage) setProfileImage(savedImage);
    const handleStorageChange = () => setProfileImage(localStorage.getItem("profilePicture"));
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const publicNavLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/discover", label: "Find Tasks", icon: Search },
  ];

  const authNavLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/discover", label: "Tasks", icon: ClipboardList },
    { href: "/wallet", label: "Wallet", icon: Wallet },
    { href: "/messages", label: "Messages", icon: MessageCircle },
  ];

  const navLinks = user ? authNavLinks : publicNavLinks;

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Dropdown menu items for authenticated users
  const dropdownItems = [
    { href: "/profile", label: "Profile", icon: User },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/wallet", label: "Wallet", icon: Wallet },
    { href: "/discover", label: "My Tasks", icon: ClipboardList },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/help", label: "Help Center", icon: HelpCircle },
  ];

  // Mobile nav items (combined primary + secondary)
  const mobileNavItems = user
    ? [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/discover", label: "Tasks", icon: ClipboardList },
        { href: "/wallet", label: "Wallet", icon: Wallet },
        { href: "/messages", label: "Messages", icon: MessageCircle },
        { href: "/create-request", label: "Post a Task", icon: Plus },
      ]
    : publicNavLinks;

  const mobileSecondaryItems = [
    { href: "/profile", label: "My Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/help", label: "Help Center", icon: HelpCircle },
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-500",
          shouldBeTransparent 
            ? "bg-transparent" 
            : "bg-background/95 backdrop-blur-xl shadow-lg shadow-foreground/5 border-b border-border/50"
        )}
      >
        <div className="container mx-auto px-4">
          <div className={cn(
            "flex items-center justify-between transition-all duration-300",
            shouldBeTransparent ? "py-2" : "py-1.5"
          )}>
            {/* Logo */}
            <Link href="/">
              <motion.div 
                className="flex items-center gap-2 cursor-pointer group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <HelpChainLogo size="md" className="rounded-lg" />
                <span className={cn(
                  "text-lg font-bold tracking-tight transition-colors duration-300",
                  shouldBeTransparent ? "text-white" : "text-foreground"
                )}>
                  HelpChain
                </span>
              </motion.div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <motion.span 
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer flex items-center gap-2",
                      shouldBeTransparent 
                        ? location === link.href 
                          ? "bg-white/20 text-white" 
                          : "text-white/80 hover:text-white hover:bg-white/10"
                        : location === link.href 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <link.icon size={16} />
                    {link.label}
                  </motion.span>
                </Link>
              ))}
            </div>

            {/* Desktop Right Section */}
            <div className="hidden md:flex items-center gap-3">
              {loading ? (
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              ) : user ? (
                <>
                  {/* Post Task CTA */}
                  <Link href="/create-request">
                    <Button 
                      size="sm"
                      className={cn(
                        "rounded-full font-medium gap-1.5 transition-all",
                        shouldBeTransparent
                          ? "bg-white text-primary hover:bg-white/90 shadow-lg shadow-black/10"
                          : "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-md shadow-primary/25"
                      )}
                    >
                      <Plus size={14} />
                      Post Task
                    </Button>
                  </Link>

                  {/* Notifications */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "relative rounded-full transition-colors duration-300",
                          shouldBeTransparent 
                            ? "hover:bg-white/10" 
                            : "hover:bg-muted"
                        )}
                      >
                        <Bell className={cn(
                          "h-5 w-5 transition-colors duration-300",
                          shouldBeTransparent ? "text-white" : "text-muted-foreground"
                        )} />
                        {unreadCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl shadow-xl border-border">
                      <div className="p-4 border-b border-border font-semibold text-sm bg-muted rounded-t-2xl flex items-center justify-between">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={() => markAllRead()} className="text-xs text-primary hover:underline font-medium">
                            Mark all read
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                          <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                          No notifications yet
                        </div>
                      ) : (
                        <div className="max-h-[320px] overflow-y-auto">
                          {notifications.slice(0, 10).map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => !notif.is_read && markAsRead(notif.id)}
                              className={cn(
                                "px-4 py-3 border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/50 transition-colors",
                                !notif.is_read && "bg-primary/5"
                              )}
                            >
                              <div className="flex items-start gap-2">
                                {!notif.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{notif.title}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                                    {new Date(notif.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className={cn(
                          "relative h-10 gap-2 px-2 rounded-full transition-colors duration-300",
                          shouldBeTransparent 
                            ? "hover:bg-white/10" 
                            : "hover:bg-muted"
                        )}
                      >
                        <Avatar className={cn(
                          "h-8 w-8 border-2 transition-colors duration-300",
                          shouldBeTransparent ? "border-white/30" : "border-primary/20"
                        )}>
                          <AvatarImage src={user.photoURL || profileImage || undefined} alt={user.displayName || 'User'} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-medium">
                            {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-colors duration-300",
                          shouldBeTransparent ? "text-white" : "text-muted-foreground"
                        )} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 rounded-2xl shadow-xl border-border p-0" align="end" forceMount>
                      {/* User Info Header */}
                      <DropdownMenuLabel className="font-normal p-4 bg-muted rounded-t-xl">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-primary/20">
                            <AvatarImage src={user.photoURL || profileImage || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-medium">
                              {user.displayName?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <p className="text-sm font-semibold leading-none">{user.displayName || 'User'}</p>
                            <p className="text-xs leading-none text-muted-foreground mt-1">{user.email}</p>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="my-0" />
                      
                      {/* Primary Actions */}
                      <div className="p-1.5">
                        {dropdownItems.slice(0, 4).map((item) => (
                          <DropdownMenuItem key={item.href} asChild className="rounded-lg cursor-pointer px-3 py-2.5">
                            <Link href={item.href} className="w-full flex items-center gap-3">
                              <item.icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </div>
                      <DropdownMenuSeparator className="my-0" />
                      
                      {/* Secondary Actions */}
                      <div className="p-1.5">
                        {dropdownItems.slice(4).map((item) => (
                          <DropdownMenuItem key={item.href} asChild className="rounded-lg cursor-pointer px-3 py-2.5">
                            <Link href={item.href} className="w-full flex items-center gap-3">
                              <item.icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </div>
                      <DropdownMenuSeparator className="my-0" />
                      
                      {/* Logout */}
                      <div className="p-1.5">
                        <DropdownMenuItem 
                          onClick={handleLogout} 
                          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg px-3 py-2.5"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          <span className="text-sm font-medium">Log out</span>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth">
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "font-medium rounded-full px-5 transition-colors duration-300",
                        shouldBeTransparent 
                          ? "text-white hover:bg-white/10" 
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link href="/auth?mode=signup">
                    <Button 
                      className={cn(
                        "font-semibold rounded-full px-6 transition-all hover:-translate-y-0.5 btn-shine",
                        shouldBeTransparent
                          ? "bg-white text-primary hover:bg-white/90 shadow-lg shadow-black/10"
                          : "bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                      )}
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "rounded-full transition-colors duration-300",
                  shouldBeTransparent ? "text-white hover:bg-white/10" : "hover:bg-muted"
                )}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-out Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 h-screen w-[300px] bg-background border-r border-border z-50 md:hidden shadow-2xl"
              >
                <div className="p-6 space-y-6 h-full flex flex-col overflow-y-auto">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HelpChainLogo size="md" className="rounded-xl" />
                      <span className="text-lg font-bold text-foreground">HelpChain</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="rounded-full hover:bg-muted"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Primary Navigation */}
                  <div className="space-y-1">
                    {mobileNavItems.map((link) => (
                      <Link key={link.href} href={link.href}>
                        <motion.div
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "py-3 px-4 rounded-xl transition-colors cursor-pointer text-sm font-medium flex items-center gap-3",
                            location === link.href
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          <link.icon size={18} />
                          {link.label}
                        </motion.div>
                      </Link>
                    ))}
                  </div>

                  {user && (
                    <>
                      <div className="h-px bg-border" />

                      {/* Secondary Navigation */}
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">Account</p>
                        {mobileSecondaryItems.map((link) => (
                          <Link key={link.href} href={link.href}>
                            <motion.div
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={cn(
                                "py-3 px-4 rounded-xl transition-colors cursor-pointer text-sm font-medium flex items-center gap-3",
                                location === link.href
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground hover:bg-muted"
                              )}
                            >
                              <link.icon size={18} className="text-muted-foreground" />
                              {link.label}
                            </motion.div>
                          </Link>
                        ))}
                      </div>

                      <div className="h-px bg-border" />

                      {/* Logout */}
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-destructive/10 transition-colors text-sm font-medium text-destructive"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Log out</span>
                      </motion.button>
                    </>
                  )}

                  {!user && (
                    <div className="space-y-3 mt-auto pt-4">
                      <Link href="/auth">
                        <Button 
                          variant="outline" 
                          className="w-full justify-center font-medium rounded-xl h-12"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Log in
                        </Button>
                      </Link>
                      <Link href="/auth?mode=signup">
                        <Button 
                          className="w-full justify-center bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold rounded-xl h-12"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.nav>
      <OnboardingBanner />
    </>
  );
}
