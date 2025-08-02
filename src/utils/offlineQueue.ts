import AsyncStorage from '@react-native-async-storage/async-storage';

// Queue for offline changes
const OFFLINE_QUEUE_KEY = 'offline_queue';

export async function queueOfflineChange(change: any) {
  const queueRaw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  const queue = queueRaw ? JSON.parse(queueRaw) : [];
  queue.push(change);
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export async function getOfflineQueue() {
  const queueRaw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  return queueRaw ? JSON.parse(queueRaw) : [];
}

export async function clearOfflineQueue() {
  await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
}
