import { useExerciseDetails } from "@presentation/hooks/useExerciseDetails";
import { Image } from "expo-image";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { fontFamily } from "../../theme/typography";
import { BottomSheet } from "../ui/BottomSheet";

interface ExerciseHelpModalProps {
  visible: boolean;
  onClose: () => void;
  exerciseName: string;
  isCustom: boolean;
}

export function ExerciseHelpModal({
  visible,
  onClose,
  exerciseName,
  isCustom,
}: ExerciseHelpModalProps) {
  const { status, details } = useExerciseDetails(exerciseName, isCustom, visible);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Text style={styles.title}>{exerciseName}</Text>
      </View>

      {status === "loading" ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}

      {status === "not-found" ? (
        <View style={styles.centerBox}>
          <Text style={styles.mutedText}>Não encontramos informações para este exercício.</Text>
        </View>
      ) : null}

      {status === "error" ? (
        <View style={styles.centerBox}>
          <Text style={styles.mutedText}>Não foi possível buscar as informações agora.</Text>
        </View>
      ) : null}

      {status === "loaded" && details ? (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Image
            source={{ uri: details.gifUrl }}
            style={styles.gif}
            contentFit="contain"
            autoplay
          />

          <View style={styles.badgeRow}>
            <Badge label={details.targetMuscle} />
            {details.secondaryMuscles.map((muscle) => (
              <Badge key={muscle} label={muscle} muted />
            ))}
            {details.equipment ? <Badge label={details.equipment} muted /> : null}
          </View>

          <Section title="Instruções">
            {details.instructions.map((step, index) => (
              <Text key={index} style={styles.stepText}>
                {index + 1}. {step}
              </Text>
            ))}
          </Section>

          <Section title="Dicas">
            {details.tips.map((tip, index) => (
              <Text key={index} style={styles.tipText}>
                • {tip}
              </Text>
            ))}
          </Section>

          {details.related.length > 0 ? (
            <Section title="Exercícios relacionados">
              <View style={styles.chipRow}>
                {details.related.map((item) => (
                  <View key={item.externalId} style={styles.chip}>
                    <Text style={styles.chipText}>{item.name}</Text>
                  </View>
                ))}
              </View>
            </Section>
          ) : null}

          <Text style={styles.source}>
            Fonte: ExerciseDB{details.isTranslated ? " · tradução automática" : ""}
          </Text>
        </ScrollView>
      ) : null}
    </BottomSheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Badge({ label, muted }: { label: string; muted?: boolean }) {
  if (!label) return null;
  return (
    <View style={[styles.badge, muted && styles.badgeMuted]}>
      <Text style={[styles.badgeText, muted && styles.badgeTextMuted]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  title: { fontFamily: fontFamily.semiBold, fontSize: 18, color: colors.textPrimary },
  centerBox: { padding: spacing.xxl, alignItems: "center" },
  mutedText: {
    fontFamily: fontFamily.regular,
    fontSize: 13.5,
    color: colors.textMuted,
    textAlign: "center",
  },
  scroll: { paddingHorizontal: spacing.xl },
  scrollContent: { paddingBottom: spacing.xxl, gap: spacing.lg },
  gif: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    backgroundColor: colors.surfaceDeep,
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: colors.primaryMuted,
  },
  badgeMuted: { backgroundColor: colors.elevated },
  badgeText: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.primary },
  badgeTextMuted: { color: colors.textSecondary },
  section: { gap: 6 },
  sectionTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  stepText: {
    fontFamily: fontFamily.light,
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  tipText: {
    fontFamily: fontFamily.light,
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: colors.elevated,
  },
  chipText: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textSecondary },
  source: {
    fontFamily: fontFamily.light,
    fontSize: 10.5,
    color: colors.textFaint,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
