import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";

interface SegmentedControlProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={[styles.button, active && styles.buttonActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 3,
    padding: 3,
    backgroundColor: colors.elevated,
    borderRadius: 11,
    alignSelf: "flex-start",
  },
  button: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  buttonActive: { backgroundColor: colors.primary },
  label: { fontFamily: fontFamily.semiBold, fontSize: 10.5, color: colors.textSecondary },
  labelActive: { color: colors.onPrimary },
});
