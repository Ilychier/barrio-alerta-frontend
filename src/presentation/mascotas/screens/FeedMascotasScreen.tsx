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
import { useState } from "react";
import { useFeedMascotasController } from "../../../application/mascotas/controllers/useFeedMascotasController";
import { EstadoReporte } from "../../../domain/mascotas/entities/EstadoReporte";
import { TipoReporte } from "../../../domain/mascotas/entities/TipoReporte";
import { ReporteMascota } from "../../../domain/mascotas/entities/ReporteMascota";
import Icon from "../../components/atomic/Icon";
import { AppTheme, useAppTheme } from "../../theme/ThemeContext";

/**
 * Feed público de reportes de mascotas (BC Mascotas).
 * Flujo continuo percibido + paginación real (scroll infinito).
 */
export function FeedMascotasScreen() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const styles = getStyles(theme, isDesktop);
  const router = useRouter();

  const [filtroEstado, setFiltroEstado] = useState<EstadoReporte | undefined>(undefined);
  const [filtroTipo, setFiltroTipo] = useState<TipoReporte | undefined>(undefined);
  const [ciudadId, setCiudadId] = useState<number | undefined>(undefined);

  const feed = useFeedMascotasController(0);

  const aplicarFiltros = (estado?: EstadoReporte, tipo?: TipoReporte, ciudad?: number) => {
    setFiltroEstado(estado);
    setFiltroTipo(tipo);
    setCiudadId(ciudad);
    feed.aplicarFiltros({ estado, tipoReporte: tipo, ciudadId: ciudad });
  };

  const renderItem = ({ item }: { item: ReporteMascota }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/mascotas/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.tipoBadge,
            { backgroundColor: item.tipoReporte === TipoReporte.LOST ? theme.colors.redBg : theme.colors.purpleBg },
          ]}
        >
          <Text
            style={[
              styles.tipoBadgeText,
              { color: item.tipoReporte === TipoReporte.LOST ? theme.colors.red : theme.colors.purple },
            ]}
          >
            {item.tipoReporte === TipoReporte.LOST ? "PERDIDO" : "ENCONTRADO"}
          </Text>
        </View>
        {item.estado === EstadoReporte.RESCUED && (
          <View style={[styles.estadoBadge, { backgroundColor: theme.colors.greenBg }]}>
            <Text style={[styles.estadoBadgeText, { color: theme.colors.green }]}>RESCATADO</Text>
          </View>
        )}
      </View>

      <Text style={styles.cardTipo}>{feed.nombreTipoMascota(item)}</Text>
      <Text style={styles.cardUbicacion}>
        <Icon name="MapPin" size={12} color={theme.colors.textMuted} /> {item.ubicacion}
      </Text>
      <Text style={styles.cardCiudad}>
        {feed.nombreCiudad(item.ciudadId)}
        {feed.departamentoCiudad(item.ciudadId) ? `, ${feed.departamentoCiudad(item.ciudadId)}` : ""}
      </Text>
      {item.descripcion ? <Text style={styles.cardDescripcion}>{item.descripcion}</Text> : null}
      <Text style={styles.cardFecha}>{new Date(item.createdAt).toLocaleString("es-CO")}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* ── Título ─────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.title}>Mascotas en Emergencia</Text>
        <Text style={styles.subtitle}>Reportes de mascotas perdidas y encontradas en tu ciudad</Text>
      </View>

      {/* ── Filtros ────────────────────────────────────── */}
      <View style={styles.filtros}>
        <View style={styles.filtroGrupo}>
          <Text style={styles.filtroLabel}>Tipo</Text>
          <View style={styles.filtroChips}>
            <Pressable
              style={[styles.chip, filtroTipo === undefined && styles.chipActivo]}
              onPress={() => aplicarFiltros(filtroEstado, undefined, ciudadId)}
            >
              <Text style={[styles.chipText, filtroTipo === undefined && styles.chipTextActivo]}>Todos</Text>
            </Pressable>
            <Pressable
              style={[styles.chip, filtroTipo === TipoReporte.LOST && styles.chipActivo]}
              onPress={() => aplicarFiltros(filtroEstado, TipoReporte.LOST, ciudadId)}
            >
              <Text style={[styles.chipText, filtroTipo === TipoReporte.LOST && styles.chipTextActivo]}>Perdidos</Text>
            </Pressable>
            <Pressable
              style={[styles.chip, filtroTipo === TipoReporte.FOUND && styles.chipActivo]}
              onPress={() => aplicarFiltros(filtroEstado, TipoReporte.FOUND, ciudadId)}
            >
              <Text style={[styles.chipText, filtroTipo === TipoReporte.FOUND && styles.chipTextActivo]}>Encontrados</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.filtroGrupo}>
          <Text style={styles.filtroLabel}>Estado</Text>
          <View style={styles.filtroChips}>
            <Pressable
              style={[styles.chip, filtroEstado === undefined && styles.chipActivo]}
              onPress={() => aplicarFiltros(undefined, filtroTipo, ciudadId)}
            >
              <Text style={[styles.chipText, filtroEstado === undefined && styles.chipTextActivo]}>Activos</Text>
            </Pressable>
            <Pressable
              style={[styles.chip, filtroEstado === EstadoReporte.RESCUED && styles.chipActivo]}
              onPress={() => aplicarFiltros(EstadoReporte.RESCUED, filtroTipo, ciudadId)}
            >
              <Text style={[styles.chipText, filtroEstado === EstadoReporte.RESCUED && styles.chipTextActivo]}>Rescatados</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* ── Lista ──────────────────────────────────────── */}
      {feed.loading ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={theme.colors.green} />
        </View>
      ) : feed.error ? (
        <View style={styles.centro}>
          <Text style={styles.error}>{feed.error}</Text>
        </View>
      ) : feed.reportes.length === 0 ? (
        <View style={styles.centro}>
          <Icon name="PawPrint" size={40} color={theme.colors.textDim} />
          <Text style={styles.vacio}>Aún no hay reportes con estos filtros.</Text>
        </View>
      ) : (
        <FlatList
          data={feed.reportes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          onEndReached={feed.loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            feed.loadingMore ? (
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
      maxWidth: isDesktop ? 1000 : undefined,
      alignSelf: "center",
      width: "100%",
    },
    header: {
      marginBottom: 16,
    },
    title: {
      fontSize: isDesktop ? 32 : 26,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textTertiary,
      marginTop: 4,
    },
    filtros: {
      gap: 12,
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
    },
    filtroGrupo: {
      gap: 6,
    },
    filtroLabel: {
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: theme.colors.textMuted,
    },
    filtroChips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceLight,
    },
    chipActivo: {
      backgroundColor: theme.colors.green,
      borderColor: theme.colors.green,
    },
    chipText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    chipTextActivo: {
      color: theme.colors.white,
    },
    lista: {
      gap: 12,
      paddingBottom: 32,
    },
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
    error: {
      color: theme.colors.red,
      fontSize: 14,
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
