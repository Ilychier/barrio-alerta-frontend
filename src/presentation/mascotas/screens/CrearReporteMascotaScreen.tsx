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
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useReporteMascotaController } from "../../../application/mascotas/controllers/useReporteMascotaController";
import { useUbicacionGeografica } from "../../../application/ubicacion/useUbicacionGeografica";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/atomic/Icon";
import { UbicacionGeograficaPicker } from "../../components/molecules/UbicacionGeograficaPicker";
import { AppTheme, useAppTheme } from "../../theme/ThemeContext";

const MAX_FOTO_BYTES = 8 * 1024 * 1024; // 8 MB (mismo límite que el backend)

/**
 * Formulario rápido de reporte de mascota (BC Mascotas).
 * Fricción baja de entrada: tipo, especie, ciudad, ubicación, teléfono.
 * Foto opcional: se acepta cualquier imagen (JPEG, PNG, HEIC...) sin
 * conversión — en emergencia no hay tiempo de cambiar formato.
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
  const [otroTipoMascota, setOtroTipoMascota] = useState("");
  const [ciudadId, setCiudadId] = useState<number | undefined>(undefined);
  const [telefono, setTelefono] = useState(user?.email ? "" : "");
  const [descripcion, setDescripcion] = useState("");
  const [fotoUri, setFotoUri] = useState<string | undefined>(undefined);
  const [fotoMime, setFotoMime] = useState<string | undefined>(undefined);
  const [fotoFile, setFotoFile] = useState<any>(undefined);

  const ubicacion = useUbicacionGeografica(controller.ciudades);

  useEffect(() => {
    controller.cargarReferencias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tipoOtro = controller.tiposMascota.find((t) => t.nombre.toLowerCase() === "otro");
  const esOtro = tipoMascotaId !== undefined && tipoOtro !== undefined && tipoMascotaId === tipoOtro.id;

  const validar = (): string | null => {
    if (!tipoMascotaId) return "Selecciona el tipo de mascota";
    if (esOtro && !otroTipoMascota.trim()) return "Especifica qué tipo de mascota es";
    if (!ciudadId) return "Selecciona el municipio/ciudad";
    if (!ubicacion.ubicacionCompuesta.trim()) return "Indica el sector o barrio";
    if (!telefono.trim() || telefono.trim().length < 7) return "Indica un teléfono de contacto válido";
    return null;
  };

  const elegirFoto = async () => {
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        alert("Necesitamos acceso a tus fotos para adjuntar la imagen.");
        return;
      }
      // allowsEditing:false + quality:1.0 devuelven el archivo original
      // (incluido HEIC) sin comprimir — clave en emergencias.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > MAX_FOTO_BYTES) {
        alert("La foto supera 8 MB. Elige una imagen más liviana.");
        return;
      }
      setFotoUri(asset.uri);
      setFotoMime(asset.mimeType ?? "image/jpeg");
      // Web: expo-image-picker devuelve el File nativo en asset.file
      setFotoFile(asset.file ?? undefined);
    } catch (e) {
      console.warn("[CrearReporteMascotaScreen] Error al elegir foto:", e);
      alert("No se pudo abrir la galería. Intenta de nuevo.");
    }
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
      otroTipoMascota: esOtro ? otroTipoMascota.trim() : undefined,
      ciudadId: ciudadId!,
      ubicacion: ubicacion.ubicacionCompuesta,
      telefono: telefono.trim(),
      descripcion: descripcion.trim() || undefined,
      fotoUri,
      fotoMime,
      fotoFile,
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
        {esOtro && (
          <TextInput
            style={styles.input}
            placeholder="Ej: Conejo, loro, hámster..."
            placeholderTextColor={theme.colors.textDim}
            value={otroTipoMascota}
            onChangeText={setOtroTipoMascota}
            maxLength={50}
          />
        )}
      </View>

      {/* ── Ubicación (cascada Depto → Municipio → Localidad → Barrio) ── */}
      <View style={styles.seccion}>
        <Text style={styles.label}>¿Dónde está la mascota?</Text>
        <UbicacionGeograficaPicker
          ubicacion={ubicacion}
          ciudadId={ciudadId}
          onChangeCiudadId={(municipioId) => setCiudadId(municipioId)}
          theme={theme}
          loading={controller.referenciasLoading}
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

      {/* ── Foto (opcional) ─────────────────────────────── */}
      <View style={styles.seccion}>
        <Text style={styles.label}>Foto (opcional)</Text>
        {fotoUri ? (
          <View style={styles.fotoPreviewBox}>
            <Image source={{ uri: fotoUri }} style={styles.fotoPreview} contentFit="cover" />
            <View style={styles.fotoActions}>
              <Pressable style={styles.fotoBtn} onPress={elegirFoto}>
                <Icon name="RefreshCw" size={16} color={theme.colors.green} />
                <Text style={styles.fotoBtnText}>Cambiar</Text>
              </Pressable>
              <Pressable style={styles.fotoBtn} onPress={() => { setFotoUri(undefined); setFotoFile(undefined); }}>
                <Icon name="Trash2" size={16} color={theme.colors.red} />
                <Text style={[styles.fotoBtnText, { color: theme.colors.red }]}>Quitar</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable style={styles.fotoPicker} onPress={elegirFoto}>
            <Icon name="Camera" size={22} color={theme.colors.green} />
            <Text style={styles.fotoPickerText}>Agregar foto del animalito</Text>
            <Text style={styles.fotoPickerHint}>JPEG, PNG, HEIC... hasta 8 MB. Ayuda a identificarlo más rápido.</Text>
          </Pressable>
        )}
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
    fotoPicker: {
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: theme.colors.green,
      borderRadius: 14,
      paddingVertical: 20,
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.colors.surfaceLight,
    },
    fotoPickerText: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.green,
    },
    fotoPickerHint: {
      fontSize: 12,
      color: theme.colors.textDim,
      textAlign: "center",
      paddingHorizontal: 16,
    },
    fotoPreviewBox: {
      gap: 8,
    },
    fotoPreview: {
      width: "100%",
      height: 200,
      borderRadius: 14,
      backgroundColor: theme.colors.surfaceLight,
    },
    fotoActions: {
      flexDirection: "row",
      gap: 12,
    },
    fotoBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    fotoBtnText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.green,
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
