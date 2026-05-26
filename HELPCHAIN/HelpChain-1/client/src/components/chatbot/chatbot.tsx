import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, X, Send, Bot, User, ChevronDown, HelpCircle, FileText, Shield, DollarSign, UserPlus } from "lucide-react";
import { useLocation } from "wouter";

interface Message {
  id: string;
  content: string;
  sender: "bot" | "user";
  timestamp: Date;
  quickReplies?: string[];
}

const QUICK_TOPICS = [
  { icon: HelpCircle, label: "How it works", value: "how does helpchain work" },
  { icon: FileText, label: "Post a task", value: "how do i post a task" },
  { icon: DollarSign, label: "Pricing & fees", value: "what are the fees" },
  { icon: Shield, label: "Safety", value: "is helpchain safe" },
  { icon: UserPlus, label: "Become a helper", value: "how do i become a helper" },
];

const QUICK_REPLY_MAP: Record<string, string> = {
  "how does it work?": "how does helpchain work",
  "post a task": "how do i post a task",
  "post a task now": "how do i post a task",
  "take me to post a task": "navigate:post",
  "what are the fees?": "what are the fees",
  "is it safe?": "is helpchain safe",
  "sign up now": "navigate:signup",
  "how does escrow work?": "how does escrow work",
  "when do i pay?": "what are the fees",
  "is there a subscription?": "what are the fees",
  "what budget should i set?": "what budget should i set",
  "how long until i get offers?": "how do i post a task",
  "how do i pay?": "what are the fees",
  "how do i report an issue?": "talk to support",
  "talk to support": "talk to support",
  "how are helpers verified?": "is helpchain safe",
  "what if i'm not satisfied?": "how does escrow work",
  "how long do i have to confirm?": "how does escrow work",
  "can i negotiate?": "what budget should i set",
  "what skills are needed?": "how do i become a helper",
  "how much can i earn?": "how do i become a helper",
  "back to main menu": "greeting",
  "safety concerns": "is helpchain safe",
  "report an issue": "talk to support",
};

const KNOWLEDGE_BASE: Record<string, { response: string; quickReplies?: string[] }> = {
  "greeting": {
    response: "Hello! I'm HelpBot, your HelpChain assistant. I can help you understand how the platform works, post tasks, learn about fees, or answer any questions. What would you like to know?",
    quickReplies: ["How does it work?", "Post a task", "What are the fees?", "Is it safe?"]
  },
  "how does helpchain work": {
    response: "HelpChain connects you with trusted local helpers for everyday tasks! Here's how it works:\n\n1. **Post your task** - Describe what you need and set your budget\n2. **Get offers** - Helpers in your area will send offers\n3. **Choose & deposit** - Pick a helper and deposit the agreed amount\n4. **Get it done** - Your helper completes the task\n5. **Release payment** - Once satisfied, release the payment to your helper\n\nIt's simple, safe, and secure!",
    quickReplies: ["Post a task now", "What are the fees?", "How do I pay?"]
  },
  "how do i post a task": {
    response: "Posting a task is easy! Here's what to do:\n\n1. Click **'Post a Task'** button\n2. Choose a category (delivery, cleaning, moving, etc.)\n3. Describe what you need done\n4. Set your location and timing\n5. Enter your budget\n6. Submit and wait for offers!\n\nHelpers will see your task and send offers. You can accept or negotiate the price.",
    quickReplies: ["Take me to post a task", "What budget should I set?", "How long until I get offers?"]
  },
  "what are the fees": {
    response: "HelpChain charges a **6% platform fee** on each task. Here's how it works:\n\n- You set your budget (e.g., ₦5,000)\n- Platform fee is added (6% = ₦300)\n- You deposit total (₦5,300)\n- Helper receives your full budget (₦5,000)\n\nNo hidden fees!",
    quickReplies: ["How does escrow work?", "When do I pay?", "Is there a subscription?"]
  },
  "is helpchain safe": {
    response: "Your safety is our priority! Here's how we protect you:\n\n✓ **Verified helpers** - All helpers verify their identity\n✓ **Secure escrow** - Your money is held safely until the task is done\n✓ **Reviews & ratings** - See what others say before choosing\n✓ **In-app messaging** - Keep all communication on the platform\n✓ **24/7 support** - Our team is here to help",
    quickReplies: ["How do I report an issue?", "Talk to support", "How are helpers verified?"]
  },
  "how do i become a helper": {
    response: "Want to earn money helping others? Here's how:\n\n1. **Create an account** - Sign up for free\n2. **Complete your profile** - Add your skills and a friendly bio\n3. **Enable Helper Mode** - Go to Profile → Settings\n4. **Browse tasks** - Find tasks you can help with\n5. **Make offers** - Send offers to task posters\n\nYou'll earn money for every completed task!",
    quickReplies: ["Sign up now", "What skills are needed?", "How much can I earn?"]
  },
  "how does escrow work": {
    response: "Our escrow system protects both you and the helper:\n\n1. **Task accepted** - You deposit the agreed amount\n2. **Money held safely** - Funds are in HelpChain's secure account\n3. **Task completed** - Helper finishes the work\n4. **You confirm** - Satisfied? Release the payment\n5. **Helper paid** - Money goes to the helper's wallet",
    quickReplies: ["What if I'm not satisfied?", "How long do I have to confirm?"]
  },
  "what budget should i set": {
    response: "You can set any budget you're comfortable with! Typical ranges:\n\n- **Delivery/Errands**: ₦1,500 - ₦3,000\n- **Home Cleaning**: ₦3,000 - ₦8,000\n- **Furniture Assembly**: ₦4,000 - ₦10,000\n- **Moving Help**: ₦5,000 - ₦20,000\n- **Electrical Work**: ₦5,000 - ₦15,000\n\nHelpers can accept your offer or suggest a different price!",
    quickReplies: ["Post a task now", "Can I negotiate?"]
  },
  "talk to support": {
    response: "If you need to speak with our human support team:\n\n📧 Email: support@helpchain.ng\n📱 WhatsApp: +234 800 HELP CHAIN\n\nOur team typically responds within 1-2 hours during business hours (9 AM - 6 PM WAT, Mon-Sat).",
    quickReplies: ["Back to main menu", "Safety concerns", "Report an issue"]
  },
  "default": {
    response: "I'm not sure I understood that. Here are some things I can help with:\n\n• How HelpChain works\n• Posting a task\n• Fees and pricing\n• Safety and security\n• Becoming a helper\n\nOr type your question and I'll do my best to help!",
    quickReplies: ["How does it work?", "Post a task", "Talk to support"]
  }
};

function findBestResponse(input: string): { response: string; quickReplies?: string[] } {
  const lowerInput = input.toLowerCase().trim();
  if (lowerInput.match(/^(hi|hello|hey|good morning|good afternoon|good evening|help)$/i)) {
    return KNOWLEDGE_BASE["greeting"];
  }
  const keywords: Record<string, string[]> = {
    "how does helpchain work": ["how", "work", "what is", "explain", "about"],
    "how do i post a task": ["post", "create", "submit", "request", "task", "job"],
    "what are the fees": ["fee", "cost", "price", "charge", "pay", "money", "commission", "percentage"],
    "is helpchain safe": ["safe", "secure", "trust", "scam", "legit", "legitimate", "protection"],
    "how do i become a helper": ["helper", "earn", "make money", "become", "work for", "join as"],
    "how does escrow work": ["escrow", "hold", "funds", "deposit"],
    "what budget should i set": ["budget", "how much", "amount", "should i pay", "typical price"],
    "talk to support": ["support", "contact", "human", "agent", "call", "email", "whatsapp", "phone"],
  };
  let bestMatch = "";
  let bestScore = 0;
  for (const [key, words] of Object.entries(keywords)) {
    let score = 0;
    for (const word of words) {
      if (lowerInput.includes(word)) score++;
    }
    if (score > bestScore) { bestScore = score; bestMatch = key; }
  }
  if (bestScore > 0 && KNOWLEDGE_BASE[bestMatch]) return KNOWLEDGE_BASE[bestMatch];
  return KNOWLEDGE_BASE["default"];
}

const BTN_SIZE = 56;
const EDGE_PAD = 12;

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const getInitialPos = () => ({
    x: (typeof window !== "undefined" ? window.innerWidth : 400) - BTN_SIZE - EDGE_PAD,
    y: (typeof window !== "undefined" ? window.innerHeight : 800) - BTN_SIZE - EDGE_PAD,
  });

  const [btnPos, setBtnPos] = useState(getInitialPos);
  const drag = useRef({ active: false, startMX: 0, startMY: 0, startBX: 0, startBY: 0, moved: false });

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = KNOWLEDGE_BASE["greeting"];
      setMessages([{ id: "1", content: greeting.response, sender: "bot", timestamp: new Date(), quickReplies: greeting.quickReplies }]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { active: true, startMX: e.clientX, startMY: e.clientY, startBX: btnPos.x, startBY: btnPos.y, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startMX;
    const dy = e.clientY - drag.current.startMY;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) drag.current.moved = true;
    const maxX = window.innerWidth - BTN_SIZE - EDGE_PAD;
    const maxY = window.innerHeight - BTN_SIZE - EDGE_PAD;
    setBtnPos({
      x: Math.max(EDGE_PAD, Math.min(maxX, drag.current.startBX + dx)),
      y: Math.max(EDGE_PAD, Math.min(maxY, drag.current.startBY + dy)),
    });
  };

  const onPointerUp = () => {
    const wasDrag = drag.current.moved;
    drag.current.active = false;
    if (!wasDrag) setIsOpen(o => !o);
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    const userMessage: Message = { id: Date.now().toString(), content: text, sender: "user", timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
    const lowerText = text.toLowerCase().trim();
    const mappedKey = QUICK_REPLY_MAP[lowerText];
    if (mappedKey === "navigate:post") {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), content: "Taking you to post a task now!", sender: "bot", timestamp: new Date() }]);
      setTimeout(() => { setIsOpen(false); setLocation("/create-request"); }, 500);
      return;
    }
    if (mappedKey === "navigate:signup") {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), content: "Redirecting you to sign up!", sender: "bot", timestamp: new Date() }]);
      setTimeout(() => { setIsOpen(false); setLocation("/auth"); }, 500);
      return;
    }
    const response = mappedKey && KNOWLEDGE_BASE[mappedKey] ? KNOWLEDGE_BASE[mappedKey] : findBestResponse(text);
    setIsTyping(false);
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), content: response.response, sender: "bot", timestamp: new Date(), quickReplies: response.quickReplies }]);
  };

  const PANEL_W = typeof window !== "undefined" ? Math.min(340, window.innerWidth - 24) : 340;
  const PANEL_H = 480;
  const panelX = Math.max(EDGE_PAD, Math.min(btnPos.x - PANEL_W + BTN_SIZE, window.innerWidth - PANEL_W - EDGE_PAD));
  const openUpward = btnPos.y > window.innerHeight / 2;
  const panelTop = openUpward ? Math.max(EDGE_PAD, btnPos.y - PANEL_H - 10) : btnPos.y + BTN_SIZE + 10;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.92, y: openUpward ? 12 : -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: openUpward ? 12 : -12 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: "fixed", left: panelX, top: panelTop, width: PANEL_W, zIndex: 49 }}
          >
            <Card className="overflow-hidden shadow-2xl border-0" style={{ borderRadius: 20 }}>
              <div className="p-4 text-white" style={{ background: "linear-gradient(135deg, #0C6B38 0%, #0a5a30 100%)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[15px]">HelpBot</h3>
                      <p className="text-[11px] text-white/65">Your HelpChain Assistant</p>
                    </div>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto p-3 space-y-3" style={{ height: 260, background: "#F8FAF8" }}>
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.sender === "bot" && (
                      <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                        <AvatarFallback style={{ background: "#0C6B38" }} className="text-white">
                          <Bot className="w-3.5 h-3.5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[82%] ${msg.sender === "user" ? "order-first" : ""}`}>
                      <div className={`px-3 py-2 text-[13px] whitespace-pre-wrap leading-relaxed ${
                        msg.sender === "user"
                          ? "text-white rounded-2xl rounded-br-sm"
                          : "bg-white text-[#0D0D0D] rounded-2xl rounded-bl-sm shadow-sm"
                      }`} style={msg.sender === "user" ? { background: "#0C6B38" } : {}}>
                        {msg.content}
                      </div>
                      {msg.quickReplies && msg.sender === "bot" && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {msg.quickReplies.map((reply, i) => (
                            <button
                              key={i}
                              onClick={() => handleSend(reply)}
                              className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-gray-200 hover:border-[#0C6B38] hover:text-[#0C6B38] transition-colors font-medium"
                            >
                              {reply}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.sender === "user" && (
                      <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                        <AvatarFallback className="bg-gray-200 text-gray-600">
                          <User className="w-3.5 h-3.5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-2 items-start">
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarFallback style={{ background: "#0C6B38" }} className="text-white">
                        <Bot className="w-3.5 h-3.5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white px-3 py-2.5 rounded-2xl rounded-bl-sm shadow-sm">
                      <div className="flex gap-1">
                        {[0, 150, 300].map((d, i) => (
                          <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {messages.length === 1 && (
                <div className="px-3 py-2.5 bg-white border-t border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick topics</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_TOPICS.map((topic, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(topic.value)}
                        className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 hover:border-[#0C6B38] hover:text-[#0C6B38] transition-colors font-medium"
                      >
                        <topic.icon className="w-3 h-3" />
                        {topic.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-white border-t border-gray-100">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 h-9 text-[13px] rounded-xl border-gray-200"
                  />
                  <button
                    type="submit"
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white"
                    style={{ background: "#0C6B38" }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        style={{
          position: "fixed",
          left: btnPos.x,
          top: btnPos.y,
          width: BTN_SIZE,
          height: BTN_SIZE,
          zIndex: 50,
          touchAction: "none",
          cursor: drag.current.active ? "grabbing" : "grab",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #0C6B38 0%, #16A34A 100%)",
          boxShadow: "0 6px 24px rgba(12,107,56,0.45)",
          color: "white",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        whileTap={{ scale: 0.92 }}
        animate={{ scale: isOpen ? 0.92 : 1 }}
        transition={{ duration: 0.15 }}
        title="Drag to move · Tap to chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
