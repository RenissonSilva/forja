import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { colors } from "../../theme/colors";
import { radius, spacing } from "../../theme/spacing";

interface CardProps extends ViewProps {
  raised?: boolean;
}

export function Card({ style, raised, ...props }: CardProps) {
  return <View style={[styles.base, raised && styles.raised, style]} {...props} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
  },
  raised: {
    backgroundColor: colors.surfaceRaised,
  },
});
