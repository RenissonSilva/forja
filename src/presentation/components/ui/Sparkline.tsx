import React from "react";
import { Circle, Polyline, Svg } from "react-native-svg";

interface SparklineProps {
  values: number[];
  color: string;
  width?: number;
  height?: number;
  /** Marks the latest value with a dot. */
  showEndDot?: boolean;
}

const STROKE_WIDTH = 1.8;
const END_DOT_RADIUS = 2.4;

/** Trend-only line scaled to its own min/max; a flat series runs through the middle. */
export function Sparkline({ values, color, width = 58, height = 24, showEndDot }: SparklineProps) {
  // A NaN in the SVG points crashes the app, so invalid values are dropped.
  const drawable = values.filter(Number.isFinite);
  // Keeps the stroke (and the end dot) from being clipped at the edges.
  const inset = showEndDot ? END_DOT_RADIUS : STROKE_WIDTH / 2;
  const min = Math.min(...drawable);
  const max = Math.max(...drawable);
  const range = max - min;
  const step = (width - inset * 2) / (drawable.length - 1 || 1);

  const coordinates = drawable.map((value, index) => ({
    x: inset + index * step,
    y: range === 0 ? height / 2 : inset + (1 - (value - min) / range) * (height - inset * 2),
  }));
  const last = coordinates[coordinates.length - 1];

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Polyline
        points={coordinates.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {showEndDot && last ? (
        <Circle cx={last.x} cy={last.y} r={END_DOT_RADIUS} fill={color} />
      ) : null}
    </Svg>
  );
}
