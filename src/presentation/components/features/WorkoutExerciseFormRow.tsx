import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { WorkoutPlanExercise } from "@domain/entities/WorkoutPlanExercise";
import { Exercise } from "@domain/entities/Exercise";
import { colors } from "../../theme/colors";
import { muscleGroupLabels } from "../../theme/muscleGroups";
import { fontFamily } from "../../theme/typography";
import { Icon } from "../ui/Icon";
import { Stepper } from "../ui/Stepper";

interface WorkoutExerciseFormRowProps {
  order: number;
  exercise: Exercise | undefined;
  planExercise: WorkoutPlanExercise;
  onChangeSets: (value: number) => void;
  onChangeReps: (value: number) => void;
  onChangeLoad: (value: number) => void;
  onChangeSeatAdjustment: (value: string) => void;
  onRemove: () => void;
}

export function WorkoutExerciseFormRow({
  order,
  exercise,
  planExercise,
  onChangeSets,
  onChangeReps,
  onChangeLoad,
  onChangeSeatAdjustment,
  onRemove,
}: WorkoutExerciseFormRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.orderBadge}>
          <Text style={styles.orderLabel}>{order}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{exercise?.name ?? "Exercício"}</Text>
          {exercise ? (
            <Text style={styles.group}>{muscleGroupLabels[exercise.muscleGroup]}</Text>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remover exercício"
          onPress={onRemove}
          style={styles.removeButton}
        >
          <Icon name="x" size={13} color={colors.textSecondary} strokeWidth={2.2} />
        </Pressable>
      </View>

      <View style={styles.steppersRow}>
        <Stepper
          label="SÉRIES"
          value={planExercise.sets}
          min={1}
          max={20}
          onChange={onChangeSets}
        />
        <Stepper label="REPS" value={planExercise.reps} min={1} max={100} onChange={onChangeReps} />
        <Stepper
          label="PESO KG"
          value={planExercise.loadKg}
          min={0}
          max={500}
          step={2.5}
          onChange={onChangeLoad}
        />
      </View>

      <View style={styles.seatSection}>
        <Text style={styles.seatLabel}>
          AJUSTES DA CADEIRA <Text style={styles.seatLabelOptional}>(opcional)</Text>
        </Text>
        <TextInput
          value={planExercise.seatAdjustment ?? ""}
          onChangeText={onChangeSeatAdjustment}
          placeholder="nenhum"
          placeholderTextColor={colors.textFaint}
          style={styles.seatInput}
        />
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
  steppersRow: { flexDirection: "row", gap: 8 },
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
