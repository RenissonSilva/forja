import { Avatar } from "@presentation/components/ui/Avatar";
import { Button } from "@presentation/components/ui/Button";
import { Card } from "@presentation/components/ui/Card";
import { Icon } from "@presentation/components/ui/Icon";
import { TodayWorkoutHero } from "@presentation/components/features/TodayWorkoutHero";
import { WeekStrip } from "@presentation/components/features/WeekStrip";
import { WorkoutPlanCard } from "@presentation/components/features/WorkoutPlanCard";
import { useProfile } from "@presentation/hooks/useProfile";
import { useWeeklyAttendance } from "@presentation/hooks/useWeeklyAttendance";
import { useWorkoutPlans } from "@presentation/hooks/useWorkoutPlans";
import { colors } from "@presentation/theme/colors";
import { spacing } from "@presentation/theme/spacing";
import { fontFamily, typography } from "@presentation/theme/typography";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { profile } = useProfile();
  const { days } = useWeeklyAttendance(profile?.id);
  const { plans, markAsToday } = useWorkoutPlans(profile?.id);

  if (!profile) return null;

  const todayPlan = plans.find((plan) => plan.isMarkedToday) ?? null;
  const weekCompletedCount = days.filter((day) => day.attendance !== null).length;

  function startSession(plan: (typeof plans)[number]) {
    router.push(`/treino/${plan.id}/sessao`);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.date}>
              {capitalize(format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR }))}
            </Text>
            <Text style={styles.greeting}>Olá, {firstName(profile.name)}</Text>
          </View>
          <Avatar name={profile.name} uri={profile.avatarUri} size={42} />
        </View>

        <Card>
          <View style={styles.weekHeader}>
            <Text style={styles.weekLabel}>ESTA SEMANA</Text>
            <Text style={styles.weekCount}>
              {weekCompletedCount} de {profile.weeklyGoalDays} treinos
            </Text>
          </View>
          <WeekStrip days={days} />
        </Card>

        {todayPlan ? (
          <TodayWorkoutHero plan={todayPlan} onStart={() => startSession(todayPlan)} />
        ) : plans.length > 0 ? (
          <Card>
            <Text style={styles.emptyToday}>
              Toque na ★ de uma ficha abaixo para marcá-la como o treino de hoje.
            </Text>
          </Card>
        ) : null}

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Meus treinos</Text>
          <Text style={styles.listHint}>toque na estrela para marcar o de hoje</Text>
        </View>

        <View style={styles.list}>
          {plans.map((plan) => (
            <WorkoutPlanCard
              key={plan.id}
              plan={plan}
              onPress={() => router.push(`/ficha/${plan.id}/editar`)}
              onToggleToday={() => markAsToday(plan.id)}
              onStart={() => startSession(plan)}
            />
          ))}
          <Button
            variant="dashed"
            icon={<Icon name="plus" size={15} color={colors.primary} strokeWidth={2.4} />}
            label="Criar novo treino"
            onPress={() => router.push("/ficha/novo")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xxl, paddingBottom: 130, gap: spacing.lg },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  date: { fontFamily: fontFamily.light, fontSize: 12.5, color: colors.textMuted },
  greeting: { ...typography.screenTitle, color: colors.textPrimary },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: spacing.md,
  },
  weekLabel: { ...typography.label, color: colors.textSecondary, textTransform: "uppercase" },
  weekCount: { fontFamily: fontFamily.semiBold, fontSize: 11.5, color: colors.primary },
  emptyToday: { ...typography.body, color: colors.textSecondary, textAlign: "center" },
  listHeader: { gap: 2 },
  listTitle: { ...typography.heading, color: colors.textPrimary },
  listHint: { fontFamily: fontFamily.light, fontSize: 11.5, color: colors.textFaint },
  list: { gap: 10 },
});
