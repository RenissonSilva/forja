import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { WorkoutDay } from "@application/progress/GetWorkoutDay.usecase";
import { ExerciseSetLog } from "@domain/entities/ExerciseLog";
import { DateKey, fromDateKey } from "@shared/date-utils";
import { formatDuration } from "@shared/duration";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { fontFamily } from "../../theme/typography";
import { BottomSheet } from "../ui/BottomSheet";
import { formatNumber } from "./exerciseProgressFormat";

interface WorkoutDaySheetProps {
  visible: boolean;
  onClose: () => void;
  /** The tapped day — known before its workout finishes loading. */
  date: DateKey | null;
  day: WorkoutDay | null;
}

/** What was trained on a calendar day: each exercise with every set performed. */
export function WorkoutDaySheet({ visible, onClose, date, day }: WorkoutDaySheetProps) {
  // A previous day's workout may still be in memory while the tapped one loads.
  const current = day && day.date === date ? day : null;
  const title = [date ? formatDayTitle(date) : null, current?.workoutPlanName]
    .filter(Boolean)
    .join(" · ");

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      </View>

      {!current ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : current.exercises.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.mutedText}>Nenhum exercício registrado neste dia</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {current.exercises.map(({ log, exercise }, index) => (
            <View key={log.id} style={[styles.exercise, index > 0 && styles.exerciseDivider]}>
              <Text style={styles.exerciseName}>{exercise?.name ?? "Exercício"}</Text>
              {log.setDetails.map((set, setIndex) => (
                <View key={setIndex} style={styles.setRow}>
                  <Text style={styles.setIndex}>{setIndex + 1}</Text>
                  <Text style={styles.setValue}>{formatDaySet(set)}</Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </BottomSheet>
  );
}

/** "Ter, 14 de outubro" — EEEEEE is ptBR's three-letter weekday; EEE spells it out. */
function formatDayTitle(date: DateKey): string {
  const text = format(fromDateKey(date), "EEEEEE, d 'de' MMMM", { locale: ptBR });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "12 × 40 kg", "12 reps" when no load was used, or "01:30" (× load) when timed. */
function formatDaySet(set: ExerciseSetLog): string {
  const timed = set.durationSeconds !== undefined;
  const amount = timed ? formatDuration(set.durationSeconds ?? 0) : String(set.reps);
  if (set.loadKg > 0) return `${amount} × ${formatNumber(set.loadKg)} kg`;
  return timed ? amount : `${amount} reps`;
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
    letterSpacing: -0.4,
    color: colors.textPrimary,
  },
  centerBox: { padding: spacing.xxl, alignItems: "center" },
  mutedText: {
    fontFamily: fontFamily.regular,
    fontSize: 13.5,
    color: colors.textMuted,
    textAlign: "center",
  },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  exercise: { gap: 6, paddingVertical: spacing.md },
  exerciseDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderStrong,
  },
  exerciseName: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13.5,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  setRow: { flexDirection: "row", alignItems: "baseline", gap: spacing.md },
  setIndex: {
    width: 16,
    textAlign: "right",
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textFaint,
  },
  setValue: { fontFamily: fontFamily.regular, fontSize: 12.5, color: colors.textSecondary },
});
