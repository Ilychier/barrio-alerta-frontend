import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useHistoriasRescateController } from "../../../application/mascotas/controllers/useHistoriasRescateController";
import { useFeedMascotasController } from "../../../application/mascotas/controllers/useFeedMascotasController";
import { ReporteMascota } from "../../../domain/mascotas/entities/ReporteMascota";
import { TipoReporte } from "../../../domain/mascotas/entities/TipoReporte";
import Icon from "../../components/atomic/Icon";
import { AppTheme, useAppTheme } from "../../theme/ThemeContext";

/**
 * Historias de rescate (BC Mascotas): reportes con estado RESCUED.
 * Feed de scroll infinito, como el feed principal.
 */
export function HistoriasRescateScreen() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const styles = getStyles(theme, isDesktop);
  const router = useRouter();

  const controller = useHistoriasRescateController(0);
  const feed = useFeedMascotasController(0);

  const renderItem = ({ item }: { item: ReporteMascota }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/mascotas/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.rescateBadge, { backgroundColor: theme.colors.greenBg }]}>
          <Icon name="HeartHandshake" size={14} color={theme.colors.green} />
          <Text style={[styles.rescateBadgeText, { color: theme.colors.green }]}>HISTORIA DE RESCATE</Text>
        </View>
      </View>

      <Text style={styles.cardTipo}>
        {feed.nombreTipoMascota(item.tipoMascotaId)}{" "}
        {item.tipoReporte === TipoReporte.LOST ? "perdida" : "encontrada"} y rescatada
      </Text>
      <Text style={styles.cardUbicacion}>{item.ubicacion}</Text>
      <Text style={styles.cardCiudad}>{feed.nombreCiudad(item.ciudadId)}</Text>
      {item.descripcion ? <Text style={styles.cardDescripcion}>{item.descripcion}</Text> : null}
      <Text style={styles.cardFecha}>{new Date(item.createdAt).toLocaleString("es-CO")}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historias de Rescate</Text>
        <Text style={styles.subtitle}>Mascotas que encontraron su hogar gracias a la comunidad</Text>
      </View>

      {controller.loading ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={theme.colors.green} />
        </View>
      ) : controller.reportes.length === 0 ? (
        <View style={styles.centro}>
          <Icon name="HeartHandshake" size={40} color={theme.colors.textDim} />
          <Text style={styles.vacio}>Aún no hay historias de rescate.</Text>
        </View>
      ) : (
        <FlatList
          data={controller.reportes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          onEndReached={controller.loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            controller.loadingMore ? (
              <ActivityIndicator style={styles.loadingMore} color={theme.colors.green} />
            ) : null
          }
        />
      )}
    </View>
  );
}

const getStyles = (theme: AppTheme, isDesktop: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: isDesktop ? 32 : 20,
      maxWidth: isDesktop ? 900 : undefined,
      alignSelf: "center",
      width: "100%",
    },
    header: {
      marginBottom: 16,
      gap: 4,
    },
    title: {
      fontSize: isDesktop ? 28 : 24,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    subtitle: {
      fontSize: 13,
      color: theme.colors.textTertiary,
    },
    lista: {
      gap: 12,
      paddingBottom: 32,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.greenBorder,
      padding: 16,
      gap: 4,
    },
    cardHeader: {
      marginBottom: 6,
    },
    rescateBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
    },
    rescateBadgeText: {
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    cardTipo: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.textPrimary,
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
    centro: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingVertical: 48,
    },
    vacio: {
      color: theme.colors.textMuted,
      fontSize: 14,
      textAlign: "center",
    },
    loadingMore: {
      paddingVertical: 16,
    },
  });
