import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  BodyMeasurement,
  MEASUREMENT_TYPES,
  MeasurementType,
} from "@domain/entities/BodyMeasurement";
import {
  changeOutcome,
  groupMeasurementsByType,
  measurementChange,
} from "@domain/services/measurementProgression";
import { Card } from "@presentation/components/ui/Card";
import { Icon } from "@presentation/components/ui/Icon";
import { Sparkline } from "@presentation/components/ui/Sparkline";
import { colors, measurementColors, measurementLabels } from "@presentation/theme/colors";
import { radius, spacing } from "@presentation/theme/spacing";
import { fontFamily } from "@presentation/theme/typography";
import { formatNumber } from "./exerciseProgressFormat";
import { formatCmChange, outcomeColors } from "./measurementProgressFormat";

interface MeasurementsGridProps {
  history: BodyMeasurement[];
  onRegisterPress: () => void;
  onOpenMeasurement: (type: MeasurementType) => void;
}

export function MeasurementsGrid({
  history,
  onRegisterPress,
  onOpenMeasurement,
}: MeasurementsGridProps) {
  const byType = groupMeasurementsByType(history);
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
            const change = measurementChange(points);
            const outcome = change ? changeOutcome(type, change) : "unchanged";
            return (
              <Pressable
                key={type}
                accessibilityRole="button"
                accessibilityLabel={[
                  measurementLabels[type],
                  `${formatNumber(latest.valueCm)} cm`,
                  change ? `${formatCmChange(change)} desde o primeiro registro` : null,
                ]
                  .filter(Boolean)
                  .join(", ")}
                onPress={() => onOpenMeasurement(type)}
                style={({ pressed }) => [styles.cell, pressed && styles.cellPressed]}
              >
                <View style={styles.cellHeader}>
                  <View style={[styles.dot, { backgroundColor: measurementColors[type] }]} />
                  <Text style={styles.cellLabel}>{measurementLabels[type]}</Text>
                  <Icon name="chevron-right" size={12} color={colors.textFaint} strokeWidth={2.2} />
                </View>
                <View style={styles.cellBody}>
                  <View>
                    <Text style={styles.cellValue}>
                      {formatNumber(latest.valueCm)}
                      <Text style={styles.cellUnit}> cm</Text>
                    </Text>
                    {change ? (
                      <Text style={[styles.cellDelta, { color: outcomeColors[outcome].text }]}>
                        {outcome === "unchanged" ? "sem variação" : formatCmChange(change)}
                      </Text>
                    ) : null}
                  </View>
                  {points.length > 1 ? (
                    <Sparkline
                      values={points.map((p) => p.valueCm)}
                      color={measurementColors[type]}
                    />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </Card>
  );
}

function formatDay(date: string): string {
  const [, month, day] = date.split("-");
  return `${day}/${month}`;
}

const styles = StyleSheet.create({
  card: { gap: spacing.md, padding: 18 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
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
  emptyText: {
    fontFamily: fontFamily.light,
    fontSize: 11.5,
    color: colors.textSecondary,
    paddingVertical: 8,
  },
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
  cellPressed: { opacity: 0.6 },
  cellHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 7 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  cellLabel: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 10.5,
    color: colors.textSecondary,
  },
  cellBody: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  cellValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
    letterSpacing: -0.4,
    color: colors.textPrimary,
  },
  cellUnit: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.textMuted },
  cellDelta: { fontFamily: fontFamily.medium, fontSize: 10, marginTop: 3 },
});
