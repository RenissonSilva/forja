import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BodyMeasurement, MEASUREMENT_TYPES, MeasurementType } from "@domain/entities/BodyMeasurement";
import { fromDateKey } from "@shared/date-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart } from "react-native-gifted-charts";
import { colors, measurementColors, measurementLabels } from "@presentation/theme/colors";
import { radius, spacing } from "@presentation/theme/spacing";
import { fontFamily } from "@presentation/theme/typography";

interface MeasurementsProgressChartProps {
  history: BodyMeasurement[];
}

export function MeasurementsProgressChart({ history }: MeasurementsProgressChartProps) {
  const available = useMemo(
    () => MEASUREMENT_TYPES.filter((type) => history.some((entry) => entry.type === type)),
    [history],
  );
  const [selected, setSelected] = useState<MeasurementType | null>(available[0] ?? null);

  if (available.length === 0) return null;

  const active = selected && available.includes(selected) ? selected : available[0]!;
  const points = history.filter((entry) => entry.type === active);
  const chartData = points.map((point) => ({
    value: point.valueCm,
    label: format(fromDateKey(point.date), "MMM", { locale: ptBR }),
  }));
  const latest = points[points.length - 1];
  const first = points[0];
  const delta = latest && first ? latest.valueCm - first.valueCm : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progressão das medidas</Text>
      <Text style={styles.subtitle}>
        {measurementLabels[active]} · {latest ? `${latest.valueCm} cm` : "--"}
        {points.length > 1 ? ` (${delta >= 0 ? "+" : ""}${delta.toFixed(1)})` : ""}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {available.map((type) => (
          <Pressable
            key={type}
            onPress={() => setSelected(type)}
            style={[
              styles.chip,
              { backgroundColor: active === type ? measurementColors[type] : colors.elevated },
            ]}
          >
            <Text style={[styles.chipLabel, active === type && styles.chipLabelActive]}>
              {measurementLabels[type]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {chartData.length >= 2 ? (
        <LineChart
          data={chartData}
          areaChart
          curved
          color={measurementColors[active]}
          startFillColor={measurementColors[active]}
          endFillColor={colors.background}
          startOpacity={0.34}
          endOpacity={0}
          thickness={2.6}
          hideRules
          hideYAxisText
          yAxisColor="transparent"
          xAxisColor={colors.borderSubtle}
          xAxisLabelTextStyle={{ color: colors.textFaint, fontSize: 10.5 }}
          dataPointsColor={measurementColors[active]}
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

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  title: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.textPrimary },
  subtitle: { fontFamily: fontFamily.light, fontSize: 11, color: colors.textFaint },
  chips: { marginTop: spacing.xs, marginBottom: spacing.xs },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    marginRight: 6,
  },
  chipLabel: { fontFamily: fontFamily.semiBold, fontSize: 10.5, color: colors.textSecondary },
  chipLabelActive: { color: colors.onPrimary },
  emptyText: {
    fontFamily: fontFamily.light,
    fontSize: 11.5,
    color: colors.textSecondary,
    paddingVertical: 20,
  },
});
