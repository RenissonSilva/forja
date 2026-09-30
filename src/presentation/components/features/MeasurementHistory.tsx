import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BodyMeasurement, MeasurementType } from "@domain/entities/BodyMeasurement";
import { changeOutcome, measurementChange } from "@domain/services/measurementProgression";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";
import { Card } from "../ui/Card";
import { formatSessionDate } from "./exerciseProgressFormat";
import { formatCm, formatCmChange, outcomeColors } from "./measurementProgressFormat";

const PAGE_SIZE = 10;

interface MeasurementHistoryProps {
  type: MeasurementType;
  /** Oldest first, as they come from the history. */
  entries: readonly BodyMeasurement[];
}

/** Every entry, newest first, with the change from the one before it. */
export function MeasurementHistory({ type, entries }: MeasurementHistoryProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const newestFirst = [...entries].reverse();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico</Text>
      <Card style={styles.card}>
        {newestFirst.slice(0, visibleCount).map((entry, index) => {
          const previous = newestFirst[index + 1];
          const change = previous ? measurementChange([previous, entry]) : null;
          const outcome = change ? changeOutcome(type, change) : "unchanged";
          return (
            <View key={entry.id} style={[styles.row, index > 0 && styles.rowDivider]}>
              <Text style={styles.date}>{formatSessionDate(entry.date)}</Text>
              <View style={styles.values}>
                <Text style={styles.value}>{formatCm(entry.valueCm)}</Text>
                {change && outcome !== "unchanged" ? (
                  <Text style={[styles.delta, { color: outcomeColors[outcome].text }]}>
                    {formatCmChange(change)}
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
  date: { flex: 1, fontFamily: fontFamily.semiBold, fontSize: 12.5, color: colors.textPrimary },
  values: { alignItems: "flex-end", gap: 3 },
  value: { fontFamily: fontFamily.semiBold, fontSize: 12.5, color: colors.textPrimary },
  delta: { fontFamily: fontFamily.medium, fontSize: 10.5 },
  showMore: { alignItems: "center", paddingVertical: 12 },
  showMorePressed: { opacity: 0.6 },
  showMoreLabel: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.primary },
});
