import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

interface RadialGlowProps {
  size: number;
  color: string;
  opacity?: number;
  /** Percentage (0-100) of the radius where the glow reaches full transparency. */
  fadeAt?: number;
  style?: StyleProp<ViewStyle>;
}

export function RadialGlow({ size, color, opacity = 1, fadeAt = 100, style }: RadialGlowProps) {
  const gradientId = React.useMemo(
    () => `glow_${Math.random().toString(36).substring(2, 9)}`,
    []
  );

  return (
    <View style={[{ width: size, height: size }, style]} pointerEvents="none">
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset={`${fadeAt}%`} stopColor={color} stopOpacity={0} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={size} height={size} fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}
