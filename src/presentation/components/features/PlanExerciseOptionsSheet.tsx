import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Exercise, MuscleGroup } from "@domain/entities/Exercise";
import { useExercises } from "../../hooks/useExercises";
import { colors } from "../../theme/colors";
import { muscleGroupLabels } from "../../theme/muscleGroups";
import { radius, spacing } from "../../theme/spacing";
import { fontFamily } from "../../theme/typography";
import { BottomSheet } from "../ui/BottomSheet";
import { Icon } from "../ui/Icon";
import { ExerciseCatalogItem } from "./ExerciseCatalogItem";
import { MuscleGroupFilter } from "./MuscleGroupFilter";

interface PlanExerciseOptionsSheetProps {
  visible: boolean;
  /** The exercise the options act on. */
  exercise: Exercise | undefined;
  /** Exercises already in the workout, left out of the swap list. */
  excludedExerciseIds: ReadonlySet<string>;
  onClose: () => void;
  onSwap: (replacement: Exercise) => void;
  onRemove: () => void;
}

type Step = "menu" | "swap";

/**
 * Options for one exercise of a workout: swap it for another (picked from the
 * catalog, in the same sheet) or remove it.
 */
export function PlanExerciseOptionsSheet({
  visible,
  exercise,
  excludedExerciseIds,
  onClose,
  onSwap,
  onRemove,
}: PlanExerciseOptionsSheetProps) {
  const [step, setStep] = useState<Step>("menu");

  // Always reopens on the menu.
  function close() {
    setStep("menu");
    onClose();
  }

  return (
    <BottomSheet visible={visible} onClose={close}>
      {step === "menu" ? (
        <View style={styles.menu}>
          <View style={styles.menuHeader}>
            <Text style={styles.title} numberOfLines={2}>
              {exercise?.name ?? "Exercício"}
            </Text>
            {exercise ? (
              <Text style={styles.subtitle}>{muscleGroupLabels[exercise.muscleGroup]}</Text>
            ) : null}
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setStep("swap")}
            style={styles.option}
          >
            <View style={styles.optionIcon}>
              <Icon name="swap" size={16} color={colors.primary} strokeWidth={2.2} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionLabel}>Trocar exercício</Text>
              <Text style={styles.optionHint}>Escolher outro para ficar no lugar deste</Text>
            </View>
            <Icon name="chevron-right" size={14} color={colors.textFaint} strokeWidth={2.2} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              close();
              onRemove();
            }}
            style={styles.option}
          >
            <View style={[styles.optionIcon, styles.optionIconDanger]}>
              <Icon name="trash" size={16} color={colors.dangerText} strokeWidth={2.2} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionLabel, styles.optionLabelDanger]}>Excluir do treino</Text>
            </View>
          </Pressable>
        </View>
      ) : (
        <SwapStep
          exercise={exercise}
          excludedExerciseIds={excludedExerciseIds}
          onBack={() => setStep("menu")}
          onPick={(replacement) => {
            close();
            onSwap(replacement);
          }}
        />
      )}
    </BottomSheet>
  );
}

interface SwapStepProps {
  exercise: Exercise | undefined;
  excludedExerciseIds: ReadonlySet<string>;
  onBack: () => void;
  onPick: (replacement: Exercise) => void;
}

function SwapStep({ exercise, excludedExerciseIds, onBack, onPick }: SwapStepProps) {
  const [query, setQuery] = useState("");
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<MuscleGroup | null>(
    exercise?.muscleGroup ?? null,
  );
  const { exercises } = useExercises(query, muscleGroupFilter ?? undefined);
  const candidates = exercises.filter((candidate) => !excludedExerciseIds.has(candidate.id));
  // A fixed height keeps the sheet from jumping as the list is filtered.
  const { height } = useWindowDimensions();

  return (
    <View style={[styles.swap, { height: height * 0.74 }]}>
      <View style={styles.swapHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={onBack}
          style={styles.backButton}
        >
          <Icon name="chevron-left" size={14} color={colors.textPrimary} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.swapHeaderInfo}>
          <Text style={styles.title}>Trocar exercício</Text>
          {exercise ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              no lugar de {exercise.name}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.searchRow}>
        <Icon name="search" size={16} color={colors.textMuted} strokeWidth={2} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar exercício"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.filter}>
        <MuscleGroupFilter value={muscleGroupFilter} onChange={setMuscleGroupFilter} />
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      >
        {candidates.map((candidate) => (
          <ExerciseCatalogItem
            key={candidate.id}
            exercise={candidate}
            pickIcon="swap"
            onAdd={() => onPick(candidate)}
          />
        ))}
        {candidates.length === 0 ? (
          <Text style={styles.empty}>Nenhum exercício encontrado</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  menu: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.sm },
  menuHeader: { paddingTop: spacing.sm, paddingBottom: spacing.sm },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 19,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  subtitle: { fontFamily: fontFamily.light, fontSize: 11.5, color: colors.textFaint, marginTop: 4 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  optionIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm + 1,
    backgroundColor: colors.primaryMutedStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  optionIconDanger: { backgroundColor: colors.dangerMuted },
  optionInfo: { flex: 1, gap: 2 },
  optionLabel: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.textPrimary },
  optionLabelDanger: { color: colors.dangerText },
  optionHint: { fontFamily: fontFamily.light, fontSize: 11.5, color: colors.textMuted },
  swap: { paddingTop: spacing.sm },
  swapHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  swapHeaderInfo: { flex: 1 },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    marginHorizontal: spacing.xl,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  filter: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  list: { flex: 1 },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: 7 },
  empty: {
    fontFamily: fontFamily.light,
    fontSize: 12.5,
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: spacing.xl,
  },
});
