import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { colors, workoutPlanColors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";
import { Icon } from "../ui/Icon";

interface WorkoutPlanCardProps {
  plan: WorkoutPlan;
  isLastCompleted?: boolean;
  onPress: () => void;
  onToggleToday: () => void;
  onStart: () => void;
}

export function WorkoutPlanCard({
  plan,
  isLastCompleted,
  onPress,
  onToggleToday,
  onStart,
}: WorkoutPlanCardProps) {
  const accentColor = workoutPlanColors[plan.colorTag];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.container,
        { borderColor: plan.isMarkedToday ? colors.primaryBorder : colors.borderSubtle },
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={2}>
            {plan.name}
          </Text>
          {isLastCompleted ? (
            <View style={styles.lastCompletedBadge}>
              <Text style={styles.lastCompletedBadgeLabel}>ÚLTIMO FEITO</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.meta}>
          {plan.exercises.length} exercícios
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            plan.isMarkedToday ? "Desmarcar como treino da vez" : "Marcar como treino da vez"
          }
          onPress={onToggleToday}
          style={[styles.iconButton, plan.isMarkedToday && styles.iconButtonActive]}
        >
          <Icon
            name="star"
            size={16}
            filled={plan.isMarkedToday}
            color={plan.isMarkedToday ? colors.primary : colors.textMuted}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Iniciar treino"
          onPress={onStart}
          style={styles.iconButton}
        >
          <Icon name="play" size={14} color={colors.textPrimary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    paddingVertical: 14,
    paddingRight: 14,
    gap: 12,
  },
  accentBar: { width: 4, height: 40, borderRadius: 2 },
  content: { flex: 1, gap: 3 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.textPrimary, flex: 1 },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 7
  },
  badgeLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 9.5,
    letterSpacing: 0.5,
    color: colors.onPrimary,
  },
  lastCompletedBadge: {
    backgroundColor: colors.successMuted,
    borderWidth: 1,
    borderColor: colors.successBorder,
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  lastCompletedBadgeLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 9.5,
    letterSpacing: 0.5,
    color: colors.success,
  },
  meta: { fontFamily: fontFamily.light, fontSize: 12, color: colors.textMuted },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.control,
  },
  iconButtonActive: { backgroundColor: colors.primaryMutedStrong },
});
