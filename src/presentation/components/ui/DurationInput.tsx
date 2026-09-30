import React, { useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import {
  durationDigits,
  durationDigitsToSeconds,
  formatDuration,
  maskDurationDigits,
} from "@shared/duration";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";

interface DurationInputProps {
  /** Seconds. */
  value: number;
  onChange: (seconds: number) => void;
  accessibilityLabel?: string;
}

/**
 * MM:SS field typed with digits only, filled from the right (1 → 00:01,
 * 130 → 01:30). Seconds over 59 carry into minutes once the field loses focus.
 * Clearing the field never emits zero.
 */
export function DurationInput({ value, onChange, accessibilityLabel }: DurationInputProps) {
  // Digits being typed; null while not editing, so the value shows normalized.
  const [draft, setDraft] = useState<string | null>(null);

  function handleChangeText(text: string) {
    const digits = durationDigits(text);
    if (digits === null) return;
    setDraft(digits);
    // A cleared field is mid-typing, not a zero-length set: keep the last value
    // (shown again on blur) instead of saving it.
    const seconds = durationDigitsToSeconds(digits);
    if (seconds > 0) onChange(seconds);
  }

  return (
    <TextInput
      value={draft !== null ? maskDurationDigits(draft) : formatDuration(value)}
      onChangeText={handleChangeText}
      onFocus={() => setDraft(durationDigits(formatDuration(value)) ?? "")}
      onBlur={() => setDraft(null)}
      keyboardType="number-pad"
      selectTextOnFocus
      accessibilityLabel={accessibilityLabel}
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surfaceDeep,
    borderRadius: 13,
    paddingVertical: 10,
    paddingHorizontal: 8,
    textAlign: "center",
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
});
