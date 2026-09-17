import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Exercise } from "@domain/entities/Exercise";
import { ExerciseLog } from "@domain/entities/ExerciseLog";
import { fromDateKey } from "@shared/date-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart } from "react-native-gifted-charts";
import { colors } from "../../theme/colors";
import { radius, spacing } from "../../theme/spacing";
import { fontFamily } from "../../theme/typography";

type Metric = "peso" | "reps" | "series" | "volume";

const METRIC_LABELS: Record<Metric, string> = {
  peso: "Peso",
  reps: "Reps",
  series: "Séries",
  volume: "Volume",
};

interface ExercisePerformanceChartProps {
  history: ExerciseLog[];
  exercisesById: Map<string, Exercise>;
}

function metricValue(entry: ExerciseLog, metric: Metric): number {
  switch (metric) {
    case "peso":
      return entry.loadKg;
    case "reps":
      return entry.reps;
    case "series":
      return entry.sets;
    case "volume":
      return entry.sets * entry.reps * entry.loadKg;
  }
}

export function ExercisePerformanceChart({
  history,
  exercisesById,
}: ExercisePerformanceChartProps) {
  const available = useMemo(() => {
    const ids = Array.from(new Set(history.map((entry) => entry.exerciseId)));
    return ids.sort((a, b) => {
      const nameA = exercisesById.get(a)?.name ?? "";
      const nameB = exercisesById.get(b)?.name ?? "";
      return nameA.localeCompare(nameB);
    });
  }, [history, exercisesById]);

  const [selected, setSelected] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>("peso");

  if (available.length === 0) return null;

  const mostRecent = history[history.length - 1]?.exerciseId ?? available[0]!;
  const active = selected && available.includes(selected) ? selected : mostRecent;

  const points = history.filter((entry) => entry.exerciseId === active);
  const chartData = points.map((point) => ({
    value: metricValue(point, metric),
    label: format(fromDateKey(point.date), "dd/MM", { locale: ptBR }),
  }));

  const latest = points[points.length - 1];
  const first = points[0];
  const delta = latest && first ? metricValue(latest, metric) - metricValue(first, metric) : 0;
  const unit = metric === "peso" ? " kg" : "";

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Progressão dos exercícios</Text>
        <View style={styles.toggleRow}>
          {(Object.keys(METRIC_LABELS) as Metric[]).map((option) => (
            <ToggleButton
              key={option}
              label={METRIC_LABELS[option]}
              active={metric === option}
              onPress={() => setMetric(option)}
            />
          ))}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {available.map((exerciseId) => (
          <Pressable
            key={exerciseId}
            onPress={() => setSelected(exerciseId)}
            style={[
              styles.chip,
              { backgroundColor: active === exerciseId ? colors.primary : colors.elevated },
            ]}
          >
            <Text style={[styles.chipLabel, active === exerciseId && styles.chipLabelActive]}>
              {exercisesById.get(exerciseId)?.name ?? "Exercício"}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.valueRow}>
        <Text style={styles.value}>
          {latest ? metricValue(latest, metric).toFixed(metric === "peso" ? 1 : 0) : "--"}
          {unit ? <Text style={styles.unit}>{unit}</Text> : null}
        </Text>
        {points.length > 1 ? (
          <Text style={styles.delta}>
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(metric === "peso" ? 1 : 0)}
          </Text>
        ) : null}
        <Text style={styles.caption}>últimas {points.length} sessões</Text>
      </View>

      {chartData.length >= 2 ? (
        <LineChart
          data={chartData}
          areaChart
          curved
          color={colors.primary}
          startFillColor={colors.primary}
          endFillColor={colors.background}
          startOpacity={0.34}
          endOpacity={0}
          thickness={2.6}
          hideRules
          hideYAxisText
          yAxisColor="transparent"
          xAxisColor={colors.borderSubtle}
          xAxisLabelTextStyle={{ color: colors.textFaint, fontSize: 10.5 }}
          dataPointsColor={colors.primary}
          height={150}
          initialSpacing={8}
          adjustToWidth
        />
      ) : (
        <Text style={styles.emptyText}>
          Registre pelo menos 2 sessões deste exercício para ver o gráfico.
        </Text>
      )}
    </View>
  );
}

function ToggleButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.toggleButton, active && styles.toggleButtonActive]}
    >
      <Text style={[styles.toggleLabel, active && styles.toggleLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  titleRow: { gap: spacing.sm },
  title: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.textPrimary },
  toggleRow: {
    flexDirection: "row",
    gap: 3,
    padding: 3,
    backgroundColor: colors.elevated,
    borderRadius: 11,
    alignSelf: "flex-start",
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  toggleButtonActive: { backgroundColor: colors.primary },
  toggleLabel: { fontFamily: fontFamily.semiBold, fontSize: 10.5, color: colors.textSecondary },
  toggleLabelActive: { color: colors.onPrimary },
  chips: { marginTop: spacing.xs, marginBottom: spacing.xs },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    marginRight: 6,
  },
  chipLabel: { fontFamily: fontFamily.semiBold, fontSize: 10.5, color: colors.textSecondary },
  chipLabelActive: { color: colors.onPrimary },
  valueRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  value: {
    fontFamily: fontFamily.semiBold,
    fontSize: 24,
    letterSpacing: -0.8,
    color: colors.textPrimary,
  },
  unit: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textMuted },
  delta: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.primary },
  caption: { fontFamily: fontFamily.light, fontSize: 11, color: colors.textFaint },
  emptyText: {
    fontFamily: fontFamily.light,
    fontSize: 11.5,
    color: colors.textSecondary,
    paddingVertical: 20,
  },
});
