import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors } from "../../theme/colors";
import { radius, spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

interface TextFieldProps extends TextInputProps {
  label?: string;
  suffix?: string;
}

export function TextField({ label, suffix, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, style]}
          {...props}
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  label: { ...typography.label, color: colors.textSecondary, textTransform: "uppercase" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  input: {
    flex: 1,
    fontFamily: typography.bodyStrong.fontFamily,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  suffix: { ...typography.caption, fontSize: 13, color: colors.textMuted },
});
