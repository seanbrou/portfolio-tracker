import React from "react";
import { View, Text } from "react-native";
import LiquidGlass from "../../src/components/LiquidGlass";
import { Tabs } from "expo-router";

function TabIcon({ label, active, icon }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 6 }}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={{ fontSize: 11, fontWeight: active ? "600" : "400", color: active ? "#00D4AA" : "#888", marginTop: 2 }}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopColor: "transparent",
          borderTopWidth: 0,
          paddingTop: 8,
          height: 85,
          paddingBottom: 24,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: "#00D4AA",
        tabBarInactiveTintColor: "#888",
        tabBarLabelStyle: { display: "none" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ focused }) => <TabIcon label="Home" active={focused} icon="📊" /> }} />
      <Tabs.Screen name="holdings" options={{ title: "Holdings", tabBarIcon: ({ focused }) => <TabIcon label="Holdings" active={focused} icon="💼" /> }} />
      <Tabs.Screen name="transactions" options={{ title: "Transactions", tabBarIcon: ({ focused }) => <TabIcon label="Activity" active={focused} icon="📋" /> }} />
    </Tabs>
  );
}
