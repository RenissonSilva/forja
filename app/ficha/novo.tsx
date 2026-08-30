import { ExerciseCatalogItem } from "@presentation/components/features/ExerciseCatalogItem";
import { MuscleGroupFilter } from "@presentation/components/features/MuscleGroupFilter";
import { WorkoutExerciseFormRow } from "@presentation/components/features/WorkoutExerciseFormRow";
import { Button } from "@presentation/components/ui/Button";
import { Icon } from "@presentation/components/ui/Icon";
import { useExercises } from "@presentation/hooks/useExercises";
import { useProfile } from "@presentation/hooks/useProfile";
import { useAppServices } from "@presentation/providers/AppServicesProvider";
import { colors } from "@presentation/theme/colors";
import { spacing } from "@presentation/theme/spacing";
import { fontFamily, typography } from "@presentation/theme/typography";
import { MuscleGroup } from "@domain/entities/Exercise";
import { WorkoutPlanExercise } from "@domain/entities/WorkoutPlanExercise";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ExerciseConfig {
  sets: number;
  reps: number;
  loadKg: number;
  seatHeight: number | null;
  seatDistance: number | null;
  seatIncline: number | null;
  seatLock: number | null;
}

const DEFAULT_CONFIG: ExerciseConfig = {
  sets: 3,
  reps: 10,
  loadKg: 0,
  seatHeight: null,
  seatDistance: null,
  seatIncline: null,
  seatLock: null,
};
const TOTAL_STEPS = 2;

export default function NovoTreinoScreen() {
  const { profile } = useProfile();
  const services = useAppServices();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [configs, setConfigs] = useState<Record<string, ExerciseConfig>>({});
  const [query, setQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<MuscleGroup | null>(null);
  const { exercises: allExercises } = useExercises("");
  const { exercises: searchResults } = useExercises(query, muscleGroupFilter ?? undefined);

  if (!profile) return null;

  const exercisesById = new Map(allExercises.map((exercise) => [exercise.id, exercise]));
  const canContinue = name.trim().length > 0 && selectedExerciseIds.length > 0;

  function toggleExercise(exerciseId: string) {
    setSelectedExerciseIds((current) =>
      current.includes(exerciseId)
        ? current.filter((id) => id !== exerciseId)
        : [...current, exerciseId],
    );
    setConfigs((current) =>
      current[exerciseId] ? current : { ...current, [exerciseId]: DEFAULT_CONFIG },
    );
  }

  function removeExercise(exerciseId: string) {
    setSelectedExerciseIds((current) => current.filter((id) => id !== exerciseId));
  }

  function updateConfig(exerciseId: string, patch: Partial<ExerciseConfig>) {
    setConfigs((current) => ({
      ...current,
      [exerciseId]: { ...(current[exerciseId] ?? DEFAULT_CONFIG), ...patch },
    }));
  }

  function handleBack() {
    if (step === 2) {
      setError(null);
      setStep(1);
      return;
    }
    router.back();
  }

  function handleNext() {
    if (!canContinue) return;
    setError(null);
    setStep(2);
  }

  async function handleSave() {
    if (!profile || isSaving || selectedExerciseIds.length === 0) return;
    setIsSaving(true);
    setError(null);
    try {
      const plan = await services.workoutPlans.create.execute({
        profileId: profile.id,
        name: name.trim(),
      });
      for (const exerciseId of selectedExerciseIds) {
        const config = configs[exerciseId] ?? DEFAULT_CONFIG;
        await services.workoutPlans.addExercise.execute({
          workoutPlanId: plan.id,
          exerciseId,
          sets: config.sets,
          reps: config.reps,
          loadKg: config.loadKg,
          seatHeight: config.seatHeight,
          seatDistance: config.seatDistance,
          seatIncline: config.seatIncline,
          seatLock: config.seatLock,
        });
      }
      router.back();
    } catch (err: unknown) {
      setIsSaving(false);
      setError(err instanceof Error ? err.message : "Não foi possível criar o treino.");
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={handleBack}
            style={styles.backButton}
          >
            <Icon name="chevron-left" size={15} color={colors.textPrimary} strokeWidth={2.2} />
          </Pressable>
          <View style={styles.progressDots}>
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
              <View key={index} style={[styles.dot, index < step && styles.dotActive]} />
            ))}
          </View>
        </View>

        <Text style={styles.title}>{step === 1 ? "Novo treino" : "Configurar exercícios"}</Text>

        {step === 1 ? (
          <>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nome do treino"
              placeholderTextColor={colors.textMuted}
              style={styles.nameInput}
              autoFocus
            />

            <MuscleGroupFilter value={muscleGroupFilter} onChange={setMuscleGroupFilter} />

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


            <View style={styles.catalogList}>
              {searchResults.map((exercise) => (
                <ExerciseCatalogItem
                  key={exercise.id}
                  exercise={exercise}
                  selected={selectedExerciseIds.includes(exercise.id)}
                  onAdd={() => toggleExercise(exercise.id)}
                />
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.hint}>
              Defina séries, repetições, peso e regulagens para cada exercício antes de
              salvar o treino.
            </Text>

            <View style={styles.exercisesList}>
              {selectedExerciseIds.map((exerciseId, index) => {
                const config = configs[exerciseId] ?? DEFAULT_CONFIG;
                const planExercise = WorkoutPlanExercise.restore({
                  id: exerciseId,
                  exerciseId,
                  order: index,
                  ...config,
                });
                return (
                  <WorkoutExerciseFormRow
                    key={exerciseId}
                    order={index + 1}
                    exercise={exercisesById.get(exerciseId)}
                    planExercise={planExercise}
                    onChangeSets={(value) => updateConfig(exerciseId, { sets: value })}
                    onChangeReps={(value) => updateConfig(exerciseId, { reps: value })}
                    onChangeLoad={(value) => updateConfig(exerciseId, { loadKg: value })}
                    onChangeSeatHeight={(value) => updateConfig(exerciseId, { seatHeight: value })}
                    onChangeSeatDistance={(value) =>
                      updateConfig(exerciseId, { seatDistance: value })
                    }
                    onChangeSeatIncline={(value) =>
                      updateConfig(exerciseId, { seatIncline: value })
                    }
                    onChangeSeatLock={(value) => updateConfig(exerciseId, { seatLock: value })}
                    onRemove={() => removeExercise(exerciseId)}
                  />
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {step === 1 ? (
          <Button label="Continuar" onPress={handleNext} disabled={!canContinue} />
        ) : (
          <Button
            label="Salvar treino"
            onPress={handleSave}
            disabled={selectedExerciseIds.length === 0 || isSaving}
            loading={isSaving}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.xxl, gap: spacing.md },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
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
  progressDots: { flexDirection: "row", gap: 6 },
  dot: { width: 26, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong },
  dotActive: { backgroundColor: colors.primary },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 19,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  nameInput: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.lg
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
    marginBottom: spacing.lg,
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
  exercisesList: { gap: 10 },
});
