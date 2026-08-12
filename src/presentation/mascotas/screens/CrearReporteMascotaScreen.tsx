import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useReporteMascotaController } from "../../../application/mascotas/controllers/useReporteMascotaController";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/atomic/Icon";
import { AppTheme, useAppTheme } from "../../theme/ThemeContext";

/**
 * Formulario rápido de reporte de mascota (BC Mascotas).
 * Fricción baja de entrada: tipo, especie, ciudad, ubicación, teléfono.
 */
export function CrearReporteMascotaScreen() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const styles = getStyles(theme, isDesktop);
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? 0;

  const controller = useReporteMascotaController(userId, () => {
    router.push("/mascotas");
  });

  const [tipoReporte, setTipoReporte] = useState<"LOST" | "FOUND">("LOST");
  const [tipoMascotaId, setTipoMascotaId] = useState<number | undefined>(undefined);
  const [ciudadId, setCiudadId] = useState<number | undefined>(undefined);
  const [ubicacion, setUbicacion] = useState("");
  const [telefono, setTelefono] = useState(user?.email ? "" : "");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    controller.cargarReferencias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validar = (): string | null => {
    if (!tipoMascotaId) return "Selecciona el tipo de mascota";
    if (!ciudadId) return "Selecciona la ciudad";
    if (!ubicacion.trim()) return "Indica el sector o barrio";
    if (!telefono.trim() || telefono.trim().length < 7) return "Indica un teléfono de contacto válido";
    return null;
  };

  const handleSubmit = async () => {
    const error = validar();
    if (error) {
      alert(error);
      return;
    }
    await controller.crear({
      tipoReporte,
      tipoMascotaId: tipoMascotaId!,
      ciudadId: ciudadId!,
      ubicacion: ubicacion.trim(),
      telefono: telefono.trim(),
      descripcion: descripcion.trim() || undefined,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {tipoReporte === "LOST" ? "Reportar Mascota Perdida" : "Reportar Mascota Encontrada"}
        </Text>
        <Text style={styles.subtitle}>
          Completa los datos en menos de un minuto. Quien la vea podrá contactarte por WhatsApp.
        </Text>
      </View>

      {/* ── Tipo de reporte ────────────────────────────── */}
      <View style={styles.seccion}>
        <Text style={styles.label}>¿Qué pasó?</Text>
        <View style={styles.tipoRow}>
          <Pressable
            style={[styles.tipoCard, tipoReporte === "LOST" && styles.tipoCardActivoLost]}
            onPress={() => setTipoReporte("LOST")}
          >
            <Icon name="Search" size={20} color={tipoReporte === "LOST" ? theme.colors.red : theme.colors.textMuted} />
            <Text style={[styles.tipoCardText, tipoReporte === "LOST" && styles.tipoCardTextActivo]}>Se perdió</Text>
          </Pressable>
          <Pressable
            style={[styles.tipoCard, tipoReporte === "FOUND" && styles.tipoCardActivoFound]}
            onPress={() => setTipoReporte("FOUND")}
          >
            <Icon name="HeartHandshake" size={20} color={tipoReporte === "FOUND" ? theme.colors.purple : theme.colors.textMuted} />
            <Text style={[styles.tipoCardText, tipoReporte === "FOUND" && styles.tipoCardTextActivo]}>La encontré / la vi</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Tipo de mascota ────────────────────────────── */}
      <View style={styles.seccion}>
        <Text style={styles.label}>Tipo de mascota</Text>
        {controller.referenciasLoading ? (
          <ActivityIndicator color={theme.colors.green} />
        ) : (
          <View style={styles.chips}>
            {controller.tiposMascota.map((t) => (
              <Pressable
                key={t.id}
                style={[styles.chip, tipoMascotaId === t.id && styles.chipActivo]}
                onPress={() => setTipoMascotaId(t.id)}
              >
                <Text style={[styles.chipText, tipoMascotaId === t.id && styles.chipTextActivo]}>{t.nombre}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* ── Ciudad ─────────────────────────────────────── */}
      <View style={styles.seccion}>
        <Text style={styles.label}>Ciudad</Text>
        {controller.referenciasLoading ? (
          <ActivityIndicator color={theme.colors.green} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chips}>
              {controller.ciudades.slice(0, 30).map((c) => (
                <Pressable
                  key={c.id}
                  style={[styles.chip, ciudadId === c.id && styles.chipActivo]}
                  onPress={() => setCiudadId(c.id)}
                >
                  <Text style={[styles.chipText, ciudadId === c.id && styles.chipTextActivo]}>
                    {c.nombre}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* ── Ubicación ──────────────────────────────────── */}
      <View style={styles.seccion}>
        <Text style={styles.label}>Sector / barrio / lugar</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Barrio La Soledad, cerca al parque"
          placeholderTextColor={theme.colors.textDim}
          value={ubicacion}
          onChangeText={setUbicacion}
        />
      </View>

      {/* ── Teléfono ───────────────────────────────────── */}
      <View style={styles.seccion}>
        <Text style={styles.label}>Teléfono de contacto (WhatsApp)</Text>
        <TextInput
          style={styles.input}
          placeholder="+57 300 123 4567"
          placeholderTextColor={theme.colors.textDim}
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
        />
      </View>

      {/* ── Descripción ────────────────────────────────── */}
      <View style={styles.seccion}>
        <Text style={styles.label}>Descripción (opcional)</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Raza, color, señas particulares, collar..."
          placeholderTextColor={theme.colors.textDim}
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          numberOfLines={3}
        />
      </View>

      {controller.error && <Text style={styles.error}>{controller.error}</Text>}

      <Pressable
        style={[styles.submitBtn, controller.enviando && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={controller.enviando}
      >
        {controller.enviando ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <Text style={styles.submitText}>Publicar reporte</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const getStyles = (theme: AppTheme, isDesktop: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent",
    },
    content: {
      padding: isDesktop ? 32 : 20,
      paddingBottom: 48,
      gap: 20,
      maxWidth: isDesktop ? 800 : undefined,
      alignSelf: "center",
      width: "100%",
    },
    header: {
      gap: 6,
    },
    title: {
      fontSize: isDesktop ? 28 : 24,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 13,
      color: theme.colors.textTertiary,
      lineHeight: 19,
    },
    seccion: {
      gap: 8,
    },
    label: {
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: theme.colors.textMuted,
    },
    tipoRow: {
      flexDirection: "row",
      gap: 12,
    },
    tipoCard: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    tipoCardActivoLost: {
      borderColor: theme.colors.red,
      backgroundColor: theme.colors.redBg,
    },
    tipoCardActivoFound: {
      borderColor: theme.colors.purple,
      backgroundColor: theme.colors.purpleBg,
    },
    tipoCardText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    tipoCardTextActivo: {
      color: theme.colors.textPrimary,
      fontWeight: "700",
    },
    chips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    chipActivo: {
      backgroundColor: theme.colors.green,
      borderColor: theme.colors.green,
    },
    chipText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    chipTextActivo: {
      color: theme.colors.white,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: theme.colors.textPrimary,
    },
    inputMultiline: {
      minHeight: 80,
      textAlignVertical: "top",
    },
    error: {
      color: theme.colors.red,
      fontSize: 13,
    },
    submitBtn: {
      backgroundColor: theme.colors.green,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 4,
    },
    submitBtnDisabled: {
      opacity: 0.6,
    },
    submitText: {
      color: theme.colors.white,
      fontSize: 15,
      fontWeight: "700",
    },
  });
