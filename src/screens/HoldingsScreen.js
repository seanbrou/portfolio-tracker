import React from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar,
} from "react-native";
import { DonutChart } from "../components/Charts";
import { HOLDINGS, CASH_BALANCE } from "../data/holdings";
import { useLivePrices, getPriceData } from "../hooks/useLivePrices";
import { colors } from "../utils/styles";

function fmt$(n) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function HoldingsScreen({ navigation }) {
  const { prices } = useLivePrices();

  const enriched = HOLDINGS.map(h => {
    const live = getPriceData(prices, h.symbol);
    const price = live?.currentPrice || h.avgCost;
    return { ...h, currentPrice: price, marketValue: price * h.shares };
  });

  const totalValue = enriched.reduce((s, h) => s + h.marketValue, 0) + CASH_BALANCE;

  const donutData = enriched.map((h, i) => ({
    label: h.symbol,
    value: parseFloat(h.marketValue.toFixed(2)),
    color: ["#00D4AA", "#007AFF", "#FF9F0A", "#BF5AF2"][i % 5],
  }));

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <Text style={s.headerTitle}>Holdings</Text>
      </View>
      <View style={s.chartSection}>
        <DonutChart data={donutData} size={160} />
      </View>

      <View style={s.tableHeader}>
        <Text style={s.th}>Symbol</Text>
        <Text style={[s.th, s.thRight]}>Value</Text>
        <Text style={[s.th, s.thRight]}>Return</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {enriched.map((h) => {
          const value = h.marketValue;
          const gain = value - h.costBasis;
          const gainPct = ((gain / h.costBasis) * 100).toFixed(2);
          const isUp = gain >= 0;
          return (
            <TouchableOpacity
              key={h.symbol}
              style={s.row}
              onPress={() => navigation.navigate("stock", { symbol: h.symbol })}
            >
              <View style={{ flex: 1 }}>
                <Text style={s.symbol}>{h.symbol}</Text>
                <Text style={s.name}>{h.name}</Text>
                <Text style={s.sharesText}>{h.shares} shares</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={s.valueText}>{fmt$(value)}</Text>
                <Text style={[s.changeText, isUp ? s.green : s.red]}>
                  {isUp ? "+" : ""}{gainPct}%
                </Text>
                <Text style={[s.costText, isUp ? s.green : s.red]}>
                  {isUp ? "+" : ""}{fmt$(gain)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={[styles.row, s.cashRow]}>
          <View style={{ flex: 1 }}>
            <Text style={s.symbol}>USD</Text>
            <Text style={s.name}>Buying Power</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.valueText}>{fmt$(CASH_BALANCE)}</Text>
          </View>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = {
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { color: colors.white, fontSize: 28, fontWeight: "700" },
  chartSection: { alignItems: "center", paddingVertical: 16 },
  tableHeader: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  th: { color: colors.gray, fontSize: 12, fontWeight: "600", flex: 1 },
  thRight: { textAlign: "right" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  symbol: { color: colors.white, fontSize: 16, fontWeight: "700" },
  name: { color: colors.gray, fontSize: 12, marginTop: 2 },
  sharesText: { color: colors.gray, fontSize: 11, marginTop: 2 },
  valueText: { color: colors.white, fontSize: 15, fontWeight: "600", textAlign: "right" },
  changeText: { fontSize: 12, fontWeight: "600", textAlign: "right", marginTop: 2 },
  costText: { fontSize: 11, textAlign: "right", marginTop: 1 },
  green: { color: colors.green },
  red: { color: colors.red },
  cashRow: { padding: 16, backgroundColor: colors.card },
});
