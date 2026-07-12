import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop, Rect, G } from 'react-native-svg';
import { useAppTheme } from '../../theme/ThemeContext';

interface SVGBackgroundProps {
  children: React.ReactNode;
}

export function SVGBackground({ children }: SVGBackgroundProps) {
  const { theme, themeType } = useAppTheme();

  const isDark = themeType === 'dark';
  // Subtle opacity settings for modern backdrop feel
  const decorationOpacity = isDark ? 0.05 : 0.07;
  const glowOpacity = isDark ? 0.14 : 0.07;
  const strokeColor = theme.colors.green; 
  const secondaryStrokeColor = theme.colors.red;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {/* Background SVG Canvas */}
      <View style={StyleSheet.absoluteFill}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 400 800"
          preserveAspectRatio="xMidYMid slice"
          style={StyleSheet.absoluteFill}
        >
          <Defs>
            {/* Ambient Aura Gradients */}
            <LinearGradient id="glowTeal" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={theme.colors.green} stopOpacity={glowOpacity} />
              <Stop offset="100%" stopColor={theme.colors.green} stopOpacity={0} />
            </LinearGradient>
            <LinearGradient id="glowRed" x1="1" y1="1" x2="0" y2="0">
              <Stop offset="0%" stopColor={theme.colors.red} stopOpacity={glowOpacity * 0.8} />
              <Stop offset="100%" stopColor={theme.colors.red} stopOpacity={0} />
            </LinearGradient>
            
            {/* Decorative Figure Gradients */}
            <LinearGradient id="shapeTeal" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={theme.colors.green} stopOpacity={decorationOpacity} />
              <Stop offset="100%" stopColor={theme.colors.green} stopOpacity={decorationOpacity * 0.2} />
            </LinearGradient>
          </Defs>

          {/* Canvas Background Color */}
          <Rect width="400" height="800" fill={theme.colors.bg} />

          {/* Modern Mesh Glows */}
          <Circle cx="360" cy="80" r="190" fill="url(#glowTeal)" />
          <Circle cx="40" cy="720" r="220" fill="url(#glowRed)" />
          <Circle cx="390" cy="300" r="110" fill="url(#glowTeal)" opacity={0.6} />

          {/* Tech Grid (Fine lines) */}
          <G opacity={decorationOpacity * 0.4}>
            <Path d="M-100,150 L500,750 M-100,50 L500,650 M-100,250 L500,850" stroke={strokeColor} strokeWidth="1" />
            <Path d="M500,150 L-100,750 M500,50 L-100,650 M500,250 L-100,850" stroke={strokeColor} strokeWidth="1" strokeDasharray="4,8" />
          </G>

          {/* Dotted Tech Grid */}
          <G opacity={decorationOpacity * 0.7} fill={strokeColor}>
            <Circle cx="40" cy="220" r="1.5" />
            <Circle cx="60" cy="220" r="1.5" />
            <Circle cx="80" cy="220" r="1.5" />
            <Circle cx="40" cy="240" r="1.5" />
            <Circle cx="60" cy="240" r="1.5" />
            <Circle cx="80" cy="240" r="1.5" />
            <Circle cx="40" cy="260" r="1.5" />
            <Circle cx="60" cy="260" r="1.5" />
            <Circle cx="80" cy="260" r="1.5" />

            <Circle cx="320" cy="540" r="1.5" />
            <Circle cx="340" cy="540" r="1.5" />
            <Circle cx="360" cy="540" r="1.5" />
            <Circle cx="320" cy="560" r="1.5" />
            <Circle cx="340" cy="560" r="1.5" />
            <Circle cx="360" cy="560" r="1.5" />
            <Circle cx="320" cy="580" r="1.5" />
            <Circle cx="340" cy="580" r="1.5" />
            <Circle cx="360" cy="580" r="1.5" />
          </G>

          {/* Scattered Security-Themed Figures */}
          
          {/* Top Left: Shield Badge */}
          <G transform="translate(60, 110) rotate(-12) scale(0.95)" opacity={decorationOpacity * 1.5}>
            <Path
              d="M0,-24 L18,-16 L18,2 C18,14 0,24 0,24 C0,24 -18,14 -18,2 L-18,-16 Z"
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
            />
            {/* Small inner checkmark */}
            <Path
              d="M-7,-3 L-2,2 L7,-7"
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </G>

          {/* Top Right: Technical Concentric Crosshair */}
          <G transform="translate(340, 160)" opacity={decorationOpacity * 1.2}>
            <Circle cx="0" cy="0" r="28" fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="3,3" />
            <Circle cx="0" cy="0" r="18" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <Circle cx="0" cy="0" r="6" fill="none" stroke={secondaryStrokeColor} strokeWidth="1" />
            <Path d="M-36,0 H36 M0,-36 V36" stroke={strokeColor} strokeWidth="0.8" />
          </G>

          {/* Center Left: Modern Key */}
          <G transform="translate(50, 430) rotate(40) scale(0.85)" opacity={decorationOpacity * 1.3}>
            <Circle cx="-12" cy="0" r="8" fill="none" stroke={secondaryStrokeColor} strokeWidth="2" />
            <Path d="M-4,0 H20 M8,0 V6 M14,0 V6" fill="none" stroke={secondaryStrokeColor} strokeWidth="2" strokeLinecap="round" />
          </G>

          {/* Center Right: Lock Icon */}
          <G transform="translate(345, 370) rotate(15) scale(0.9)" opacity={decorationOpacity * 1.4}>
            <Rect x="-12" y="-4" width="24" height="18" rx="4" fill="none" stroke={strokeColor} strokeWidth="2" />
            <Path d="M-7,-4 V-11 A7,7 0 0,1 7,-11 V-4" fill="none" stroke={strokeColor} strokeWidth="2" />
            <Circle cx="0" cy="3" r="2.5" fill={strokeColor} />
            <Path d="M0,5.5 V9" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          </G>

          {/* Bottom Left: Hexagonal Radar Mesh */}
          <G transform="translate(70, 610) rotate(30) scale(0.9)" opacity={decorationOpacity * 1.5}>
            <Path
              d="M0,-25 L21.6,-12.5 L21.6,12.5 L0,25 L-21.6,12.5 L-21.6,-12.5 Z"
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
            />
            <Circle cx="0" cy="0" r="10" fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="2,2" />
            <Path d="M0,-25 V25 M-21.6,-12.5 L21.6,12.5 M-21.6,12.5 L21.6,-12.5" stroke={strokeColor} strokeWidth="0.5" />
          </G>

          {/* Bottom Right: Shield Alert Badge */}
          <G transform="translate(330, 680) rotate(-8) scale(1.05)" opacity={decorationOpacity * 1.7}>
            <Path
              d="M0,-26 L20,-18 L20,3 C20,15 0,26 0,26 C0,26 -20,15 -20,3 L-20,-18 Z"
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
            />
            <Path
              d="M0,-20 L14,-14 L14,2 C14,11 0,20 0,20 C0,20 -14,11 -14,2 L-14,-14 Z"
              fill="none"
              stroke={strokeColor}
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            <Path d="M0,-7 V2" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
            <Circle cx="0" cy="7" r="1.5" fill={strokeColor} />
          </G>

          {/* Abstract Floating Crosses and Circles */}
          <G opacity={decorationOpacity * 0.9} stroke={strokeColor} strokeWidth="1.5">
            {/* Cross 1 */}
            <Path d="M 180 90 L 190 90 M 185 85 L 185 95" />
            {/* Cross 2 */}
            <Path d="M 210 730 L 220 730 M 215 725 L 215 735" />
            {/* Circle Outline 1 */}
            <Circle cx="220" cy="270" r="5" fill="none" stroke={secondaryStrokeColor} />
            {/* Circle Outline 2 */}
            <Circle cx="120" cy="500" r="7" fill="none" stroke={strokeColor} strokeDasharray="3,3" />
            {/* Floating Square */}
            <Rect x="260" y="460" width="10" height="10" rx="2" fill="none" stroke={strokeColor} transform="rotate(25, 265, 465)" />
          </G>
        </Svg>
      </View>
      
      {/* Content Layer */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
