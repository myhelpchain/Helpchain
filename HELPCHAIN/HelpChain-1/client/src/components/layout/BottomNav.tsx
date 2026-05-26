import { Link, useLocation } from "wouter";
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useConversations } from "@/hooks/use-messaging";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";

const tabs = [
  { href: "/dashboard", icon: Home,          label: "Home"     },
  { href: "/discover",  icon: Search,        label: "Tasks"    },
  { href: "/messages",  icon: MessageCircle, label: "Chat"     },
  { href: "/profile",   icon: User,          label: "Profile"  },
];

export function BottomNav() {
  const [location] = useLocation();
  const { user } = useFirebaseAuth();
  const { conversations } = useConversations();

  const unreadMessages = user
    ? conversations.reduce((sum, c) => {
        const isA = c.participant_a === user.uid;
        return sum + (isA ? (c.unread_a || 0) : (c.unread_b || 0));
      }, 0)
    : 0;

  const isActive = (href: string) => {
    if (href === "/dashboard") return location === "/dashboard" || location === "/";
    return location.startsWith(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom,0px)]">
      <div
        className="mx-auto max-w-lg mb-4 px-4 h-[76px] flex items-center justify-between glass-card rounded-[32px] shadow-premium-lg border-white/40"
        style={{ width: "calc(100% - 32px)" }}
      >
        {tabs.slice(0, 2).map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link key={tab.href} href={tab.href}>
              <motion.div
                whileTap={{ scale: 0.9, y: 2 }}
                className="relative flex flex-col items-center justify-center w-14 h-14 cursor-pointer"
              >
                <AnimatePresence>
                  {active && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-[#0C6B38]/10 rounded-2xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
                <tab.icon
                  className={`w-6 h-6 transition-all duration-300 ${active ? "text-[#0C6B38] stroke-[2.5px]" : "text-gray-400 stroke-[1.8px]"}`}
                />
                <span className={`text-[10px] mt-1 font-bold tracking-tight ${active ? "text-[#0C6B38]" : "text-gray-400"}`}>
                  {tab.label}
                </span>
              </motion.div>
            </Link>
          );
        })}

        {/* Floating Action Button */}
        <Link href="/create-request">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92, rotate: 5 }}
            className="flex flex-col items-center justify-center -mt-8"
          >
            <div
              className="w-[64px] h-[64px] rounded-[24px] flex items-center justify-center shadow-green-lg"
              style={{
                background: "linear-gradient(135deg, #0C6B38 0%, #15A34A 100%)",
                border: "2px solid rgba(255,255,255,0.2)"
              }}
            >
              <Plus className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
          </motion.div>
        </Link>

        {tabs.slice(2).map((tab) => {
          const active = isActive(tab.href);
          const badge = tab.href === "/messages" && unreadMessages > 0 ? unreadMessages : 0;
          return (
            <Link key={tab.href} href={tab.href}>
              <motion.div
                whileTap={{ scale: 0.9, y: 2 }}
                className="relative flex flex-col items-center justify-center w-14 h-14 cursor-pointer"
              >
                <AnimatePresence>
                  {active && (
                    <motion.div
                      layoutId="active-pill-2"
                      className="absolute inset-0 bg-[#0C6B38]/10 rounded-2xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
                <div className="relative">
                  <tab.icon
                    className={`w-6 h-6 transition-all duration-300 ${active ? "text-[#0C6B38] stroke-[2.5px]" : "text-gray-400 stroke-[1.8px]"}`}
                  />
                  {badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-sm"
                    >
                      {badge > 9 ? "9+" : badge}
                    </motion.span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-bold tracking-tight ${active ? "text-[#0C6B38]" : "text-gray-400"}`}>
                  {tab.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
