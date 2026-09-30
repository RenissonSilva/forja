import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BodyMeasurement, MeasurementType } from "@domain/entities/BodyMeasurement";
import { changeOutcome, measurementChange } from "@domain/services/measurementProgression";
import { colors, measurementColors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { fontFamily } from "../../theme/typography";
import { Card } from "../ui/Card";
import { SegmentedControl } from "../ui/SegmentedControl";
import { MeasurementHistory } from "./MeasurementHistory";
import { ProgressLineChart } from "./ProgressLineChart";
import {
  formatNumber,
  formatPercent,
  formatSessionDate,
  formatShortDate,
} from "./exerciseProgressFormat";
import { formatCmChange, outcomeColors } from "./measurementProgressFormat";
import { PROGRESS_PERIOD_OPTIONS, ProgressPeriod, filterByPeriod } from "./progressPeriod";

interface MeasurementProgressDetailProps {
  type: MeasurementType;
  /** Oldest first, all of the same type. */
  entries: readonly BodyMeasurement[];
}

/** Chart and history of one body measurement. */
export function MeasurementProgressDetail({ type, entries }: MeasurementProgressDetailProps) {
  return (
    <View style={styles.container}>
      <Card>
        <MeasurementChartCard type={type} entries={entries} />
      </Card>
      <MeasurementHistory type={type} entries={entries} />
    </View>
  );
}

function MeasurementChartCard({ type, entries: allEntries }: MeasurementProgressDetailProps) {
  const [period, setPeriod] = useState<ProgressPeriod>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const entries = filterByPeriod(allEntries, period);
  // Until a point is tapped (or if it left the period), the latest entry is shown.
  const tappedIndex = entries.findIndex((entry) => entry.id === selectedId);
  const selectedIndex = tappedIndex >= 0 ? tappedIndex : entries.length - 1;
  const selected = entries[selectedIndex];
  const change = measurementChange(entries);
  const outcome = change ? changeOutcome(type, change) : null;

  const points = entries.map((entry) => ({
    value: entry.valueCm,
    label: formatShortDate(entry.date),
    highlighted: false,
  }));

  return (
    <View style={styles.chartCard}>
      {selected ? (
        <View style={styles.hero}>
          <View style={styles.heroMain}>
            <Text style={styles.heroValue}>
              {formatNumber(selected.valueCm)}
              <Text style={styles.heroUnit}> cm</Text>
            </Text>
            <Text style={styles.heroDate}>{formatSessionDate(selected.date)}</Text>
          </View>

          {change && outcome ? (
            <View style={styles.changeColumn}>
              <View
                style={[styles.changePill, { backgroundColor: outcomeColors[outcome].background }]}
              >
                <Text style={[styles.changeLabel, { color: outcomeColors[outcome].text }]}>
                  {outcome === "unchanged"
                    ? "Sem variação"
                    : `${formatCmChange(change)} · ${formatPercent(change.percent ?? 0)}`}
                </Text>
              </View>
              <Text style={styles.changeCaption}>desde {formatShortDate(entries[0]!.date)}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {entries.length > 0 ? (
        <ProgressLineChart
          points={points}
          selectedIndex={selectedIndex}
          onSelect={(index) => setSelectedId(entries[index]?.id ?? null)}
          formatAxisValue={formatNumber}
          color={measurementColors[type]}
        />
      ) : (
        <Text style={styles.emptyPeriod}>Nenhuma medição registrada no período.</Text>
      )}

      <SegmentedControl options={PROGRESS_PERIOD_OPTIONS} value={period} onChange={setPeriod} />
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
  heroDate: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textSecondary },
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
});
