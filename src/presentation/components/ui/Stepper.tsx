import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";

interface StepperProps {
  label?: string;
  value: number;
  step?: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function Stepper({ label, value, step = 1, min = 0, max, onChange }: StepperProps) {
  const decrement = () => onChange(Math.max(min, round(value - step)));
  const increment = () =>
    onChange(max === undefined ? round(value + step) : Math.min(max, round(value + step)));

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Diminuir ${label ?? "valor"}`}
          onPress={decrement}
          style={styles.stepButton}
        >
          <Text style={styles.stepSymbol}>−</Text>
        </Pressable>
        <Text style={styles.value}>{value}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Aumentar ${label ?? "valor"}`}
          onPress={increment}
          style={[styles.stepButton, styles.stepButtonActive]}
        >
          <Text style={[styles.stepSymbol, styles.stepSymbolActive]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 6,
    backgroundColor: colors.surfaceDeep,
    borderRadius: 13,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: 2,
  },
  value: { fontFamily: fontFamily.semiBold, fontSize: 16, color: colors.textPrimary },
  stepButton: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.controlAlt,
  },
  stepButtonActive: { backgroundColor: colors.primaryMutedStrong },
  stepSymbol: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.textPrimary },
  stepSymbolActive: { color: colors.primary },
});
