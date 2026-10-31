import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  percent: number;
  color: string;
  trackColor: string;
  size?: number;
  strokeWidth?: number;
}

/** Anillo con el porcentaje de match. */
export function MatchRing({ percent, color, trackColor, size = 48, strokeWidth = 5 }: Props) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${percent}% de coincidencia con tu placard`}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute' }}>
        <Circle cx={center} cy={center} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        {percent > 0 && (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${(circumference * percent) / 100} ${circumference}`}
            fill="none"
            rotation={-90}
            originX={center}
            originY={center}
          />
        )}
      </Svg>
      <Text style={{ fontSize: size * 0.24, fontWeight: '700', color }}>{percent}%</Text>
    </View>
  );
}
