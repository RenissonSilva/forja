import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";

interface StepperProps {
  label?: string;
  value: number;
  step?: number;
  min?: number;
  max?: number;
  /** Lets the typed value have decimals (e.g. 22.5 kg); otherwise it's rounded to a whole number. */
  decimal?: boolean;
  onChange: (value: number) => void;
}

export function Stepper({
  label,
  value,
  step = 1,
  min = 0,
  max,
  decimal = false,
  onChange,
}: StepperProps) {
  // Text being typed; null while the field isn't being edited.
  const [draft, setDraft] = useState<string | null>(null);

  const clamp = (next: number) => Math.max(min, max === undefined ? next : Math.min(max, next));

  function parseDraft(): number | null {
    if (draft === null) return null;
    const normalized = draft.trim().replace(",", ".");
    if (normalized === "") return null;
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) return null;
    return clamp(decimal ? round(parsed) : Math.round(parsed));
  }

  function commitDraft() {
    const typed = parseDraft();
    setDraft(null);
    if (typed !== null && typed !== value) onChange(typed);
  }

  // The buttons step from what's typed, if anything, so a tap mid-edit isn't lost.
  function stepBy(delta: number) {
    const base = parseDraft() ?? value;
    setDraft(null);
    onChange(clamp(round(base + delta)));
  }

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Diminuir ${label ?? "valor"}`}
          onPress={() => stepBy(-step)}
          style={styles.stepButton}
        >
          <Text style={styles.stepSymbol}>−</Text>
        </Pressable>
        <TextInput
          accessibilityLabel={label ?? "Valor"}
          value={draft ?? String(value)}
          onChangeText={setDraft}
          onFocus={() => setDraft(String(value))}
          onBlur={commitDraft}
          selectTextOnFocus
          keyboardType={decimal ? "decimal-pad" : "number-pad"}
          returnKeyType="done"
          style={styles.value}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Aumentar ${label ?? "valor"}`}
          onPress={() => stepBy(step)}
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
  value: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    textAlign: "center",
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
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
