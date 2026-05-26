import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Sector = "real_world" | "web3_digital";

interface SectorState {
  sector: Sector;
  setSector: (sector: Sector) => void;
  toggleSector: () => void;
}

export const useSectorStore = create<SectorState>()(
  persist(
    (set, get) => ({
      sector: "real_world",
      setSector: (sector) => set({ sector }),
      toggleSector: () => set((s) => ({ sector: s.sector === "real_world" ? "web3_digital" : "real_world" })),
    }),
    { name: "helpchain-sector" }
  )
);
