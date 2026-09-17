import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BodyMeasurement, MEASUREMENT_TYPES, MeasurementType } from "@domain/entities/BodyMeasurement";
import { BottomSheet } from "@presentation/components/ui/BottomSheet";
import { Icon } from "@presentation/components/ui/Icon";
import { colors, measurementColors, measurementLabels } from "@presentation/theme/colors";
import { radius, spacing } from "@presentation/theme/spacing";
import { fontFamily } from "@presentation/theme/typography";

const STEP = 0.5;
const MIN_CM = 10;
const MAX_CM = 300;

interface RegisterMeasurementsSheetProps {
  visible: boolean;
  onClose: () => void;
  latestByType: Partial<Record<MeasurementType, BodyMeasurement>>;
  onSave: (values: Partial<Record<MeasurementType, number>>) => Promise<void>;
}

export function RegisterMeasurementsSheet({
  visible,
  onClose,
  latestByType,
  onSave,
}: RegisterMeasurementsSheetProps) {
  const [draft, setDraft] = useState<Partial<Record<MeasurementType, number>>>(() =>
    Object.fromEntries(
      MEASUREMENT_TYPES.map((type) => [type, latestByType[type]?.valueCm]).filter(
        ([, value]) => value !== undefined,
      ),
    ),
  );
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onSave(draft);
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Registrar medidas</Text>
          <Text style={styles.subtitle}>valores em centímetros</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          onPress={onClose}
          style={styles.closeButton}
        >
          <Icon name="x" size={13} color={colors.textPrimary} strokeWidth={2.4} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {MEASUREMENT_TYPES.map((type) => {
          const value = draft[type];
          const previous = latestByType[type]?.valueCm;
          return (
            <View key={type} style={styles.row}>
              <View style={[styles.rowStripe, { backgroundColor: measurementColors[type] }]} />
              <View style={styles.rowInfo}>
                <Text style={styles.rowLabel}>{measurementLabels[type]}</Text>
                <Text style={styles.rowPrevious}>
                  {previous !== undefined ? `Última: ${previous} cm` : "Sem registro anterior"}
                </Text>
              </View>
              <View style={styles.rowControls}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Diminuir ${measurementLabels[type]}`}
                  onPress={() =>
                    setDraft((current) => ({
                      ...current,
                      [type]: clamp(round((value ?? previous ?? MIN_CM) - STEP)),
                    }))
                  }
                  style={styles.stepButton}
                >
                  <Text style={styles.stepSymbol}>−</Text>
                </Pressable>
                <Text style={styles.rowValue}>
                  {value !== undefined ? value : "--"}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Aumentar ${measurementLabels[type]}`}
                  onPress={() =>
                    setDraft((current) => ({
                      ...current,
                      [type]: clamp(round((value ?? previous ?? MIN_CM) + STEP)),
                    }))
                  }
                  style={[styles.stepButton, styles.stepButtonActive]}
                >
                  <Icon name="plus" size={12} color={colors.primary} strokeWidth={2.6} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={handleSave}
          disabled={isSaving}
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveLabel}>{isSaving ? "Salvando…" : "Salvar medidas"}</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function clamp(value: number): number {
  return Math.max(MIN_CM, Math.min(MAX_CM, value));
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: { fontFamily: fontFamily.semiBold, fontSize: 19, letterSpacing: -0.5, color: colors.textPrimary },
  subtitle: { fontFamily: fontFamily.light, fontSize: 11.5, color: colors.textFaint, marginTop: 4 },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  rowStripe: { width: 6, height: 26, borderRadius: 3 },
  rowInfo: { flex: 1, minWidth: 0 },
  rowLabel: { fontFamily: fontFamily.medium, fontSize: 13.5, color: colors.textPrimary },
  rowPrevious: { fontFamily: fontFamily.light, fontSize: 10.5, color: colors.textFaint, marginTop: 2 },
  rowControls: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  stepButton: {
    width: 30,
    height: 30,
    borderRadius: radius.sm + 1,
    backgroundColor: colors.controlAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  stepButtonActive: { backgroundColor: colors.primaryMutedStrong },
  stepSymbol: { fontFamily: fontFamily.semiBold, fontSize: 16, color: colors.textPrimary },
  rowValue: { fontFamily: fontFamily.semiBold, fontSize: 16, color: colors.textPrimary, minWidth: 46, textAlign: "center" },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.surfaceRaised,
  },
  saveButton: {
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveLabel: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.onPrimary },
});
