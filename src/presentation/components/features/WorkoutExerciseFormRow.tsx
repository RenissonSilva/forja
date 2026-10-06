import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Exercise } from "@domain/entities/Exercise";
import { colors } from "../../theme/colors";
import { muscleGroupLabels } from "../../theme/muscleGroups";
import { fontFamily } from "../../theme/typography";
import { Icon } from "../ui/Icon";
import { ExerciseHelpButton } from "./ExerciseHelpButton";
import { WorkoutSetList, WorkoutSetValues } from "./WorkoutSetList";

export interface WorkoutExerciseFormValues {
  sets: readonly WorkoutSetValues[];
  seatHeight: number | null;
  seatDistance: number | null;
  seatIncline: number | null;
  seatLock: number | null;
}

interface WorkoutExerciseFormRowProps {
  order?: number;
  exercise: Exercise | undefined;
  planExercise: WorkoutExerciseFormValues;
  onChangeSets: (sets: WorkoutSetValues[]) => void;
  onChangeSeatHeight: (value: number | null) => void;
  onChangeSeatDistance: (value: number | null) => void;
  onChangeSeatIncline: (value: number | null) => void;
  onChangeSeatLock: (value: number | null) => void;
  onRemove?: () => void;
  /** Shows a ⋯ button (instead of the remove one) for more actions on the exercise. */
  onOpenOptions?: () => void;
  hideHeader?: boolean;
  /** Hides the per-set list when the sets are edited elsewhere (e.g. during a session). */
  hideSets?: boolean;
  /** Rendered before the order badge, e.g. a drag handle for reordering. */
  dragHandle?: React.ReactNode;
}

function hasSeatValues(values: WorkoutExerciseFormValues): boolean {
  return (
    values.seatHeight !== null ||
    values.seatDistance !== null ||
    values.seatIncline !== null ||
    values.seatLock !== null
  );
}

function parseSeatValue(text: string): number | null {
  const normalized = text.trim().replace(",", ".");
  if (normalized === "") return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function WorkoutExerciseFormRow({
  order,
  exercise,
  planExercise,
  onChangeSets,
  onChangeSeatHeight,
  onChangeSeatDistance,
  onChangeSeatIncline,
  onChangeSeatLock,
  onRemove,
  onOpenOptions,
  hideHeader = false,
  hideSets = false,
  dragHandle,
}: WorkoutExerciseFormRowProps) {
  // The seat adjustments start closed unless some value is already saved.
  const [seatOpen, setSeatOpen] = useState(() => hasSeatValues(planExercise));

  return (
    <View style={hideHeader ? styles.bareContainer : styles.container}>
      {hideHeader ? null : (
        <View style={styles.header}>
          {dragHandle}
          <View style={styles.orderBadge}>
            <Text style={styles.orderLabel}>{order}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{exercise?.name ?? "Exercício"}</Text>
            {exercise ? (
              <Text style={styles.group}>{muscleGroupLabels[exercise.muscleGroup]}</Text>
            ) : null}
          </View>
          {exercise ? (
            <ExerciseHelpButton
              exerciseName={exercise.name}
              isCustom={exercise.isCustom}
              size={26}
            />
          ) : null}
          {onOpenOptions ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Opções do exercício"
              onPress={onOpenOptions}
              style={styles.removeButton}
            >
              <Icon name="more" size={15} color={colors.textSecondary} />
            </Pressable>
          ) : onRemove ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remover exercício"
              onPress={onRemove}
              style={styles.removeButton}
            >
              <Icon name="x" size={13} color={colors.textSecondary} strokeWidth={2.2} />
            </Pressable>
          ) : null}
        </View>
      )}

      {hideSets ? null : (
        <WorkoutSetList sets={planExercise.sets} exercise={exercise} onChange={onChangeSets} />
      )}

      <View style={styles.seatSection}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: seatOpen }}
          onPress={() => setSeatOpen((open) => !open)}
          hitSlop={8}
          style={styles.seatToggle}
        >
          <Text style={styles.seatLabel}>
            REGULAGENS <Text style={styles.seatLabelOptional}>(opcional)</Text>
          </Text>
          <View style={seatOpen && styles.seatChevronOpen}>
            <Icon name="chevron-down" size={13} color={colors.textMuted} strokeWidth={2.2} />
          </View>
        </Pressable>
        {seatOpen ? (
          <View style={styles.seatGrid}>
            <View style={styles.seatField}>
              <Text style={styles.seatFieldLabel}>ALTURA</Text>
              <TextInput
                value={planExercise.seatHeight?.toString() ?? ""}
                onChangeText={(text) => onChangeSeatHeight(parseSeatValue(text))}
                placeholder="-"
                placeholderTextColor={colors.textFaint}
                keyboardType="numeric"
                style={styles.seatInput}
              />
            </View>
            <View style={styles.seatField}>
              <Text style={styles.seatFieldLabel}>DISTÂNCIA</Text>
              <TextInput
                value={planExercise.seatDistance?.toString() ?? ""}
                onChangeText={(text) => onChangeSeatDistance(parseSeatValue(text))}
                placeholder="-"
                placeholderTextColor={colors.textFaint}
                keyboardType="numeric"
                style={styles.seatInput}
              />
            </View>
            <View style={styles.seatField}>
              <Text style={styles.seatFieldLabel}>INCLINAÇÃO</Text>
              <TextInput
                value={planExercise.seatIncline?.toString() ?? ""}
                onChangeText={(text) => onChangeSeatIncline(parseSeatValue(text))}
                placeholder="-"
                placeholderTextColor={colors.textFaint}
                keyboardType="numeric"
                style={styles.seatInput}
              />
            </View>
            <View style={styles.seatField}>
              <Text style={styles.seatFieldLabel}>TRAVA</Text>
              <TextInput
                value={planExercise.seatLock?.toString() ?? ""}
                onChangeText={(text) => onChangeSeatLock(parseSeatValue(text))}
                placeholder="-"
                placeholderTextColor={colors.textFaint}
                keyboardType="numeric"
                style={styles.seatInput}
              />
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    gap: 14,
  },
  bareContainer: {
    padding: 14,
    paddingTop: 0,
    gap: 14,
  },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  orderBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  orderLabel: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.primary },
  info: { flex: 1 },
  name: { fontFamily: fontFamily.semiBold, fontSize: 14.5, color: colors.textPrimary },
  group: { fontFamily: fontFamily.light, fontSize: 11.5, color: colors.textMuted },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: colors.control,
    alignItems: "center",
    justifyContent: "center",
  },
  seatSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    gap: 9,
  },
  seatLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 10.5,
    letterSpacing: 0.3,
    color: colors.textMuted,
  },
  seatLabelOptional: { opacity: 0.6 },
  seatToggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  seatChevronOpen: { transform: [{ rotate: "180deg" }] },
  seatGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  seatField: { flexBasis: "47%", flexGrow: 1, gap: 6 },
  seatFieldLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 9.5,
    letterSpacing: 0.3,
    color: colors.textFaint,
  },
  seatInput: {
    backgroundColor: colors.surfaceDeep,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
});
