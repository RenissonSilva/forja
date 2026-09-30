import { ExerciseProgressList } from "@presentation/components/features/ExerciseProgressList";
import { matchesExerciseName } from "@presentation/components/features/exerciseProgressFormat";
import { Card } from "@presentation/components/ui/Card";
import { Icon } from "@presentation/components/ui/Icon";
import { TextField } from "@presentation/components/ui/TextField";
import { useExerciseProgress } from "@presentation/hooks/useExerciseProgress";
import { useProfile } from "@presentation/hooks/useProfile";
import { colors } from "@presentation/theme/colors";
import { spacing } from "@presentation/theme/spacing";
import { fontFamily, typography } from "@presentation/theme/typography";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExerciseProgressListScreen() {
  const { profile } = useProfile();
  const { items } = useExerciseProgress(profile?.id);
  const [query, setQuery] = useState("");

  const visibleItems = items.filter((item) =>
    matchesExerciseName(item.exercise?.name ?? "", query),
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
            <Text style={styles.title}>Progressão</Text>
            <Text style={styles.subtitle}>
              {items.length} {items.length === 1 ? "exercício" : "exercícios"} · mais recentes
              primeiro
            </Text>
          </View>
        </View>

        <TextField
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar exercício"
          autoCorrect={false}
          returnKeyType="search"
        />

        <Card style={styles.listCard}>
          {visibleItems.length > 0 ? (
            <ExerciseProgressList
              items={visibleItems}
              onOpenExercise={(exerciseId) => router.push(`/progresso/${exerciseId}`)}
            />
          ) : (
            <Text style={styles.emptyText}>Nenhum exercício encontrado.</Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xxl, paddingBottom: 48, gap: spacing.lg },
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
  listCard: { paddingVertical: 4 },
  emptyText: {
    fontFamily: fontFamily.light,
    fontSize: 11.5,
    color: colors.textSecondary,
    paddingVertical: spacing.lg,
  },
});
