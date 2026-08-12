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
import { useAuth } from "../../context/AuthContext";
import { useMisReportesMascotaController } from "../../../application/mascotas/controllers/useMisReportesMascotaController";
import { useFeedMascotasController } from "../../../application/mascotas/controllers/useFeedMascotasController";
import { ReporteMascota } from "../../../domain/mascotas/entities/ReporteMascota";
import { EstadoReporte } from "../../../domain/mascotas/entities/EstadoReporte";
import { TipoReporte } from "../../../domain/mascotas/entities/TipoReporte";
import Icon from "../../components/atomic/Icon";
import { AppTheme, useAppTheme } from "../../theme/ThemeContext";

/**
 * "Mis reportes" (BC Mascotas): reportes creados por el usuario autenticado.
 * Permite marcar como rescatado y eliminar (soft delete).
 */
export function MisReportesMascotaScreen() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const styles = getStyles(theme, isDesktop);
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? 0;

  const controller = useMisReportesMascotaController(userId);
  const feed = useFeedMascotasController(0);

  const renderItem = ({ item }: { item: ReporteMascota }) => (
    <View style={styles.card}>
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
        {item.estado !== EstadoReporte.DELETED && (
          <View
            style={[
              styles.estadoBadge,
              {
                backgroundColor:
                  item.estado === EstadoReporte.RESCUED ? theme.colors.greenBg : theme.colors.surfaceLight,
              },
            ]}
          >
            <Text
              style={[
                styles.estadoBadgeText,
                { color: item.estado === EstadoReporte.RESCUED ? theme.colors.green : theme.colors.textMuted },
              ]}
            >
              {item.estado === EstadoReporte.RESCUED ? "RESCATADO" : "ACTIVO"}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.cardTipo}>{feed.nombreTipoMascota(item.tipoMascotaId)}</Text>
      <Text style={styles.cardUbicacion}>{item.ubicacion}</Text>
      <Text style={styles.cardCiudad}>{feed.nombreCiudad(item.ciudadId)}</Text>
      <Text style={styles.cardFecha}>{new Date(item.createdAt).toLocaleString("es-CO")}</Text>

      {item.estado === EstadoReporte.ACTIVE && (
        <View style={styles.acciones}>
          <Pressable
            style={[styles.btn, styles.btnRescate]}
            onPress={() => controller.marcarRescatado(item.id)}
          >
            <Icon name="HeartHandshake" size={14} color={theme.colors.green} />
            <Text style={[styles.btnText, { color: theme.colors.green }]}>Marcar rescatado</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnEliminar]}
            onPress={() => controller.eliminar(item.id)}
          >
            <Icon name="Trash2" size={14} color={theme.colors.red} />
            <Text style={[styles.btnText, { color: theme.colors.red }]}>Eliminar</Text>
          </Pressable>
        </View>
      )}

      <Pressable style={styles.verDetalle} onPress={() => router.push(`/mascotas/${item.id}`)}>
        <Text style={styles.verDetalleText}>Ver detalle público</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Reportes</Text>
        <Text style={styles.subtitle}>Gestiona los reportes que has creado</Text>
      </View>

      {controller.loading ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={theme.colors.green} />
        </View>
      ) : controller.reportes.length === 0 ? (
        <View style={styles.centro}>
          <Icon name="PawPrint" size={40} color={theme.colors.textDim} />
          <Text style={styles.vacio}>Aún no has creado reportes.</Text>
          <Pressable style={styles.crearBtn} onPress={() => router.push("/mascotas/reportar")}>
            <Text style={styles.crearBtnText}>Crear el primero</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={controller.reportes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
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
    cardFecha: {
      fontSize: 11,
      color: theme.colors.textDim,
      marginTop: 4,
    },
    acciones: {
      flexDirection: "row",
      gap: 8,
      marginTop: 10,
    },
    btn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
    },
    btnRescate: {
      borderColor: theme.colors.greenBorder,
      backgroundColor: theme.colors.greenBg,
    },
    btnEliminar: {
      borderColor: theme.colors.redBorder,
      backgroundColor: theme.colors.redBg,
    },
    btnText: {
      fontSize: 12,
      fontWeight: "700",
    },
    verDetalle: {
      marginTop: 10,
    },
    verDetalleText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.green,
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
    crearBtn: {
      backgroundColor: theme.colors.green,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    crearBtnText: {
      color: theme.colors.white,
      fontSize: 13,
      fontWeight: "700",
    },
  });
