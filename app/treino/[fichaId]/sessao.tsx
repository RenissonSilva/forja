import { Button } from "@presentation/components/ui/Button";
import { Icon } from "@presentation/components/ui/Icon";
import { useExercises } from "@presentation/hooks/useExercises";
import { useProfile } from "@presentation/hooks/useProfile";
import { useWorkoutPlan } from "@presentation/hooks/useWorkoutPlan";
import { useAppServices } from "@presentation/providers/AppServicesProvider";
import { colors } from "@presentation/theme/colors";
import { spacing } from "@presentation/theme/spacing";
import { fontFamily, typography } from "@presentation/theme/typography";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SessaoTreinoScreen() {
  const { fichaId } = useLocalSearchParams<{ fichaId: string }>();
  const { plan } = useWorkoutPlan(fichaId);
  const { profile } = useProfile();
  const services = useAppServices();
  const { exercises: allExercises } = useExercises("");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [isFinishing, setIsFinishing] = useState(false);

  const exercisesById = useMemo(
    () => new Map(allExercises.map((exercise) => [exercise.id, exercise])),
    [allExercises],
  );

  if (!plan || !profile) return null;

  function toggleExercise(workoutPlanExerciseId: string) {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(workoutPlanExerciseId)) next.delete(workoutPlanExerciseId);
      else next.add(workoutPlanExerciseId);
      return next;
    });
  }

  async function handleFinish() {
    if (!plan || !profile) return;
    setIsFinishing(true);
    try {
      await services.attendance.completeSession.execute({
        profileId: profile.id,
        workoutPlanId: plan.id,
      });
      router.replace("/(tabs)");
    } finally {
      setIsFinishing(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <Icon name="x" size={14} color={colors.textPrimary} strokeWidth={2.2} />
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            {plan.name}
          </Text>
        </View>
        <Text style={styles.subtitle}>
          {completedIds.size} de {plan.exercises.length} concluídos
        </Text>

        <View style={styles.list}>
          {plan.exercises.map((planExercise, index) => {
            const exercise = exercisesById.get(planExercise.exerciseId);
            const done = completedIds.has(planExercise.id);
            return (
              <Pressable
                key={planExercise.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done }}
                onPress={() => toggleExercise(planExercise.id)}
                style={[styles.exerciseRow, done && styles.exerciseRowDone]}
              >
                <View style={[styles.checkbox, done && styles.checkboxDone]}>
                  {done ? (
                    <Icon name="check" size={13} color={colors.onPrimary} strokeWidth={2.4} />
                  ) : null}
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={[styles.exerciseName, done && styles.exerciseNameDone]}>
                    {index + 1}. {exercise?.name ?? "Exercício"}
                  </Text>
                  <Text style={styles.exerciseMeta}>
                    {planExercise.sets} séries · {planExercise.reps} reps · {planExercise.loadKg} kg
                    {planExercise.seatAdjustment
                      ? ` · cadeira: ${planExercise.seatAdjustment}`
                      : ""}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Button label="Concluir treino" onPress={handleFinish} loading={isFinishing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xxl, gap: spacing.lg },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...typography.screenTitle, color: colors.textPrimary, flexShrink: 1 },
  subtitle: { fontFamily: fontFamily.light, fontSize: 11.5, color: colors.textFaint },
  list: { gap: 10 },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
  },
  exerciseRowDone: { borderColor: colors.primaryBorder, backgroundColor: colors.primaryMuted },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  exerciseInfo: { flex: 1, gap: 2 },
  exerciseName: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.textPrimary },
  exerciseNameDone: { textDecorationLine: "line-through", color: colors.textSecondary },
  exerciseMeta: { fontFamily: fontFamily.light, fontSize: 12, color: colors.textMuted },
});
