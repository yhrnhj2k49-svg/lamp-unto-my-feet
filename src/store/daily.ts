// A verse each morning.
//
// Local notifications only: the phone schedules them itself, the verse is
// chosen on the device, and nothing is sent anywhere — the same promise the
// rest of the app makes.
//
// A repeating daily alarm would say the same words every morning, so instead a
// fortnight of individual notifications is scheduled, one per day, each with
// that day's verse. They are topped back up every time the app opens, which in
// practice keeps them running indefinitely.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { dayNumber, notificationText, verseForDay } from "../engine/daily";

const KEY = "lamp.daily.v1";
const CHANNEL = "daily-verse";
const DAYS_AHEAD = 14;

export type DailySettings = { on: boolean; hour: number; minute: number };

const DEFAULTS: DailySettings = { on: false, hour: 7, minute: 0 };

let state: DailySettings = { ...DEFAULTS };
let snapshot: DailySettings & { ready: boolean } = { ...DEFAULTS, ready: false };
const listeners = new Set<() => void>();
const emit = (ready = true) => {
  snapshot = { ...state, ready };
  listeners.forEach((l) => l());
};

export function useDaily() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snapshot,
    () => snapshot
  );
}

/** Shown while the app is open too, rather than silently swallowed. */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensureChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: "A verse each morning",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: null,
    vibrationPattern: [0, 200],
    showBadge: false,
  });
}

/** Cancels what is scheduled and lays down the next fortnight. */
export async function reschedule() {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!state.on) return;

  await ensureChannel();

  const now = new Date();
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const when = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, state.hour, state.minute, 0, 0);
    // Today's has already gone if the hour has passed; start tomorrow instead.
    if (when.getTime() <= now.getTime() + 5000) continue;
    const verse = verseForDay(dayNumber(when));
    const { title, body } = notificationText(verse);
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { ref: verse.ref },
        ...(Platform.OS === "android" ? { channelId: CHANNEL } : {}),
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
    });
  }
}

const save = () => AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});

export async function hydrateDaily() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const p = raw ? (JSON.parse(raw) as Partial<DailySettings>) : null;
    if (p && typeof p.on === "boolean" && typeof p.hour === "number" && typeof p.minute === "number") {
      state = { on: p.on, hour: p.hour, minute: p.minute };
    }
  } catch {
    state = { ...DEFAULTS };
  }
  emit();
  // Top the fortnight back up on every launch.
  if (state.on) await reschedule().catch(() => {});
}

/**
 * Turn the morning verse on. Returns false when permission was refused, so the
 * screen can say so rather than leaving a switch on that does nothing.
 */
export async function enableDaily(hour = state.hour, minute = state.minute): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const existing = await Notifications.getPermissionsAsync();
  const granted =
    existing.granted || (await Notifications.requestPermissionsAsync()).granted;
  if (!granted) return false;
  state = { on: true, hour, minute };
  emit();
  save();
  await reschedule();
  return true;
}

export async function disableDaily() {
  state = { ...state, on: false };
  emit();
  save();
  await reschedule();
}

export async function setDailyTime(hour: number, minute: number) {
  state = { ...state, hour, minute };
  emit();
  save();
  if (state.on) await reschedule();
}

/** For the About screen: how many mornings are actually queued. */
export async function scheduledCount(): Promise<number> {
  if (Platform.OS === "web") return 0;
  return (await Notifications.getAllScheduledNotificationsAsync()).length;
}
