import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MuscleGroupStat } from "@application/attendance/GetMuscleGroupStats.usecase";
import { colors } from "../../theme/colors";
import { muscleGroupLabels } from "../../theme/muscleGroups";
import { fontFamily } from "../../theme/typography";

interface MuscleGroupStatsChartProps {
  stats: MuscleGroupStat[];
}

export function MuscleGroupStatsChart({ stats }: MuscleGroupStatsChartProps) {
  const trained = stats.filter((stat) => stat.count > 0);
  const maxCount = Math.max(1, ...trained.map((stat) => stat.count));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Treinos por grupo muscular</Text>

      {trained.length === 0 ? (
        <Text style={styles.emptyText}>
          Complete treinos para ver a distribuição por grupo muscular.
        </Text>
      ) : (
        <View style={styles.rows}>
          {trained.map((stat) => (
            <View key={stat.muscleGroup} style={styles.row}>
              <Text style={styles.label}>{muscleGroupLabels[stat.muscleGroup]}</Text>
              <View style={styles.track}>
                <View
                  style={[styles.fill, { width: `${(stat.count / maxCount) * 100}%` }]}
                />
              </View>
              <Text style={styles.count}>{stat.count}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  title: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.textPrimary },
  rows: { gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  label: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary, width: 62 },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.control,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 4, backgroundColor: colors.primary },
  count: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.textPrimary,
    width: 20,
    textAlign: "right",
  },
  emptyText: {
    fontFamily: fontFamily.light,
    fontSize: 11.5,
    color: colors.textSecondary,
    paddingVertical: 8,
  },
});
