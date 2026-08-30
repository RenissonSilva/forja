import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { MonthDayAttendanceSummary } from "@application/attendance/GetMonthlyAttendance.usecase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";
import { Icon } from "../ui/Icon";

const WEEKDAY_LETTERS = ["S", "T", "Q", "Q", "S", "S", "D"];

interface MonthCalendarProps {
  referenceDate: Date;
  days: MonthDayAttendanceSummary[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export function MonthCalendar({
  referenceDate,
  days,
  onPreviousMonth,
  onNextMonth,
}: MonthCalendarProps) {
  const weeks = chunk(days, 7);
  const monthLabel = capitalize(format(referenceDate, "MMMM yyyy", { locale: ptBR }));

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Icon name="calendar" size={14} color={colors.primary} />
          <Text style={styles.monthLabel}>{monthLabel}</Text>
        </View>
        <View style={styles.navButtons}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mês anterior"
            onPress={onPreviousMonth}
            style={styles.navButton}
          >
            <Icon name="chevron-left" size={12} color={colors.textSecondary} strokeWidth={2.4} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Próximo mês"
            onPress={onNextMonth}
            style={styles.navButton}
          >
            <Icon name="chevron-right" size={12} color={colors.textSecondary} strokeWidth={2.4} />
          </Pressable>
        </View>
      </View>

      <View style={styles.weekdaysRow}>
        {WEEKDAY_LETTERS.map((letter, index) => (
          <Text key={index} style={styles.weekdayLetter}>
            {letter}
          </Text>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((day) => {
            const trained = day.attendance !== null;
            return (
              <View key={day.dateKey} style={styles.dayCell}>
                <View
                  style={[
                    styles.circle,
                    trained && styles.circleTrained,
                    day.isToday && styles.circleToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      trained && styles.dayNumberHighlighted,
                      day.isToday && styles.dayNumberToday,
                      !day.isInCurrentMonth && styles.dayNumberOutOfMonth,
                    ]}
                  >
                    {day.date.getDate()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}

      <View style={styles.legend}>
        <LegendItem swatchStyle={styles.swatchTrained} label="treinei" />
        <LegendItem swatchStyle={styles.swatchToday} label="hoje" />
        <LegendItem swatchStyle={styles.swatchEmpty} label="sem treino" />
      </View>
    </View>
  );
}

function LegendItem({ swatchStyle, label }: { swatchStyle: StyleProp<ViewStyle>; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, swatchStyle]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  headerTitle: { flexDirection: "row", alignItems: "center", gap: 8 },
  monthLabel: { fontFamily: fontFamily.semiBold, fontSize: 13.5, color: colors.textPrimary },
  navButtons: { flexDirection: "row", gap: 6 },
  navButton: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: colors.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdaysRow: { flexDirection: "row", marginBottom: 8 },
  weekdayLetter: {
    flex: 1,
    textAlign: "center",
    fontFamily: fontFamily.medium,
    fontSize: 10,
    color: colors.textFaint,
  },
  weekRow: { flexDirection: "row", marginBottom: 3, justifyContent: "space-between" },
  dayCell: { flex: 1, alignItems: "center" },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  circleTrained: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  circleToday: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayNumber: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.textMuted },
  dayNumberHighlighted: { color: colors.textPrimary },
  dayNumberToday: { color: colors.onPrimary },
  dayNumberOutOfMonth: { color: colors.textGhost },
  legend: { flexDirection: "row", gap: 16, marginTop: 16, paddingHorizontal: 4 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 7 },
  legendSwatch: { width: 14, height: 14, borderRadius: 7 },
  swatchTrained: {
    backgroundColor: colors.primaryMutedStrong,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  swatchToday: { backgroundColor: colors.primary },
  swatchEmpty: { borderWidth: 1.5, borderColor: colors.borderStrong },
  legendLabel: { fontFamily: fontFamily.light, fontSize: 11, color: colors.textMuted },
});
