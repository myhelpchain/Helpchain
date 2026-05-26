import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFirebaseAuth } from "./use-firebase-auth";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const TASK_API = `${SUPABASE_URL}/functions/v1/task-api`;

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_at: string;
}

export function useNotifications() {
  const queryClient = useQueryClient();
  const { user, getIdToken } = useFirebaseAuth();

  const getAuthHeaders = async (): Promise<HeadersInit | undefined> => {
    try {
      const token = await getIdToken();
      if (!token) return undefined;
      return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    } catch {
      return undefined;
    }
  };

  const { data: notifications = [], isLoading, refetch } = useQuery<Notification[]>({
    queryKey: ["notifications", user?.uid],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      if (!headers) return [];
      const res = await fetch(`${TASK_API}/notifications`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      return data.notifications || [];
    },
    enabled: !!user,
    staleTime: 10000,
    // Slow fallback poll — realtime handles instant delivery
    refetchInterval: 120000,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = useMutation({
    mutationFn: async (notifId: string) => {
      const headers = await getAuthHeaders();
      if (!headers) throw new Error("Not authenticated");
      await fetch(`${TASK_API}/notifications/${notifId}/read`, { method: "PATCH", headers });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const headers = await getAuthHeaders();
      if (!headers) throw new Error("Not authenticated");
      await fetch(`${TASK_API}/notifications/read-all`, { method: "PATCH", headers });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const sendWelcomeNotification = async (displayName?: string) => {
    try {
      const headers = await getAuthHeaders();
      if (!headers) return;
      await fetch(`${TASK_API}/notifications/welcome`, {
        method: "POST",
        headers,
        body: JSON.stringify({ displayName }),
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (err) {
      console.error("Failed to send welcome notification:", err);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    refetch,
    markAsRead: markAsRead.mutateAsync,
    markAllRead: markAllRead.mutateAsync,
    sendWelcomeNotification,
  };
}
