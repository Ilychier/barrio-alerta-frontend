import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useFeedMascotasController } from "../../../application/mascotas/controllers/useFeedMascotasController";
import { EstadoReporte } from "../../../domain/mascotas/entities/EstadoReporte";
import { ReporteMascota } from "../../../domain/mascotas/entities/ReporteMascota";
import { TipoReporte } from "../../../domain/mascotas/entities/TipoReporte";
import Icon from "../../components/atomic/Icon";
import { FeedSkeletonList } from "../../components/molecules/FeedSkeletonCard";
import { SelectInput, SelectOption } from "../../components/atomic/SelectInput";
import { useDI } from "../../context/DIContext";
import { AppTheme, useAppTheme } from "../../theme/ThemeContext";
import { MascotaCard } from "../components/MascotaCard";

/**
 * Feed público de reportes de mascotas (BC Mascotas).
 * Flujo continuo percibido + paginación real (scroll infinito).
 */
const TIPO_OPTIONS: SelectOption[] = [
  { value: "TODOS", label: "Todos" },
  { value: TipoReporte.LOST, label: "Perdidos" },
  { value: TipoReporte.FOUND, label: "Encontrados" },
];

const ESTADO_OPTIONS: SelectOption[] = [
  { value: "ACTIVOS", label: "Activos" },
  { value: EstadoReporte.RESCUED, label: "Rescatados" },
];

interface FeedMascotasScreenProps {
  /** Callback al tocar una tarjeta. Si no se provee, navega a /mascotas/[id]. */
  onVerDetalle?: (reporte: ReporteMascota) => void;
}

export function FeedMascotasScreen({
  onVerDetalle,
}: FeedMascotasScreenProps = {}) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const styles = getStyles(theme, isDesktop);
  const router = useRouter();
  const container = useDI();

  const [filtroEstado, setFiltroEstado] = useState<EstadoReporte | undefined>(
    undefined,
  );
  const [filtroTipo, setFiltroTipo] = useState<TipoReporte | undefined>(
    undefined,
  );
  const [ciudadId, setCiudadId] = useState<number | undefined>(undefined);

  const feed = useFeedMascotasController(container, 0);

  const aplicarFiltros = (
    estado?: EstadoReporte,
    tipo?: TipoReporte,
    ciudad?: number,
  ) => {
    setFiltroEstado(estado);
    setFiltroTipo(tipo);
    setCiudadId(ciudad);
    feed.aplicarFiltros({
      estado,
      tipoReporte: tipo,
      ciudadId: ciudad,
      busqueda: feed.busqueda,
    });
  };

  const buscar = (texto: string) => {
    feed.setBusqueda(texto);
    feed.aplicarFiltros({
      estado: filtroEstado,
      tipoReporte: filtroTipo,
      ciudadId,
      busqueda: texto,
    });
  };

  const limpiarBusqueda = () => {
    feed.setBusqueda("");
    feed.aplicarFiltros({
      estado: filtroEstado,
      tipoReporte: filtroTipo,
      ciudadId,
      busqueda: "",
    });
  };

  const handleVerDetalle = useCallback(
    (item: ReporteMascota) => {
      if (onVerDetalle) onVerDetalle(item);
      else router.push(`/mascotas/${item.id}`);
    },
    [onVerDetalle, router],
  );

  const renderItem = useCallback(
    ({ item }: { item: ReporteMascota }) => (
      <MascotaCard
        item={item}
        ciudadMap={feed.ciudadMap}
        departamentoMap={feed.departamentoMap}
        tipoMascotaMap={feed.tipoMascotaMap}
        baseUrl={container.getBaseUrl()}
        theme={theme}
        onPress={handleVerDetalle}
      />
    ),
    [feed.ciudadMap, feed.departamentoMap, feed.tipoMascotaMap, container, theme, handleVerDetalle],
  );

  return (
    <View style={styles.container}>
      {/* ── Búsqueda por texto ────────────────────────────── */}
      <View style={styles.busquedaContainer}>
        <Icon name="Search" size={16} color={theme.colors.textMuted} />
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar por descripción o ubicación…"
          placeholderTextColor={theme.colors.textDim}
          value={feed.busqueda}
          onChangeText={buscar}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Buscar mascotas por descripción o ubicación"
        />
        {feed.busqueda.length > 0 ? (
          <Pressable
            onPress={limpiarBusqueda}
            hitSlop={8}
            accessibilityLabel="Limpiar búsqueda"
          >
            <Icon name="X" size={16} color={theme.colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {/* ── Filtros ────────────────────────────────────── */}
      <View style={styles.filtros}>
        <View style={styles.selectWrapper}>
          <SelectInput
            label="Tipo"
            icon="PawPrint"
            options={TIPO_OPTIONS}
            selectedValue={filtroTipo ?? "TODOS"}
            onSelect={(v) =>
              aplicarFiltros(
                filtroEstado,
                v === "TODOS" ? undefined : (v as TipoReporte),
                ciudadId,
              )
            }
            placeholder="Todos"
            theme={theme}
            focused={false}
            onFocus={() => {}}
            onBlur={() => {}}
          />
        </View>

        <View style={styles.selectWrapper}>
          <SelectInput
            label="Estado"
            icon="ShieldCheck"
            options={ESTADO_OPTIONS}
            selectedValue={filtroEstado ?? "ACTIVOS"}
            onSelect={(v) =>
              aplicarFiltros(
                v === "ACTIVOS" ? undefined : (v as EstadoReporte),
                filtroTipo,
                ciudadId,
              )
            }
            placeholder="Activos"
            theme={theme}
            focused={false}
            onFocus={() => {}}
            onBlur={() => {}}
          />
        </View>
      </View>

      {/* ── Lista ──────────────────────────────────────── */}
      {feed.initialLoading ? (
        <FeedSkeletonList theme={theme} />
      ) : feed.error ? (
        <View style={styles.centro}>
          <Text style={styles.error}>{feed.error}</Text>
        </View>
      ) : feed.reportes.length === 0 ? (
        <View style={styles.centro}>
          <Icon name="PawPrint" size={40} color={theme.colors.textDim} />
          <Text style={styles.vacio}>
            Aún no hay reportes con estos filtros.
          </Text>
        </View>
      ) : (
        <FlashList
          data={feed.reportes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          onEndReached={feed.loadMore}
          onEndReachedThreshold={0.5}
          // Precarga celdas antes de llegar al fondo: la inserción de la
          // página siguiente ya viene renderizada → menos trabajo al insertar
          // (menos micro lag durante el infinity scroll).
          drawDistance={600}
          ListFooterComponent={
            feed.loadingMore ? (
              <ActivityIndicator
                style={styles.loadingMore}
                color={theme.colors.green}
              />
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
      paddingTop: 0,
      paddingHorizontal: isDesktop ? 32 : 20,
      maxWidth: isDesktop ? 1000 : undefined,
      alignSelf: "center",
      width: "100%",
    },
    header: {
      marginBottom: 10,
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
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 10,
      width: "100%",
    },
    busquedaContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginBottom: 10,
      width: "100%",
    },
    busquedaInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 14,
      color: theme.colors.textPrimary,
    },
    selectWrapper: {
      flex: 1,
    },
    lista: {
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
