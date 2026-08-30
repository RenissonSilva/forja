import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BmiHistoryPoint } from "@application/progress/GetBmiHistory.usecase";
import { fromDateKey } from "@shared/date-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart } from "react-native-gifted-charts";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";

type Mode = "peso" | "imc";

interface WeightImcChartProps {
  points: BmiHistoryPoint[];
}

export function WeightImcChart({ points }: WeightImcChartProps) {
  const [mode, setMode] = useState<Mode>("peso");

  const chartData = points.map((point) => ({
    value: mode === "peso" ? point.weightKg : point.bmi,
    label: format(fromDateKey(point.date), "MMM", { locale: ptBR }),
  }));

  const latest = points[points.length - 1];
  const first = points[0];
  const delta =
    latest && first
      ? mode === "peso"
        ? latest.weightKg - first.weightKg
        : latest.bmi - first.bmi
      : 0;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Progresso</Text>
        <View style={styles.toggleRow}>
          <ToggleButton label="Peso" active={mode === "peso"} onPress={() => setMode("peso")} />
          <ToggleButton label="IMC" active={mode === "imc"} onPress={() => setMode("imc")} />
        </View>
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.value}>
          {latest ? (mode === "peso" ? latest.weightKg.toFixed(1) : latest.bmi.toFixed(1)) : "--"}
          {mode === "peso" ? <Text style={styles.unit}> kg</Text> : null}
        </Text>
        {latest ? (
          <Text style={styles.delta}>
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(1)}
          </Text>
        ) : null}
        <Text style={styles.caption}>últimos {points.length} registros</Text>
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
        <Text style={styles.emptyText}>Registre pelo menos 2 medições para ver o gráfico.</Text>
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
  container: { gap: 14 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.textPrimary },
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
  toggleRow: {
    flexDirection: "row",
    gap: 3,
    padding: 3,
    backgroundColor: colors.elevated,
    borderRadius: 11,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  toggleButtonActive: { backgroundColor: colors.primary },
  toggleLabel: { fontFamily: fontFamily.semiBold, fontSize: 11.5, color: colors.textSecondary },
  toggleLabelActive: { color: colors.onPrimary },
  emptyText: {
    fontFamily: fontFamily.light,
    fontSize: 11.5,
    color: colors.textSecondary,
    paddingVertical: 20,
  },
});
