import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchQuotes } from '../services/stockApi';

const CACHE_KEY = '@portfolio_quotes';
const CACHE_TS_KEY = '@portfolio_quotes_ts';
const HOLDINGS = ['TSLA', 'HOOD', 'IVV', 'NBIS'];
const REFRESH_INTERVAL_MS = 30000; // live refresh every 30s while app is open

export function useLivePrices() {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  // Load cached prices immediately
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(CACHE_KEY)
      .then(raw => {
        if (!mounted || !raw) return;
        const cached = JSON.parse(raw);
        setPrices(cached);
      })
      .catch(() => {})
      .finally(() => {
        AsyncStorage.getItem(CACHE_TS_KEY)
          .then(ts => { if (mounted && ts) setLastUpdated(new Date(Number(ts))); })
          .catch(() => {});
      });
    return () => { mounted = false; };
  }, []);

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const data = await fetchQuotes(HOLDINGS);
    if (Object.keys(data).length > 0) {
      setPrices(prev => ({ ...prev, ...data }));
      const now = Date.now();
      setLastUpdated(new Date(now));
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ ...prices, ...data }));
      await AsyncStorage.setItem(CACHE_TS_KEY, String(now));
    }
    if (!silent) setLoading(false);
  }, [prices]);

  // Initial fetch + live interval while open
  useEffect(() => {
    refresh(true);
    intervalRef.current = setInterval(() => refresh(true), REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  return { prices, loading, lastUpdated, refresh };
}

export function getPriceData(prices, symbol) {
  const q = prices[symbol];
  if (!q) return null;
  return {
    currentPrice: q.price,
    priceChange: q.change,
    priceChangePercent: q.changePercent,
    dayHigh: q.dayHigh,
    dayLow: q.dayLow,
    open: q.open,
    volume: q.volume,
  };
}
