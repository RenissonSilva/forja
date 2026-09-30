import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ExerciseLog } from "@domain/entities/ExerciseLog";
import {
  ProgressionMetric,
  metricValue,
  progressChange,
} from "@domain/services/exerciseProgression";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";
import { Card } from "../ui/Card";
import { Icon } from "../ui/Icon";
import {
  formatChange,
  formatMetricValue,
  formatSessionDate,
  formatSets,
  recordLabels,
  trendColors,
  trendOf,
} from "./exerciseProgressFormat";

const PAGE_SIZE = 10;

interface ExerciseSessionHistoryProps {
  /** Oldest first, as they come from the progress. */
  sessions: readonly ExerciseLog[];
  metric: ProgressionMetric;
  recordsBySessionId: ReadonlyMap<string, ProgressionMetric[]>;
}

/** Every session, newest first, with its sets and the change from the session before it. */
export function ExerciseSessionHistory({
  sessions,
  metric,
  recordsBySessionId,
}: ExerciseSessionHistoryProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const newestFirst = [...sessions].reverse();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico</Text>
      <Card style={styles.card}>
        {newestFirst.slice(0, visibleCount).map((session, index) => {
          const previous = newestFirst[index + 1];
          const change = previous ? progressChange([previous, session], metric) : null;
          const trend = change ? trendOf(change) : "flat";
          const records = recordsBySessionId.get(session.id);
          return (
            <View key={session.id} style={[styles.row, index > 0 && styles.rowDivider]}>
              <View style={styles.info}>
                <Text style={styles.date}>{formatSessionDate(session.date)}</Text>
                <Text style={styles.sets}>{formatSets(session.setDetails)}</Text>
                {records ? (
                  <View style={styles.recordTag}>
                    <Icon name="star" size={10} color={colors.primary} filled />
                    <Text style={styles.recordLabel}>
                      {records.map((record) => recordLabels[record]).join(" · ")}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.values}>
                <Text style={styles.value}>
                  {formatMetricValue(metricValue(session, metric), metric)}
                </Text>
                {change && trend !== "flat" ? (
                  <Text style={[styles.delta, { color: trendColors[trend].text }]}>
                    {formatChange(change, metric)}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}

        {newestFirst.length > visibleCount ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setVisibleCount((count) => count + PAGE_SIZE)}
            style={({ pressed }) => [styles.showMore, pressed && styles.showMorePressed]}
          >
            <Text style={styles.showMoreLabel}>Mostrar mais</Text>
          </Pressable>
        ) : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  title: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.textPrimary },
  card: { paddingVertical: 4 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 12 },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderStrong },
  info: { flex: 1, gap: 3 },
  date: { fontFamily: fontFamily.semiBold, fontSize: 12.5, color: colors.textPrimary },
  sets: { fontFamily: fontFamily.light, fontSize: 11.5, color: colors.textSecondary },
  recordTag: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  recordLabel: { fontFamily: fontFamily.medium, fontSize: 10.5, color: colors.primary },
  values: { alignItems: "flex-end", gap: 3 },
  value: { fontFamily: fontFamily.semiBold, fontSize: 12.5, color: colors.textPrimary },
  delta: { fontFamily: fontFamily.medium, fontSize: 10.5 },
  showMore: { alignItems: "center", paddingVertical: 12 },
  showMorePressed: { opacity: 0.6 },
  showMoreLabel: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.primary },
});
