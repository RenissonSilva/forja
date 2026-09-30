import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ExerciseRecord } from "@domain/services/exerciseProgression";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/spacing";
import { fontFamily } from "../../theme/typography";
import { Icon } from "../ui/Icon";
import {
  formatMetricValue,
  formatNumber,
  formatShortDate,
  recordLabels,
} from "./exerciseProgressFormat";

interface ExerciseRecordsProps {
  records: readonly ExerciseRecord[];
}

/** All-time bests, one tile per metric, with the day each was set. */
export function ExerciseRecords({ records }: ExerciseRecordsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recordes pessoais</Text>
      <View style={styles.grid}>
        {records.map((record) => (
          <View key={record.metric} style={styles.tile}>
            <View style={styles.tileHeader}>
              <Icon name="star" size={11} color={colors.primary} filled />
              <Text style={styles.label} numberOfLines={1}>
                {recordLabels[record.metric]}
              </Text>
            </View>
            <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
              {recordValue(record)}
            </Text>
            <Text style={styles.detail} numberOfLines={1}>
              {recordDetail(record)}
            </Text>
            <Text style={styles.date}>{formatShortDate(record.session.date)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function recordValue({ metric, value, session }: ExerciseRecord): string {
  if (metric === "estimatedOneRepMax") {
    return `${formatNumber(session.bestSet.loadKg)} × ${session.bestSet.reps}`;
  }
  return formatMetricValue(value, metric);
}

function recordDetail({ metric, value, session }: ExerciseRecord): string {
  const sets = `${session.sets} ${session.sets === 1 ? "série" : "séries"}`;
  switch (metric) {
    case "load":
      return `× ${session.reps} ${session.reps === 1 ? "rep" : "reps"}`;
    case "estimatedOneRepMax":
      return `1RM ≈ ${formatNumber(value)} kg`;
    case "reps":
    case "duration":
      return "numa série";
    case "volume":
    case "totalReps":
    case "totalDuration":
      return `em ${sets}`;
  }
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  title: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.textPrimary },
  grid: { flexDirection: "row", gap: 8 },
  tile: {
    flex: 1,
    gap: 3,
    padding: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
  },
  tileHeader: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  label: {
    flexShrink: 1,
    fontFamily: fontFamily.regular,
    fontSize: 10.5,
    color: colors.textSecondary,
  },
  value: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    letterSpacing: -0.4,
    color: colors.textPrimary,
  },
  detail: { fontFamily: fontFamily.light, fontSize: 10.5, color: colors.textMuted },
  date: { fontFamily: fontFamily.light, fontSize: 10, color: colors.textFaint, marginTop: 2 },
});
