// Portfolio transaction data
export const TRANSACTIONS = [
  {date: "2020-08-17T18:37:00.000Z", way: "BUY", base_amount: 1, base_currency: "TSLA", base_type: "STOCK", quote_amount: 344.07, quote_currency: "USD", exchange: "Nasdaq", notes: ""},
  {date: "2021-09-22T18:52:23.000Z", way: "BUY", base_amount: 24, base_currency: "HOOD", base_type: "STOCK", quote_amount: 893.52, quote_currency: "USD", exchange: "Nasdaq", notes: ""},
  {date: "2021-09-22T18:54:42.000Z", way: "BUY", base_amount: 24, base_currency: "IVV", base_type: "FUND", quote_amount: 8259.36, quote_currency: "USD", exchange: "NYSE", notes: ""},
  {date: "2023-03-13T23:34:00.000Z", way: "BUY", base_amount: 2, base_currency: "TSLA", base_type: "STOCK", quote_amount: 400, quote_currency: "USD", exchange: "Nasdaq", notes: ""},
  {date: "2024-03-20T21:23:15.000Z", way: "DEPOSIT", base_amount: 111.43, base_currency: "USD", base_type: "FIAT", quote_amount: 111.43, quote_currency: "USD", exchange: "", notes: "Schwab dry powder"},
  {date: "2025-03-21T17:38:33.000Z", way: "BUY", base_amount: 2, base_currency: "TSLA", base_type: "STOCK", quote_amount: 490.7, quote_currency: "USD", exchange: "Nasdaq", notes: ""},
  {date: "2025-03-21T17:38:59.000Z", way: "BUY", base_amount: 5.91, base_currency: "HOOD", base_type: "STOCK", quote_amount: 256.14, quote_currency: "USD", exchange: "Nasdaq", notes: ""},
  {date: "2025-03-27T21:38:00.000Z", way: "BUY", base_amount: 29, base_currency: "HOOD", base_type: "STOCK", quote_amount: 1312.83, quote_currency: "USD", exchange: "Nasdaq", notes: ""},
  {date: "2025-03-27T21:39:00.000Z", way: "SELL", base_amount: 3, base_currency: "IVV", base_type: "FUND", quote_amount: 1719.33, quote_currency: "USD", exchange: "NYSE", notes: ""},
  {date: "2025-04-04T13:47:32.000Z", way: "WITHDRAW", base_amount: 290, base_currency: "USD", base_type: "FIAT", quote_amount: 290, quote_currency: "USD", exchange: "", notes: "Went towards 6 shares of NVDA"},
  {date: "2025-04-07T02:15:34.000Z", way: "BUY", base_amount: 8, base_currency: "HOOD", base_type: "STOCK", quote_amount: 256, quote_currency: "USD", exchange: "Nasdaq", notes: ""},
  {date: "2025-04-07T18:17:00.000Z", way: "BUY", base_amount: 0.09, base_currency: "HOOD", base_type: "STOCK", quote_amount: 2.88, quote_currency: "USD", exchange: "Nasdaq", notes: ""},
  {date: "2025-05-13T05:11:10.000Z", way: "BUY", base_amount: 1, base_currency: "TSLA", base_type: "STOCK", quote_amount: 314.77, quote_currency: "USD", exchange: "Nasdaq", notes: ""},
  {date: "2025-07-28T19:01:38.000Z", way: "BUY", base_amount: 42, base_currency: "NBIS", base_type: "STOCK", quote_amount: 2175.18, quote_currency: "USD", exchange: "Nasdaq", notes: ""},
  {date: "2025-11-11T21:32:15.000Z", way: "BUY", base_amount: 25, base_currency: "NBIS", base_type: "STOCK", quote_amount: 2540.75, quote_currency: "USD", exchange: "Nasdaq", notes: ""},
  {date: "2026-01-27T04:12:21.000Z", way: "DEPOSIT", base_amount: 901.19, base_currency: "USD", base_type: "FIAT", quote_amount: 901.19, quote_currency: "USD", exchange: "", notes: ""},
  {date: "2026-02-06T18:51:39.000Z", way: "BUY", base_amount: 33, base_currency: "NBIS", base_type: "STOCK", quote_amount: 2607, quote_currency: "USD", exchange: "Nasdaq", notes: ""},
  {date: "2026-03-10T16:55:00.000Z", way: "BUY", base_amount: 11, base_currency: "NBIS", base_type: "STOCK", quote_amount: 1100, quote_currency: "USD", exchange: "Nasdaq", notes: ""},
];

// Compute current holdings from transactions
export function computeHoldings() {
  const holdings = {};
  let deposits = 0;
  let withdrawals = 0;
  for (const t of TRANSACTIONS) {
    if (t.base_type === "FIAT") {
      if (t.way === "DEPOSIT") deposits += t.base_amount;
      else if (t.way === "WITHDRAW") withdrawals += t.base_amount;
      continue;
    }
    const sym = t.base_currency;
    if (!holdings[sym]) {
      holdings[sym] = { symbol: sym, shares: 0, cost_basis: 0, type: t.base_type };
    }
    if (t.way === "BUY") {
      holdings[sym].shares += t.base_amount;
      holdings[sym].cost_basis += t.quote_amount;
    } else if (t.way === "SELL") {
      const sellFraction = holdings[sym].shares > 0 ? t.base_amount / holdings[sym].shares : 0;
      holdings[sym].shares -= t.base_amount;
      holdings[sym].cost_basis -= holdings[sym].cost_basis * sellFraction;
    }
  }
  return { holdings, deposits, withdrawals };
}

export const { holdings: HOLDINGS_DATA, deposits: TOTAL_DEPOSITS, withdrawals: TOTAL_WITHDRAWALS } = computeHoldings();
