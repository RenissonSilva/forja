import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Exercise } from "@domain/entities/Exercise";
import { colors } from "../../theme/colors";
import { muscleGroupLabels } from "../../theme/muscleGroups";
import { fontFamily } from "../../theme/typography";
import { Icon } from "../ui/Icon";

interface ExerciseCatalogItemProps {
  exercise: Exercise;
  onAdd: () => void;
}

export function ExerciseCatalogItem({ exercise, onAdd }: ExerciseCatalogItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Adicionar ${exercise.name}`}
      onPress={onAdd}
      style={styles.row}
    >
      <View style={styles.info}>
        <Text style={styles.name}>{exercise.name}</Text>
        <Text style={styles.group}>{muscleGroupLabels[exercise.muscleGroup]}</Text>
      </View>
      <View style={styles.addButton}>
        <Icon name="plus" size={14} color={colors.primary} strokeWidth={2.6} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  info: { flex: 1, gap: 2 },
  name: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.textPrimary },
  group: { fontFamily: fontFamily.light, fontSize: 11.5, color: colors.textMuted },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryMutedStrong,
  },
});
