import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";
import { Icon } from "../ui/Icon";

interface TodayWorkoutHeroProps {
  plan: WorkoutPlan;
  onStart: () => void;
}

export function TodayWorkoutHero({ plan, onStart }: TodayWorkoutHeroProps) {
  return (
    <LinearGradient
      colors={["#FF6A1A", "#C74400"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.decorCircle} />
      <Text style={styles.label}>TREINO DE HOJE</Text>
      <Text style={styles.name} numberOfLines={2}>
        {plan.name.replace(" — ", " · ")}
      </Text>
      <Text style={styles.meta}>
        {plan.exercises.length} exercícios · ~{plan.estimatedDurationMinutes} min
      </Text>
      <View style={styles.row}>
        <Pressable accessibilityRole="button" onPress={onStart} style={styles.startButton}>
          <Icon name="play" size={13} color={colors.primary} />
          <Text style={styles.startLabel}>Iniciar treino</Text>
        </Pressable>
        <View style={styles.clockButton}>
          <Icon name="clock" size={16} color={colors.onPrimary} strokeWidth={2} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 18,
    overflow: "hidden",
  },
  decorCircle: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: 10.5,
    letterSpacing: 1,
    color: "rgba(21,10,2,0.6)",
    marginBottom: 8,
  },
  name: {
    fontFamily: fontFamily.semiBold,
    fontSize: 25,
    lineHeight: 29,
    letterSpacing: -0.7,
    color: colors.onPrimary,
    marginBottom: 4,
  },
  meta: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: "rgba(21,10,2,0.62)",
    marginBottom: 18,
  },
  row: { flexDirection: "row", gap: 10 },
  startButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.onPrimary,
  },
  startLabel: { fontFamily: fontFamily.semiBold, fontSize: 14.5, color: "#FFF0E6" },
  clockButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(21,10,2,0.18)",
  },
});
