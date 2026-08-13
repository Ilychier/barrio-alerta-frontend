import { Animated, StyleSheet, View } from "react-native";
import { useShimmerOpacity } from "../../hooks/useShimmerOpacity";
import { AppTheme } from "../../theme/ThemeContext";
import { SelectSkeleton } from "./SelectSkeleton";

/**
 * Skeleton de la cascada geográfica (Departamento → Municipio → Localidad →
 * Barrio + detalle). Replica la estructura de UbicacionGeograficaPicker
 * (4 selects de 35px + input de 52px) para que no haya salto de layout
 * mientras cargan los catálogos. Presentación pura (hex-arch).
 */
export function UbicacionSkeleton({ theme }: { theme: AppTheme }) {
  const shimmer = useShimmerOpacity();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <SelectSkeleton theme={theme} />
      <SelectSkeleton theme={theme} />
      <SelectSkeleton theme={theme} />
      <SelectSkeleton theme={theme} />
      <Animated.View style={[styles.detalle, { opacity: shimmer }]} />
    </View>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      gap: 12,
    },
    detalle: {
      backgroundColor: theme.colors.surfaceLight,
      borderWidth: 1.5,
      borderColor: theme.colors.surfaceBorder,
      borderRadius: 16,
      height: 52,
    },
  });
