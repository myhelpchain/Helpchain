import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFirebaseAuth } from "./use-firebase-auth";
import { walletService } from "@/lib/firebase-services";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "escrow_lock" | "escrow_release" | "escrow_refund" | "fee" | "earning";
  amount: number;
  status: string;
  description: string;
  createdAt: any;
}

export interface Wallet {
  userId: string;
  availableBalance: number;
  escrowBalance: number;
  status: string;
}

export function useWallet() {
  const queryClient = useQueryClient();
  const { user } = useFirebaseAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Realtime Wallet Listener (Supabase)
  useEffect(() => {
    if (!user) {
      setWallet(null);
      setIsLoading(false);
      return;
    }

    const client = supabase.client;
    if (!client) {
      setIsLoading(false);
      return;
    }

    // Initial fetch
    walletService.getWallet(user.uid).then(w => {
      if (w) setWallet(w);
      setIsLoading(false);
    });

    // Subscribe to changes
    const channel = client
      .channel(`wallet:${user.uid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallets',
          filter: `user_id=eq.${user.uid}`,
        },
        (payload) => {
          const newWallet = payload.new as any;
          setWallet({
            userId: newWallet.user_id,
            availableBalance: Number(newWallet.available_balance),
            escrowBalance: Number(newWallet.escrow_balance),
            status: newWallet.wallet_status,
          });
          queryClient.invalidateQueries({ queryKey: ["wallet-transactions", user.uid] });
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [user?.uid]);

  // Transactions Query
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["wallet-transactions", user?.uid],
    queryFn: async () => {
      if (!user) return [];
      return (await walletService.getTransactions(user.uid)) as Transaction[];
    },
    enabled: !!user,
  });

  const depositMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!user) throw new Error("Not authenticated");
      // This sends a request to Firestore which a Cloud Function should watch
      return await walletService.requestDeposit(user.uid, amount);
    },
  });

  const verifyDepositMutation = useMutation({
    mutationFn: async (reference: string) => {
      if (!user) throw new Error("Not authenticated");
      return await walletService.verifyDeposit(user.uid, reference);
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user) throw new Error("Not authenticated");
      return await walletService.requestWithdrawal(user.uid, data);
    },
  });

  const refetchWallet = async () => {
    if (!user) return;
    const w = await walletService.getWallet(user.uid);
    if (w) setWallet(w);
  };

  return {
    availableBalance: wallet?.availableBalance || 0,
    escrowBalance: wallet?.escrowBalance || 0,
    balance: wallet?.availableBalance || 0, // Alias for compatibility
    wallet,
    transactions,
    isLoading,
    transactionsLoading,
    refetchWallet,
    initializeDeposit: (amount: number) => depositMutation.mutateAsync(amount),
    verifyDeposit: (reference: string) => verifyDepositMutation.mutateAsync(reference),
    withdraw: (data: any) => withdrawMutation.mutateAsync(data),
    depositPending: depositMutation.isPending,
    verifyPending: verifyDepositMutation.isPending,
    withdrawPending: withdrawMutation.isPending,
  };
}
