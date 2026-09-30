import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ExerciseProgressItem } from "@application/progress/GetExerciseProgress.usecase";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";
import { Icon } from "../ui/Icon";
import { ExerciseProgressList } from "./ExerciseProgressList";

const PREVIEW_COUNT = 5;

interface ExerciseProgressOverviewProps {
  items: readonly ExerciseProgressItem[];
  isLoading: boolean;
  onOpenExercise: (exerciseId: string) => void;
  onSeeAll: () => void;
}

/** The most recently trained exercises, with a link to the full list. */
export function ExerciseProgressOverview({
  items,
  isLoading,
  onOpenExercise,
  onSeeAll,
}: ExerciseProgressOverviewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progressão dos exercícios</Text>
        <Text style={styles.subtitle}>Variação desde o primeiro treino de cada um</Text>
      </View>

      {items.length > 0 ? (
        <ExerciseProgressList
          items={items.slice(0, PREVIEW_COUNT)}
          onOpenExercise={onOpenExercise}
        />
      ) : isLoading ? null : (
        <Text style={styles.emptyText}>
          Marque os exercícios como concluídos durante o treino para acompanhar sua evolução aqui.
        </Text>
      )}

      {items.length > PREVIEW_COUNT ? (
        <Pressable
          accessibilityRole="button"
          onPress={onSeeAll}
          style={({ pressed }) => [styles.seeAll, pressed && styles.seeAllPressed]}
        >
          <Text style={styles.seeAllLabel}>Ver todos os {items.length} exercícios</Text>
          <Icon name="chevron-right" size={13} color={colors.primary} strokeWidth={2.4} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  header: { gap: 3, marginBottom: 2 },
  title: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.textPrimary },
  subtitle: { fontFamily: fontFamily.light, fontSize: 11, color: colors.textFaint },
  emptyText: {
    fontFamily: fontFamily.light,
    fontSize: 11.5,
    color: colors.textSecondary,
    paddingVertical: 8,
  },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.primaryMuted,
  },
  seeAllPressed: { opacity: 0.7 },
  seeAllLabel: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.primary },
});
