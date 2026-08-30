import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { bmiClassificationColors, colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";

const DISPLAY_MIN = 15;
const DISPLAY_MAX = 35;
const THRESHOLDS = [18.5, 25, 30, DISPLAY_MAX];

const SEGMENTS: {
  classification: keyof typeof bmiClassificationColors;
  from: number;
  to: number;
}[] = [
  { classification: "abaixo", from: DISPLAY_MIN, to: THRESHOLDS[0]! },
  { classification: "saudavel", from: THRESHOLDS[0]!, to: THRESHOLDS[1]! },
  { classification: "sobrepeso", from: THRESHOLDS[1]!, to: THRESHOLDS[2]! },
  { classification: "obesidade", from: THRESHOLDS[2]!, to: THRESHOLDS[3]! },
];

interface BmiGaugeProps {
  bmiValue: number;
}

export function BmiGauge({ bmiValue }: BmiGaugeProps) {
  const markerPercent = toPercent(bmiValue);

  return (
    <View style={styles.container}>
      <View style={styles.trackWrapper}>
        <View style={styles.track}>
          {SEGMENTS.map((segment) => (
            <View
              key={segment.classification}
              style={{
                flex: segment.to - segment.from,
                backgroundColor: bmiClassificationColors[segment.classification],
              }}
            />
          ))}
        </View>
        <View style={[styles.marker, { left: `${markerPercent}%` }]} />
      </View>
      <View style={styles.labelsRow}>
        <Text style={styles.label}>abaixo</Text>
        <Text style={styles.label}>saudável</Text>
        <Text style={styles.label}>sobrepeso</Text>
        <Text style={styles.label}>obesidade</Text>
      </View>
    </View>
  );
}

function toPercent(value: number): number {
  const clamped = Math.max(DISPLAY_MIN, Math.min(DISPLAY_MAX, value));
  return ((clamped - DISPLAY_MIN) / (DISPLAY_MAX - DISPLAY_MIN)) * 100;
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  trackWrapper: { position: "relative" },
  track: {
    flexDirection: "row",
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  marker: {
    position: "absolute",
    top: -7,
    width: 6,
    height: 24,
    marginLeft: -3,
    backgroundColor: colors.textPrimary,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: colors.background,
  },
  labelsRow: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontFamily: fontFamily.light, fontSize: 10, color: colors.textFaint },
});
