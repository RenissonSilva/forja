import { Button } from "@presentation/components/ui/Button";
import { Icon } from "@presentation/components/ui/Icon";
import { PlanExerciseOptionsSheet } from "@presentation/components/features/PlanExerciseOptionsSheet";
import { WorkoutExerciseFormRow } from "@presentation/components/features/WorkoutExerciseFormRow";
import {
  WorkoutSetList,
  WorkoutSetValues,
  conformSets,
  swappedSets,
} from "@presentation/components/features/WorkoutSetList";
import { useExercisePerformanceHistory } from "@presentation/hooks/useExercisePerformanceHistory";
import { useExercises } from "@presentation/hooks/useExercises";
import { useProfile } from "@presentation/hooks/useProfile";
import { useWorkoutPlan } from "@presentation/hooks/useWorkoutPlan";
import { useAppServices } from "@presentation/providers/AppServicesProvider";
import { useConfirm } from "@presentation/providers/ConfirmProvider";
import { useActiveWorkoutStore } from "@presentation/stores/activeWorkoutStore";
import { colors } from "@presentation/theme/colors";
import { spacing } from "@presentation/theme/spacing";
import { fontFamily, typography } from "@presentation/theme/typography";
import { Exercise } from "@domain/entities/Exercise";
import { WorkoutPlanExercise } from "@domain/entities/WorkoutPlanExercise";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Sortable, { SortableGridRenderItem } from "react-native-sortables";
import { toast } from "sonner-native";

/**
 * Starts each set from what was lifted in the last session for this exercise,
 * so the load progression carries over; falls back to the plan's values.
 */
function initialSets(
  planExercise: WorkoutPlanExercise,
  lastSets: readonly WorkoutSetValues[] | undefined,
  exercise: Exercise | undefined,
): WorkoutSetValues[] {
  const sets = planExercise.sets.map((planned, index) => {
    const previous = lastSets?.[index] ?? lastSets?.[lastSets.length - 1];
    return { ...(previous ?? planned) };
  });
  return conformSets(sets, exercise);
}

export default function SessaoTreinoScreen() {
  const { fichaId } = useLocalSearchParams<{ fichaId: string }>();
  const { plan, updateExercise, removeExercise, swapExercise, reorderExercises } =
    useWorkoutPlan(fichaId);
  const scrollableRef = useAnimatedRef<Animated.ScrollView>();
  const { profile } = useProfile();
  const services = useAppServices();
  const confirm = useConfirm();
  const { exercises: allExercises } = useExercises("");
  const { entries: history } = useExercisePerformanceHistory(profile?.id);
  const navigation = useNavigation();
  const session = useActiveWorkoutStore((state) => state.session);
  const startSession = useActiveWorkoutStore((state) => state.start);
  const updateSession = useActiveWorkoutStore((state) => state.update);
  const [isFinishing, setIsFinishing] = useState(false);
  // The plan exercise whose options sheet (swap / remove) is open.
  const [optionsForId, setOptionsForId] = useState<string | null>(null);

  // The session lives in a persisted store so it survives Android killing the
  // app in the background; a session for another plan or user starts over.
  const current =
    session && session.fichaId === fichaId && session.profileId === profile?.id ? session : null;
  const completedIds = useMemo(() => new Set(current?.completedIds ?? []), [current?.completedIds]);
  const sessionSets = current?.sessionSets ?? {};
  const removedIds = current?.removedIds;
  const exerciseOverrides = current?.exerciseOverrides ?? {};

  useEffect(() => {
    if (profile && !current) startSession(fichaId, profile.id);
  }, [profile, current, fichaId, startSession]);

  // Leaving the screen (close, back, finishing) ends the session for good.
  useEffect(
    () => navigation.addListener("beforeRemove", () => useActiveWorkoutStore.getState().clear()),
    [navigation],
  );

  const exercisesById = useMemo(
    () => new Map(allExercises.map((exercise) => [exercise.id, exercise])),
    [allExercises],
  );

  // History is ordered by date ascending, so the last write per exercise wins.
  const lastSetsByExerciseId = useMemo(
    () => new Map(history.map((entry) => [entry.exerciseId, entry.setDetails])),
    [history],
  );

  // Exercises removed for this session only are hidden, but stay in the plan.
  const planExercises = useMemo(
    () => (plan?.exercises ?? []).filter((planExercise) => !removedIds?.includes(planExercise.id)),
    [plan, removedIds],
  );

  if (!plan || !profile) return null;

  /** The exercise done today, which a swap for this session only may have changed. */
  function exerciseIdFor(planExercise: WorkoutPlanExercise): string {
    return exerciseOverrides[planExercise.id] ?? planExercise.exerciseId;
  }

  function setsFor(planExercise: WorkoutPlanExercise): WorkoutSetValues[] {
    const exerciseId = exerciseIdFor(planExercise);
    return (
      sessionSets[planExercise.id] ??
      initialSets(planExercise, lastSetsByExerciseId.get(exerciseId), exercisesById.get(exerciseId))
    );
  }

  const optionsFor = planExercises.find((planExercise) => planExercise.id === optionsForId);
  const exerciseIdsInSession = new Set(planExercises.map(exerciseIdFor));

  function withErrorToast(save: Promise<void>, fallback: string) {
    save.catch((err: unknown) => toast.error(err instanceof Error ? err.message : fallback));
  }

  function handleSwap(planExercise: WorkoutPlanExercise, replacement: Exercise) {
    const currentName = exercisesById.get(exerciseIdFor(planExercise))?.name ?? "o exercício";
    const lastSets = lastSetsByExerciseId.get(replacement.id);
    // Today's sets keep their count and reps, with the load from the new exercise.
    const swapSession = (onlyToday: boolean) =>
      updateSession((prev) => {
        const overrides = { ...prev.exerciseOverrides };
        if (onlyToday && replacement.id !== planExercise.exerciseId) {
          overrides[planExercise.id] = replacement.id;
        } else {
          delete overrides[planExercise.id];
        }
        return {
          exerciseOverrides: overrides,
          sessionSets: {
            ...prev.sessionSets,
            [planExercise.id]: swappedSets(setsFor(planExercise), replacement, lastSets),
          },
          completedIds: prev.completedIds.filter((id) => id !== planExercise.id),
        };
      });

    confirm({
      title: "Trocar exercício",
      message: `Trocar ${currentName} por ${replacement.name}?`,
      actions: [
        {
          label: "Salvar na ficha",
          variant: "primary",
          onPress: () => {
            swapSession(false);
            withErrorToast(
              swapExercise(
                planExercise.id,
                replacement.id,
                swappedSets(planExercise.sets, replacement, lastSets),
              ),
              "Não foi possível trocar o exercício.",
            );
          },
        },
        { label: "Só neste treino", onPress: () => swapSession(true) },
      ],
    });
  }

  function handleRemove(planExercise: WorkoutPlanExercise) {
    const name = exercisesById.get(exerciseIdFor(planExercise))?.name ?? "o exercício";
    const dropFromSession = () =>
      updateSession((prev) => ({
        removedIds: [...(prev.removedIds ?? []), planExercise.id],
        completedIds: prev.completedIds.filter((id) => id !== planExercise.id),
      }));

    confirm({
      title: "Excluir exercício",
      message: `Remover ${name}?`,
      actions: [
        { label: "Só neste treino", onPress: dropFromSession },
        {
          label: "Excluir da ficha",
          variant: "danger",
          onPress: () => {
            dropFromSession();
            withErrorToast(
              removeExercise(planExercise.id),
              "Não foi possível excluir o exercício.",
            );
          },
        },
      ],
    });
  }

  /**
   * Saves the new order of the exercises on screen; the ones removed for this
   * session only keep their place in the plan.
   */
  function saveOrder(visible: readonly WorkoutPlanExercise[]) {
    if (!plan) return;
    const queue = visible.map((planExercise) => planExercise.id);
    const ordered = plan.exercises.map((planExercise) =>
      removedIds?.includes(planExercise.id) ? planExercise.id : (queue.shift() ?? planExercise.id),
    );
    withErrorToast(reorderExercises(ordered), "Não foi possível salvar a nova ordem.");
  }

  function toggleExercise(workoutPlanExerciseId: string) {
    updateSession((prev) => ({
      completedIds: prev.completedIds.includes(workoutPlanExerciseId)
        ? prev.completedIds.filter((id) => id !== workoutPlanExerciseId)
        : [...prev.completedIds, workoutPlanExerciseId],
    }));
  }

  // Seat adjustments are saved to the plan as they're typed, as on the edit screen.
  function saveSeatAdjustment(
    workoutPlanExerciseId: string,
    patch: Parameters<typeof updateExercise>[1],
  ) {
    updateExercise(workoutPlanExerciseId, patch).catch((err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar a alteração.");
    });
  }

  async function handleFinish() {
    if (!plan || !profile) return;
    setIsFinishing(true);
    try {
      // Finishing the workout logs every exercise in it; the checkmarks are only
      // there to help the user keep track of where they are.
      const performedExercises = planExercises.map((planExercise) => ({
        exerciseId: exerciseIdFor(planExercise),
        sets: setsFor(planExercise),
      }));

      await Promise.all([
        services.attendance.completeSession.execute({
          profileId: profile.id,
          workoutPlanId: plan.id,
        }),
        performedExercises.length > 0
          ? services.progress.logExercisePerformance.execute({
              profileId: profile.id,
              entries: performedExercises,
            })
          : Promise.resolve(),
      ]);
      router.replace("/(tabs)");
    } finally {
      setIsFinishing(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Animated.ScrollView ref={scrollableRef} contentContainerStyle={styles.content}>
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
          {planExercises.filter((planExercise) => completedIds.has(planExercise.id)).length} de{" "}
          {planExercises.length} concluídos
        </Text>

        <Sortable.Grid
          columns={1}
          data={planExercises}
          keyExtractor={(planExercise) => planExercise.id}
          rowGap={10}
          customHandle
          scrollableRef={scrollableRef}
          onDragEnd={({ data }) => saveOrder(data)}
          renderItem={({
            item: planExercise,
            index,
          }: Parameters<SortableGridRenderItem<WorkoutPlanExercise>>[0]) => {
            const exercise = exercisesById.get(exerciseIdFor(planExercise));
            const sets = setsFor(planExercise);
            const done = completedIds.has(planExercise.id);
            const swappedToday = exerciseOverrides[planExercise.id] !== undefined;
            return (
              <View style={[styles.exerciseCard, done && styles.exerciseCardDone]}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: done }}
                  onPress={() => toggleExercise(planExercise.id)}
                  style={styles.exerciseRow}
                >
                  <Sortable.Handle>
                    <View style={styles.dragHandleTouchArea}>
                      <Icon name="grip" size={16} color={colors.textFaint} />
                    </View>
                  </Sortable.Handle>
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
                      {sets.length} {sets.length === 1 ? "série" : "séries"}
                      {swappedToday ? " · trocado só hoje" : ""}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Opções do exercício"
                    onPress={() => setOptionsForId(planExercise.id)}
                    hitSlop={6}
                    style={styles.optionsButton}
                  >
                    <Icon name="more" size={15} color={colors.textSecondary} />
                  </Pressable>
                </Pressable>

                <View style={styles.setList}>
                  <WorkoutSetList
                    sets={sets}
                    exercise={exercise}
                    onChange={(next) =>
                      updateSession((prev) => ({
                        sessionSets: { ...prev.sessionSets, [planExercise.id]: next },
                      }))
                    }
                  />
                </View>

                {/* The plan's seat adjustments are for its own exercise, not today's swap. */}
                {swappedToday ? null : (
                  <WorkoutExerciseFormRow
                    exercise={exercise}
                    planExercise={planExercise}
                    hideHeader
                    hideSets
                    onChangeSets={() => undefined}
                    onChangeSeatHeight={(value) =>
                      saveSeatAdjustment(planExercise.id, { seatHeight: value })
                    }
                    onChangeSeatDistance={(value) =>
                      saveSeatAdjustment(planExercise.id, { seatDistance: value })
                    }
                    onChangeSeatIncline={(value) =>
                      saveSeatAdjustment(planExercise.id, { seatIncline: value })
                    }
                    onChangeSeatLock={(value) =>
                      saveSeatAdjustment(planExercise.id, { seatLock: value })
                    }
                  />
                )}
              </View>
            );
          }}
        />
      </Animated.ScrollView>

      <View style={styles.footer}>
        <Button label="Concluir treino" onPress={handleFinish} loading={isFinishing} />
      </View>

      <PlanExerciseOptionsSheet
        visible={optionsFor !== undefined}
        exercise={optionsFor ? exercisesById.get(exerciseIdFor(optionsFor)) : undefined}
        excludedExerciseIds={exerciseIdsInSession}
        onClose={() => setOptionsForId(null)}
        onSwap={(replacement) => {
          if (optionsFor) handleSwap(optionsFor, replacement);
        }}
        onRemove={() => {
          if (optionsFor) handleRemove(optionsFor);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xxl, gap: spacing.lg },
  footer: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl },
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
  dragHandleTouchArea: { paddingVertical: 4, marginRight: -4 },
  exerciseCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  exerciseCardDone: { borderColor: colors.primaryBorder, backgroundColor: colors.primaryMuted },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  setList: { gap: 8, paddingHorizontal: 14, paddingBottom: 14 },
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
  optionsButton: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: colors.control,
    alignItems: "center",
    justifyContent: "center",
  },
});
