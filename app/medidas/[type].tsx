import { MeasurementProgressDetail } from "@presentation/components/features/MeasurementProgressDetail";
import { parseMeasurementType } from "@presentation/components/features/measurementProgressFormat";
import { Icon } from "@presentation/components/ui/Icon";
import { useMeasurementsHistory } from "@presentation/hooks/useMeasurementsHistory";
import { useProfile } from "@presentation/hooks/useProfile";
import { colors, measurementColors, measurementLabels } from "@presentation/theme/colors";
import { spacing } from "@presentation/theme/spacing";
import { fontFamily, typography } from "@presentation/theme/typography";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MeasurementProgressScreen() {
  const { type: typeParam } = useLocalSearchParams<{ type: string }>();
  const type = parseMeasurementType(typeParam);
  const { profile } = useProfile();
  const { byType, isLoading } = useMeasurementsHistory(profile?.id);
  const entries = (type && byType[type]) ?? [];

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
            <View style={styles.titleRow}>
              {type ? (
                <View style={[styles.dot, { backgroundColor: measurementColors[type] }]} />
              ) : null}
              <Text style={styles.title} numberOfLines={1}>
                {type ? measurementLabels[type] : "Medida"}
              </Text>
            </View>
            {entries.length > 0 ? (
              <Text style={styles.subtitle}>
                {entries.length} {entries.length === 1 ? "registro" : "registros"}
              </Text>
            ) : null}
          </View>
        </View>

        {type && entries.length > 0 ? (
          <MeasurementProgressDetail type={type} entries={entries} />
        ) : isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.loading} />
        ) : (
          <Text style={styles.emptyText}>Nenhuma medição registrada para esta medida.</Text>
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
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  title: { ...typography.screenTitle, color: colors.textPrimary, flexShrink: 1 },
  subtitle: { fontFamily: fontFamily.light, fontSize: 11.5, color: colors.textFaint },
  loading: { marginTop: spacing.xxxl },
  emptyText: { fontFamily: fontFamily.light, fontSize: 12, color: colors.textSecondary },
});
