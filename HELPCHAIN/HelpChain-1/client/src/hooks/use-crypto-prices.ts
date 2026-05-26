import { useState, useEffect, useCallback } from "react";

interface CryptoPrices {
  usdcNgn: number; // 1 USDC = X NGN
  solNgn: number;  // 1 SOL = X NGN
  solUsd: number;  // 1 SOL = X USD
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
}

const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price";
const REFRESH_INTERVAL = 30_000; // 30 seconds

export function useCryptoPrices(): CryptoPrices & { refresh: () => void } {
  const [prices, setPrices] = useState<CryptoPrices>({
    usdcNgn: 1580, // fallback
    solNgn: 237000,
    solUsd: 150,
    lastUpdated: null,
    isLoading: true,
    error: null,
  });

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch(
        `${COINGECKO_API}?ids=usd-coin,solana&vs_currencies=ngn,usd&precision=2`
      );
      if (!res.ok) throw new Error("Price API unavailable");
      const data = await res.json();

      const usdcNgn = data["usd-coin"]?.ngn || 1580;
      const solNgn = data["solana"]?.ngn || 237000;
      const solUsd = data["solana"]?.usd || 150;

      setPrices({
        usdcNgn,
        solNgn,
        solUsd,
        lastUpdated: new Date(),
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      setPrices((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message,
      }));
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { ...prices, refresh: fetchPrices };
}
