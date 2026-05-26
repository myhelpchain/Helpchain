import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  increment,
  type DocumentData
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { supabase } from "./supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

async function callWalletApi(route: string, method: string = 'GET', body?: any) {
  const token = await auth?.currentUser?.getIdToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${SUPABASE_URL}/functions/v1/wallet-api${route}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || err.error || "API call failed");
  }

  return await response.json();
}

// --- Profiles ---
export const profileService = {
  get: async (uid: string) => {
    if (!db) return null;
    const snap = await getDoc(doc(db, "profiles", uid));
    return snap.exists() ? snap.data() : null;
  },
  update: async (uid: string, data: Partial<DocumentData>) => {
    if (!db) return;
    await updateDoc(doc(db, "profiles", uid), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },
  create: async (uid: string, data: any) => {
    if (!db) return;
    await setDoc(doc(db, "profiles", uid), {
      ...data,
      id: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
};

// --- Tasks ---
export const taskService = {
  create: async (taskData: any) => {
    if (!db) throw new Error("Firebase not initialized");
    const docRef = await addDoc(collection(db, "tasks"), {
      ...taskData,
      status: "published",
      offers_count: 0,
      views_count: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },
  getById: async (taskId: string) => {
    if (!db) return null;
    const snap = await getDoc(doc(db, "tasks", taskId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },
  updateStatus: async (taskId: string, status: string) => {
    if (!db) return;
    await updateDoc(doc(db, "tasks", taskId), {
      status,
      updatedAt: serverTimestamp()
    });
  }
};

// --- Wallet & Transactions (Switched to Supabase Edge Functions to avoid Firebase Blaze Plan) ---
export const walletService = {
  getWallet: async (uid: string) => {
    try {
      const data = await callWalletApi('/wallet');
      return data.wallet;
    } catch (err) {
      console.error("[walletService] getWallet failed:", err);
      return null;
    }
  },
  getTransactions: async (uid: string) => {
    try {
      const data = await callWalletApi('/wallet/transactions');
      return data.transactions || [];
    } catch (err) {
      console.error("[walletService] getTransactions failed:", err);
      return [];
    }
  },
  requestDeposit: async (uid: string, amount: number) => {
    return await callWalletApi('/wallet/deposit/initialize', 'POST', { amount });
  },
  verifyDeposit: async (uid: string, reference: string) => {
    return await callWalletApi('/wallet/deposit/verify', 'POST', { reference });
  },
  requestWithdrawal: async (uid: string, data: any) => {
    return await callWalletApi('/wallet/withdraw', 'POST', data);
  },
  lockEscrow: async (taskId: string, amount: number) => {
    return await callWalletApi('/wallet/escrow/lock', 'POST', { taskId, amount });
  },
  releaseEscrow: async (taskId: string, workerId: string, amount: number) => {
    return await callWalletApi('/wallet/escrow/release', 'POST', { taskId, workerId, amount });
  },
  getBanks: async () => {
    const data = await callWalletApi('/banks');
    return data.banks || [];
  }
};

// --- Messaging ---
export const messagingService = {
  getConversations: async (uid: string) => {
    if (!db) return [];
    const qA = query(collection(db, "conversations"), where("participant_a", "==", uid), orderBy("last_message_at", "desc"));
    const qB = query(collection(db, "conversations"), where("participant_b", "==", uid), orderBy("last_message_at", "desc"));
    const [snapA, snapB] = await Promise.all([getDocs(qA), getDocs(qB)]);
    const list = [...snapA.docs, ...snapB.docs].map(d => ({ id: d.id, ...d.data() }));
    return list.sort((a: any, b: any) => b.last_message_at?.toMillis() - a.last_message_at?.toMillis());
  },
  sendMessage: async (convId: string, senderId: string, body: string) => {
    if (!db) return;
    const msgData = {
      conversation_id: convId,
      sender_id: senderId,
      body,
      createdAt: serverTimestamp(),
      read_at: null
    };
    await addDoc(collection(db, "messages"), msgData);
    await updateDoc(doc(db, "conversations", convId), {
      last_message: body,
      last_message_at: serverTimestamp()
    });
  }
};
