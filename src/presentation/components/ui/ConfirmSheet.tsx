import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { fontFamily } from "../../theme/typography";
import { BottomSheet } from "./BottomSheet";
import { Button } from "./Button";

export interface ConfirmAction {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
}

export interface ConfirmOptions {
  title: string;
  message?: string;
  /** Shown top to bottom, above the "Cancelar" button. */
  actions: ConfirmAction[];
  cancelLabel?: string;
}

interface ConfirmSheetProps {
  options: ConfirmOptions | null;
  onClose: () => void;
}

/** Confirmation in the app's bottom sheet style, replacing the native alert. */
export function ConfirmSheet({ options, onClose }: ConfirmSheetProps) {
  return (
    <BottomSheet visible={options !== null} onClose={onClose}>
      {options ? (
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{options.title}</Text>
            {options.message ? <Text style={styles.message}>{options.message}</Text> : null}
          </View>
          <View style={styles.actions}>
            {options.actions.map((action) => (
              <Button
                key={action.label}
                label={action.label}
                variant={action.variant ?? "secondary"}
                onPress={() => {
                  onClose();
                  action.onPress();
                }}
              />
            ))}
            <Button label={options.cancelLabel ?? "Cancelar"} variant="ghost" onPress={onClose} />
          </View>
        </View>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.xl },
  header: { paddingTop: spacing.sm, gap: 6 },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 19,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  message: {
    fontFamily: fontFamily.light,
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  actions: { gap: spacing.sm },
});
