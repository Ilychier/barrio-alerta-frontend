import { StyleSheet, Text, View } from "react-native";
import Icon from "../../components/atomic/Icon";
import { AppTheme } from "../../theme/ThemeContext";
import { ConteoReportes } from "../../../application/mascotas/controllers/useContarReportesController";

interface ContadorBadgeProps {
  conteo: ConteoReportes;
  loading: boolean;
  theme: AppTheme;
}

/**
 * Badge flotante con 3 indicadores: registrados, perdidos y rescatados.
 * Solo iconos + número (sin texto): PawPrint = total, Search = perdidos,
 * Home = rescatados. Se posiciona abajo al centro, sobre el feed.
 *
 * Componente puro de presentación: recibe datos, no los busca.
 */
export function ContadorBadge({ conteo, loading, theme }: ContadorBadgeProps) {
  const styles = getStyles(theme);

  return (
    // box-none: el contenedor NO captura toques (no bloquea el scroll),
    // pero la píldora sí (auto por defecto) → absorbe el click sin
    // traspasarlo a la card que tenga detrás.
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.badge}>
        <ContadorItem
          icon="PawPrint"
          value={conteo.registrados}
          color={theme.colors.green}
          bg={theme.colors.greenBg}
          loading={loading}
          styles={styles}
        />
        <View style={styles.divider} />
        <ContadorItem
          icon="Search"
          value={conteo.perdidos}
          color={theme.colors.red}
          bg={theme.colors.redBg}
          loading={loading}
          styles={styles}
        />
        <View style={styles.divider} />
        <ContadorItem
          icon="House"
          value={conteo.rescatados}
          color={theme.colors.purple}
          bg={theme.colors.purpleBg}
          loading={loading}
          styles={styles}
        />
      </View>
    </View>
  );
}

function ContadorItem({
  icon,
  value,
  color,
  bg,
  loading,
  styles,
}: {
  icon: "PawPrint" | "Search" | "House";
  value: number;
  color: string;
  bg: string;
  loading: boolean;
  styles: ReturnType<typeof getStyles>;
}) {
  return (
    <View style={styles.item}>
      <View style={[styles.iconCircle, { backgroundColor: bg }]}>
        <Icon name={icon} size={14} color={color} />
      </View>
      <Text style={[styles.number, { color }]}>
        {loading ? "…" : value}
      </Text>
    </View>
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
      paddingVertical: 8,
      paddingHorizontal: 16,
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