// Stock API — Yahoo Finance quotes + history
const YQ = 'https://query1.finance.yahoo.com/v7/finance/quote';
const YH = 'https://query1.finance.yahoo.com/v8/finance/chart';

export async function fetchQuotes(symbols) {
  try {
    const url = `${YQ}?fields=regularMarketPrice,regularMarketPreviousClose,regularMarketChange,regularMarketChangePercent,regularMarketDayHigh,regularMarketDayLow,regularMarketOpen,regularMarketVolume&symbols=${symbols.join(',')}`;
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    const j = await r.json();
    const out = {};
    for (const item of (j.quoteResponse?.result ?? [])) {
      out[item.symbol] = {
        price: item.regularMarketPrice ?? 0,
        prevClose: item.regularMarketPreviousClose ?? 0,
        change: item.regularMarketChange ?? 0,
        changePercent: item.regularMarketChangePercent ?? 0,
        dayHigh: item.regularMarketDayHigh ?? 0,
        dayLow: item.regularMarketDayLow ?? 0,
        open: item.regularMarketOpen ?? 0,
        volume: item.regularMarketVolume ?? 0,
        updatedAt: Date.now(),
      };
    }
    return out;
  } catch (e) {
    console.warn('fetchQuotes failed', e);
    return {};
  }
}

export async function fetchHistory(symbol, months = 6) {
  try {
    const end = Math.floor(Date.now() / 1000);
    const start = Math.floor(Date.now() / 1000 - months * 30 * 86400);
    const r = await fetch(`${YH}/${symbol}?period1=${start}&period2=${end}&interval=1d`);
    const j = await r.json();
    const res = j.chart?.result?.[0];
    if (!res) return [];
    const ts = res.timestamp ?? [];
    const cl = res.indicators?.quote?.[0]?.close ?? [];
    return ts.map((t, i) => ({ date: new Date(t * 1000).toISOString(), value: cl[i] ?? 0 })).filter(p => p.value > 0);
  } catch (e) {
    console.warn('fetchHistory failed', e);
    return [];
  }
}
