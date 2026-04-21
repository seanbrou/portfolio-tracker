
import { useEffect, useState, useCallback } from 'react';
import { holdingsConfig, transactions } from '../data/portfolio';
import { formatCurrency } from './utils';

export interface Quote {
  price: number;
  prevClose: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  volume: number;
}

export interface HoldingEnriched extends Quote {
  symbol: string;
  name: string;
  shares: number;
  type: string;
  exchange: string;
  avgCost: number;
  costBasis: number;
  marketValue: number;
  dayChange$: number;
  totalReturn$: number;
  totalReturnPct: number;
  allocation: number;
}

const YAHOO_QUOTE = 'https://query1.finance.yahoo.com/v7/finance/quote';
const YAHOO_CHART = 'https://query1.finance.yahoo.com/v8/finance/chart';

async function fetchQuotes(symbols: string[]): Promise<Record<string, Quote>> {
  const url = `${YAHOO_QUOTE}?fields=regularMarketPrice,regularMarketPrevious` +
    `Close,regularMarketChange,regularMarketChangePercent,regularM` +
    `arketDayHigh,regularMarketDayLow,regularMarketOpen,regularMark` +
    `etVolume&symbols=${symbols.join(',')}`;
  try {
    const r = await fetch(url);
    const j = await r.json();
    const out: Record<string, Quote> = {};
    for (const item of j.quoteResponse?.result ?? []) {
      out[item.symbol] = {
        price: item.regularMarketPrice ?? 0,
        prevClose: item.regularMarketPreviousClose ?? 0,
        change: item.regularMarketChange ?? 0,
        changePercent: item.regularMarketChangePercent ?? 0,
        high: item.regularMarketDayHigh ?? 0,
        low: item.regularMarketDayLow ?? 0,
        open: item.regularMarketOpen ?? 0,
        volume: item.regularMarketVolume ?? 0,
      };
    }
    return out;
  } catch (e) {
    console.warn('Quote fetch failed', e);
    return {};
  }
}

export async function fetchHistory(symbol: string, months = 6): Promise<{ date: string; close: number }[]> {
  const end = Math.floor(Date.now() / 1000);
  const start = Math.floor(Date.now() / 1000 - months * 30 * 86400);
  const url = `${YAHOO_CHART}/${symbol}?period1=${start}&period2=${end}&interval=1d`;
  try {
    const r = await fetch(url);
    const j = await r.json();
    const res = j.chart?.result?.[0];
    if (!res) return [];
    const ts = res.timestamp ?? [];
    const cl = res.indicators?.quote?.[0]?.close ?? [];
    return ts.map((t: number, i: number) => ({
      date: new Date(t * 1000).toISOString(),
      close: cl[i] ?? 0,
    })).filter((p: any) => p.close > 0);
  } catch (e) {
    console.warn('History fetch failed', e);
    return [];
  }
}

export function usePortfolio() {
  const [data, setData] = useState<HoldingEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const symbols = Object.keys(holdingsConfig);
    const quotes = await fetchQuotes(symbols);

    const enriched: HoldingEnriched[] = symbols.map(sym => {
      const cfg = holdingsConfig[sym];
      const q = quotes[sym] ?? { price: 0, prevClose: 0, change: 0, changePercent: 0, high: 0, low: 0, open: 0, volume: 0 };
      const buyTx = transactions.filter(t => t.ticker === sym && t.way === 'BUY');
      const totalQty = buyTx.reduce((s, t) => s + t.qty, 0);
      const totalCost = buyTx.reduce((s, t) => s + t.cost, 0);
      const avgCost = totalQty > 0 ? totalCost / totalQty : 0;
      const marketValue = q.price * cfg.shares;
      const costBasis = avgCost * cfg.shares;
      const totalReturn$ = marketValue - costBasis;
      const totalReturnPct = costBasis > 0 ? (totalReturn$ / costBasis) * 100 : 0;
      const dayChange$ = (q.price - q.prevClose) * cfg.shares;

      return {
        symbol: sym, ...q, ...cfg,
        avgCost: Math.round(avgCost * 100) / 100,
        costBasis: Math.round(costBasis * 100) / 100,
        marketValue: Math.round(marketValue * 100) / 100,
        dayChange$: Math.round(dayChange$ * 100) / 100,
        totalReturn$: Math.round(totalReturn$ * 100) / 100,
        totalReturnPct: Math.round(totalReturnPct * 100) / 100,
        allocation: 0,
      };
    });

    const totalMV = enriched.reduce((s, h) => s + h.marketValue, 0);
    enriched.forEach(h => { h.allocation = totalMV > 0 ? Math.round((h.marketValue / totalMV) * 10000) / 100 : 0; });
    enriched.sort((a, b) => b.marketValue - a.marketValue);

    setData(enriched);
    setLoading(false);
    setLastUpdate(new Date());
  }, []);

  useEffect(() => { load(); }, [load]);
  return { data, loading, lastUpdate, refresh: load, totalValue: data.reduce((s, h) => s + h.marketValue, 0) };
}

export function useAssetDetail(symbol: string) {
  const [history, setHistory] = useState<{ date: string; close: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async (m = 6) => { setLoading(true); setHistory(await fetchHistory(symbol, m)); setLoading(false); }, [symbol]);
  useEffect(() => { load(6); }, [load]);
  return { history, loading, refetch: load };
}
