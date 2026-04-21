import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { registerBackgroundFetchAsync } from "../src/tasks/backgroundFetch";

export default function RootLayout() {
  useEffect(() => {
    registerBackgroundFetchAsync().catch(() => {});
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="stock/[symbol]" />
    </Stack>
  );
}
