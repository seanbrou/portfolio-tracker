// Portfolio data parsed from your CSV
// Holdings: TSLA (6), HOOD (67), IVV (21), NBIS (111)

export const transactions = [
  { date: '2020-08-17', way: 'BUY' as const, ticker: 'TSLA', qty: 1, price: 344.07, cost: 344.07, notes: '' },
  { date: '2021-09-22', way: 'BUY' as const, ticker: 'HOOD', qty: 24, price: 37.23, cost: 893.52, notes: 'IPO' },
  { date: '2021-09-22', way: 'BUY' as const, ticker: 'IVV', qty: 24, price: 344.14, cost: 8259.36, notes: '' },
  { date: '2023-03-13', way: 'BUY' as const, ticker: 'TSLA', qty: 2, price: 200.00, cost: 400.00, notes: '' },
  { date: '2025-03-21', way: 'BUY' as const, ticker: 'TSLA', qty: 2, price: 245.35, cost: 490.70, notes: '' },
  { date: '2025-03-21', way: 'BUY' as const, ticker: 'HOOD', qty: 5.91, price: 43.34, cost: 256.14, notes: '' },
  { date: '2025-03-27', way: 'BUY' as const, ticker: 'HOOD', qty: 29, price: 45.27, cost: 1312.83, notes: '' },
  { date: '2025-03-27', way: 'SELL' as const, ticker: 'IVV', qty: 3, price: 573.11, cost: 1719.33, notes: '' },
  { date: '2025-04-04', way: 'SELL' as const, ticker: 'USD', qty: 290, price: 290, cost: 290, notes: 'NVDA allocation' },
  { date: '2025-04-07', way: 'BUY' as const, ticker: 'HOOD', qty: 8, price: 32.00, cost: 256.00, notes: '' },
  { date: '2025-04-07', way: 'BUY' as const, ticker: 'HOOD', qty: 0.09, price: 32.00, cost: 2.88, notes: '' },
  { date: '2025-05-13', way: 'BUY' as const, ticker: 'TSLA', qty: 1, price: 314.77, cost: 314.77, notes: '' },
  { date: '2025-07-28', way: 'BUY' as const, ticker: 'NBIS', qty: 42, price: 51.79, cost: 2175.18, notes: '' },
  { date: '2025-11-11', way: 'BUY' as const, ticker: 'NBIS', qty: 25, price: 101.63, cost: 2540.75, notes: '' },
  { date: '2026-01-27', way: 'BUY' as const, ticker: 'USD', qty: 901.19, price: 901.19, cost: 901.19, notes: 'Deposit' },
  { date: '2026-02-06', way: 'BUY' as const, ticker: 'NBIS', qty: 33, price: 79.00, cost: 2607.00, notes: '' },
  { date: '2026-03-10', way: 'BUY' as const, ticker: 'NBIS', qty: 11, price: 100.00, cost: 1100.00, notes: '' },
];

export const holdingsConfig: Record<string, { name: string; shares: number; type: string; exchange: string }> = {
  TSLA: { name: 'Tesla Inc', shares: 6.0, type: 'Stock', exchange: 'NASDAQ' },
  HOOD: { name: 'Robinhood Markets', shares: 67.0, type: 'Stock', exchange: 'NASDAQ' },
  IVV: { name: 'iShares Core S&P 500 ETF', shares: 21.0, type: 'ETF', exchange: 'NYSE' },
  NBIS: { name: 'Nebius Group NV', shares: 111.0, type: 'Stock', exchange: 'NASDAQ' },
};
