import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DayAttendanceSummary } from "@application/attendance/GetWeeklyAttendance.usecase";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";

const WEEKDAY_LETTERS = ["S", "T", "Q", "Q", "S", "S", "D"];

interface WeekStripProps {
  days: DayAttendanceSummary[];
}

export function WeekStrip({ days }: WeekStripProps) {
  return (
    <View style={styles.row}>
      {days.map((day, index) => {
        const trained = day.attendance !== null;
        return (
          <View key={day.dateKey} style={styles.column}>
            <Text style={[styles.letter, day.isToday && styles.letterToday]}>
              {WEEKDAY_LETTERS[index]}
            </Text>
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
                ]}
              >
                {day.date.getDate()}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" },
  column: { alignItems: "center", gap: 7 },
  letter: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.textFaint },
  letterToday: { color: colors.primary },
  circle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  circleTrained: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  circleToday: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayNumber: { fontFamily: fontFamily.semiBold, fontSize: 13.5, color: colors.textMuted },
  dayNumberHighlighted: { color: colors.textPrimary },
  dayNumberToday: { color: colors.onPrimary },
});
