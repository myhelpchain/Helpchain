import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFirebaseAuth } from "./use-firebase-auth";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  onSnapshot
} from "firebase/firestore";
import { useEffect, useState } from "react";

export interface ConversationData {
  id: string;
  taskId: string | null;
  participant_a: string;
  participant_b: string;
  last_message: string | null;
  last_message_at: any;
  unread_a: number;
  unread_b: number;
  other_a?: any;
  other_b?: any;
  task?: any;
}

export interface MessageData {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  createdAt: any;
}

export function useConversations() {
  const { user } = useFirebaseAuth();
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db || !user) return;

    // Listen for conversations where user is participant_a
    const qA = query(collection(db, "conversations"), where("participant_a", "==", user.uid));
    const qB = query(collection(db, "conversations"), where("participant_b", "==", user.uid));

    const processDocs = (docs: any[]) => {
      return docs.map(d => ({ id: d.id, ...d.data() } as ConversationData));
    };

    const unsubA = onSnapshot(qA, (snapA) => {
      const listA = processDocs(snapA.docs);
      setConversations(prev => {
        const other = prev.filter(c => c.participant_b === user.uid);
        const combined = [...listA, ...other];
        return combined.sort((a, b) => {
          const timeA = a.last_message_at?.toMillis?.() || new Date(a.last_message_at).getTime() || 0;
          const timeB = b.last_message_at?.toMillis?.() || new Date(b.last_message_at).getTime() || 0;
          return timeB - timeA;
        });
      });
      setIsLoading(false);
    });

    const unsubB = onSnapshot(qB, (snapB) => {
      const listB = processDocs(snapB.docs);
      setConversations(prev => {
        const other = prev.filter(c => c.participant_a === user.uid);
        const combined = [...listB, ...other];
        return combined.sort((a, b) => {
          const timeA = a.last_message_at?.toMillis?.() || new Date(a.last_message_at).getTime() || 0;
          const timeB = b.last_message_at?.toMillis?.() || new Date(b.last_message_at).getTime() || 0;
          return timeB - timeA;
        });
      });
      setIsLoading(false);
    });

    return () => { unsubA(); unsubB(); };
  }, [user?.uid]);

  return { conversations, isLoading };
}

export function useMessages(conversationId: string | null) {
  const { user } = useFirebaseAuth();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sendPending, setSendPending] = useState(false);

  useEffect(() => {
    if (!db || !conversationId) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    const q = query(
      collection(db, "messages"),
      where("conversation_id", "==", conversationId),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as MessageData)));
      setIsLoading(false);
    });

    return () => unsub();
  }, [conversationId]);

  const sendMessage = async (body: string) => {
    if (!db || !conversationId || !user) return;
    setSendPending(true);
    try {
      await addDoc(collection(db, "messages"), {
        conversation_id: conversationId,
        sender_id: user.uid,
        body,
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, "conversations", conversationId), {
        last_message: body,
        last_message_at: serverTimestamp()
      });
    } finally {
      setSendPending(false);
    }
  };

  return { messages, isLoading, sendMessage, sendPending, currentUserId: user?.uid };
}
