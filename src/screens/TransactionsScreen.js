import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableWithoutFeedback, StatusBar,
} from "react-native";
import { TRANSACTIONS } from "../data/transactions";
import { colors } from "../utils/styles";
import LiquidGlass from "../components/LiquidGlass";

const typeColors = {
  BUY: "#00D4AA",
  SELL: "#FF4D4F",
  DEPOSIT: "#007AFF",
  WITHDRAW: "#FF9F0A",
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function TransactionsScreen() {
  const [filter, setFilter] = useState("ALL");
  const filters = ["ALL", "BUY", "SELL", "DEPOSIT", "WITHDRAW"];

  const filtered = filter === "ALL" ? TRANSACTIONS : TRANSACTIONS.filter(t => t.way === filter);
  // sort newest first
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <Text style={s.headerTitle}>Transactions</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterBar}>
        {filters.map(f => (
          <TouchableWithoutFeedback key={f} onPress={() => setFilter(f)}>
            <View style={[s.pill, filter === f && s.pillActive]}>
              <Text style={[s.pillText, filter === f && s.pillTextActive]}>{f}</Text>
            </View>
          </TouchableWithoutFeedback>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <LiquidGlass style={s.summary} intensity={45}>
          <Text style={s.summaryText}>{filtered.length} transactions</Text>
          <Text style={s.summaryText}>
            Total invested: ${TRANSACTIONS.filter(t => t.way === "BUY").reduce((a, t) => a + t.quote_amount, 0).toFixed(2)}
          </Text>
        </LiquidGlass>

        {filtered.map((t, i) => {
          const accent = typeColors[t.way] || colors.gray;
          return (
            <LiquidGlass key={i} style={s.txCard} intensity={40} radius={14}>
              <View style={[s.txIcon, { backgroundColor: accent + "22" }]}>
                <Text style={[s.txIconText, { color: accent }]}>{t.way === "BUY" ? "↓" : t.way === "SELL" ? "↑" : t.way === "DEPOSIT" ? "+" : "-"}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.txSymbol}>{t.way === "BUY" || t.way === "SELL" ? t.base_currency : "USD"}</Text>
                <Text style={s.txType}>
                  {t.way} {t.way === "BUY" || t.way === "SELL" ? `${t.base_amount} ${t.base_currency}` : `$${t.base_amount.toFixed(2)}`}
                </Text>
                <Text style={s.txDate}>{formatDate(t.date)} at {formatTime(t.date)}</Text>
                {t.notes ? <Text style={s.txNotes}>{t.notes}</Text> : null}
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[s.txAmount, { color: accent }]}>
                  {t.way === "BUY" || t.way === "WITHDRAW" ? "-" : "+"}${t.quote_amount.toFixed(2)}
                </Text>
                <Text style={s.txExchange}>{t.exchange || "—"}</Text>
              </View>
            </LiquidGlass>
          );
        })}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { color: colors.white, fontSize: 28, fontWeight: "700" },
  filterBar: { paddingHorizontal: 20, marginBottom: 12, flexDirection: "row", gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.cardAlt, marginRight: 4 },
  pillActive: { backgroundColor: "#00D4AA22" },
  pillText: { color: colors.gray, fontSize: 13, fontWeight: "600" },
  pillTextActive: { color: colors.green, fontSize: 13, fontWeight: "600" },
  summary: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryText: { color: colors.gray, fontSize: 12 },
  txCard: { flexDirection: "row", alignItems: "flex-start", padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  txIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  txIconText: { color: colors.green, fontSize: 18, fontWeight: "700" },
  txSymbol: { color: colors.white, fontSize: 15, fontWeight: "700" },
  txType: { color: colors.gray, fontSize: 12, marginTop: 2 },
  txDate: { color: "#555", fontSize: 11, marginTop: 2 },
  txNotes: { color: "#666", fontSize: 11, marginTop: 4, fontStyle: "italic" },
  txAmount: { fontSize: 14, fontWeight: "600" },
  txExchange: { color: "#555", fontSize: 11, marginTop: 2 },
  green: { color: colors.green },
});
