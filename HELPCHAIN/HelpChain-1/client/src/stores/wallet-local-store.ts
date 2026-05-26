import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LocalTransaction {
  id: string;
  type: "deposit" | "withdrawal" | "escrow_lock" | "escrow_release" | "escrow_refund" | "fee" | "earning";
  amount: number;
  description: string;
  status: "completed" | "pending" | "failed";
  createdAt: string;
}

interface WalletLocalState {
  availableBalance: number;
  escrowBalance: number;
  usdcBalance: number;
  transactions: LocalTransaction[];

  deposit: (amount: number) => void;
  withdraw: (amount: number) => boolean;
  lockEscrow: (amount: number, description: string) => void;
  releaseEscrow: (amount: number, toWorkerId: string) => void;
  refundEscrow: (amount: number) => void;
  addEarning: (amount: number, description: string) => void;
}

export const useWalletLocalStore = create<WalletLocalState>()(
  persist(
    (set, get) => ({
      availableBalance: 50000,
      escrowBalance: 0,
      usdcBalance: 33.33,
      transactions: [
        {
          id: "tx-seed-1", type: "deposit", amount: 50000,
          description: "Initial wallet funding", status: "completed",
          createdAt: new Date(Date.now() - 604800000).toISOString(),
        },
      ],

      deposit: (amount) => {
        set((s) => ({
          availableBalance: s.availableBalance + amount,
          transactions: [
            {
              id: `tx-${Date.now()}`, type: "deposit", amount,
              description: `Deposit of ₦${amount.toLocaleString()}`, status: "completed",
              createdAt: new Date().toISOString(),
            },
            ...s.transactions,
          ],
        }));
      },

      withdraw: (amount) => {
        const { availableBalance } = get();
        if (availableBalance < amount) return false;
        set((s) => ({
          availableBalance: s.availableBalance - amount,
          transactions: [
            {
              id: `tx-${Date.now()}`, type: "withdrawal", amount,
              description: `Withdrawal of ₦${amount.toLocaleString()}`, status: "completed",
              createdAt: new Date().toISOString(),
            },
            ...s.transactions,
          ],
        }));
        return true;
      },

      lockEscrow: (amount, description) => {
        set((s) => ({
          availableBalance: s.availableBalance - amount,
          escrowBalance: s.escrowBalance + amount,
          transactions: [
            {
              id: `tx-${Date.now()}`, type: "escrow_lock", amount,
              description, status: "completed",
              createdAt: new Date().toISOString(),
            },
            ...s.transactions,
          ],
        }));
      },

      releaseEscrow: (amount, _toWorkerId) => {
        set((s) => ({
          escrowBalance: s.escrowBalance - amount,
          transactions: [
            {
              id: `tx-${Date.now()}`, type: "escrow_release", amount,
              description: `Escrow released: ₦${amount.toLocaleString()}`, status: "completed",
              createdAt: new Date().toISOString(),
            },
            ...s.transactions,
          ],
        }));
      },

      refundEscrow: (amount) => {
        set((s) => ({
          escrowBalance: s.escrowBalance - amount,
          availableBalance: s.availableBalance + amount,
          transactions: [
            {
              id: `tx-${Date.now()}`, type: "escrow_refund", amount,
              description: `Escrow refund: ₦${amount.toLocaleString()}`, status: "completed",
              createdAt: new Date().toISOString(),
            },
            ...s.transactions,
          ],
        }));
      },

      addEarning: (amount, description) => {
        set((s) => ({
          availableBalance: s.availableBalance + amount,
          transactions: [
            {
              id: `tx-${Date.now()}`, type: "earning", amount,
              description, status: "completed",
              createdAt: new Date().toISOString(),
            },
            ...s.transactions,
          ],
        }));
      },
    }),
    { name: "helpchain-wallet" }
  )
);
