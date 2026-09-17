import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BodyMeasurement, MEASUREMENT_TYPES, MeasurementType } from "@domain/entities/BodyMeasurement";
import { Card } from "@presentation/components/ui/Card";
import { Icon } from "@presentation/components/ui/Icon";
import { colors, measurementColors, measurementLabels } from "@presentation/theme/colors";
import { radius, spacing } from "@presentation/theme/spacing";
import { fontFamily } from "@presentation/theme/typography";
import { Polyline, Svg } from "react-native-svg";

interface MeasurementsGridProps {
  history: BodyMeasurement[];
  onRegisterPress: () => void;
}

export function MeasurementsGrid({ history, onRegisterPress }: MeasurementsGridProps) {
  const byType = groupByType(history);
  const lastDate = history[history.length - 1]?.date;
  const registered = MEASUREMENT_TYPES.filter((type) => byType[type]?.length);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Medidas</Text>
          <Text style={styles.subtitle}>
            {lastDate ? `Última atualização em ${formatDay(lastDate)}` : "Nenhum registro ainda"}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onRegisterPress}
          style={styles.registerButton}
        >
          <Icon name="plus" size={12} color={colors.onPrimary} strokeWidth={3} />
          <Text style={styles.registerLabel}>Registrar</Text>
        </Pressable>
      </View>

      {registered.length === 0 ? (
        <Text style={styles.emptyText}>
          Toque em &quot;Registrar&quot; para lançar suas primeiras medidas corporais.
        </Text>
      ) : (
        <View style={styles.grid}>
          {registered.map((type) => {
            const points = byType[type]!;
            const latest = points[points.length - 1]!;
            const first = points[0]!;
            const delta = latest.valueCm - first.valueCm;
            return (
              <View key={type} style={styles.cell}>
                <View style={styles.cellHeader}>
                  <View style={[styles.dot, { backgroundColor: measurementColors[type] }]} />
                  <Text style={styles.cellLabel}>{measurementLabels[type]}</Text>
                </View>
                <View style={styles.cellBody}>
                  <View>
                    <Text style={styles.cellValue}>
                      {latest.valueCm}
                      <Text style={styles.cellUnit}> cm</Text>
                    </Text>
                    {points.length > 1 ? (
                      <Text style={styles.cellDelta}>
                        {delta >= 0 ? "+" : ""}
                        {delta.toFixed(1)}
                      </Text>
                    ) : null}
                  </View>
                  {points.length > 1 ? (
                    <Sparkline values={points.map((p) => p.valueCm)} color={measurementColors[type]} />
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const width = 58;
  const height = 24;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1 || 1);

  const points = values
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Polyline points={points} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}

function groupByType(history: BodyMeasurement[]): Partial<Record<MeasurementType, BodyMeasurement[]>> {
  const result: Partial<Record<MeasurementType, BodyMeasurement[]>> = {};
  for (const entry of history) {
    const list = result[entry.type] ?? [];
    list.push(entry);
    result[entry.type] = list;
  }
  return result;
}

function formatDay(date: string): string {
  const [, month, day] = date.split("-");
  return `${day}/${month}`;
}

const styles = StyleSheet.create({
  card: { gap: spacing.md, padding: 18 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.sm },
  title: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.textPrimary },
  subtitle: { fontFamily: fontFamily.light, fontSize: 11, color: colors.textFaint, marginTop: 3 },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md - 1,
    backgroundColor: colors.primary,
  },
  registerLabel: { fontFamily: fontFamily.semiBold, fontSize: 11.5, color: colors.onPrimary },
  emptyText: { fontFamily: fontFamily.light, fontSize: 11.5, color: colors.textSecondary, paddingVertical: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  cell: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    padding: spacing.md - 1,
  },
  cellHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 7 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  cellLabel: { fontFamily: fontFamily.regular, fontSize: 10.5, color: colors.textSecondary },
  cellBody: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: spacing.sm },
  cellValue: { fontFamily: fontFamily.semiBold, fontSize: 17, letterSpacing: -0.4, color: colors.textPrimary },
  cellUnit: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.textMuted },
  cellDelta: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.textPrimary, marginTop: 3 },
});
