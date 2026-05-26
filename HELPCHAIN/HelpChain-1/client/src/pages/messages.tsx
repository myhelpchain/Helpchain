import { useState, useEffect, useRef } from "react";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageCircle, Search, Loader2, ArrowLeft, MoreHorizontal, Image as ImageIcon } from "lucide-react";
import { Redirect } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useConversations, useMessages, type ConversationData } from "@/hooks/use-messaging";
import { format, isToday, isYesterday } from "date-fns";

const GREEN = "#0C6B38";

function formatMessageTime(date: any) {
  if (!date) return "";
  const d = date.toDate?.() || new Date(date);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

export default function MessagesPage() {
  const { user } = useFirebaseAuth();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { conversations, isLoading: convsLoading } = useConversations();
  const { messages, isLoading: msgsLoading, sendMessage, sendPending } = useMessages(selectedConvId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) return <Redirect to="/auth" />;

  const filteredConvs = conversations.filter((c) => {
    const otherName = c.participant_a === user.uid ? c.other_b?.full_name : c.other_a?.full_name;
    return (otherName || "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedConv = conversations.find(c => c.id === selectedConvId);
  const otherUser = selectedConv ? (selectedConv.participant_a === user.uid ? selectedConv.other_b : selectedConv.other_a) : null;

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConvId) return;
    await sendMessage(newMessage.trim());
    setNewMessage("");
  };

  // Chat View
  if (selectedConvId && otherUser) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F8FAF9] flex flex-col">
        {/* Chat Header */}
        <header className="px-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-4 bg-white/80 backdrop-blur-xl sticky top-0 z-10 border-b border-gray-100 flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedConvId(null)}
            className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-gray-900" strokeWidth={3} />
          </motion.button>

          <div className="flex-1 flex items-center gap-3">
             <Avatar className="h-10 w-10 ring-2 ring-gray-50">
               <AvatarImage src={otherUser.avatar_url} />
               <AvatarFallback className="bg-gradient-green text-white text-xs font-black">{otherUser.full_name?.[0]}</AvatarFallback>
             </Avatar>
             <div>
                <h4 className="text-sm font-black text-gray-900">{otherUser.full_name}</h4>
                <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">Active Now</p>
             </div>
          </div>

          <button className="w-10 h-10 text-gray-300">
            <MoreHorizontal />
          </button>
        </header>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
           {msgsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#0C6B38]" />
              </div>
           ) : messages.map((msg, i) => {
             const isMine = msg.sender_id === user.uid;
             return (
               <motion.div
                 key={msg.id}
                 initial={{ opacity: 0, scale: 0.9, y: 10 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
               >
                 <div
                   className={`max-w-[80%] px-5 py-3.5 rounded-[24px] shadow-sm relative ${isMine ? 'bg-[#0C6B38] text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-50'}`}
                 >
                    <p className="text-sm font-medium leading-relaxed">{msg.body}</p>
                    <span className={`text-[9px] font-black uppercase mt-1.5 block opacity-40 ${isMine ? 'text-white' : 'text-gray-400'}`}>
                      {formatMessageTime(msg.createdAt)}
                    </span>
                 </div>
               </motion.div>
             );
           })}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100">
           <div className="mx-auto max-w-lg flex items-center gap-3">
              <button className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center">
                <ImageIcon size={20} />
              </button>
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="h-12 rounded-2xl border-none bg-gray-50 px-5 font-medium text-sm focus-visible:ring-[#0C6B38]/10"
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={!newMessage.trim() || sendPending}
                className="w-12 h-12 rounded-2xl bg-[#0C6B38] text-white flex items-center justify-center shadow-green disabled:opacity-50"
              >
                {sendPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} strokeWidth={3} />}
              </motion.button>
           </div>
        </div>
      </div>
    );
  }

  // Conversation List View
  return (
    <MobileLayout>
      <div className="min-h-full bg-[#F8FAF9]">
        <header className="px-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-6 bg-white rounded-b-[40px] shadow-sm sticky top-0 z-10">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-6">Messages</h1>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={2.5} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-12 h-[56px] rounded-2xl border-none bg-gray-50 text-sm font-bold placeholder:text-gray-400"
            />
          </div>
        </header>

        <div className="px-6 pt-8 pb-20 space-y-3">
           {convsLoading ? (
             <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-24 rounded-[32px] bg-white border border-gray-50 shimmer" />)}
             </div>
           ) : filteredConvs.length === 0 ? (
             <div className="py-20 text-center">
                <div className="w-20 h-20 bg-white rounded-[32px] shadow-premium flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="text-gray-200" size={32} />
                </div>
                <h3 className="text-lg font-black text-gray-900">No messages yet</h3>
                <p className="text-gray-400 text-sm mt-2 max-w-[180px] mx-auto leading-relaxed">
                  Connect with people by posting or applying for tasks.
                </p>
             </div>
           ) : filteredConvs.map((conv, i) => {
             const other = conv.participant_a === user.uid ? conv.other_b : conv.other_a;
             const isUnread = (conv.participant_a === user.uid && conv.unread_a > 0) || (conv.participant_b === user.uid && conv.unread_b > 0);

             return (
               <motion.div
                 key={conv.id}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.05 }}
                 onClick={() => setSelectedConvId(conv.id)}
                 className="bg-white p-5 rounded-[32px] border border-gray-50 shadow-premium flex items-center gap-4 cursor-pointer hover:border-[#0C6B38]/20 transition-all group"
               >
                 <div className="relative">
                    <Avatar className="h-14 w-14 ring-2 ring-gray-50">
                      <AvatarImage src={other?.avatar_url} />
                      <AvatarFallback className="bg-gradient-green text-white font-black">{other?.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    {isUnread && <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-4 border-white rounded-full" />}
                 </div>

                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                       <h4 className={`text-sm font-black truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>{other?.full_name || 'User'}</h4>
                       <span className="text-[10px] font-black text-gray-300 uppercase shrink-0">{formatMessageTime(conv.last_message_at)}</span>
                    </div>
                    <p className={`text-xs truncate ${isUnread ? 'text-gray-900 font-bold' : 'text-gray-400 font-medium'}`}>
                      {conv.last_message || 'Start a conversation'}
                    </p>
                 </div>
               </motion.div>
             );
           })}
        </div>
      </div>
    </MobileLayout>
  );
}
