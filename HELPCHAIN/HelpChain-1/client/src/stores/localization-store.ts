import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  rateToUsdc: number; // How many local units per 1 USDC
}

const CURRENCIES: Record<string, CurrencyConfig> = {
  NGN: { code: "NGN", symbol: "₦", name: "Nigerian Naira", rateToUsdc: 1500 },
  USD: { code: "USD", symbol: "$", name: "US Dollar", rateToUsdc: 1 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", rateToUsdc: 0.79 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", rateToUsdc: 0.92 },
  KES: { code: "KES", symbol: "KSh", name: "Kenyan Shilling", rateToUsdc: 153 },
  GHS: { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi", rateToUsdc: 15.5 },
  ZAR: { code: "ZAR", symbol: "R", name: "South African Rand", rateToUsdc: 18.5 },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", rateToUsdc: 83 },
  IDR: { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", rateToUsdc: 15700 },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", rateToUsdc: 149 },
};

const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  NG: "NGN", US: "USD", GB: "GBP", DE: "EUR", FR: "EUR",
  KE: "KES", GH: "GHS", ZA: "ZAR", IN: "INR", ID: "IDR", JP: "JPY",
};

interface LocalizationState {
  country: string;
  countryName: string;
  currencyCode: string;
  currency: CurrencyConfig;
  wizardComplete: boolean;
  lastFxUpdate: string | null;

  setCountry: (countryCode: string, countryName: string) => void;
  setCurrency: (currencyCode: string) => void;
  completeWizard: () => void;
  resetWizard: () => void;

  // Conversion helpers
  usdcToLocal: (usdc: number) => number;
  localToUsdc: (local: number) => number;
  formatLocal: (amount: number) => string;
  formatUsdc: (usdc: number) => string;

  getAllCurrencies: () => CurrencyConfig[];
}

export const useLocalizationStore = create<LocalizationState>()(
  persist(
    (set, get) => ({
      country: "NG",
      countryName: "Nigeria",
      currencyCode: "NGN",
      currency: CURRENCIES.NGN,
      wizardComplete: false,
      lastFxUpdate: null,

      setCountry: (countryCode, countryName) => {
        const currCode = COUNTRY_CURRENCY_MAP[countryCode] || "USD";
        set({
          country: countryCode,
          countryName,
          currencyCode: currCode,
          currency: CURRENCIES[currCode] || CURRENCIES.USD,
        });
      },

      setCurrency: (currencyCode) => {
        set({
          currencyCode,
          currency: CURRENCIES[currencyCode] || CURRENCIES.USD,
        });
      },

      completeWizard: () => set({ wizardComplete: true }),
      resetWizard: () => set({ wizardComplete: false }),

      usdcToLocal: (usdc) => {
        const { currency } = get();
        return Math.round(usdc * currency.rateToUsdc * 100) / 100;
      },

      localToUsdc: (local) => {
        const { currency } = get();
        return Math.round((local / currency.rateToUsdc) * 1000000) / 1000000;
      },

      formatLocal: (amount) => {
        const { currency } = get();
        return `${currency.symbol}${amount.toLocaleString()}`;
      },

      formatUsdc: (usdc) => {
        return `$${usdc.toFixed(2)}`;
      },

      getAllCurrencies: () => Object.values(CURRENCIES),
    }),
    { name: "helpchain-localization" }
  )
);
