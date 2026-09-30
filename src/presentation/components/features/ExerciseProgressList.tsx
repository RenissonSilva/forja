import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ExerciseProgressItem } from "@application/progress/GetExerciseProgress.usecase";
import {
  ProgressChange,
  ProgressionMetric,
  metricValue,
  progressChange,
} from "@domain/services/exerciseProgression";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";
import { Icon } from "../ui/Icon";
import { Sparkline } from "../ui/Sparkline";
import {
  formatChange,
  formatPercent,
  formatRelativeDay,
  formatSet,
  trendColors,
  trendOf,
} from "./exerciseProgressFormat";

/** Enough sessions to show the recent direction without squashing the line. */
const SPARKLINE_SESSIONS = 12;

interface ExerciseProgressListProps {
  items: readonly ExerciseProgressItem[];
  onOpenExercise: (exerciseId: string) => void;
}

/** One row per exercise: latest top set, recent trend and change since the first session. */
export function ExerciseProgressList({ items, onOpenExercise }: ExerciseProgressListProps) {
  return (
    <View>
      {items.map((item, index) => (
        <ExerciseProgressRow
          key={item.exerciseId}
          item={item}
          showDivider={index > 0}
          onPress={() => onOpenExercise(item.exerciseId)}
        />
      ))}
    </View>
  );
}

function ExerciseProgressRow({
  item,
  showDivider,
  onPress,
}: {
  item: ExerciseProgressItem;
  showDivider: boolean;
  onPress: () => void;
}) {
  const metric = item.metrics[0]!;
  const latest = item.sessions[item.sessions.length - 1]!;
  const change = progressChange(item.sessions, metric);
  const isLatestRecord = item.recordsBySessionId.has(latest.id);
  const name = item.exercise?.name ?? "Exercício";
  const headline = formatSet(latest.topSet);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[
        name,
        headline,
        change ? `${changeLabel(change, metric)} desde o primeiro treino` : "primeiro treino",
        isLatestRecord ? "novo recorde" : null,
      ]
        .filter(Boolean)
        .join(", ")}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        showDivider && styles.rowDivider,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {isLatestRecord ? <Icon name="star" size={12} color={colors.primary} filled /> : null}
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {headline} · {formatRelativeDay(latest.date)}
        </Text>
      </View>

      {item.sessions.length > 1 ? (
        <Sparkline
          values={item.sessions
            .slice(-SPARKLINE_SESSIONS)
            .map((session) => metricValue(session, metric))}
          color={colors.primary}
          width={52}
          height={22}
          showEndDot
        />
      ) : null}

      {change ? (
        <View style={[styles.badge, { backgroundColor: trendColors[trendOf(change)].background }]}>
          <Text style={[styles.badgeLabel, { color: trendColors[trendOf(change)].text }]}>
            {changeLabel(change, metric)}
          </Text>
        </View>
      ) : (
        <Text style={styles.firstSession}>1º treino</Text>
      )}

      <Icon name="chevron-right" size={14} color={colors.textFaint} strokeWidth={2.2} />
    </Pressable>
  );
}

function changeLabel(change: ProgressChange, metric: ProgressionMetric): string {
  return change.percent === null ? formatChange(change, metric) : formatPercent(change.percent);
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderStrong },
  rowPressed: { opacity: 0.6 },
  info: { flex: 1, gap: 3 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  name: {
    flexShrink: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  meta: { fontFamily: fontFamily.light, fontSize: 11, color: colors.textMuted },
  badge: {
    minWidth: 50,
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: 8,
    alignItems: "center",
  },
  badgeLabel: { fontFamily: fontFamily.semiBold, fontSize: 11 },
  firstSession: {
    minWidth: 50,
    textAlign: "center",
    fontFamily: fontFamily.regular,
    fontSize: 10.5,
    color: colors.textFaint,
  },
});
