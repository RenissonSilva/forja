import { Button } from "@presentation/components/ui/Button";
import { Icon } from "@presentation/components/ui/Icon";
import { ExerciseCatalogItem } from "@presentation/components/features/ExerciseCatalogItem";
import { MuscleGroupFilter } from "@presentation/components/features/MuscleGroupFilter";
import { WorkoutExerciseFormRow } from "@presentation/components/features/WorkoutExerciseFormRow";
import { useExercises } from "@presentation/hooks/useExercises";
import { useWorkoutPlan } from "@presentation/hooks/useWorkoutPlan";
import { colors } from "@presentation/theme/colors";
import { spacing } from "@presentation/theme/spacing";
import { fontFamily, typography } from "@presentation/theme/typography";
import { MuscleGroup } from "@domain/entities/Exercise";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

type EditorMode = "config" | "catalog";

export default function EditarFichaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plan, addExercise, updateExercise, removeExercise, rename, remove } = useWorkoutPlan(id);
  const [mode, setMode] = useState<EditorMode>("config");
  const [nameDraft, setNameDraft] = useState("");
  const [syncedPlanId, setSyncedPlanId] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<MuscleGroup | null>(null);
  const { exercises: allExercises } = useExercises("");
  const { exercises: searchResults } = useExercises(query, muscleGroupFilter ?? undefined);

  // Adjust local draft state when a different plan finishes loading (React's
  // documented pattern for syncing state from a prop, without an effect).
  if (plan && plan.id !== syncedPlanId) {
    setSyncedPlanId(plan.id);
    setNameDraft(plan.name);
  }

  const exercisesById = useMemo(
    () => new Map(allExercises.map((exercise) => [exercise.id, exercise])),
    [allExercises],
  );

  const planExerciseByExerciseId = useMemo(
    () =>
      new Map((plan?.exercises ?? []).map((planExercise) => [planExercise.exerciseId, planExercise])),
    [plan],
  );

  if (!plan) return null;

  async function saveName() {
    if (!plan || nameDraft.trim().length === 0 || nameDraft === plan.name) return;
    try {
      await rename(nameDraft);
      toast.success("Treino atualizado");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Não foi possível atualizar o treino.");
    }
  }

  async function handleBack() {
    if (mode === "catalog") {
      setMode("config");
      return;
    }
    await saveName();
    router.back();
  }

  async function handleSave() {
    await saveName();
    router.back();
  }

  function toggleExercise(exerciseId: string) {
    const existing = planExerciseByExerciseId.get(exerciseId);
    if (existing) {
      removeExercise(existing.id);
    } else {
      addExercise({ exerciseId, sets: 3, reps: 10, loadKg: 0 });
    }
  }

  function handleDelete() {
    Alert.alert(
      "Excluir treino",
      "Tem certeza que deseja excluir este treino? Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await remove();
              toast.success("Treino excluído");
              router.back();
            } catch (err: unknown) {
              toast.error(err instanceof Error ? err.message : "Não foi possível excluir o treino.");
            }
          },
        },
      ],
    );
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
          <Text style={styles.title}>{mode === "catalog" ? "Alterar exercícios" : "Editar treino"}</Text>
          {mode === "config" ? (
            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Alterar exercícios"
                onPress={() => setMode("catalog")}
                style={styles.editButton}
              >
                <Icon name="pencil" size={15} color={colors.primary} strokeWidth={2.2} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Excluir treino"
                onPress={handleDelete}
                style={styles.deleteButton}
              >
                <Icon name="trash" size={15} color={colors.danger} strokeWidth={2.2} />
              </Pressable>
            </View>
          ) : null}
        </View>

        {mode === "config" ? (
          <>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              onBlur={saveName}
              placeholder="Nome do treino"
              placeholderTextColor={colors.textMuted}
              style={styles.nameInput}
            />

            <View style={styles.exercisesHeader}>
              <Text style={styles.sectionTitle}>Exercícios do treino</Text>
              <Text style={styles.sectionCount}>{plan.exercises.length} exercícios</Text>
            </View>

            <View style={styles.exercisesList}>
              {plan.exercises.map((planExercise, index) => (
                <WorkoutExerciseFormRow
                  key={planExercise.id}
                  order={index + 1}
                  exercise={exercisesById.get(planExercise.exerciseId)}
                  planExercise={planExercise}
                  onChangeSets={(value) => updateExercise(planExercise.id, { sets: value })}
                  onChangeReps={(value) => updateExercise(planExercise.id, { reps: value })}
                  onChangeLoad={(value) => updateExercise(planExercise.id, { loadKg: value })}
                  onChangeSeatHeight={(value) =>
                    updateExercise(planExercise.id, { seatHeight: value })
                  }
                  onChangeSeatDistance={(value) =>
                    updateExercise(planExercise.id, { seatDistance: value })
                  }
                  onChangeSeatIncline={(value) =>
                    updateExercise(planExercise.id, { seatIncline: value })
                  }
                  onChangeSeatLock={(value) =>
                    updateExercise(planExercise.id, { seatLock: value })
                  }
                  onRemove={() => removeExercise(planExercise.id)}
                />
              ))}
            </View>
          </>
        ) : (
          <>
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

            <View style={styles.catalogList}>
              {searchResults.map((exercise) => (
                <ExerciseCatalogItem
                  key={exercise.id}
                  exercise={exercise}
                  selected={planExerciseByExerciseId.has(exercise.id)}
                  onAdd={() => toggleExercise(exercise.id)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {mode === "config" ? (
          <Button label="Salvar" onPress={handleSave} />
        ) : (
          <Button label="Continuar" onPress={() => setMode("config")} />
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
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
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
    flex: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: 19,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  headerActions: { flexDirection: "row", gap: spacing.sm },
  editButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
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
  },
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
    marginBottom: 6,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  searchCount: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.textFaint },
  catalogList: { gap: 7 },
  exercisesHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { ...typography.heading, color: colors.textPrimary },
  sectionCount: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textMuted },
  exercisesList: { gap: 10 },
});
