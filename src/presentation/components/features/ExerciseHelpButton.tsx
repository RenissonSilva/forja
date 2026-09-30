import { useExerciseInfoIndex } from "@presentation/providers/ExerciseInfoIndexProvider";
import React, { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { Icon } from "../ui/Icon";
import { ExerciseHelpModal } from "./ExerciseHelpModal";

interface ExerciseHelpButtonProps {
  exerciseName: string;
  isCustom: boolean;
  size?: number;
}

export function ExerciseHelpButton({ exerciseName, isCustom, size = 22 }: ExerciseHelpButtonProps) {
  const { hasMatch } = useExerciseInfoIndex();
  const [open, setOpen] = useState(false);

  if (isCustom || !exerciseName || !hasMatch(exerciseName)) return null;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver informações sobre ${exerciseName}`}
        onPress={() => setOpen(true)}
        hitSlop={8}
        style={[styles.button, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Icon name="help-circle" size={size * 0.68} color={colors.textSecondary} strokeWidth={1.8} />
      </Pressable>
      <ExerciseHelpModal
        visible={open}
        onClose={() => setOpen(false)}
        exerciseName={exerciseName}
        isCustom={isCustom}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.control,
  },
});
