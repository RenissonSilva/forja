import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";
import { RadialGlow } from "./RadialGlow";

type ButtonVariant = "primary" | "dashed" | "secondary";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const content = (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColors[variant]} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );

  if (variant === "primary") {
    return (
      <View style={styles.primaryWrapper}>
        <RadialGlow
          size={240}
          color="#FF6A1A"
          opacity={0.38}
          fadeAt={50}
          style={styles.primaryGlow}
        />
        {content}
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  primaryWrapper: {
    position: "relative",
    width: "100%",
    alignItems: "center",
  },
  primaryGlow: {
    position: "absolute",
    top: -92,
    alignSelf: "center",
  },
  base: {
    width: "100%",
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  label: { fontFamily: fontFamily.semiBold, fontSize: 15.5 },
});

const labelStyles = StyleSheet.create({
  primary: { color: colors.onPrimary },
  dashed: { color: colors.primary },
  secondary: { color: colors.textPrimary },
});

const indicatorColors: Record<ButtonVariant, string> = {
  primary: colors.onPrimary,
  dashed: colors.primary,
  secondary: colors.textPrimary,
};

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    shadowColor: "#FF6A1A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
    boxShadow: "0px 12px 30px rgba(255,106,26,0.38)",
  },
  dashed: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.primaryBorder,
  },
  secondary: {
    backgroundColor: colors.control,
  },
});
