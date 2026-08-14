import { Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "../../components/atomic/Icon";
import { AppTheme } from "../../theme/ThemeContext";
import { ConteoReportes } from "../../../application/mascotas/controllers/useContarReportesController";

/** Filtros que el badge puede activar en el feed. */
export type FiltroBadge = "registrados" | "perdidos" | "encontrados" | "rescatados";

interface ContadorBadgeProps {
  conteo: ConteoReportes;
  loading: boolean;
  theme: AppTheme;
  /** Item del badge que coincide con el filtro activo del feed (null = ninguno). */
  filtroActivo: FiltroBadge | null;
  /** Callback al tocar un item: aplica el filtro correspondiente en el feed. */
  onSeleccionar: (filtro: FiltroBadge) => void;
}

/**
 * Badge flotante con 3 indicadores: registrados, perdidos y rescatados.
 * Solo iconos + número (sin texto): PawPrint = total, Search = perdidos,
 * House = rescatados. Se posiciona abajo al centro, sobre el feed.
 *
 * Cada item es un botón: al tocarlo filtra el feed (todos / perdidos /
 * rescatados). El item activo se resalta con fondo + borde de su color.
 *
 * Componente puro de presentación: recibe datos y callbacks, no busca nada.
 */
export function ContadorBadge({
  conteo,
  loading,
  theme,
  filtroActivo,
  onSeleccionar,
}: ContadorBadgeProps) {
  const styles = getStyles(theme);

  return (
    // box-none: el contenedor NO captura toques (no bloquea el scroll),
    // pero la píldora sí (Pressables) → absorbe el click sin traspasarlo
    // a la card que tenga detrás.
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.badge}>
        <ContadorItem
          filtro="registrados"
          icon="PawPrint"
          value={conteo.registrados}
          color={theme.colors.green}
          bg={theme.colors.greenBg}
          loading={loading}
          activo={filtroActivo === "registrados"}
          onPress={onSeleccionar}
          styles={styles}
        />
        <View style={styles.divider} />
        <ContadorItem
          filtro="perdidos"
          icon="Search"
          value={conteo.perdidos}
          color={theme.colors.red}
          bg={theme.colors.redBg}
          loading={loading}
          activo={filtroActivo === "perdidos"}
          onPress={onSeleccionar}
          styles={styles}
        />
        <View style={styles.divider} />
        <ContadorItem
          filtro="encontrados"
          icon="MapPin"
          value={conteo.encontrados}
          color={theme.colors.purple}
          bg={theme.colors.purpleBg}
          loading={loading}
          activo={filtroActivo === "encontrados"}
          onPress={onSeleccionar}
          styles={styles}
        />
        <View style={styles.divider} />
        <ContadorItem
          filtro="rescatados"
          icon="House"
          value={conteo.rescatados}
          color={theme.colors.green}
          bg={theme.colors.greenBg}
          loading={loading}
          activo={filtroActivo === "rescatados"}
          onPress={onSeleccionar}
          styles={styles}
        />
      </View>
    </View>
  );
}

function ContadorItem({
  filtro,
  icon,
  value,
  color,
  bg,
  loading,
  activo,
  onPress,
  styles,
}: {
  filtro: FiltroBadge;
  icon: "PawPrint" | "Search" | "MapPin" | "House";
  value: number;
  color: string;
  bg: string;
  loading: boolean;
  activo: boolean;
  onPress: (filtro: FiltroBadge) => void;
  styles: ReturnType<typeof getStyles>;
}) {
  return (
    <Pressable
      style={[styles.item, activo && { backgroundColor: bg, borderColor: color }]}
      onPress={() => onPress(filtro)}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={`Filtrar por ${filtro}`}
    >
      <View style={[styles.iconCircle, { backgroundColor: bg }]}>
        <Icon name={icon} size={14} color={color} />
      </View>
      <Text style={[styles.number, { color }]}>
        {loading ? "…" : value}
      </Text>
    </Pressable>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 16,
      left: 0,
      right: 0,
      alignItems: "center",
      zIndex: 10,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: 6,
      paddingHorizontal: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 6,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 2,
      paddingHorizontal: 6,
      // Borde transparente por defecto: el activo lo pinta con su color
      // sin saltar el layout (mismo tamaño en ambos estados).
      borderWidth: 1,
      borderColor: "transparent",
      borderRadius: 12,
    },
    iconCircle: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
    },
    number: {
      fontSize: 15,
      fontWeight: "700",
      fontVariant: ["tabular-nums"],
      minWidth: 20,
    },
    divider: {
      width: 1,
      height: 20,
      backgroundColor: theme.colors.border,
      marginHorizontal: 2,
    },
  });