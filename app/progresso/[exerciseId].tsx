import { ExerciseHelpButton } from "@presentation/components/features/ExerciseHelpButton";
import { ExerciseProgressDetail } from "@presentation/components/features/ExerciseProgressDetail";
import { Icon } from "@presentation/components/ui/Icon";
import { useExerciseProgress } from "@presentation/hooks/useExerciseProgress";
import { useProfile } from "@presentation/hooks/useProfile";
import { colors } from "@presentation/theme/colors";
import { muscleGroupLabels } from "@presentation/theme/muscleGroups";
import { spacing } from "@presentation/theme/spacing";
import { fontFamily, typography } from "@presentation/theme/typography";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExerciseProgressScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const { profile } = useProfile();
  const { items, isLoading } = useExerciseProgress(profile?.id);
  const item = items.find((candidate) => candidate.exerciseId === exerciseId);
  const exercise = item?.exercise;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Icon name="chevron-left" size={15} color={colors.textPrimary} strokeWidth={2.2} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={2}>
              {exercise?.name ?? "Exercício"}
            </Text>
            {item ? (
              <Text style={styles.subtitle}>
                {exercise ? `${muscleGroupLabels[exercise.muscleGroup]} · ` : ""}
                {item.sessions.length} {item.sessions.length === 1 ? "treino" : "treinos"}
              </Text>
            ) : null}
          </View>
          {exercise ? (
            <ExerciseHelpButton exerciseName={exercise.name} isCustom={exercise.isCustom} />
          ) : null}
        </View>

        {item ? (
          <ExerciseProgressDetail item={item} />
        ) : isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.loading} />
        ) : (
          <Text style={styles.emptyText}>Nenhum treino registrado para este exercício.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xxl, paddingBottom: 48, gap: spacing.xl },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1, gap: 2 },
  title: { ...typography.screenTitle, color: colors.textPrimary },
  subtitle: { fontFamily: fontFamily.light, fontSize: 11.5, color: colors.textFaint },
  loading: { marginTop: spacing.xxxl },
  emptyText: { fontFamily: fontFamily.light, fontSize: 12, color: colors.textSecondary },
});
