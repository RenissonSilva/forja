import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Exercise } from "@domain/entities/Exercise";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";
import { DurationInput } from "../ui/DurationInput";
import { Stepper } from "../ui/Stepper";

export interface WorkoutSetValues {
  reps: number;
  loadKg: number;
  /** Only on timed sets (core, cardio). */
  durationSeconds?: number;
}

const MAX_SETS = 20;
const DEFAULT_REPS = 10;

/** A cardio set is usually one longer block; core holds are short. */
function defaultDurationSeconds(exercise: Exercise): number {
  return exercise.usesLoad ? 30 : 10 * 60;
}

/** Starting sets when an exercise is added to a plan. */
export function defaultSetsFor(exercise: Exercise | undefined): WorkoutSetValues[] {
  if (exercise?.isTimed) {
    const count = exercise.usesLoad ? 3 : 1;
    const durationSeconds = defaultDurationSeconds(exercise);
    return Array.from({ length: count }, () => ({ reps: 0, loadKg: 0, durationSeconds }));
  }
  return Array.from({ length: 3 }, () => ({ reps: DEFAULT_REPS, loadKg: 0 }));
}

/**
 * Fits sets to how the exercise is measured — sets saved before core and cardio
 * were timed come in with reps and no duration. Unchanged while the exercise is unknown.
 */
export function conformSets(
  sets: readonly WorkoutSetValues[],
  exercise: Exercise | undefined,
): WorkoutSetValues[] {
  if (!exercise) return [...sets];
  if (exercise.isTimed) {
    return sets.map((set) => ({
      reps: 0,
      loadKg: exercise.usesLoad ? set.loadKg : 0,
      durationSeconds: set.durationSeconds ?? defaultDurationSeconds(exercise),
    }));
  }
  return sets.map((set) => ({ reps: set.reps >= 1 ? set.reps : DEFAULT_REPS, loadKg: set.loadKg }));
}

/**
 * Sets for an exercise swapped into another's place: keeps how many sets there
 * were and their reps, but the load (and time) come from the last session of
 * the new exercise — the old exercise's load means nothing for it.
 */
export function swappedSets(
  sets: readonly WorkoutSetValues[],
  exercise: Exercise | undefined,
  lastSets: readonly WorkoutSetValues[] | undefined,
): WorkoutSetValues[] {
  const swapped = sets.map((set, index): WorkoutSetValues => {
    const previous = lastSets?.[index] ?? lastSets?.[lastSets.length - 1];
    const durationSeconds = previous?.durationSeconds ?? set.durationSeconds;
    return {
      reps: set.reps,
      loadKg: previous?.loadKg ?? 0,
      ...(durationSeconds !== undefined ? { durationSeconds } : {}),
    };
  });
  return conformSets(swapped, exercise);
}

interface WorkoutSetListProps {
  sets: readonly WorkoutSetValues[];
  /** Decides between reps and time, and whether load is shown. */
  exercise: Exercise | undefined;
  onChange: (sets: WorkoutSetValues[]) => void;
}

/**
 * One editable row per set (reps — or time, for core and cardio — and load can
 * differ per set), plus add/remove set buttons.
 */
export function WorkoutSetList({ sets: rawSets, exercise, onChange }: WorkoutSetListProps) {
  const sets = conformSets(rawSets, exercise);
  const isTimed = exercise?.isTimed ?? false;
  const usesLoad = exercise?.usesLoad ?? true;

  function updateSet(index: number, patch: Partial<WorkoutSetValues>) {
    onChange(sets.map((set, i) => (i === index ? { ...set, ...patch } : set)));
  }

  // A new set copies the last one, since that's usually where the load ended up.
  function addSet() {
    const last = sets[sets.length - 1] ?? defaultSetsFor(exercise)[0]!;
    onChange([...sets, { ...last }]);
  }

  function removeSet() {
    onChange(sets.slice(0, -1));
  }

  const canRemove = sets.length > 1;
  const canAdd = sets.length < MAX_SETS;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.headerLabel, styles.indexColumn]}>SÉRIE</Text>
        <Text style={[styles.headerLabel, styles.stepperColumn]}>
          {isTimed ? "TEMPO" : "REPS"}
        </Text>
        {usesLoad ? (
          <Text style={[styles.headerLabel, styles.stepperColumn]}>PESO KG</Text>
        ) : null}
      </View>

      {sets.map((set, index) => (
        <View style={styles.row} key={index}>
          <View style={[styles.indexColumn, styles.indexBadge]}>
            <Text style={styles.indexLabel}>{index + 1}</Text>
          </View>
          <View style={styles.stepperColumn}>
            {isTimed ? (
              <DurationInput
                value={set.durationSeconds ?? 0}
                accessibilityLabel={`Tempo da série ${index + 1}`}
                onChange={(value) => updateSet(index, { durationSeconds: value })}
              />
            ) : (
              <Stepper
                value={set.reps}
                min={1}
                max={100}
                onChange={(value) => updateSet(index, { reps: value })}
              />
            )}
          </View>
          {usesLoad ? (
            <View style={styles.stepperColumn}>
              <Stepper
                value={set.loadKg}
                min={0}
                max={500}
                step={5}
                decimal
                onChange={(value) => updateSet(index, { loadKg: value })}
              />
            </View>
          ) : null}
        </View>
      ))}

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remover série"
          onPress={removeSet}
          disabled={!canRemove}
          style={[styles.actionButton, !canRemove && styles.actionDisabled]}
        >
          <Text style={styles.actionLabel}>−</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Adicionar série"
          onPress={addSet}
          disabled={!canAdd}
          style={[
            styles.actionButton,
            styles.actionButtonPrimary,
            !canAdd && styles.actionDisabled,
          ]}
        >
          <Text style={[styles.actionLabel, styles.actionLabelPrimary]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 9.5,
    letterSpacing: 0.3,
    color: colors.textFaint,
    textAlign: "center",
  },
  indexColumn: { width: 34 },
  stepperColumn: { flex: 1 },
  indexBadge: {
    height: 26,
    borderRadius: 8,
    backgroundColor: colors.control,
    alignItems: "center",
    justifyContent: "center",
  },
  indexLabel: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.textSecondary },
  actions: { flexDirection: "row", gap: 8, marginTop: 2 },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: colors.controlAlt,
  },
  actionButtonPrimary: { backgroundColor: colors.primaryMutedStrong },
  actionDisabled: { opacity: 0.4 },
  actionLabel: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.textPrimary },
  actionLabelPrimary: { color: colors.primary },
});
