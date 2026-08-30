import { AppContainer, buildContainer } from "@composition/container";
import { db } from "@infrastructure/database/database";
import { seedExerciseCatalog } from "@infrastructure/database/seed/seedExerciseCatalog";
import {
  Sora_300Light,
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
  useFonts,
} from "@expo-google-fonts/sora";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import migrations from "../../../drizzle/migrations";

const AppServicesContext = createContext<AppContainer | null>(null);

export function AppServicesProvider({ children }: { children: React.ReactNode }) {
  const { success, error } = useMigrations(db, migrations);
  const [fontsLoaded, fontError] = useFonts({
    Sora_300Light,
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
  });
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState<Error | null>(null);

  useEffect(() => {
    if (!success) return;
    seedExerciseCatalog()
      .then(() => setSeeded(true))
      .catch((err: unknown) => setSeedError(err instanceof Error ? err : new Error(String(err))));
  }, [success]);

  const container = useMemo(() => buildContainer(db), []);

  const failure = error ?? seedError ?? fontError;
  if (failure) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Não foi possível preparar o banco local</Text>
        <Text style={styles.message}>{failure.message}</Text>
      </View>
    );
  }

  if (!success || !seeded || !fontsLoaded) {
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
