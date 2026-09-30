import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ExerciseProgressItem } from "@application/progress/GetExerciseProgress.usecase";
import {
  ProgressionMetric,
  metricValue,
  progressChange,
} from "@domain/services/exerciseProgression";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { fontFamily } from "../../theme/typography";
import { Card } from "../ui/Card";
import { Icon } from "../ui/Icon";
import { SegmentedControl } from "../ui/SegmentedControl";
import { ExerciseRecords } from "./ExerciseRecords";
import { ExerciseSessionHistory } from "./ExerciseSessionHistory";
import { ProgressLineChart } from "./ProgressLineChart";
import {
  formatChange,
  formatMetricAmount,
  formatPercent,
  formatSessionDate,
  formatSets,
  formatShortDate,
  metricLabels,
  metricUnit,
  recordLabels,
  trendColors,
  trendOf,
} from "./exerciseProgressFormat";
import { PROGRESS_PERIOD_OPTIONS, ProgressPeriod, filterByPeriod } from "./progressPeriod";

interface ExerciseProgressDetailProps {
  item: ExerciseProgressItem;
}

/** Chart, personal records and session history of one exercise. */
export function ExerciseProgressDetail({ item }: ExerciseProgressDetailProps) {
  const [metric, setMetric] = useState<ProgressionMetric>(item.metrics[0]!);
  // A refresh can turn a bodyweight exercise into a weighted one (or back).
  const activeMetric = item.metrics.includes(metric) ? metric : item.metrics[0]!;

  return (
    <View style={styles.container}>
      <Card>
        <ProgressChartCard item={item} metric={activeMetric} onChangeMetric={setMetric} />
      </Card>
      <ExerciseRecords records={item.records} />
      <ExerciseSessionHistory
        sessions={item.sessions}
        metric={activeMetric}
        recordsBySessionId={item.recordsBySessionId}
      />
    </View>
  );
}

function ProgressChartCard({
  item,
  metric,
  onChangeMetric,
}: {
  item: ExerciseProgressItem;
  metric: ProgressionMetric;
  onChangeMetric: (metric: ProgressionMetric) => void;
}) {
  const [period, setPeriod] = useState<ProgressPeriod>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sessions = filterByPeriod(item.sessions, period);
  // Until a point is tapped (or if it left the period), the latest session is shown.
  const tappedIndex = sessions.findIndex((session) => session.id === selectedId);
  const selectedIndex = tappedIndex >= 0 ? tappedIndex : sessions.length - 1;
  const selected = sessions[selectedIndex];
  const change = progressChange(sessions, metric);
  const isRecord = (sessionId: string) =>
    item.recordsBySessionId.get(sessionId)?.includes(metric) ?? false;

  const points = sessions.map((session) => ({
    value: metricValue(session, metric),
    label: formatShortDate(session.date),
    highlighted: isRecord(session.id),
  }));

  return (
    <View style={styles.chartCard}>
      {item.metrics.length > 1 ? (
        <SegmentedControl
          options={item.metrics.map((option) => ({ value: option, label: metricLabels[option] }))}
          value={metric}
          onChange={onChangeMetric}
        />
      ) : null}

      {selected ? (
        <View style={styles.hero}>
          <View style={styles.heroMain}>
            <Text style={styles.heroValue}>
              {formatMetricAmount(metricValue(selected, metric), metric)}
              <Text style={styles.heroUnit}> {metricUnit(metric)}</Text>
            </Text>
            <View style={styles.heroDateRow}>
              <Text style={styles.heroDate}>{formatSessionDate(selected.date)}</Text>
              {isRecord(selected.id) ? (
                <View style={styles.recordTag}>
                  <Icon name="star" size={10} color={colors.primary} filled />
                  <Text style={styles.recordLabel}>{recordLabels[metric]}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.heroSets}>{formatSets(selected.setDetails)}</Text>
          </View>

          {change ? (
            <View style={styles.changeColumn}>
              <View
                style={[
                  styles.changePill,
                  { backgroundColor: trendColors[trendOf(change)].background },
                ]}
              >
                <Text style={[styles.changeLabel, { color: trendColors[trendOf(change)].text }]}>
                  {trendOf(change) === "flat"
                    ? "Sem variação"
                    : `${formatChange(change, metric)}${
                        change.percent !== null ? ` · ${formatPercent(change.percent)}` : ""
                      }`}
                </Text>
              </View>
              <Text style={styles.changeCaption}>desde {formatShortDate(sessions[0]!.date)}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {sessions.length > 0 ? (
        <ProgressLineChart
          points={points}
          selectedIndex={selectedIndex}
          onSelect={(index) => setSelectedId(sessions[index]?.id ?? null)}
          formatAxisValue={(value) => formatMetricAmount(value, metric)}
        />
      ) : (
        <Text style={styles.emptyPeriod}>Nenhum treino deste exercício no período.</Text>
      )}

      <View style={styles.chartFooter}>
        <SegmentedControl options={PROGRESS_PERIOD_OPTIONS} value={period} onChange={setPeriod} />
        {points.some((point) => point.highlighted) ? (
          <View style={styles.legend}>
            <View style={styles.legendHalo}>
              <View style={styles.legendDot} />
            </View>
            <Text style={styles.legendLabel}>Recorde</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xl },
  chartCard: { gap: spacing.lg },
  hero: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  heroMain: { flex: 1, gap: 3 },
  heroValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: 28,
    letterSpacing: -1,
    color: colors.textPrimary,
  },
  heroUnit: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    letterSpacing: 0,
    color: colors.textMuted,
  },
  heroDateRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  heroDate: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textSecondary },
  heroSets: { fontFamily: fontFamily.light, fontSize: 11.5, color: colors.textMuted },
  recordTag: { flexDirection: "row", alignItems: "center", gap: 4 },
  recordLabel: { fontFamily: fontFamily.medium, fontSize: 10.5, color: colors.primary },
  changeColumn: { alignItems: "flex-end", gap: 5, paddingTop: 6 },
  changePill: { paddingVertical: 5, paddingHorizontal: 9, borderRadius: 9 },
  changeLabel: { fontFamily: fontFamily.semiBold, fontSize: 11.5 },
  changeCaption: { fontFamily: fontFamily.light, fontSize: 10.5, color: colors.textFaint },
  emptyPeriod: {
    fontFamily: fontFamily.light,
    fontSize: 11.5,
    color: colors.textSecondary,
    paddingVertical: 40,
    textAlign: "center",
  },
  chartFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  legend: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendHalo: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primaryMutedStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  legendDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.primary },
  legendLabel: { fontFamily: fontFamily.regular, fontSize: 10.5, color: colors.textMuted },
});
