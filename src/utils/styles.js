
import { StyleSheet } from "react-native";

export const colors = {
  bg: "#0A0A0A",
  card: "#141414",
  cardAlt: "#1C1C1E",
  green: "#00D4AA",
  red: "#FF4D4F",
  white: "#FFFFFF",
  gray: "#888888",
  darkGray: "#3A3A3C",
  border: "#2C2C2E",
  accent: "#007AFF",
};

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: colors.gray,
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  bigNumber: {
    color: colors.white,
    fontSize: 36,
    fontWeight: "700",
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  seeAll: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 20,
  },
  symbolText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  nameText: {
    color: colors.gray,
    fontSize: 12,
    marginTop: 2,
  },
  priceText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
  },
  changeText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    marginTop: 2,
  },
  green: { color: colors.green },
  red: { color: colors.red },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
    paddingBottom: 30,
    paddingTop: 8,
    justifyContent: "space-around",
  },
  tabItem: {
    alignItems: "center",
    padding: 8,
  },
  tabLabel: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 4,
  },
  tabLabelActive: {
    fontSize: 11,
    color: colors.accent,
    marginTop: 4,
    fontWeight: "600",
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: colors.cardAlt,
  },
  pillActive: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: "#00D4AA22",
  },
  pillText: {
    color: colors.gray,
    fontSize: 13,
    fontWeight: "600",
  },
  pillTextActive: {
    color: colors.green,
    fontSize: 13,
    fontWeight: "600",
  },
});
