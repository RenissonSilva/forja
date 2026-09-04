import { AppContainer, buildContainer } from "@composition/container";
import { supabase } from "@infrastructure/supabase/supabaseClient";
import {
  Sora_300Light,
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
  useFonts,
} from "@expo-google-fonts/sora";
import React, { createContext, useContext, useEffect, useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "../stores/authStore";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

const AppServicesContext = createContext<AppContainer | null>(null);

export function AppServicesProvider({ children }: { children: React.ReactNode }) {
  const [fontsLoaded, fontError] = useFonts({
    Sora_300Light,
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
  });
  const setUser = useAuthStore((state) => state.setUser);

  const container = useMemo(() => buildContainer(supabase), []);

  useEffect(() => {
    container.auth.getCurrentUser.execute().then(setUser);
    const unsubscribe = container.auth.onAuthStateChange(setUser);
    return unsubscribe;
  }, [container, setUser]);

  if (fontError) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Não foi possível preparar o app</Text>
        <Text style={styles.message}>{fontError.message}</Text>
      </View>
    );
  }

  if (!fontsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return <AppServicesContext.Provider value={container}>{children}</AppServicesContext.Provider>;
}

export function useAppServices(): AppContainer {
  const container = useContext(AppServicesContext);
  if (!container) {
    throw new Error("useAppServices must be used within an AppServicesProvider");
  }
  return container;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: spacing.xxl,
    gap: spacing.md,
  },
  title: { ...typography.heading, color: colors.textPrimary, textAlign: "center" },
  message: { ...typography.body, color: colors.textSecondary, textAlign: "center" },
});
