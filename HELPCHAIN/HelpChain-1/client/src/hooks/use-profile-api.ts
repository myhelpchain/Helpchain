import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFirebaseAuth } from "./use-firebase-auth";
import { db } from "@/lib/firebase";
import { profileService } from "@/lib/firebase-services";
import { doc, onSnapshot } from "firebase/firestore";
import { useState, useEffect } from "react";

export interface ProfileData {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  rating: number;
  reputation_score: number;
  success_rate: number;
  skills: string[] | null;
  id_verified: boolean;
  total_tasks_done: number;
  total_tasks_posted: number;
  total_reviews: number;
}

export function useProfileApi() {
  const queryClient = useQueryClient();
  const { user } = useFirebaseAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db || !user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, "profiles", user.uid), (snap) => {
      if (snap.exists()) {
        setProfile({ id: snap.id, ...snap.data() } as ProfileData);
      } else {
        // Auto-create profile if missing
        profileService.create(user.uid, {
          full_name: user.displayName,
          email: user.email,
          avatar_url: user.photoURL,
          reputation_score: 0,
          success_rate: 100,
          total_tasks_done: 0,
          total_tasks_posted: 0,
          total_reviews: 0
        });
      }
      setIsLoading(false);
    });

    return () => unsub();
  }, [user?.uid]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!user) throw new Error("Not authenticated");
      return await profileService.update(user.uid, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return {
    profile,
    isLoading,
    updateProfile: updateProfileMutation.mutateAsync,
    updateProfilePending: updateProfileMutation.isPending,
  };
}

export function usePublicProfile(targetUserId: string | undefined) {
  return useQuery<ProfileData | null>({
    queryKey: ["public-profile", targetUserId],
    queryFn: async () => {
      if (!targetUserId || !db) return null;
      return (await profileService.get(targetUserId)) as ProfileData;
    },
    enabled: !!targetUserId && !!db,
    staleTime: 60000,
  });
}
