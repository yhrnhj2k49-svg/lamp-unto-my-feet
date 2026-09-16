import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  GentiumBookPlus_400Regular,
  GentiumBookPlus_400Regular_Italic,
  GentiumBookPlus_700Bold,
} from "@expo-google-fonts/gentium-book-plus";
import {
  BodoniModa_400Regular,
  BodoniModa_400Regular_Italic,
  BodoniModa_500Medium,
} from "@expo-google-fonts/bodoni-moda";
import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
} from "@expo-google-fonts/archivo";
import { hydrate } from "../src/store/kept";
import { hydrateBibles } from "../src/bible/store";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  // Gentium Book Plus was drawn by SIL for scripture typesetting, which is a
  // reason to use it here beyond the way it looks.
  const [loaded, error] = useFonts({
    Gentium_400: GentiumBookPlus_400Regular,
    Gentium_400i: GentiumBookPlus_400Regular_Italic,
    Gentium_700: GentiumBookPlus_700Bold,
    Bodoni_400: BodoniModa_400Regular,
    Bodoni_400i: BodoniModa_400Regular_Italic,
    Bodoni_500: BodoniModa_500Medium,
    Archivo_400: Archivo_400Regular,
    Archivo_500: Archivo_500Medium,
    Archivo_600: Archivo_600SemiBold,
  });

  useEffect(() => {
    void hydrate();
    void hydrateBibles();
  }, []);

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
