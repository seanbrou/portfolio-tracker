
export function formatCurrency(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n < 0 ? '-' : '') + '$' + (Math.abs(n) / 1_000_000).toFixed(1) + 'M';
  return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPct(n: number): string {
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const COLORS = {
  bg: '#0a0a0a',
  card: '#141414',
  cardBorder: '#1e1e1e',
  text: '#FFFFFF',
  textSec: '#8E8E93',
  textTer: '#636366',
  green: '#00D632',
  red: '#FF3B30',
  blue: '#0A84FF',
  border: '#2C2C2E',
};
