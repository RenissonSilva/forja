import React, { useId, useState } from "react";
import { GestureResponderEvent, StyleSheet, Text, View } from "react-native";
import { Circle, Defs, Line, LinearGradient, Path, Stop, Svg } from "react-native-svg";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";

export interface ProgressChartPoint {
  value: number;
  label: string;
  /** Drawn with a halo — used for personal records. */
  highlighted: boolean;
}

interface ProgressLineChartProps {
  points: readonly ProgressChartPoint[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  formatAxisValue: (value: number) => string;
  /** Line, fill and dots; the app's primary color by default. */
  color?: string;
  height?: number;
}

const PADDING = { top: 12, right: 14, bottom: 26, left: 40 };
const X_LABEL_WIDTH = 40;
const MAX_X_LABELS = 4;
/** Above this, plain dots turn into noise; records and the selection stay visible. */
const MAX_PLAIN_DOTS = 24;

/**
 * Line chart with a real y-axis (starting near the data, not at zero, so small
 * load jumps stay visible). Tapping or dragging across it selects a point.
 */
export function ProgressLineChart({
  points,
  selectedIndex,
  onSelect,
  formatAxisValue,
  color = colors.primary,
  height = 180,
}: ProgressLineChartProps) {
  const [width, setWidth] = useState(0);
  const gradientId = `progress-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const plotWidth = Math.max(0, width - PADDING.left - PADDING.right);
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const baseline = PADDING.top + plotHeight;
  const scale = niceScale(points.map((point) => point.value).filter(Number.isFinite));
  const xStep = points.length > 1 ? plotWidth / (points.length - 1) : 0;

  const xOf = (index: number) => PADDING.left + (points.length > 1 ? index * xStep : plotWidth / 2);
  const yOf = (value: number) =>
    PADDING.top + (1 - (value - scale.min) / (scale.max - scale.min)) * plotHeight;

  // A NaN reaching an SVG path crashes the app, so invalid values are left undrawn.
  const coordinates = points.map((point, index) => ({
    x: xOf(index),
    y: yOf(point.value),
    drawable: Number.isFinite(point.value),
  }));
  const drawn = coordinates.filter((coordinate) => coordinate.drawable);
  const first = drawn[0];
  const last = drawn[drawn.length - 1];
  const selected = coordinates[selectedIndex];
  const linePath = drawn
    .map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  function selectAt(event: GestureResponderEvent) {
    if (points.length === 0) return;
    const index = xStep > 0 ? Math.round((event.nativeEvent.locationX - PADDING.left) / xStep) : 0;
    const clamped = Math.min(points.length - 1, Math.max(0, index));
    if (clamped !== selectedIndex) onSelect(clamped);
  }

  const selectedPoint = points[selectedIndex];

  return (
    <View style={{ height }} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 && first && last ? (
        <>
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={color} stopOpacity={0.2} />
                <Stop offset="1" stopColor={color} stopOpacity={0} />
              </LinearGradient>
            </Defs>

            {scale.ticks.map((tick) => (
              <Line
                key={tick}
                x1={PADDING.left}
                x2={width - PADDING.right}
                y1={yOf(tick)}
                y2={yOf(tick)}
                stroke={colors.borderStrong}
                strokeWidth={1}
                strokeDasharray="3 5"
              />
            ))}

            {drawn.length > 1 ? (
              <>
                <Path
                  d={`${linePath} L${last.x.toFixed(1)},${baseline} L${first.x.toFixed(1)},${baseline} Z`}
                  fill={`url(#${gradientId})`}
                />
                <Path
                  d={linePath}
                  fill="none"
                  stroke={color}
                  strokeWidth={2.4}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </>
            ) : null}

            {selected ? (
              <Line
                x1={selected.x}
                x2={selected.x}
                y1={PADDING.top}
                y2={baseline}
                stroke={colors.textFaint}
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            ) : null}

            {coordinates.map(({ x, y, drawable }, index) => {
              if (!drawable || index === selectedIndex) return null;
              if (points[index]?.highlighted) {
                return (
                  <React.Fragment key={index}>
                    <Circle cx={x} cy={y} r={7} fill={color} fillOpacity={0.22} />
                    <Circle cx={x} cy={y} r={3.4} fill={color} />
                  </React.Fragment>
                );
              }
              return points.length <= MAX_PLAIN_DOTS ? (
                <Circle key={index} cx={x} cy={y} r={2.6} fill={color} />
              ) : null;
            })}

            {selected?.drawable ? (
              <Circle
                cx={selected.x}
                cy={selected.y}
                r={6}
                fill={color}
                stroke={colors.surface}
                strokeWidth={2.5}
              />
            ) : null}
          </Svg>

          {scale.ticks.map((tick) => (
            <Text
              key={tick}
              style={[styles.yLabel, { top: yOf(tick) - 7, width: PADDING.left - 8 }]}
            >
              {formatAxisValue(tick)}
            </Text>
          ))}

          {xLabelIndices(points.length).map((index) => (
            <Text
              key={index}
              style={[
                styles.xLabel,
                {
                  top: baseline + 8,
                  left: Math.min(
                    width - X_LABEL_WIDTH,
                    Math.max(0, xOf(index) - X_LABEL_WIDTH / 2),
                  ),
                },
              ]}
            >
              {points[index]?.label}
            </Text>
          ))}
        </>
      ) : null}

      {/* Empty overlay so locationX is always relative to the chart, whatever is drawn below. */}
      <View
        style={StyleSheet.absoluteFill}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Gráfico de evolução"
        accessibilityValue={
          selectedPoint
            ? { text: `${selectedPoint.label}: ${formatAxisValue(selectedPoint.value)}` }
            : undefined
        }
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) => {
          const step = event.nativeEvent.actionName === "increment" ? 1 : -1;
          const next = selectedIndex + step;
          if (next >= 0 && next < points.length) onSelect(next);
        }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={selectAt}
        onResponderMove={selectAt}
      />
    </View>
  );
}

/**
 * Rounds the axis to friendly steps (1, 2, 2.5 or 5 × 10ⁿ), so labels read
 * like "55 · 60 · 65" instead of arbitrary values.
 */
function niceScale(values: readonly number[]): { min: number; max: number; ticks: number[] } {
  let low = Math.min(...values);
  let high = Math.max(...values);
  if (!Number.isFinite(low) || !Number.isFinite(high)) return { min: 0, max: 1, ticks: [0, 1] };
  if (low === high) {
    const padding = Math.max(Math.abs(low) * 0.1, 1);
    low -= padding;
    high += padding;
  }

  const roughStep = (high - low) / 3;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const step =
    [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((s) => s >= roughStep) ??
    10 * magnitude;
  const min = Math.max(0, Math.floor(low / step) * step);
  const max = Math.ceil(high / step) * step;

  const ticks: number[] = [];
  for (let tick = min; tick <= max + step / 2; tick += step) {
    ticks.push(Math.round(tick * 1000) / 1000);
  }
  return { min, max, ticks };
}

/** First, last and evenly spaced ones in between. */
function xLabelIndices(count: number): number[] {
  if (count <= MAX_X_LABELS) return Array.from({ length: count }, (_, index) => index);
  const indices = Array.from({ length: MAX_X_LABELS }, (_, slot) =>
    Math.round((slot * (count - 1)) / (MAX_X_LABELS - 1)),
  );
  return [...new Set(indices)];
}

const styles = StyleSheet.create({
  yLabel: {
    position: "absolute",
    left: 0,
    textAlign: "right",
    fontFamily: fontFamily.regular,
    fontSize: 10,
    color: colors.textFaint,
  },
  xLabel: {
    position: "absolute",
    width: X_LABEL_WIDTH,
    textAlign: "center",
    fontFamily: fontFamily.regular,
    fontSize: 10,
    color: colors.textFaint,
  },
});
