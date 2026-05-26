import { create } from "zustand";

export type OfferStatus = "pending" | "approved" | "rejected" | "completed" | "cancelled";

export interface Offer {
  id: string;
  title: string;
  description: string;
  budget: number;
  ptf: number;
  totalDeposit: number;
  status: OfferStatus;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorRating: number;
  location: string;
  urgency: "critical" | "urgent" | "high" | "medium" | "low";
  category: string;
  timestamp: Date;
  approvalNotes?: string;
  rejectionNotes?: string;
}

interface OffersState {
  offers: Offer[];
  
  // Actions
  createOffer: (offer: Omit<Offer, "id" | "timestamp">) => string;
  approveOffer: (offerId: string, notes?: string) => void;
  rejectOffer: (offerId: string, notes: string) => void;
  getOfferById: (id: string) => Offer | undefined;
  getApprovedOffers: () => Offer[];
  getPendingOffers: () => Offer[];
  getCreatorOffers: (creatorId: string) => Offer[];
  completeOffer: (offerId: string) => void;
  cancelOffer: (offerId: string) => void;
}

export const useOffers = create<OffersState>((set, get) => ({
  offers: [],

  createOffer: (offer) => {
    const id = `offer-${Date.now()}`;
    const newOffer: Offer = {
      ...offer,
      id,
      timestamp: new Date(),
    };
    set((state) => ({
      offers: [newOffer, ...state.offers],
    }));
    return id;
  },

  approveOffer: (offerId, notes) => {
    set((state) => ({
      offers: state.offers.map((offer) =>
        offer.id === offerId
          ? { ...offer, status: "approved" as OfferStatus, approvalNotes: notes }
          : offer
      ),
    }));
  },

  rejectOffer: (offerId, notes) => {
    set((state) => ({
      offers: state.offers.map((offer) =>
        offer.id === offerId
          ? { ...offer, status: "rejected" as OfferStatus, rejectionNotes: notes }
          : offer
      ),
    }));
  },

  getOfferById: (id) => {
    return get().offers.find((offer) => offer.id === id);
  },

  getApprovedOffers: () => {
    return get().offers.filter((offer) => offer.status === "approved");
  },

  getPendingOffers: () => {
    return get().offers.filter((offer) => offer.status === "pending");
  },

  getCreatorOffers: (creatorId) => {
    return get().offers.filter((offer) => offer.creatorId === creatorId);
  },

  completeOffer: (offerId) => {
    set((state) => ({
      offers: state.offers.map((offer) =>
        offer.id === offerId
          ? { ...offer, status: "completed" as OfferStatus }
          : offer
      ),
    }));
  },

  cancelOffer: (offerId) => {
    set((state) => ({
      offers: state.offers.map((offer) =>
        offer.id === offerId
          ? { ...offer, status: "cancelled" as OfferStatus }
          : offer
      ),
    }));
  },
}));
