import { ExerciseCatalogItem } from "@presentation/components/features/ExerciseCatalogItem";
import { MuscleGroupFilter } from "@presentation/components/features/MuscleGroupFilter";
import { Icon } from "@presentation/components/ui/Icon";
import { useExercises } from "@presentation/hooks/useExercises";
import { useProfile } from "@presentation/hooks/useProfile";
import { useAppServices } from "@presentation/providers/AppServicesProvider";
import { colors } from "@presentation/theme/colors";
import { spacing } from "@presentation/theme/spacing";
import { fontFamily, typography } from "@presentation/theme/typography";
import { MuscleGroup } from "@domain/entities/Exercise";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NovoTreinoScreen() {
  const { profile } = useProfile();
  const services = useAppServices();
  const [query, setQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<MuscleGroup | null>(null);
  const { exercises: allExercises } = useExercises("");
  const { exercises: searchResults } = useExercises(query, muscleGroupFilter ?? undefined);

  if (!profile) return null;

  async function handleSelectExercise(exerciseId: string) {
    if (isCreating || !profile) return;
    setIsCreating(true);
    setError(null);
    try {
      const plan = await services.workoutPlans.create.execute({
        profileId: profile.id,
        name: "Novo treino",
      });
      await services.workoutPlans.addExercise.execute({
        workoutPlanId: plan.id,
        exerciseId,
        sets: 3,
        reps: 10,
        loadKg: 0,
      });
      router.replace(`/ficha/${plan.id}/editar?fresh=1`);
    } catch (err: unknown) {
      setIsCreating(false);
      setError(err instanceof Error ? err.message : "Não foi possível criar o treino.");
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Icon name="chevron-left" size={15} color={colors.textPrimary} strokeWidth={2.2} />
          </Pressable>
          <Text style={styles.title}>Novo treino</Text>
        </View>

        <Text style={styles.hint}>Escolha ao menos um exercício para criar o treino.</Text>

        <View style={styles.searchRow}>
          <Icon name="search" size={16} color={colors.textMuted} strokeWidth={2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar exercício"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          <Text style={styles.searchCount}>
            {searchResults.length} de {allExercises.length}
          </Text>
        </View>

        <MuscleGroupFilter value={muscleGroupFilter} onChange={setMuscleGroupFilter} />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.catalogList}>
          {searchResults.map((exercise) => (
            <ExerciseCatalogItem
              key={exercise.id}
              exercise={exercise}
              onAdd={() => handleSelectExercise(exercise.id)}
            />
          ))}
        </View>
      </ScrollView>

      {isCreating ? (
        <View style={styles.overlay}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xxl, gap: spacing.md },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: 4 },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 19,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  hint: { ...typography.body, color: colors.textSecondary },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 50,
    borderRadius: 16,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  searchCount: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.textFaint },
  error: { ...typography.body, color: colors.danger },
  catalogList: { gap: 7 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(11,11,13,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
});
