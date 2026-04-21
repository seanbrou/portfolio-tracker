import React, { useState, useMemo } from "react";
import {
  View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, StatusBar,
  ActivityIndicator,
} from "react-native";
import { AreaChart, DonutChart } from "../components/Charts";
import { HOLDINGS, CASH_BALANCE, generatePortfolioHistory } from "../data/holdings";
import { useLivePrices, getPriceData } from "../hooks/useLivePrices";
import { colors } from "../utils/styles";

const { width } = Dimensions.get("window");
const PERIODS = ["1D", "1W", "1M", "6M", "1Y", "All"];

function fmt$(n) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function DashboardScreen({ navigation }) {
  const [period, setPeriod] = useState("1Y");
  const { prices, loading, lastUpdated, refresh } = useLivePrices();

  const history = useMemo(() => generatePortfolioHistory(), []);

  const enriched = useMemo(() => {
    return HOLDINGS.map(h => {
      const live = getPriceData(prices, h.symbol);
      const price = live?.currentPrice || h.avgCost;
      const change = live?.priceChange || 0;
      const changePct = live?.priceChangePercent || 0;
      return {
        ...h,
        currentPrice: price,
        priceChange: change,
        priceChangePercent: changePct,
        marketValue: price * h.shares,
      };
    });
  }, [prices]);

  const totalValue = enriched.reduce((s, h) => s + h.marketValue, 0) + CASH_BALANCE;
  const totalCost = HOLDINGS.reduce((s, h) => s + h.costBasis, 0) + CASH_BALANCE;
  const totalReturn = totalValue - totalCost;
  const totalReturnPct = ((totalReturn / totalCost) * 100).toFixed(2);
  const isUp = totalReturn >= 0;

  const donutData = enriched.map((h, i) => ({
    label: h.symbol,
    value: h.marketValue,
    color: ["#00D4AA", "#007AFF", "#FF9F0A", "#BF5AF2", "#FF375F"][i % 5],
  }));
  donutData.push({ label: "Cash", value: CASH_BALANCE, color: "#888" });

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <Text style={s.headerLabel}>Total Portfolio Value</Text>
        {loading && Object.keys(prices).length === 0 ? (
          <ActivityIndicator color={colors.green} style={{ marginVertical: 14 }} />
        ) : (
          <>
            <Text style={s.totalValue}>{fmt$(totalValue)}</Text>
            <Text style={[s.returnText, isUp ? s.green : s.red]}>
              {isUp ? "+" : ""}{fmt$(totalReturn)} ({isUp ? "+" : ""}{totalReturnPct}%) All time
            </Text>
            {lastUpdated && (
              <Text style={s.lastUpdated}>Updated {lastUpdated.toLocaleTimeString()}</Text>
            )}
          </>
        )}
      </View>

      <View style={s.periodBar}>
        {PERIODS.map(p => (
          <TouchableOpacity key={p} onPress={() => setPeriod(p)}
            style={[s.pill, period === p && s.pillActive]}>
            <Text style={[s.pillText, period === p && s.pillTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
        <View style={s.chartCard}>
          <AreaChart
            data={history}
            color={isUp ? colors.green : colors.red}
            formatValue={v => `$${v.toFixed(0)}`}
          />
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Holdings</Text>
            <TouchableOpacity onPress={() => navigation.navigate("holdings")}>
              <Text style={s.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={s.card}>
            {enriched.map((h, i) => (
              <TouchableOpacity
                key={h.symbol}
                style={s.holdingRow}
                onPress={() => navigation.navigate("stock", { symbol: h.symbol })}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={[s.icon, { backgroundColor: ["#00D4AA22", "#007AFF22", "#FF9F0A22", "#BF5AF222"][i] }]}>
                    <Text style={s.iconText}>{h.symbol.slice(0, 2)}</Text>
                  </View>
                  <View>
                    <Text style={s.symbolText}>{h.symbol}</Text>
                    <Text style={s.nameText}>{h.shares} shares</Text>
                  </View>
                </View>
                <View>
                  <Text style={s.priceText}>{fmt$(h.marketValue)}</Text>
                  <Text style={[s.changeText, h.priceChange >= 0 ? s.green : s.red]}>
                    {h.priceChange >= 0 ? "+" : ""}{h.priceChangePercent.toFixed(2)}%
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Allocation</Text>
          </View>
          <View style={s.card}>
            <DonutChart data={donutData} size={200} />
          </View>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Buying Power</Text>
          </View>
          <View style={s.card}>
            <View style={s.rowFull}>
              <Text style={s.rowLabel}>Cash Balance</Text>
              <Text style={s.rowValue}>{fmt$(CASH_BALANCE)}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  headerLabel: { color: colors.gray, fontSize: 14, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  totalValue: { color: colors.white, fontSize: 36, fontWeight: "700", marginTop: 6 },
  returnText: { fontSize: 15, fontWeight: "600", marginTop: 4 },
  lastUpdated: { color: colors.gray, fontSize: 11, marginTop: 4 },
  green: { color: colors.green },
  red: { color: colors.red },
  periodBar: { flexDirection: "row", paddingHorizontal: 20, gap: 8, marginTop: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.cardAlt },
  pillActive: { backgroundColor: "#00D4AA22" },
  pillText: { color: colors.gray, fontSize: 13, fontWeight: "600" },
  pillTextActive: { color: colors.green, fontSize: 13, fontWeight: "600" },
  chartCard: { paddingHorizontal: 10, paddingVertical: 8 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { color: colors.white, fontSize: 18, fontWeight: "700" },
  seeAll: { color: colors.accent, fontSize: 14, fontWeight: "600" },
  card: { backgroundColor: colors.card, borderRadius: 16, overflow: "hidden" },
  holdingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  iconText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  symbolText: { color: colors.white, fontSize: 16, fontWeight: "700" },
  nameText: { color: colors.gray, fontSize: 12, marginTop: 2 },
  priceText: { color: colors.white, fontSize: 16, fontWeight: "600", textAlign: "right" },
  changeText: { fontSize: 13, fontWeight: "600", textAlign: "right", marginTop: 2 },
  rowFull: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 16 },
  rowLabel: { color: colors.gray, fontSize: 14 },
  rowValue: { color: colors.white, fontSize: 14, fontWeight: "600" },
});
