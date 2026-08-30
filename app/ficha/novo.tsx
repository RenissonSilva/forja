import { useProfile } from "@presentation/hooks/useProfile";
import { useAppServices } from "@presentation/providers/AppServicesProvider";
import { colors } from "@presentation/theme/colors";
import { spacing } from "@presentation/theme/spacing";
import { typography } from "@presentation/theme/typography";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function NovoTreinoScreen() {
  const { profile } = useProfile();
  const services = useAppServices();
  const [error, setError] = useState<string | null>(null);
  const hasCreated = useRef(false);

  useEffect(() => {
    if (!profile || hasCreated.current) return;
    hasCreated.current = true;

    services.workoutPlans.create
      .execute({ profileId: profile.id, name: "Novo treino" })
      .then((plan) => router.replace(`/ficha/${plan.id}/editar`))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Não foi possível criar o treino.");
      });
  }, [profile, services]);

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <ActivityIndicator color={colors.primary} size="large" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
  },
  error: { ...typography.body, color: colors.danger, textAlign: "center" },
});
