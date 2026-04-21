import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  RefreshControl, StatusBar, Modal, Dimensions, Platform
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Defs, LinearGradient, Stop as SvgStop, G } from 'react-native-svg';
import { LinearGradient as LGradient } from 'expo-linear-gradient';

// ═══════════════════════════════════════════════════════════
//  DATA: parsed from your CSV
// ═══════════════════════════════════════════════════════════
const HOLDINGS: Record<string, { name: string; shares: number; type: string; exchange: string }> = {
  TSLA: { name: 'Tesla Inc', shares: 6.0, type: 'Stock', exchange: 'NASDAQ' },
  HOOD: { name: 'Robinhood Markets', shares: 67.0, type: 'Stock', exchange: 'NASDAQ' },
  IVV: { name: 'iShares Core S&P 500 ETF', shares: 21.0, type: 'ETF', exchange: 'NYSE' },
  NBIS: { name: 'Nebius Group NV', shares: 111.0, type: 'Stock', exchange: 'NASDAQ' },
};

interface Tx { date: string; way: string; ticker: string; qty: number; price: number; cost: number; notes: string; }
const TRANSACTIONS: Tx[] = [
  { date: '2020-08-17', way: 'BUY', ticker: 'TSLA', qty: 1, price: 344.07, cost: 344.07, notes: '' },
  { date: '2021-09-22', way: 'BUY', ticker: 'HOOD', qty: 24, price: 37.23, cost: 893.52, notes: 'IPO' },
  { date: '2021-09-22', way: 'BUY', ticker: 'IVV', qty: 24, price: 344.14, cost: 8259.36, notes: '' },
  { date: '2023-03-13', way: 'BUY', ticker: 'TSLA', qty: 2, price: 200.00, cost: 400.00, notes: '' },
  { date: '2025-03-21', way: 'BUY', ticker: 'TSLA', qty: 2, price: 245.35, cost: 490.70, notes: '' },
  { date: '2025-03-21', way: 'BUY', ticker: 'HOOD', qty: 5.91, price: 43.34, cost: 256.14, notes: '' },
  { date: '2025-03-27', way: 'BUY', ticker: 'HOOD', qty: 29, price: 45.27, cost: 1312.83, notes: '' },
  { date: '2025-03-27', way: 'SELL', ticker: 'IVV', qty: 3, price: 573.11, cost: 1719.33, notes: '' },
  { date: '2025-04-04', way: 'SELL', ticker: 'USD', qty: 290, price: 290, cost: 290, notes: 'NVDA allocation' },
  { date: '2025-04-07', way: 'BUY', ticker: 'HOOD', qty: 8, price: 32.00, cost: 256.00, notes: '' },
  { date: '2025-04-07', way: 'BUY', ticker: 'HOOD', qty: 0.09, price: 32.00, cost: 2.88, notes: '' },
  { date: '2025-05-13', way: 'BUY', ticker: 'TSLA', qty: 1, price: 314.77, cost: 314.77, notes: '' },
  { date: '2025-07-28', way: 'BUY', ticker: 'NBIS', qty: 42, price: 51.79, cost: 2175.18, notes: '' },
  { date: '2025-11-11', way: 'BUY', ticker: 'NBIS', qty: 25, price: 101.63, cost: 2540.75, notes: '' },
  { date: '2026-01-27', way: 'BUY', ticker: 'USD', qty: 901.19, price: 901.19, cost: 901.19, notes: 'Deposit' },
  { date: '2026-02-06', way: 'BUY', ticker: 'NBIS', qty: 33, price: 79.00, cost: 2607.00, notes: '' },
  { date: '2026-03-10', way: 'BUY', ticker: 'NBIS', qty: 11, price: 100.00, cost: 1100.00, notes: '' },
];

// ═══════════════════════════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════════════════════════
const C = { bg: '#0a0a0a', card: '#141414', brd: '#1e1e1e', txt: '#FFF', txt2: '#8E8E93', txt3: '#636366', green: '#00D632', red: '#FF3B30', blue: '#0A84FF' };
const fmt$ = (n: number) => { const a = Math.abs(n); return (n < 0 ? '-$' : '$') + (a >= 1e6 ? (a / 1e6).toFixed(1) + 'M' : a.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })); };
const fmtPct = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const DONUT = ['#00D632', '#0A84FF', '#BF5AF2', '#FF9F0A', '#FF453A', '#30D158'];

// ═══════════════════════════════════════════════════════════
//  YAHOO FINANCE API
// ═══════════════════════════════════════════════════════════
const YQ = 'https://query1.finance.yahoo.com/v7/finance/quote';
const YH = 'https://query1.finance.yahoo.com/v8/finance/chart';

async function getQuotes(symbols: string[]) {
  try {
    const r = await fetch(`${YQ}?fields=regularMarketPrice,regularMarketPreviousClose,regularMarketChange,regularMarketChangePercent,regularMarketDayHigh,regularMarketDayLow,regularMarketOpen,regularMarketVolume&symbols=${symbols.join(',')}`);
    const j = await r.json();
    const out: Record<string, any> = {};
    for (const i of (j.quoteResponse?.result ?? [])) out[i.symbol] = i;
    return out;
  } catch (e) { console.warn('quotes failed', e); return {}; }
}

async function getHistory(symbol: string, months = 6) {
  try {
    const end = Math.floor(Date.now() / 1000);
    const start = Math.floor(Date.now() / 1000 - months * 30 * 86400);
    const r = await fetch(`${YH}/${symbol}?period1=${start}&period2=${end}&interval=1d`);
    const j = await r.json();
    const res = j.chart?.result?.[0];
    if (!res) return [];
    const ts = res.timestamp ?? [], cl = res.indicators?.quote?.[0]?.close ?? [];
    return ts.map((t: number, i: number) => ({ date: new Date(t * 1000).toISOString(), close: cl[i] ?? 0 })).filter((p: any) => p.close > 0);
  } catch (e) { return []; }
}

// ═══════════════════════════════════════════════════════════
//  CHART COMPONENTS
// ═══════════════════════════════════════════════════════════
function Donut({ data }: { data: { label: string; pct: number; color: string }[] }) {
  const sz = 170, r = 65, sw = 22, circ = 2 * Math.PI * r;
  let cum = 0;
  return (
    <Svg width={sz} height={sz}>
      {data.map((d, i) => {
        const dash = [(d.pct / 100) * circ, (1 - d.pct / 100) * circ];
        const off = -cum / 100 * circ; cum += d.pct;
        return <Circle key={i} cx={sz / 2} cy={sz / 2} r={r} fill="none" stroke={d.color} strokeWidth={sw} strokeDasharray={dash} strokeDashoffset={off} rotation={-90} originX={sz / 2} originY={sz / 2} />;
      })}
      <Text x={sz / 2} y={sz / 2 - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill={C.txt}>{data.length}</Text>
      <Text x={sz / 2} y={sz / 2 + 13} textAnchor="middle" fontSize="10" fill={C.txt2}>Holdings</Text>
    </Svg>
  );
}

function LineChart({ values, w }: { values: number[]; w: number }) {
  if (values.length < 2) return <Text style={{ color: C.txt2, textAlign: 'center', padding: 30 }}>Loading chart...</Text>;
  const h = 180, pw = w - 20;
  const mn = Math.min(...values), mx = Math.max(...values), range = mx - mn || 1;
  const pts = values.map((v, i) => ({ x: (i / (values.length - 1)) * pw, y: 12 + (1 - (v - mn) / range) * (h - 40) }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = d + ` L${pw},${h} L0,${h} Z`;
  const up = values[values.length - 1] >= values[0];
  const clr = up ? C.green : C.red;
  return (
    <Svg width={w} height={h + 10}>
      <Defs><LinearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><SvgStop offset="0%" stopColor={clr} stopOpacity={0.3} /><SvgStop offset="100%" stopColor={clr} stopOpacity={0} /></LinearGradient></Defs>
      <Path d={area} fill="url(#lg)" /><Path d={d} fill="none" stroke={clr} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ═══════════════════════════════════════════════════════════
//  SCREENS
// ═══════════════════════════════════════════════════════════
const { width: SW } = Dimensions.get('window');

// --- PORTFOLIO TAB ---
function PortfolioTab({ data, loading, totalValue, lastUpdate, onRefresh, onSelect }: any) {
  const day$ = data.reduce((s: number, h: any) => s + h.dayChange$, 0);
  const prev = totalValue - day$, dPct = prev > 0 ? (day$ / prev) * 100 : 0, pos = day$ >= 0;
  const chart = data.filter((h: any) => h.allocation > 0).map((h: any, i: number) => ({ label: h.symbol, pct: h.allocation, color: DONUT[i % DONUT.length] }));
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <LGradient colors={['#0a0a0a', '#111']} style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 18, alignItems: 'center' }}>
        <Text style={{ color: C.txt2, fontSize: 11, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase' }}>Total Value</Text>
        {loading ? <ActivityIndicator color={C.green} style={{ marginVertical: 14 }} /> : <>
          <Text style={{ color: C.txt, fontSize: 40, fontWeight: '700', marginTop: 4, letterSpacing: -0.5 }}>{fmt$(totalValue)}</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', marginTop: 5, color: pos ? C.green : C.red }}>
            {pos ? '▲' : '▼'} {pos ? '+' : ''}{fmt$(day$)} ({pos ? '+' : ''}{fmtPct(dPct)}) today
          </Text>
        </>}
      </LGradient>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={C.green} />}>
        <View style={{ backgroundColor: C.card, borderRadius: 16, marginHorizontal: 16, marginTop: 12, padding: 16 }}>
          <Text style={{ color: C.txt, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>Allocation</Text>
          <Donut data={chart} />
          <View style={{ marginTop: 4 }}>
            {chart.map((d: any, i: number) => (
              <TouchableOpacity key={d.label} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: C.brd }} onPress={() => onSelect(data[i]?.symbol)}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: d.color, marginRight: 10 }} />
                <View style={{ flex: 1 }}><Text style={{ color: C.txt, fontSize: 14, fontWeight: '600' }}>{d.label}</Text>
                  <Text style={{ color: C.txt2, fontSize: 11, marginTop: 1 }}>{fmtPct(d.pct)} — {fmt$((d.pct / 100) * totalValue)}</Text></View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ backgroundColor: C.card, borderRadius: 16, marginHorizontal: 16, marginTop: 12, padding: 16 }}>
          <Text style={{ color: C.txt, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Holdings</Text>
          {data.map((h: any) => (
            <TouchableOpacity key={h.symbol} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 0.5, borderBottomColor: C.brd }} activeOpacity={0.6} onPress={() => onSelect(h.symbol)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.txt, fontSize: 11, fontWeight: '700' }}>{h.symbol.slice(0, 2)}</Text></View>
                <View><Text style={{ color: C.txt, fontSize: 14, fontWeight: '600' }}>{h.symbol}</Text>
                  <Text style={{ color: C.txt2, fontSize: 11, marginTop: 1 }}>{h.shares < 1 ? h.shares.toFixed(2) : h.shares} shares • {fmt$(h.avgCost)} avg</Text></View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: C.txt, fontSize: 14, fontWeight: '600' }}>{fmt$(h.marketValue)}</Text>
                <Text style={{ fontSize: 11, fontWeight: '500', marginTop: 2, color: (h.dayChange$ || 0) >= 0 ? C.green : C.red }}>
                  {(h.dayChange$ || 0) >= 0 ? '+' : ''}{fmt$(h.dayChange$ || 0)} ({fmtPct(h.changePercent || 0)})
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={{ color: C.txt3, fontSize: 10, textAlign: 'center', marginTop: 16 }}>{lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : ''}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- PERFORMANCE TAB ---
function PerformanceTab({ data, loading, totalValue, onRefresh }: any) {
  const invested = data.reduce((s: number, h: any) => s + h.costBasis, 0);
  const ret$ = totalValue - invested, retPct = invested > 0 ? (ret$ / invested) * 100 : 0, up = ret$ >= 0;
  const timeline = useMemo(() => {
    const txs = TRANSACTIONS.filter(t => ['BUY', 'SELL'].includes(t.way)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let cum = 0; const pts: number[] = [];
    txs.forEach(t => { cum += t.way === 'BUY' ? t.cost : -t.cost; pts.push(Math.round(cum * 100) / 100); });
    pts.push(Math.round(totalValue * 100) / 100);
    return pts;
  }, [totalValue, data]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={C.green} />}>
        <View style={{ paddingHorizontal: 20, paddingTop: 12, alignItems: 'center' }}>
          <Text style={{ color: C.txt2, fontSize: 11, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase' }}>Total Return</Text>
          {loading ? <ActivityIndicator color={C.green} style={{ marginVertical: 14 }} /> : <>
            <Text style={{ fontSize: 36, fontWeight: '700', marginTop: 4, color: up ? C.green : C.red }}>{up ? '+' : ''}{fmt$(ret$)}</Text>
            <Text style={{ color: C.txt2, fontSize: 12, marginTop: 3 }}>{fmtPct(retPct)} on {fmt$(invested)} invested • {data.length} holdings</Text>
          </>}
        </View>
        <LineChart values={timeline} w={SW} />
        <View style={{ backgroundColor: C.card, borderRadius: 16, marginHorizontal: 16, marginTop: 16, padding: 16 }}>
          <Text style={{ color: C.txt, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Performance by Asset</Text>
          {data.map((h: any, i: number) => (
            <View key={h.symbol} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: i < data.length - 1 ? 0.5 : 0, borderBottomColor: C.brd }}>
              <View><Text style={{ color: C.txt, fontSize: 14, fontWeight: '600' }}>{h.symbol}</Text>
                <Text style={{ color: C.txt2, fontSize: 11 }}>{h.shares} shares @ {fmt$(h.avgCost)}</Text></View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: h.totalReturn$ >= 0 ? C.green : C.red }}>{up ? '+' : ''}{fmt$(h.totalReturn$)}</Text>
                <Text style={{ fontSize: 11, fontWeight: '500', color: h.totalReturnPct >= 0 ? C.green : C.red }}>{fmtPct(h.totalReturnPct)}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- ACTIVITY TAB ---
function ActivityTab() {
  const [filter, setFilter] = useState('ALL');
  const txs = useMemo(() => TRANSACTIONS.filter((t: any) => filter === 'ALL' || t.way === filter).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()), [filter]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text style={{ color: C.txt, fontSize: 28, fontWeight: '700', marginBottom: 12 }}>Activity</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {['ALL', 'BUY', 'SELL'].map(f => (
            <TouchableOpacity key={f} style={{ paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12, backgroundColor: filter === f ? '#2C2C2E' : '#1a1a1a' }} onPress={() => setFilter(f)}>
              <Text style={{ color: filter === f ? C.txt : C.txt2, fontSize: 12, fontWeight: filter === f ? '600' : '500' }}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {txs.map((t: any, i: number) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 13, marginBottom: 7 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: t.way === 'BUY' ? 'rgba(0,214,50,0.15)' : 'rgba(255,59,48,0.15)' }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: t.way === 'BUY' ? C.green : C.red }}>{t.way}</Text>
              </View>
              <View><Text style={{ color: C.txt, fontSize: 14, fontWeight: '600' }}>{t.ticker}</Text>
                <Text style={{ color: C.txt2, fontSize: 11 }}>{fmtDate(t.date)} • {t.qty} @ {fmt$(t.price)}</Text>
                {t.notes && <Text style={{ color: C.txt3, fontSize: 10, marginTop: 2, fontStyle: 'italic' }}>{t.notes}</Text>}
              </View>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '600', color: t.way === 'SELL' ? C.green : C.red }}>
              {t.way === 'BUY' ? '-' : '+'}{fmt$(t.cost)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- DETAIL MODAL ---
function DetailModal({ symbol, visible, onClose, data, refreshAll }: any) {
  const [history, setHistory] = useState<any[]>([]);
  const [period, setPeriod] = useState('6M');
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    if (!visible || !symbol) return;
    const load = async () => {
      setChartLoading(true);
      const months: Record<string, number> = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12, ALL: 99 };
      setHistory(await getHistory(symbol, months[period] ?? 6));
      setChartLoading(false);
    };
    load();
  }, [symbol, visible, period]);

  const holding = data?.find((h: any) => h.symbol === symbol);
  const txs = TRANSACTIONS.filter((t: any) => t.ticker === symbol).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const closes = history.map(h => h.close);
  const up = (holding?.totalReturn$ ?? 0) >= 0;
  const dUp = (holding?.dayChange$ ?? 0) >= 0;
  const periodUp = closes.length >= 2 && closes[closes.length - 1] >= closes[0];
  const periodChg = closes.length >= 2 ? ((closes[closes.length - 1] - closes[0]) / closes[0]) * 100 : 0;
  const stats = closes.length >= 2 ? { high: Math.max(...closes), low: Math.min(...closes) } : null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 }}>
          <TouchableOpacity onPress={onClose}><Text style={{ color: C.blue, fontSize: 16, fontWeight: '500' }}>✕ Close</Text></TouchableOpacity>
          <Text style={{ color: C.txt, fontSize: 18, fontWeight: '700' }}>{symbol}</Text><View style={{ width: 60 }} />
        </View>
        {holding && !chartLoading ? (
          <ScrollView style={{ flex: 1 }}>
            <View style={{ alignItems: 'center', paddingTop: 12 }}>
              <Text style={{ color: C.txt2, fontSize: 13 }}>{holding.name}</Text>
              <Text style={{ color: C.txt, fontSize: 32, fontWeight: '700', marginTop: 6 }}>{fmt$(holding.price)}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', marginTop: 4, color: dUp ? C.green : C.red }}>
                {dUp ? '+' : ''}{fmt$(holding.dayChange$)} ({fmtPct(holding.changePercent)}) today
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', marginVertical: 16 }}>
              {['1M', '3M', '6M', '1Y', 'ALL'].map(p => (
                <TouchableOpacity key={p} style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, backgroundColor: period === p ? C.green : '#1a1a1a' }} onPress={() => setPeriod(p)}>
                  <Text style={{ color: period === p ? '#000' : C.txt2, fontSize: 12, fontWeight: period === p ? '700' : '500' }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {chartLoading ? <ActivityIndicator color={C.green} style={{ marginVertical: 30 }} /> : <LineChart values={closes} w={SW - 32} />}
            {stats && <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 }}>
              <View style={{ alignItems: 'center' }}><Text style={{ color: C.txt, fontSize: 13, fontWeight: '600' }}>{fmt$(stats.high)}</Text><Text style={{ color: C.txt2, fontSize: 10 }}>High</Text></View>
              <View style={{ alignItems: 'center' }}><Text style={{ color: C.txt, fontSize: 13, fontWeight: '600' }}>{fmt$(stats.low)}</Text><Text style={{ color: C.txt2, fontSize: 10 }}>Low</Text></View>
              <View style={{ alignItems: 'center' }}><Text style={{ color: periodUp ? C.green : C.red, fontSize: 13, fontWeight: '600' }}>{fmtPct(periodChg)}</Text><Text style={{ color: C.txt2, fontSize: 10 }}>Period</Text></View>
            </View>}
            <View style={{ backgroundColor: C.card, borderRadius: 14, marginHorizontal: 14, marginTop: 8, padding: 14 }}>
              <Text style={{ color: C.txt, fontSize: 15, fontWeight: '600', marginBottom: 6 }}>Your Position</Text>
              {[['Shares', (holding.shares < 1 ? holding.shares.toFixed(4) : holding.shares).toString()],
                ['Avg Cost', fmt$(holding.avgCost)], ['Cost Basis', fmt$(holding.costBasis)],
                ['Market Value', fmt$(holding.marketValue)],
                ['Total Return', `${up ? '+' : ''}${fmt$(holding.totalReturn$)} (${fmtPct(holding.totalReturnPct)})`]
              ].map(([l, v], i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: i < 4 ? 0.5 : 0, borderBottomColor: C.brd }}>
                  <Text style={{ color: C.txt2, fontSize: 12 }}>{l}</Text>
                  <Text style={[{ color: C.txt, fontSize: 12, fontWeight: '600' }, l === 'Total Return' && { color: up ? C.green : C.red }]}>{v}</Text>
                </View>
              ))}
            </View>
            <View style={{ backgroundColor: C.card, borderRadius: 14, marginHorizontal: 14, marginTop: 12, padding: 14 }}>
              <Text style={{ color: C.txt, fontSize: 15, fontWeight: '600', marginBottom: 6 }}>Transactions</Text>
              {txs.map((t: any, i: number) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: i < txs.length - 1 ? 0.5 : 0, borderBottomColor: C.brd }}>
                  <View><Text style={[{ fontSize: 11, fontWeight: '700' }, t.way === 'BUY' ? { color: C.green } : { color: C.red }]}>{t.way}</Text>
                    <Text style={{ color: C.txt2, fontSize: 10, marginTop: 1 }}>{fmtDate(t.date)}</Text></View>
                  <View style={{ alignItems: 'flex-end' }}><Text style={{ color: C.txt, fontSize: 13, fontWeight: '600' }}>{fmt$(t.cost)}</Text>
                    <Text style={{ color: C.txt2, fontSize: 10 }}>{t.qty} @ {fmt$(t.price)}</Text></View>
                </View>
              ))}
            </View>
            <View style={{ height: 60 }} />
          </ScrollView>
        ) : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>{loading ? <ActivityIndicator color={C.green} /> : <Text style={{ color: C.txt2 }}>No data</Text>}</View>}
      </SafeAreaView>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════
//  MAIN APP — fetches real quotes, computes enriched portfolio
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState(0);
  const [modal, setModal] = useState<string | null>(null);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const totalValue = holdings.reduce((s: number, h: any) => s + (h.marketValue ?? 0), 0);

  const load = useCallback(async () => {
    setLoading(true);
    const syms = Object.keys(HOLDINGS);
    const quotes = await getQuotes(syms);
    const enriched = syms.map(sym => {
      const cfg = HOLDINGS[sym];
      const q = quotes[sym] ?? {};
      const buys = TRANSACTIONS.filter(t => t.ticker === sym && t.way === 'BUY');
      const tQty = buys.reduce((s, t) => s + t.qty, 0);
      const tCost = buys.reduce((s, t) => s + t.cost, 0);
      const avg = tQty > 0 ? tCost / tQty : 0;
      const price = q.regularMarketPrice ?? 0;
      const prev = q.regularMarketPreviousClose ?? price;
      const chgPct = prev > 0 ? ((price - prev) / prev) * 100 : 0;
      return {
        symbol: sym, name: cfg.name, shares: cfg.shares, avgCost: Math.round(avg * 100) / 100,
        costBasis: Math.round(avg * cfg.shares * 100) / 100,
        price: Math.round(price * 100) / 100, prevClose: Math.round(prev * 100) / 100,
        marketValue: Math.round(price * cfg.shares * 100) / 100,
        dayChange$: Math.round((price - prev) * cfg.shares * 100) / 100,
        changePercent: Math.round(chgPct * 100) / 100,
        totalReturn$: 0, totalReturnPct: 0, allocation: 0,
      };
    });
    const tot = enriched.reduce((s: number, h: any) => s + h.marketValue, 0);
    enriched.forEach((h: any) => {
      h.allocation = tot > 0 ? Math.round((h.marketValue / tot) * 10000) / 100 : 0;
      const cb = h.costBasis;
      h.totalReturn$ = Math.round((h.marketValue - cb) * 100) / 100;
      h.totalReturnPct = cb > 0 ? Math.round(((h.marketValue - cb) / cb) * 10000) / 100 : 0;
    });
    enriched.sort((a: any, b: any) => b.marketValue - a.marketValue);
    setHoldings(enriched);
    setLoading(false);
    setLastUpdate(new Date());
  }, []);

  useEffect(() => { load(); const iv = setInterval(load, 300000); return () => clearInterval(iv); }, [load]);

  const tabs = ['Portfolio', 'Performance', 'Activity'];
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        {tab === 0 && <PortfolioTab data={holdings} loading={loading} totalValue={totalValue} lastUpdate={lastUpdate} onRefresh={load} onSelect={(s: string) => setModal(s)} />}
        {tab === 1 && <PerformanceTab data={holdings} loading={loading} totalValue={totalValue} onRefresh={load} />}
        {tab === 2 && <ActivityTab />}
        {/* Tab bar */}
        <View style={{ flexDirection: 'row', backgroundColor: '#0a0a0a', borderTopColor: '#1e1e1e', borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 25 : 8, paddingTop: 6 }}>
          {tabs.map((t, i) => (
            <TouchableOpacity key={t} style={{ flex: 1, alignItems: 'center' }} onPress={() => setTab(i)}>
              <Text style={{ fontSize: tab === i ? 18 : 16 }}>{tab === i ? ['◆', '▲', '⬡'][i] : ['◇', '△', '⬢'][i]}</Text>
              <Text style={{ fontSize: 10, fontWeight: tab === i ? '600' : '400', marginTop: 2, color: tab === i ? C.green : C.txt2 }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <DetailModal symbol={modal} visible={!!modal} onClose={() => setModal(null)} data={holdings} refreshAll={load} />
    </SafeAreaProvider>
  );
}
import 'react-native-screens';
