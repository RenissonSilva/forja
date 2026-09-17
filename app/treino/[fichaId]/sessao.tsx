import { Button } from "@presentation/components/ui/Button";
import { Icon } from "@presentation/components/ui/Icon";
import {
  WorkoutExerciseFormRow,
  WorkoutExerciseFormValues,
} from "@presentation/components/features/WorkoutExerciseFormRow";
import { useExercises } from "@presentation/hooks/useExercises";
import { useProfile } from "@presentation/hooks/useProfile";
import { useWorkoutPlan } from "@presentation/hooks/useWorkoutPlan";
import { useAppServices } from "@presentation/providers/AppServicesProvider";
import { colors } from "@presentation/theme/colors";
import { spacing } from "@presentation/theme/spacing";
import { fontFamily, typography } from "@presentation/theme/typography";
import { WorkoutPlanExercise } from "@domain/entities/WorkoutPlanExercise";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

interface SeatAdjustments {
  seatHeight: number | null;
  seatDistance: number | null;
  seatIncline: number | null;
  seatLock: number | null;
}

function formatSeatAdjustments(planExercise: SeatAdjustments): string {
  const parts = [
    planExercise.seatHeight !== null ? `altura ${planExercise.seatHeight}` : null,
    planExercise.seatDistance !== null ? `distância ${planExercise.seatDistance}` : null,
    planExercise.seatIncline !== null ? `inclinação ${planExercise.seatIncline}` : null,
    planExercise.seatLock !== null ? `trava ${planExercise.seatLock}` : null,
  ].filter((part): part is string => part !== null);

  return parts.length > 0 ? ` · ${parts.join(" · ")}` : "";
}

export default function SessaoTreinoScreen() {
  const { fichaId } = useLocalSearchParams<{ fichaId: string }>();
  const { plan, updateExercise } = useWorkoutPlan(fichaId);
  const { profile } = useProfile();
  const services = useAppServices();
  const { exercises: allExercises } = useExercises("");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, WorkoutExerciseFormValues>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
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

  function toggleExpanded(workoutPlanExerciseId: string) {
    setExpandedId((prev) => (prev === workoutPlanExerciseId ? null : workoutPlanExerciseId));
  }

  function toDraftValues(planExercise: WorkoutPlanExercise): WorkoutExerciseFormValues {
    return {
      sets: planExercise.sets,
      reps: planExercise.reps,
      loadKg: planExercise.loadKg,
      seatHeight: planExercise.seatHeight,
      seatDistance: planExercise.seatDistance,
      seatIncline: planExercise.seatIncline,
      seatLock: planExercise.seatLock,
    };
  }

  function updateDraft(planExercise: WorkoutPlanExercise, patch: Partial<WorkoutExerciseFormValues>) {
    setDrafts((prev) => ({
      ...prev,
      [planExercise.id]: { ...(prev[planExercise.id] ?? toDraftValues(planExercise)), ...patch },
    }));
  }

  async function saveDraft(workoutPlanExerciseId: string) {
    const draft = drafts[workoutPlanExerciseId];
    if (!draft) {
      setExpandedId(null);
      return;
    }
    setSavingId(workoutPlanExerciseId);
    try {
      await updateExercise(workoutPlanExerciseId, draft);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[workoutPlanExerciseId];
        return next;
      });
      setExpandedId(null);
      toast.success("Exercício atualizado");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar o exercício.");
    } finally {
      setSavingId(null);
    }
  }

  function cancelDraft(workoutPlanExerciseId: string) {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[workoutPlanExerciseId];
      return next;
    });
    setExpandedId(null);
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
            const expanded = expandedId === planExercise.id;
            return (
              <View style={[styles.exerciseCard, done && styles.exerciseCardDone]} key={planExercise.id}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: done }}
                  onPress={() => toggleExercise(planExercise.id)}
                  style={styles.exerciseRow}
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
                      {formatSeatAdjustments(planExercise)}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={expanded ? "Recolher exercício" : "Editar exercício"}
                    onPress={() => toggleExpanded(planExercise.id)}
                    hitSlop={8}
                    style={[styles.expandButton, expanded && styles.expandButtonOpen]}
                  >
                    <Icon
                      name="chevron-down"
                      size={14}
                      color={colors.textSecondary}
                      strokeWidth={2.2}
                    />
                  </Pressable>
                </Pressable>

                {expanded
                  ? (() => {
                      const draft = drafts[planExercise.id] ?? planExercise;
                      return (
                        <View style={styles.expandedForm}>
                          <View style={styles.expandedDivider} />
                          <WorkoutExerciseFormRow
                            exercise={exercise}
                            planExercise={draft}
                            hideHeader
                            onChangeSets={(value) => updateDraft(planExercise, { sets: value })}
                            onChangeReps={(value) => updateDraft(planExercise, { reps: value })}
                            onChangeLoad={(value) => updateDraft(planExercise, { loadKg: value })}
                            onChangeSeatHeight={(value) =>
                              updateDraft(planExercise, { seatHeight: value })
                            }
                            onChangeSeatDistance={(value) =>
                              updateDraft(planExercise, { seatDistance: value })
                            }
                            onChangeSeatIncline={(value) =>
                              updateDraft(planExercise, { seatIncline: value })
                            }
                            onChangeSeatLock={(value) =>
                              updateDraft(planExercise, { seatLock: value })
                            }
                          />
                          <View style={styles.expandedActions}>
                            <View style={styles.expandedActionButton}>
                              <Button
                                label="Cancelar"
                                variant="secondary"
                                onPress={() => cancelDraft(planExercise.id)}
                                disabled={savingId === planExercise.id}
                              />
                            </View>
                            <View style={styles.expandedActionButton}>
                              <Button
                                label="Salvar"
                                onPress={() => saveDraft(planExercise.id)}
                                loading={savingId === planExercise.id}
                              />
                            </View>
                          </View>
                        </View>
                      );
                    })()
                  : null}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Concluir treino" onPress={handleFinish} loading={isFinishing} />
      </View>
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
  list: { gap: 10 },
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
  expandButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  expandButtonOpen: { transform: [{ rotate: "180deg" }] },
  expandedForm: {},
  expandedDivider: { height: 1, backgroundColor: colors.borderSubtle, marginBottom: 14 },
  expandedActions: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  expandedActionButton: { flex: 1 },
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
