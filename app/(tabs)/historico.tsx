import { Card } from "@presentation/components/ui/Card";
import { Icon } from "@presentation/components/ui/Icon";
import { ProgressBar } from "@presentation/components/ui/ProgressBar";
import { MonthCalendar } from "@presentation/components/features/MonthCalendar";
import { useMonthlyOverview } from "@presentation/hooks/useMonthlyOverview";
import { useProfile } from "@presentation/hooks/useProfile";
import { colors } from "@presentation/theme/colors";
import { spacing } from "@presentation/theme/spacing";
import { fontFamily, typography } from "@presentation/theme/typography";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoricoScreen() {
  const { profile } = useProfile();
  const { referenceDate, days, goalProgress, goToPreviousMonth, goToNextMonth } =
    useMonthlyOverview(profile?.id);

  if (!profile) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Histórico</Text>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Dias treinados</Text>
              <Icon name="check" size={14} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>{goalProgress?.completed ?? 0}</Text>
            <Text style={styles.statHint}>
              em {capitalize(format(referenceDate, "MMMM", { locale: ptBR }))}
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Meta do mês</Text>
              <Icon name="target" size={14} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>{goalProgress?.goal ?? 0}</Text>
            <Text style={styles.statHint}>{profile.weeklyGoalDays}× por semana</Text>
          </Card>
        </View>

        <Card>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progresso da meta</Text>
            <Text style={styles.progressPercentage}>{goalProgress?.progressPercentage ?? 0}%</Text>
          </View>
          <ProgressBar percentage={goalProgress?.progressPercentage ?? 0} />
          <View style={styles.progressFooter}>
            <Text style={styles.progressFooterText}>{goalProgress?.completed ?? 0} concluídos</Text>
            <Text style={styles.progressFooterText}>faltam {goalProgress?.remaining ?? 0}</Text>
          </View>
        </Card>

        <Card>
          <MonthCalendar
            referenceDate={referenceDate}
            days={days}
            onPreviousMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xxl, paddingBottom: 130, gap: spacing.md },
  title: { ...typography.screenTitle, color: colors.textPrimary, marginBottom: 6 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, gap: 0, padding: 16 },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statLabel: { fontFamily: fontFamily.regular, fontSize: 11.5, color: colors.textSecondary },
  statValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: 30,
    letterSpacing: -1,
    color: colors.textPrimary,
  },
  statHint: { fontFamily: fontFamily.light, fontSize: 11, color: colors.textFaint, marginTop: 4 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },
  progressLabel: { fontFamily: fontFamily.regular, fontSize: 11.5, color: colors.textSecondary },
  progressPercentage: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.primary },
  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressFooterText: { fontFamily: fontFamily.light, fontSize: 11, color: colors.textFaint },
});
