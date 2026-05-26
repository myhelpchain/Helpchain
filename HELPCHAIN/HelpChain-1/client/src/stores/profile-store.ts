import { create } from "zustand";
import { persist } from "zustand/middleware";

export type VerificationTier = 1 | 2 | 3;

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  bio: string;
  avatarUrl: string | null;
  location: string;
  country: string;
  baseCurrency: string;
  rating: number;
  ratingCount: number;
  reputationScore: number;
  verificationTier: VerificationTier;
  helpsGiven: number;
  helpsReceived: number;
  successRate: number;
  onTimeRate: number;
  responseTime: string;
  joinedAt: string;
  skills: string[];
  isFeatured: boolean;
}

const SEED_PROFILES: UserProfile[] = [
  {
    id: "prof-1", userId: "user-seed-1", fullName: "Adaeze Okonkwo", email: "adaeze@example.com",
    bio: "Business owner in Lagos. I frequently post tasks for my company operations.", avatarUrl: "https://i.pravatar.cc/150?img=45",
    location: "Lekki, Lagos", country: "NG", baseCurrency: "NGN", rating: 4.8, ratingCount: 23,
    reputationScore: 780, verificationTier: 2, helpsGiven: 5, helpsReceived: 23, successRate: 96,
    onTimeRate: 92, responseTime: "< 1 hour", joinedAt: "2024-06-15", skills: ["Business", "Project Management"], isFeatured: false,
  },
  {
    id: "prof-2", userId: "user-seed-2", fullName: "James Obi", email: "james@example.com",
    bio: "Tech entrepreneur building on Solana. Looking for talent across Africa.", avatarUrl: "https://i.pravatar.cc/150?img=52",
    location: "Remote", country: "NG", baseCurrency: "NGN", rating: 4.9, ratingCount: 15,
    reputationScore: 920, verificationTier: 3, helpsGiven: 2, helpsReceived: 15, successRate: 100,
    onTimeRate: 100, responseTime: "< 30 mins", joinedAt: "2024-03-01", skills: ["Solana", "Web3", "React"], isFeatured: true,
  },
  {
    id: "prof-3", userId: "user-seed-3", fullName: "Funke Adeleke", email: "funke@example.com",
    bio: "Working mother of two. HelpChain has been a lifesaver for errands!", avatarUrl: "https://i.pravatar.cc/150?img=47",
    location: "Victoria Island, Lagos", country: "NG", baseCurrency: "NGN", rating: 4.7, ratingCount: 8,
    reputationScore: 420, verificationTier: 2, helpsGiven: 1, helpsReceived: 8, successRate: 95,
    onTimeRate: 88, responseTime: "< 2 hours", joinedAt: "2024-09-01", skills: ["Education", "Tutoring"], isFeatured: false,
  },
];

interface ProfileState {
  profiles: UserProfile[];
  currentUserId: string | null;
  
  setCurrentUser: (userId: string) => void;
  getCurrentProfile: () => UserProfile | null;
  getProfileByUserId: (userId: string) => UserProfile | undefined;
  updateProfile: (userId: string, updates: Partial<UserProfile>) => void;
  createProfile: (profile: UserProfile) => void;
  addReputation: (userId: string, points: number) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: SEED_PROFILES,
      currentUserId: null,

      setCurrentUser: (userId) => set({ currentUserId: userId }),

      getCurrentProfile: () => {
        const { profiles, currentUserId } = get();
        return profiles.find((p) => p.userId === currentUserId) || null;
      },

      getProfileByUserId: (userId) => get().profiles.find((p) => p.userId === userId),

      updateProfile: (userId, updates) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.userId === userId ? { ...p, ...updates } : p
          ),
        }));
      },

      createProfile: (profile) => {
        set((state) => ({ profiles: [...state.profiles, profile] }));
      },

      addReputation: (userId, points) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.userId === userId ? { ...p, reputationScore: Math.max(0, p.reputationScore + points) } : p
          ),
        }));
      },
    }),
    { name: "helpchain-profiles" }
  )
);
