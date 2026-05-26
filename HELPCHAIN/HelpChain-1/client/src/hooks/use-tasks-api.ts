import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFirebaseAuth } from "./use-firebase-auth";
import { db } from "@/lib/firebase";
import { taskService } from "@/lib/firebase-services";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  updateDoc,
  increment
} from "firebase/firestore";

import { walletService } from "@/lib/firebase-services";

export interface TaskData {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  locationType: string;
  urgency: string;
  budget: number;
  status: string;
  helperId: string | null;
  offers_count: number;
  createdAt: any;
  updatedAt: any;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export interface OfferData {
  id: string;
  task_id: string;
  worker_id: string;
  amount: number;
  message: string;
  delivery_time: string | null;
  status: string;
  createdAt: any;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
    reputation_score: number;
    total_tasks_done: number;
  };
}

export function useTasksApi() {
  const queryClient = useQueryClient();
  const { user } = useFirebaseAuth();

  // My tasks
  const { data: myTasks = [], isLoading: tasksLoading } = useQuery<TaskData[]>({
    queryKey: ["my-tasks", user?.uid],
    queryFn: async () => {
      if (!db || !user) return [];
      const q = query(
        collection(db, "tasks"),
        where("creatorId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as TaskData));
    },
    enabled: !!user && !!db,
    staleTime: 60000,
  });

  // Open tasks (marketplace)
  const { data: openTasks = [], isLoading: openTasksLoading } = useQuery<TaskData[]>({
    queryKey: ["open-tasks"],
    queryFn: async () => {
      if (!db) return [];
      const q = query(
        collection(db, "tasks"),
        where("status", "==", "published"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as TaskData));
    },
    enabled: !!db,
    staleTime: 60000,
  });

  // Create task
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      if (!user) throw new Error("Not authenticated");

      // Lock escrow in Supabase before creating task in Firestore
      await walletService.lockEscrow("pending", taskData.budget);

      return await taskService.create({
        ...taskData,
        creatorId: user.uid,
        creatorName: user.displayName || "Anonymous"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["open-tasks"] });
    },
  });

  return {
    myTasks,
    openTasks,
    tasksLoading,
    openTasksLoading,
    createTask: createTaskMutation.mutateAsync,
    createTaskPending: createTaskMutation.isPending,
  };
}

export function useTask(taskId: string | undefined) {
  const { user } = useFirebaseAuth();

  return useQuery<TaskData | null>({
    queryKey: ["task", taskId],
    queryFn: async () => {
      if (!taskId || !db) return null;
      const docRef = doc(db, "tasks", taskId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as TaskData;
    },
    enabled: !!taskId && !!user && !!db,
    staleTime: 30000,
  });
}

export function useTaskOffers(taskId: string | undefined) {
  const queryClient = useQueryClient();
  const { user } = useFirebaseAuth();

  const { data: offers = [], isLoading } = useQuery<OfferData[]>({
    queryKey: ["task-offers", taskId],
    queryFn: async () => {
      if (!taskId || !db) return [];
      const q = query(collection(db, "offers"), where("task_id", "==", taskId), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as OfferData));
    },
    enabled: !!taskId && !!db,
  });

  const submitOfferMutation = useMutation({
    mutationFn: async (offerData: any) => {
      if (!user || !taskId || !db) throw new Error("Not authenticated");
      const docRef = await addDoc(collection(db, "offers"), {
        ...offerData,
        task_id: taskId,
        worker_id: user.uid,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "tasks", taskId), {
        offers_count: increment(1)
      });
      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-offers", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });

  const acceptOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      if (!db || !taskId) return;
      await updateDoc(doc(db, "offers", offerId), { status: "accepted" });
      await updateDoc(doc(db, "tasks", taskId), { status: "in_progress", helperId: user?.uid });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-offers", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });

  const rejectOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      if (!db) return;
      await updateDoc(doc(db, "offers", offerId), { status: "rejected" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-offers", taskId] });
    },
  });

  return {
    offers,
    isLoading,
    submitOffer: submitOfferMutation.mutateAsync,
    submitPending: submitOfferMutation.isPending,
    acceptOffer: acceptOfferMutation.mutateAsync,
    acceptPending: acceptOfferMutation.isPending,
    rejectOffer: rejectOfferMutation.mutateAsync,
  };
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  const { user } = useFirebaseAuth();

  return useMutation({
    mutationFn: async ({ taskId, workerId, amount }: { taskId: string, workerId: string, amount: number }) => {
      if (!db) return;

      // Release escrow in Supabase
      await walletService.releaseEscrow(taskId, workerId, amount);

      // Update task status in Firestore
      await updateDoc(doc(db, "tasks", taskId), { status: "completed" });

      return { success: true };
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewData: any) => {
      if (!db) return;
      await addDoc(collection(db, "reviews"), {
        ...reviewData,
        createdAt: serverTimestamp()
      });
    },
  });
}
