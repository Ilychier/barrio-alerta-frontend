import { Animated, StyleSheet, View } from "react-native";
import { useShimmerOpacity } from "../../hooks/useShimmerOpacity";
import { AppTheme } from "../../theme/ThemeContext";

interface FeedSkeletonCardProps {
  theme: AppTheme;
  /** Valor de opacidad compartido (shimmer pulsante). */
  opacity: Animated.Value;
}

/**
 * Skeleton de la card del feed de mascotas.
 * Replica 1:1 la estructura de la card real (badges, título, foto 300px,
 * ubicación, descripción, fecha) para que no haya salto de layout al cargar.
 * Presentación pura: no toca dominio ni infraestructura (hex-arch).
 */
export function FeedSkeletonCard({ theme, opacity }: FeedSkeletonCardProps) {
  const styles = getStyles(theme);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Animated.View style={[styles.badge, { opacity }]} />
        <Animated.View style={[styles.badge, styles.badgeWide, { opacity }]} />
      </View>
      <Animated.View style={[styles.titulo, { opacity }]} />
      <Animated.View style={[styles.foto, { opacity }]} />
      <Animated.View style={[styles.ubicacion, { opacity }]} />
      <Animated.View style={[styles.ciudad, { opacity }]} />
      <Animated.View style={[styles.descripcion, { opacity }]} />
      <Animated.View style={[styles.descripcion, styles.descripcionCorta, { opacity }]} />
      <Animated.View style={[styles.fecha, { opacity }]} />
    </View>
  );
}

/**
 * Lista de skeletons del feed (6 cards ≈ una pantalla).
 * Un solo Animated.Value compartido: un loop, un listener (KISS).
 */
export function FeedSkeletonList({ theme }: { theme: AppTheme }) {
  const shimmer = useShimmerOpacity();

  return (
    <View style={stylesList.container}>
      {Array.from({ length: 6 }).map((_, i) => (
        <FeedSkeletonCard key={`skel-${i}`} theme={theme} opacity={shimmer} />
      ))}
    </View>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      gap: 4,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    badge: {
      width: 64,
      height: 20,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceLight,
    },
    badgeWide: {
      width: 84,
    },
    titulo: {
      width: 120,
      height: 20,
      borderRadius: 6,
      backgroundColor: theme.colors.surfaceLight,
    },
    foto: {
      width: "100%",
      height: 300,
      borderRadius: 12,
      marginTop: 8,
      backgroundColor: theme.colors.surfaceLight,
    },
    ubicacion: {
      width: 150,
      height: 14,
      borderRadius: 4,
      backgroundColor: theme.colors.surfaceLight,
      marginTop: 4,
    },
    ciudad: {
      width: 100,
      height: 12,
      borderRadius: 4,
      backgroundColor: theme.colors.surfaceLight,
    },
    descripcion: {
      width: "100%",
      height: 13,
      borderRadius: 4,
      backgroundColor: theme.colors.surfaceLight,
      marginTop: 4,
    },
    descripcionCorta: {
      width: "80%",
    },
    fecha: {
      width: 80,
      height: 11,
      borderRadius: 4,
      backgroundColor: theme.colors.surfaceLight,
      marginTop: 6,
    },
  });

const stylesList = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 32,
  },
});
