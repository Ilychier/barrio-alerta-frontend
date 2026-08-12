import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useFeedMascotasController } from "../../../application/mascotas/controllers/useFeedMascotasController";
import { ReporteMascota } from "../../../domain/mascotas/entities/ReporteMascota";
import { resolverUrlFoto } from "../../../infrastructure/mascotas/adapters/mappers";
import { EstadoReporte } from "../../../domain/mascotas/entities/EstadoReporte";
import { TipoReporte } from "../../../domain/mascotas/entities/TipoReporte";
import { DependencyContainer } from "../../../infrastructure/config/dependencyContainer";
import Icon from "../../components/atomic/Icon";
import { AppTheme, useAppTheme } from "../../theme/ThemeContext";

interface DetalleReporteMascotaScreenProps {
  /** ID del reporte. Si no se provee, se lee del query param de la ruta. */
  reporteId?: number;
  /** Callback al volver atrás. Si no se provee, se usa el router. */
  onBack?: () => void;
}

/**
 * Detalle público de un reporte de mascota + contacto via WhatsApp.
 * Cuando el reporte está RESCUED, el backend oculta el teléfono
 * (Ley 1581 de 2012) y el botón de WhatsApp no se muestra.
 */
export function DetalleReporteMascotaScreen({
  reporteId: reporteIdProp,
  onBack,
}: DetalleReporteMascotaScreenProps = {}) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const styles = getStyles(theme, isDesktop);
  const { id } = useLocalSearchParams<{ id: string }>();
  const reporteId = reporteIdProp ?? Number(id);

  const [reporte, setReporte] = useState<ReporteMascota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reutiliza el controller del feed para resolver nombres de catálogos
  const feed = useFeedMascotasController(0);

  useEffect(() => {
    let active = true;
    async function cargar() {
      try {
        const repo = DependencyContainer.getInstance().getReporteMascotaRepository();
        const data = await repo.obtenerPublico(reporteId);
        if (active) setReporte(data ?? null);
      } catch {
        if (active) setError("No se pudo cargar el reporte");
      } finally {
        if (active) setLoading(false);
      }
    }
    cargar();
    return () => {
      active = false;
    };
  }, [reporteId]);

  const abrirWhatsApp = () => {
    if (!reporte?.telefono) return;
    // Click to Chat oficial de WhatsApp: https://wa.me/<numero>?text=<mensaje>
    // (https://faq.whatsapp.com/general/chats/how-to-use-click-to-chat)
    // Funciona en móvil y en WhatsApp Web. El esquema nativo whatsapp://
    // solo funciona en Android/iOS y los navegadores web no lo manejan.
    const telefono = reporte.telefono.replace(/[^0-9]/g, "");
    const mensaje = encodeURIComponent(
      `Hola, vi tu reporte en Barrio Alerta sobre ${reporte.tipoReporte === TipoReporte.LOST ? "una mascota perdida" : "una mascota encontrada"}. Quiero ayudarte.`,
    );
    Linking.openURL(`https://wa.me/${telefono}?text=${mensaje}`).catch((e) => {
      console.warn("[DetalleReporteMascotaScreen] No se pudo abrir WhatsApp:", e);
      alert("No se pudo abrir WhatsApp. Llama al número directamente.");
    });
  };

  if (loading) {
    return (
      <View style={[styles.centro, { flex: 1 }]}>
        <ActivityIndicator size="large" color={theme.colors.green} />
      </View>
    );
  }

  if (error || !reporte) {
    return (
      <View style={[styles.centro, { flex: 1 }]}>
        <Icon name="PawPrint" size={40} color={theme.colors.textDim} />
        <Text style={styles.error}>{error ?? "Reporte no encontrado"}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {onBack && (
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Icon name="ArrowLeft" size={18} color={theme.colors.green} />
          <Text style={styles.backBtnText}>Volver a los reportes</Text>
        </TouchableOpacity>
      )}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.tipoBadge,
              { backgroundColor: reporte.tipoReporte === TipoReporte.LOST ? theme.colors.redBg : theme.colors.purpleBg },
            ]}
          >
            <Text
              style={[
                styles.tipoBadgeText,
                { color: reporte.tipoReporte === TipoReporte.LOST ? theme.colors.red : theme.colors.purple },
              ]}
            >
              {reporte.tipoReporte === TipoReporte.LOST ? "PERDIDO" : "ENCONTRADO"}
            </Text>
          </View>
          {reporte.estado === EstadoReporte.RESCUED && (
            <View style={[styles.estadoBadge, { backgroundColor: theme.colors.greenBg }]}>
              <Text style={[styles.estadoBadgeText, { color: theme.colors.green }]}>RESCATADO 🎉</Text>
            </View>
          )}
        </View>

        <Text style={styles.tipo}>{feed.nombreTipoMascota(reporte)}</Text>

        {reporte.fotoUrl ? (
          <Image source={{ uri: resolverUrlFoto(reporte.fotoUrl) ?? undefined }} style={styles.foto} contentFit="cover" />
        ) : null}

        <View style={styles.infoRow}>
          <Icon name="MapPin" size={16} color={theme.colors.green} />
          <Text style={styles.infoText}>{reporte.ubicacion}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="Building2" size={16} color={theme.colors.green} />
          <Text style={styles.infoText}>
            {feed.nombreCiudad(reporte.ciudadId)}
            {feed.departamentoCiudad(reporte.ciudadId) ? `, ${feed.departamentoCiudad(reporte.ciudadId)}` : ""}
          </Text>
        </View>

        {reporte.descripcion ? (
          <View style={styles.descripcionBox}>
            <Text style={styles.descripcion}>{reporte.descripcion}</Text>
          </View>
        ) : null}

        <Text style={styles.fecha}>Publicado: {new Date(reporte.createdAt).toLocaleString("es-CO")}</Text>

        {/* Contacto: solo si el teléfono está visible (no RESCUED) */}
        {reporte.telefono ? (
          <Pressable style={styles.whatsappBtn} onPress={abrirWhatsApp}>
            <Icon name="MessageCircle" size={18} color={theme.colors.white} />
            <Text style={styles.whatsappText}>Contactar por WhatsApp</Text>
          </Pressable>
        ) : (
          <View style={styles.rescuedBox}>
            <Icon name="HeartHandshake" size={18} color={theme.colors.green} />
            <Text style={styles.rescuedText}>
              Este caso ya fue resuelto. ¡Gracias a la comunidad por ayudar!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const getStyles = (theme: AppTheme, isDesktop: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: "transparent" },
    content: {
      padding: isDesktop ? 32 : 20,
      maxWidth: isDesktop ? 700 : undefined,
      alignSelf: "center",
      width: "100%",
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: isDesktop ? 28 : 20,
      gap: 12,
    },
    backBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      paddingVertical: 6,
      paddingHorizontal: 4,
      marginBottom: 4,
    },
    backBtnText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.green,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    tipoBadge: {
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    tipoBadgeText: {
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    estadoBadge: {
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    estadoBadgeText: {
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    tipo: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    foto: {
      width: "100%",
      height: 260,
      borderRadius: 14,
      backgroundColor: theme.colors.surfaceLight,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    infoText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    descripcionBox: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 12,
      padding: 14,
    },
    descripcion: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    fecha: {
      fontSize: 12,
      color: theme.colors.textDim,
    },
    whatsappBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: "#25D366",
      borderRadius: 14,
      paddingVertical: 14,
      marginTop: 8,
    },
    whatsappText: {
      color: theme.colors.white,
      fontSize: 15,
      fontWeight: "700",
    },
    rescuedBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.colors.greenBg,
      borderRadius: 12,
      padding: 14,
      marginTop: 8,
    },
    rescuedText: {
      color: theme.colors.green,
      fontSize: 13,
      fontWeight: "600",
      flex: 1,
    },
    centro: {
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    error: {
      color: theme.colors.red,
      fontSize: 14,
    },
  });
