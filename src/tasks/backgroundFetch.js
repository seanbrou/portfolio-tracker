import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchQuotes } from '../services/stockApi';

const TASK_NAME = 'portfolio-background-quote-fetch';
const HOLDINGS = ['TSLA', 'HOOD', 'IVV', 'NBIS'];
const CACHE_KEY = '@portfolio_quotes';
const CACHE_TS_KEY = '@portfolio_quotes_ts';

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const data = await fetchQuotes(HOLDINGS);
    if (Object.keys(data).length > 0) {
      const existingRaw = await AsyncStorage.getItem(CACHE_KEY);
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      const merged = { ...existing, ...data };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(merged));
      await AsyncStorage.setItem(CACHE_TS_KEY, String(Date.now()));
    }
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (e) {
    console.warn('Background fetch failed', e);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundFetchAsync() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
  if (isRegistered) return;
  await BackgroundFetch.registerTaskAsync(TASK_NAME, {
    minimumInterval: 60 * 30, // 30 minutes
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

export async function unregisterBackgroundFetchAsync() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
  if (!isRegistered) return;
  await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
}
