import { Button } from "@presentation/components/ui/Button";
import { Icon } from "@presentation/components/ui/Icon";
import { TextField } from "@presentation/components/ui/TextField";
import { Toggle } from "@presentation/components/ui/Toggle";
import { useProfile } from "@presentation/hooks/useProfile";
import { colors } from "@presentation/theme/colors";
import { spacing } from "@presentation/theme/spacing";
import { fontFamily, typography } from "@presentation/theme/typography";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WEEKLY_GOAL_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

export default function CreateProfileScreen() {
  const { create } = useProfile();
  const [name, setName] = useState("");
  const [heightCm, setHeightCm] = useState("170");
  const [weightKg, setWeightKg] = useState("70");
  const [weeklyGoalDays, setWeeklyGoalDays] = useState(3);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function pickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    const asset = result.assets?.[0];
    if (!result.canceled && asset) {
      setAvatarUri(asset.uri);
    }
  }

  async function handleSubmit() {
    setErrorMessage(null);
    if (name.trim().length === 0) {
      setErrorMessage("Informe seu nome.");
      return;
    }

    setIsSubmitting(true);
    try {
      await create({
        name,
        avatarUri,
        heightCm: Number(heightCm) || 0,
        weightKg: Number(weightKg) || 0,
        weeklyGoalDays,
        remindersEnabled,
      });
      router.replace("/(tabs)");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível salvar seu perfil.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Icon name="chevron-left" size={15} color={colors.textPrimary} strokeWidth={2.2} />
          </Pressable>
          <View style={styles.progressDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </View>

        <Text style={styles.title}>Criar perfil</Text>
        <Text style={styles.subtitle}>
          Usamos altura e peso para calcular seu IMC e acompanhar o progresso.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Escolher foto de perfil"
          onPress={pickAvatar}
          style={styles.avatarPicker}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} contentFit="cover" />
          ) : (
            <Text style={styles.avatarPlaceholder}>foto{"\n"}opcional</Text>
          )}
          <View style={styles.avatarAddBadge}>
            <Icon name="plus" size={14} color={colors.onPrimary} strokeWidth={2.6} />
          </View>
        </Pressable>

        <TextField
          label="NOME"
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
          autoCapitalize="words"
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TextField
              label="ALTURA"
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="numeric"
              suffix="cm"
            />
          </View>
          <View style={styles.rowItem}>
            <TextField
              label="PESO"
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="numeric"
              suffix="kg"
            />
          </View>
        </View>

        <View style={styles.goalHeader}>
          <Text style={styles.label}>DIAS DE TREINO POR SEMANA</Text>
          <Text style={styles.goalValue}>{weeklyGoalDays} dias</Text>
        </View>
        <View style={styles.daysRow}>
          {WEEKLY_GOAL_OPTIONS.map((day) => (
            <Pressable
              key={day}
              accessibilityRole="button"
              onPress={() => setWeeklyGoalDays(day)}
              style={[styles.dayButton, day === weeklyGoalDays && styles.dayButtonActive]}
            >
              <Text style={[styles.dayLabel, day === weeklyGoalDays && styles.dayLabelActive]}>
                {day}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.hint}>
          Sua meta mensal será de {weeklyGoalDays * 4} treinos. Você pode mudar isso depois em
          Ajustes.
        </Text>

        <View style={styles.reminderRow}>
          <Text style={styles.reminderLabel}>Lembrete nos dias de treino</Text>
          <Toggle value={remindersEnabled} onValueChange={setRemindersEnabled} />
        </View>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <Button label="Continuar" onPress={handleSubmit} loading={isSubmitting} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xxl, gap: spacing.lg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
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
  progressDots: { flexDirection: "row", gap: 6 },
  dot: { width: 26, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong },
  dotActive: { backgroundColor: colors.primary },
  title: { ...typography.sectionTitle, color: colors.textPrimary },
  subtitle: {
    fontFamily: fontFamily.light,
    fontSize: 13.5,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  avatarPicker: {
    alignSelf: "center",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSunken,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.md,
  },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 14,
    color: colors.textFaint,
    textAlign: "center",
  },
  avatarAddBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", gap: spacing.md },
  rowItem: { flex: 1 },
  label: { ...typography.label, color: colors.textSecondary, textTransform: "uppercase" },
  goalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  goalValue: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.primary },
  daysRow: { flexDirection: "row", gap: 7 },
  dayButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  dayButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayLabel: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.textSecondary },
  dayLabelActive: { color: colors.onPrimary },
  hint: { fontFamily: fontFamily.light, fontSize: 11.5, lineHeight: 17, color: colors.textFaint },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 58,
    backgroundColor: colors.surfaceSunken,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  reminderLabel: { fontFamily: fontFamily.regular, fontSize: 13.5, color: colors.textPrimary },
  error: { ...typography.caption, color: colors.danger },
});
