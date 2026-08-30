import { Button } from "@presentation/components/ui/Button";
import { Card } from "@presentation/components/ui/Card";
import { Icon } from "@presentation/components/ui/Icon";
import { BmiGauge } from "@presentation/components/features/BmiGauge";
import { WeightImcChart } from "@presentation/components/features/WeightImcChart";
import { useBmiHistory } from "@presentation/hooks/useBmiHistory";
import { useProfile } from "@presentation/hooks/useProfile";
import { useWeightHistory } from "@presentation/hooks/useWeightHistory";
import {
  bmiClassificationColors,
  bmiClassificationLabels,
  colors,
} from "@presentation/theme/colors";
import { spacing } from "@presentation/theme/spacing";
import { fontFamily, typography } from "@presentation/theme/typography";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ImcScreen() {
  const { profile, update } = useProfile();
  const { points, refresh: refreshBmi } = useBmiHistory(profile?.id);
  const { registerWeight } = useWeightHistory(profile?.id);
  const [draftHeight, setDraftHeight] = useState<number | null>(null);
  const [draftWeight, setDraftWeight] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  if (!profile) return null;

  const latest = points[points.length - 1];
  const first = points[0];
  const currentBmi = latest?.bmi ?? 0;
  const currentClassification = latest?.classification ?? "saudavel";
  const currentWeight = latest?.weightKg ?? 0;
  const bmiDelta = latest && first ? latest.bmi - first.bmi : 0;

  const displayedHeight = draftHeight ?? profile.heightCm;
  const displayedWeight = draftWeight ?? currentWeight;
  const isDirty = draftHeight !== null || draftWeight !== null;
  const showProgressChart = hasSaved || points.length > 1;

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (draftHeight !== null) await update({ heightCm: draftHeight });
      if (draftWeight !== null) await registerWeight(draftWeight);
      await refreshBmi();
      setDraftHeight(null);
      setDraftWeight(null);
      setHasSaved(true);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>IMC</Text>

        <Card style={styles.imcCard}>
          <View style={styles.imcTopRow}>
            <View>
              <Text style={styles.imcLabel}>SEU IMC</Text>
              <View style={styles.imcValueRow}>
                <Text style={styles.imcValue}>{currentBmi.toFixed(1)}</Text>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: `${bmiClassificationColors[currentClassification]}26` },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeLabel,
                      { color: bmiClassificationColors[currentClassification] },
                    ]}
                  >
                    {bmiClassificationLabels[currentClassification]}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.imcMetaColumn}>
              <Text style={styles.imcMeta}>
                {profile.heightCm} cm · {currentWeight.toFixed(1)} kg
              </Text>
              {points.length > 1 ? (
                <Text style={styles.imcDelta}>
                  {bmiDelta >= 0 ? "+" : ""}
                  {bmiDelta.toFixed(1)} desde o início
                </Text>
              ) : null}
            </View>
          </View>
          <BmiGauge bmiValue={currentBmi} />
        </Card>

        <View style={styles.row}>
          <MeasureCard
            label="Altura"
            value={displayedHeight}
            unit="cm"
            step={1}
            min={100}
            max={250}
            onChange={setDraftHeight}
          />
          <MeasureCard
            label="Peso"
            value={displayedWeight}
            unit="kg"
            step={0.1}
            min={20}
            max={400}
            onChange={setDraftWeight}
          />
        </View>

        {showProgressChart ? (
          <Card style={styles.progressCard}>
            <WeightImcChart points={points} />
          </Card>
        ) : null}
      </ScrollView>

      {isDirty ? (
        <View style={styles.saveFooter}>
          <Button label="Salvar" onPress={handleSave} loading={isSaving} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

interface MeasureCardProps {
  label: string;
  value: number;
  unit: string;
  step: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function MeasureCard({ label, value, unit, step, min, max, onChange }: MeasureCardProps) {
  const decrement = () => onChange(Math.max(min, round(value - step)));
  const increment = () => onChange(Math.min(max, round(value + step)));

  return (
    <Card style={styles.measureCard}>
      <Text style={styles.measureLabel}>{label}</Text>
      <View style={styles.measureRow}>
        <Text style={styles.measureValue}>
          {step < 1 ? value.toFixed(1) : Math.round(value)}
          <Text style={styles.measureUnit}> {unit}</Text>
        </Text>
        <View style={styles.measureButtons}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Diminuir ${label}`}
            onPress={decrement}
            style={styles.measureButton}
          >
            <Text style={styles.measureButtonSymbol}>−</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Aumentar ${label}`}
            onPress={increment}
            style={[styles.measureButton, styles.measureButtonActive]}
          >
            <Icon name="plus" size={12} color={colors.primary} strokeWidth={2.6} />
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xxl, paddingBottom: 130, gap: spacing.md },
  saveFooter: {
    position: "absolute",
    left: spacing.xxl,
    right: spacing.xxl,
    bottom: 106,
  },
  title: { ...typography.screenTitle, color: colors.textPrimary, marginBottom: 6 },
  imcCard: { gap: 18, padding: 20 },
  imcTopRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  imcLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    letterSpacing: 0.4,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  imcValueRow: { flexDirection: "row", alignItems: "baseline", gap: 9 },
  imcValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: 44,
    letterSpacing: -2,
    color: colors.textPrimary,
  },
  badge: { paddingVertical: 5, paddingHorizontal: 9, borderRadius: 7 },
  badgeLabel: { fontFamily: fontFamily.semiBold, fontSize: 12 },
  imcMetaColumn: { alignItems: "flex-end" },
  imcMeta: { fontFamily: fontFamily.light, fontSize: 11, color: colors.textFaint },
  imcDelta: {
    fontFamily: fontFamily.regular,
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 3,
  },
  row: { flexDirection: "row", gap: 10 },
  measureCard: { flex: 1, gap: 8, padding: 14 },
  measureLabel: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.textMuted },
  measureRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  measureValue: { fontFamily: fontFamily.semiBold, fontSize: 20, color: colors.textPrimary },
  measureUnit: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textMuted },
  measureButtons: { flexDirection: "row", gap: 5 },
  measureButton: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: colors.control,
    alignItems: "center",
    justifyContent: "center",
  },
  measureButtonActive: { backgroundColor: colors.primaryMutedStrong },
  measureButtonSymbol: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.textPrimary },
  progressCard: { padding: 18, paddingHorizontal: 16 },
});
