import { Button } from "@presentation/components/ui/Button";
import { Icon, IconName } from "@presentation/components/ui/Icon";
import { colors } from "@presentation/theme/colors";
import { spacing } from "@presentation/theme/spacing";
import { fontFamily, typography } from "@presentation/theme/typography";
import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FEATURES: { icon: IconName; label: string }[] = [
  { icon: "dumbbell", label: "Treinos personalizados por ficha" },
  { icon: "calendar", label: "Presença registrada dia a dia" },
  { icon: "trending-up", label: "IMC e peso em gráfico" },
];

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/welcome-bg.png")}
        style={styles.bgImage}
        resizeMode="cover"
      />

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <Text style={styles.wordmark}>
          FORJA<Text style={styles.wordmarkDot}>.</Text>
        </Text>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSpacer} />

          <Text style={styles.title}>Cada treino{"\n"}no lugar certo.</Text>
          <Text style={styles.subtitle}>
            Monte seus treinos com séries, cargas e ajustes de cadeira. Marque o treino do dia,
            acompanhe a semana no calendário e veja seu IMC evoluir.
          </Text>

          <View style={styles.features}>
            {FEATURES.map((feature) => (
              <View key={feature.label} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Icon name={feature.icon} size={16} color={colors.primary} strokeWidth={2} />
                </View>
                <Text style={styles.featureLabel}>{feature.label}</Text>
              </View>
            ))}
          </View>

          <Button label="Continuar" onPress={() => router.push("/criar-perfil")} />
          <Text style={styles.footnote}>Leva menos de um minuto para configurar</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  bgImage: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },
  safeArea: { flex: 1 },
  wordmark: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    letterSpacing: 2,
    color: colors.textPrimary,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.sm,
    marginBottom: spacing.xs,
    zIndex: 10,
  },
  wordmarkDot: { color: colors.primary },
  content: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xl, flexGrow: 1 },
  heroSpacer: {
    height: 260,
  },
  title: { ...typography.display, color: colors.textPrimary, marginBottom: 14 },
  subtitle: {
    fontFamily: fontFamily.light,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
    maxWidth: 300,
    marginBottom: 26,
  },
  features: { gap: 12, marginBottom: spacing.xl },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  featureLabel: { fontFamily: fontFamily.regular, fontSize: 13.5, color: "rgba(245,244,242,0.78)" },
  footnote: {
    fontFamily: fontFamily.light,
    fontSize: 11.5,
    color: colors.textFaint,
    textAlign: "center",
    marginTop: 14,
  },
});
