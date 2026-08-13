import { Animated, StyleSheet, View } from "react-native";
import { useShimmerOpacity } from "../../hooks/useShimmerOpacity";
import { AppTheme } from "../../theme/ThemeContext";

/**
 * Skeleton de un SelectInput (35px de alto, icono + texto + chevron).
 * Replica 1:1 la estructura del input real para que no haya salto de layout
 * mientras cargan los catálogos. Presentación pura (hex-arch).
 */
export function SelectSkeleton({ theme }: { theme: AppTheme }) {
  const shimmer = useShimmerOpacity();
  const styles = getStyles(theme);
  return (
    <Animated.View style={[styles.input, { opacity: shimmer }]}>
      <View style={styles.icon} />
      <View style={styles.texto} />
      <View style={styles.chevron} />
    </Animated.View>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    input: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surfaceLight,
      borderWidth: 1.5,
      borderColor: theme.colors.surfaceBorder,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 35,
      gap: 12,
    },
    icon: {
      width: 18,
      height: 18,
      borderRadius: 4,
      backgroundColor: theme.colors.surfaceBorder,
    },
    texto: {
      flex: 1,
      height: 14,
      borderRadius: 4,
      backgroundColor: theme.colors.surfaceBorder,
    },
    chevron: {
      width: 18,
      height: 18,
      borderRadius: 4,
      backgroundColor: theme.colors.surfaceBorder,
    },
  });
