import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { MUSCLE_GROUPS, MuscleGroup } from "@domain/entities/Exercise";
import { colors } from "../../theme/colors";
import { muscleGroupLabels } from "../../theme/muscleGroups";
import { fontFamily } from "../../theme/typography";

interface MuscleGroupFilterProps {
  value: MuscleGroup | null;
  onChange: (value: MuscleGroup | null) => void;
}

export function MuscleGroupFilter({ value, onChange }: MuscleGroupFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Chip label="Todos" selected={value === null} onPress={() => onChange(null)} />
      {MUSCLE_GROUPS.map((group) => (
        <Chip
          key={group}
          label={muscleGroupLabels[group]}
          selected={value === group}
          onPress={() => onChange(group)}
        />
      ))}
    </ScrollView>
  );
}

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primaryMutedStrong,
    borderColor: colors.primaryBorder,
  },
  chipLabel: { fontFamily: fontFamily.medium, fontSize: 12.5, color: colors.textSecondary },
  chipLabelSelected: { color: colors.primary },
});
