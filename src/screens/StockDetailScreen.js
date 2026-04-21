import React, { useState, useMemo } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar,
} from "react-native";
import { AreaChart } from "../components/Charts";
import { HOLDINGS, stockPriceHistory } from "../data/holdings";
import { useLivePrices, getPriceData } from "../hooks/useLivePrices";
import { colors } from "../utils/styles";

const PERIODS = ["1M", "3M", "6M", "1Y", "ALL"];

function fmt$(n) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function StockDetailScreen({ route }) {
  const { symbol } = route.params;
  const [period, setPeriod] = useState("1Y");
  const { prices } = useLivePrices();

  const stock = HOLDINGS.find(h => h.symbol === symbol);
  if (!stock) return <Text style={{color: colors.white, padding: 20, paddingTop: 80}}>Stock not found</Text>;

  const live = getPriceData(prices, symbol);
  const currentPrice = live?.currentPrice || stock.avgCost;
  const priceChange = live?.priceChange || 0;
  const priceChangePercent = live?.priceChangePercent || 0;
  const dayHigh = live?.dayHigh || currentPrice;
  const dayLow = live?.dayLow || currentPrice;

  const rawData = stockPriceHistory[symbol] || [];
  const chartData = rawData.map(d => ({ date: d.date, value: d.price, price: d.price }));

  const totalValue = currentPrice * stock.shares;
  const gain = totalValue - stock.costBasis;
  const gainPct = ((gain / stock.costBasis) * 100).toFixed(2);
  const isUp = gain >= 0;
  const dayIsUp = priceChange >= 0;

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={s.headerTop}>
            <View>
              <Text style={s.symbol}>{stock.symbol}</Text>
              <Text style={s.name}>{stock.name}</Text>
            </View>
            <View style={[s.exchangeBadge]}>
              <Text style={s.exchangeText}>{stock.exchange}</Text>
            </View>
          </View>
        </View>

        <View style={s.priceSection}>
          <Text style={s.price}>{fmt$(currentPrice)}</Text>
          <Text style={[s.change, dayIsUp ? s.green : s.red]}>
            {dayIsUp ? "+" : ""}{fmt$(priceChange)} ({priceChangePercent.toFixed(2)}%) Today
          </Text>
        </View>

        <View style={s.periodBar}>
          {PERIODS.map(p => (
            <TouchableOpacity key={p} onPress={() => setPeriod(p)}
              style={[s.pill, period === p && s.pillActive]}>
              <Text style={[s.pillText, period === p && s.pillTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.chartContainer}>
          <AreaChart
            data={chartData}
            formatValue={v => `$${v.toFixed(0)}`}
          />
        </View>

        <View style={s.statsCard}>
          <View style={s.statRow}>
            <View style={s.statLeft}>
              <Text style={s.statLabel}>Day Range</Text>
              <Text style={s.statValue}>{fmt$(dayLow)} — {fmt$(dayHigh)}</Text>
            </View>
          </View>
          <View style={s.statDivider} />
          <View style={s.statRow}>
            <View style={s.statLeft}>
              <Text style={s.statLabel}>Avg Cost</Text>
              <Text style={s.statValue}>{fmt$(stock.avgCost)}</Text>
            </View>
          </View>
          <View style={s.statDivider} />
          <View style={s.statRow}>
            <View style={s.statLeft}>
              <Text style={s.statLabel}>Shares</Text>
              <Text style={s.statValue}>{stock.shares}</Text>
            </View>
          </View>
          <View style={s.statDivider} />
          <View style={s.statRow}>
            <View style={s.statLeft}>
              <Text style={s.statLabel}>Market Value</Text>
              <Text style={s.statValue}>{fmt$(totalValue)}</Text>
            </View>
          </View>
          <View style={s.statDivider} />
          <View style={s.statRow}>
            <View style={s.statLeft}>
              <Text style={s.statLabel}>Total Return</Text>
              <Text style={[s.statValue, isUp ? s.green : s.red]}>
                {isUp ? "+" : ""}{fmt$(gain)} ({isUp ? "+" : ""}{gainPct}%)
              </Text>
            </View>
          </View>
        </View>

        <View style={s.performanceCard}>
          <Text style={s.sectionTitle}>Performance</Text>
          <View style={s.perfRow}>
            <Text style={s.perfLabel}>1 Week</Text>
            <Text style={[s.perfValue, stock.weekChange >= 0 ? s.green : s.red]}>
              {stock.weekChange >= 0 ? "+" : ""}{stock.weekChange}%
            </Text>
          </View>
          <View style={s.perfRow}>
            <Text style={s.perfLabel}>1 Month</Text>
            <Text style={[s.perfValue, stock.monthChange >= 0 ? s.green : s.red]}>
              {stock.monthChange >= 0 ? "+" : ""}{stock.monthChange}%
            </Text>
          </View>
          <View style={s.perfRow}>
            <Text style={s.perfLabel}>1 Year</Text>
            <Text style={[s.perfValue, stock.yearChange >= 0 ? s.green : s.red]}>
              {stock.yearChange >= 0 ? "+" : ""}{stock.yearChange}%
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  symbol: { color: colors.white, fontSize: 28, fontWeight: "800" },
  name: { color: colors.gray, fontSize: 14, marginTop: 2 },
  exchangeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: colors.cardAlt },
  exchangeText: { color: colors.gray, fontSize: 11, fontWeight: "600" },
  priceSection: { paddingHorizontal: 20, paddingVertical: 8 },
  price: { color: colors.white, fontSize: 40, fontWeight: "700" },
  change: { fontSize: 16, fontWeight: "600", marginTop: 4 },
  green: { color: colors.green },
  red: { color: colors.red },
  periodBar: { flexDirection: "row", paddingHorizontal: 20, gap: 6, marginTop: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.cardAlt, marginRight: 4 },
  pillActive: { backgroundColor: "#00D4AA22" },
  pillText: { color: colors.gray, fontSize: 13, fontWeight: "600" },
  pillTextActive: { color: colors.green, fontSize: 13, fontWeight: "600" },
  chartContainer: { marginTop: 12, paddingHorizontal: 10 },
  statsCard: { backgroundColor: colors.card, borderRadius: 16, marginHorizontal: 20, marginTop: 20, overflow: "hidden" },
  statRow: { padding: 16 },
  statLeft: { flex: 1 },
  statLabel: { color: colors.gray, fontSize: 12, marginBottom: 4 },
  statValue: { color: colors.white, fontSize: 16, fontWeight: "600" },
  statDivider: { height: 1, backgroundColor: colors.border },
  performanceCard: { backgroundColor: colors.card, borderRadius: 16, marginHorizontal: 20, marginTop: 16, padding: 16 },
  sectionTitle: { color: colors.white, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  perfRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  perfLabel: { color: colors.gray, fontSize: 14 },
  perfValue: { color: colors.white, fontSize: 14, fontWeight: "600" },
});
