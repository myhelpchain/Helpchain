import React, { createContext, useEffect, useRef, useState, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  Unsubscribe,
  limit,
  orderBy
} from "firebase/firestore";

const RealtimeContext = createContext<{ isConnected: boolean }>({ isConnected: false });
export { RealtimeContext };

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { user } = useFirebaseAuth();
  const unsubscribes = useRef<Unsubscribe[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!db || !user) {
      cleanup();
      setIsConnected(false);
      return;
    }

    cleanup();
    const uid = user.uid;

    try {
      // ─── PROFILE ────────────────────────────────────────────────────────────
      const profileUnsub = onSnapshot(doc(db, "profiles", uid), (docSnap) => {
        if (docSnap.exists()) {
          queryClient.setQueryData(["profile", uid], docSnap.data());
          queryClient.invalidateQueries({ queryKey: ["profile"] });
        }
      });

      // ─── TASKS (open marketplace) ────────────────────────────────────────────
      const tasksQuery = query(
        collection(db, "tasks"),
        where("status", "==", "published"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const tasksUnsub = onSnapshot(tasksQuery, (querySnap) => {
        const tasks = querySnap.docs.map(d => ({ id: d.id, ...d.data() }));
        queryClient.setQueryData(["open-tasks"], tasks);
        queryClient.invalidateQueries({ queryKey: ["open-tasks"] });
      });

      // ─── MY TASKS (creator) ────────────────────────────────────────────
      const myTasksQuery = query(
        collection(db, "tasks"),
        where("creatorId", "==", uid),
        orderBy("createdAt", "desc")
      );
      const myTasksUnsub = onSnapshot(myTasksQuery, (querySnap) => {
        queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      });

      // ─── OFFERS ─────────────────────────────────────────────────────────────
      const offersQuery = query(
        collection(db, "offers"),
        where("workerId", "==", uid)
      );
      const offersUnsub = onSnapshot(offersQuery, (querySnap) => {
        queryClient.invalidateQueries({ queryKey: ["my-offers"] });
        queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      });

      // ─── NOTIFICATIONS ───────────────────────────────────────────────────────
      const notifQuery = query(
        collection(db, "notifications"),
        where("userId", "==", uid),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      const notifUnsub = onSnapshot(notifQuery, (querySnap) => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      });

      // ─── CONVERSATIONS ───────────────────────────────────────────────────────
      // Firebase doesn't support complex OR filters easily in simple queries without separate unsubscribes or composite indexes
      // We'll watch for conversations where the user is a participant
      const convAQuery = query(collection(db, "conversations"), where("participant_a", "==", uid));
      const convBQuery = query(collection(db, "conversations"), where("participant_b", "==", uid));

      const convAUnsub = onSnapshot(convAQuery, () => queryClient.invalidateQueries({ queryKey: ["conversations"] }));
      const convBUnsub = onSnapshot(convBQuery, () => queryClient.invalidateQueries({ queryKey: ["conversations"] }));

      // ─── WALLET ─────────────────────────────────────────────────────────────
      const walletUnsub = onSnapshot(doc(db, "wallets", uid), (docSnap) => {
        if (docSnap.exists()) {
          queryClient.setQueryData(["wallet", uid], docSnap.data());
          queryClient.invalidateQueries({ queryKey: ["wallet"] });
        }
      });

      unsubscribes.current = [
        profileUnsub,
        tasksUnsub,
        myTasksUnsub,
        offersUnsub,
        notifUnsub,
        convAUnsub,
        convBUnsub,
        walletUnsub
      ];

      setIsConnected(true);
    } catch (error) {
      console.error("[Realtime] Failed to setup listeners:", error);
      setIsConnected(false);
    }

    return cleanup;
  }, [user?.uid]);

  function cleanup() {
    unsubscribes.current.forEach((unsub) => unsub());
    unsubscribes.current = [];
  }

  return (
    <RealtimeContext.Provider value={{ isConnected }}>
      {children}
    </RealtimeContext.Provider>
  );
}
