import { Image } from "expo-image";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { resolverUrlFoto } from "../../../application/mascotas/services/UrlResolver";
import { EstadoReporte } from "../../../domain/mascotas/entities/EstadoReporte";
import { ReporteMascota } from "../../../domain/mascotas/entities/ReporteMascota";
import { TipoReporte } from "../../../domain/mascotas/entities/TipoReporte";
import Icon from "../../components/atomic/Icon";
import { AppTheme } from "../../theme/ThemeContext";

interface MascotaCardProps {
  item: ReporteMascota;
  /** Mapas de lookup estables (evitan re-renders: las props no cambian). */
  ciudadMap: Map<number, string>;
  departamentoMap: Map<number, string>;
  tipoMascotaMap: Map<number, string>;
  baseUrl: string;
  theme: AppTheme;
  onPress: (item: ReporteMascota) => void;
}

/** Badges de tipo (PERDIDO/ENCONTRADO) y estado (RESCATADO). */
function CardBadges({ item, theme }: { item: ReporteMascota; theme: AppTheme }) {
  const styles = getStyles(theme);
  const esPerdido = item.tipoReporte === TipoReporte.LOST;
  return (
    <View style={styles.cardHeader}>
      <View
        style={[
          styles.tipoBadge,
          { backgroundColor: esPerdido ? theme.colors.redBg : theme.colors.purpleBg },
        ]}
      >
        <Text
          style={[
            styles.tipoBadgeText,
            { color: esPerdido ? theme.colors.red : theme.colors.purple },
          ]}
        >
          {esPerdido ? "PERDIDO" : "ENCONTRADO"}
        </Text>
      </View>
      {item.estado === EstadoReporte.RESCUED && (
        <View
          style={[styles.estadoBadge, { backgroundColor: theme.colors.greenBg }]}
        >
          <Text style={[styles.estadoBadgeText, { color: theme.colors.green }]}>
            RESCATADO
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * Card del feed de mascotas, memoizada (React.memo).
 * Estrategia #2 de rendimiento: props estables (item + mapas + callbacks
 * memoizados) → FlashList no re-renderiza las cards visibles al hacer
 * setState en el controller (loadingMore, etc.).
 */
export const MascotaCard = memo(function MascotaCard({
  item,
  ciudadMap,
  departamentoMap,
  tipoMascotaMap,
  baseUrl,
  theme,
  onPress,
}: MascotaCardProps) {
  const styles = getStyles(theme);
  const nombreTipo =
    item.otroTipoMascota ?? tipoMascotaMap.get(item.tipoMascotaId) ?? "";
  const ciudad = ciudadMap.get(item.ciudadId) ?? "";
  const departamento = departamentoMap.get(item.ciudadId) ?? "";

  return (
    <Pressable style={styles.card} onPress={() => onPress(item)}>
      <CardBadges item={item} theme={theme} />

      <Text style={styles.cardTipo}>{nombreTipo}</Text>
      {item.fotoUrl ? (
        <Image
          source={{ uri: resolverUrlFoto(item.fotoUrl, baseUrl) ?? undefined }}
          style={styles.cardFoto}
          contentFit="cover"
          placeholder={theme.colors.surfaceLight}
        />
      ) : null}
      <Text style={styles.cardUbicacion}>
        <Icon name="MapPin" size={12} color={theme.colors.textMuted} />{" "}
        {item.ubicacion}
      </Text>
      <Text style={styles.cardCiudad}>
        {ciudad}
        {departamento ? `, ${departamento}` : ""}
      </Text>
      {item.descripcion ? (
        <Text style={styles.cardDescripcion}>{item.descripcion}</Text>
      ) : null}
      <Text style={styles.cardFecha}>
        {new Date(item.createdAt).toLocaleString("es-CO")}
      </Text>
    </Pressable>
  );
});

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      gap: 4,
      // FlashList no respeta `gap` del contentContainerStyle (virtualiza con
      // posicionamiento absoluto) → el espaciado va en la card (KISS).
      marginBottom: 12,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    tipoBadge: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
    },
    tipoBadgeText: {
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    estadoBadge: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
    },
    estadoBadgeText: {
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    cardTipo: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    cardFoto: {
      width: "100%",
      height: 300,
      resizeMode: "cover",
      borderRadius: 12,
      marginTop: 8,
      backgroundColor: theme.colors.surfaceLight,
    },
    cardUbicacion: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    cardCiudad: {
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    cardDescripcion: {
      fontSize: 13,
      color: theme.colors.textTertiary,
      marginTop: 4,
      lineHeight: 18,
    },
    cardFecha: {
      fontSize: 11,
      color: theme.colors.textDim,
      marginTop: 6,
    },
  });
