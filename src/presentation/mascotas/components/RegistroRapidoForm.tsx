import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useState } from "react";
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
import { useReporteMascotaController } from "../../../application/mascotas/controllers/useReporteMascotaController";
import { useRegistroRapidoController } from "../../../application/mascotas/controllers/useRegistroRapidoController";
import { useUbicacionGeografica } from "../../../application/ubicacion/useUbicacionGeografica";
import { ReporteRapidoResult } from "../../../domain/mascotas/ports/IReporteRapidoRepository";
import Icon from "../../components/atomic/Icon";
import { useDI } from "../../context/DIContext";
import { SelectInput } from "../../components/atomic/SelectInput";
import { UbicacionGeograficaPicker } from "../../components/molecules/UbicacionGeograficaPicker";
import { AppTheme, useAppTheme } from "../../theme/ThemeContext";

const MAX_FOTO_BYTES = 8 * 1024 * 1024; // 8 MB (mismo límite que el backend)
const PREFIJO_PAIS = "+57"; // Colombia: prefijo fijo, el usuario solo digita el número

interface RegistroRapidoFormProps {
  onSuccess: (result: ReporteRapidoResult) => void;
}

/**
 * Formulario rápido de emergencia (BC Mascotas).
 * Un solo paso: celular personal (llave del usuario) + datos del animalito.
 * El teléfono de contacto de la mascota puede ser el mismo (checkbox) o uno
 * distinto. Al enviar, el backend registra (o reutiliza) el usuario por su
 * celular y crea el reporte atómicamente.
 */
export function RegistroRapidoForm({ onSuccess }: RegistroRapidoFormProps) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const styles = getStyles(theme, isDesktop);
  const container = useDI();

  const controller = useReporteMascotaController(container, 0);
  const registroRapido = useRegistroRapidoController(container);
  const ubicacion = useUbicacionGeografica(container, controller.ciudades);

  const [tipoReporte, setTipoReporte] = useState<"LOST" | "FOUND">("LOST");
  const [tipoMascotaId, setTipoMascotaId] = useState<number | undefined>(
    undefined,
  );
  const [otroTipoMascota, setOtroTipoMascota] = useState("");
  const [ciudadId, setCiudadId] = useState<number | undefined>(undefined);
  const [phonePersonal, setPhonePersonal] = useState("");
  const [telefonoContacto, setTelefonoContacto] = useState("");
  const [usarMismoTelefono, setUsarMismoTelefono] = useState(true);
  const [descripcion, setDescripcion] = useState("");
  const [fotoUri, setFotoUri] = useState<string | undefined>(undefined);
  const [fotoMime, setFotoMime] = useState<string | undefined>(undefined);
  const [fotoFile, setFotoFile] = useState<any>(undefined);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    controller.cargarReferencias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tipoOtro = controller.tiposMascota.find(
    (t) => t.nombre.toLowerCase() === "otro",
  );
  const esOtro =
    tipoMascotaId !== undefined &&
    tipoOtro !== undefined &&
    tipoMascotaId === tipoOtro.id;

  const validar = (): string | null => {
    if (!phonePersonal.trim() || phonePersonal.trim().length < 7) {
      return "Indica tu celular (WhatsApp) para poder contactarte";
    }
    // Máx 13 dígitos: con el prefijo +57 el string completo cabe en
    // varchar(15) del backend (ej: +573001234567 = 13 chars).
    if (conPrefijo(phonePersonal).length > 15) {
      return "El número de celular es demasiado largo (máx 13 dígitos)";
    }
    if (!tipoMascotaId) return "Selecciona el tipo de mascota";
    if (esOtro && !otroTipoMascota.trim())
      return "Especifica qué tipo de mascota es";
    if (!ciudadId) return "Selecciona el municipio/ciudad";
    if (!ubicacion.ubicacionCompuesta.trim())
      return "Indica el sector o barrio";
    if (
      !usarMismoTelefono &&
      (!telefonoContacto.trim() || telefonoContacto.trim().length < 7)
    ) {
      return "Indica un teléfono de contacto válido para la mascota";
    }
    if (!usarMismoTelefono && conPrefijo(telefonoContacto).length > 15) {
      return "El teléfono de contacto es demasiado largo (máx 13 dígitos)";
    }
    return null;
  };

  // El input guarda solo dígitos; el prefijo +57 se concatena al enviar
  // (formato consistente con el backend: +573001234567). Si el usuario ya
  // escribió el prefijo (57), no se duplica.
  const conPrefijo = (numero: string) => {
    const digitos = numero.replace(/\D/g, "");
    if (digitos.startsWith("57")) return `+${digitos}`;
    return `${PREFIJO_PAIS}${digitos}`;
  };

  const elegirFoto = async () => {
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        alert("Necesitamos acceso a tus fotos para adjuntar la imagen.");
        return;
      }
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
      setFotoFile(asset.file ?? undefined);
    } catch (e) {
      console.warn("[RegistroRapidoForm] Error al elegir foto:", e);
      alert("No se pudo abrir la galería. Intenta de nuevo.");
    }
  };

  const handleSubmit = async () => {
    const errorMsg = validar();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      const result = await registroRapido.registrar({
        phonePersonal: conPrefijo(phonePersonal),
        telefonoContacto: usarMismoTelefono
          ? conPrefijo(phonePersonal)
          : conPrefijo(telefonoContacto),
        tipoReporte,
        tipoMascotaId: tipoMascotaId!,
        otroTipoMascota: esOtro ? otroTipoMascota.trim() : undefined,
        ciudadId: ciudadId!,
        ubicacion: ubicacion.ubicacionCompuesta,
        descripcion: descripcion.trim() || undefined,
        fotoUri,
        fotoMime,
        fotoFile,
      });
      onSuccess(result);
    } catch (e: any) {
      setError(
        e.message || "No se pudo registrar el reporte. Intenta de nuevo.",
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Tipo de reporte ────────────────────────────── */}
      <View style={styles.seccion}>
        <Text style={styles.label}>¿Qué pasó?</Text>
        <View style={styles.tipoRow}>
          <Pressable
            style={[
              styles.tipoCard,
              tipoReporte === "LOST" && styles.tipoCardActivoLost,
            ]}
            onPress={() => setTipoReporte("LOST")}
          >
            <Icon
              name="Search"
              size={20}
              color={
                tipoReporte === "LOST"
                  ? theme.colors.red
                  : theme.colors.textMuted
              }
            />
            <Text
              style={[
                styles.tipoCardText,
                tipoReporte === "LOST" && styles.tipoCardTextActivo,
              ]}
            >
              Se perdió
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tipoCard,
              tipoReporte === "FOUND" && styles.tipoCardActivoFound,
            ]}
            onPress={() => setTipoReporte("FOUND")}
          >
            <Icon
              name="HeartHandshake"
              size={20}
              color={
                tipoReporte === "FOUND"
                  ? theme.colors.purple
                  : theme.colors.textMuted
              }
            />
            <Text
              style={[
                styles.tipoCardText,
                tipoReporte === "FOUND" && styles.tipoCardTextActivo,
              ]}
            >
              La encontré / la vi
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ── Celular personal ───────────────────────────── */}
      <View style={styles.seccion}>
        <Text style={styles.label}>Registrate con tu número de celular *</Text>
        <View style={styles.phoneRow}>
          <View style={styles.phonePrefixBox}>
            <Text style={styles.phonePrefixText}>{PREFIJO_PAIS}</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="300 123 4567"
            placeholderTextColor={theme.colors.textDim}
            value={phonePersonal}
            onChangeText={setPhonePersonal}
            keyboardType="phone-pad"
            maxLength={13}
          />
        </View>
        <Text style={styles.hint}>
          Es tu llave de acceso. Con él podrás iniciar sesión y ver tus
          reportes.
        </Text>
      </View>

      {/* ── Teléfono de contacto de la mascota ─────────── */}
      <View style={styles.seccion}>
        <Pressable
          style={styles.checkRow}
          onPress={() => setUsarMismoTelefono(!usarMismoTelefono)}
        >
          <View
            style={[
              styles.checkbox,
              usarMismoTelefono && styles.checkboxActivo,
            ]}
          >
            {usarMismoTelefono && (
              <Icon name="Check" size={14} color={theme.colors.white} />
            )}
          </View>
          <Text style={styles.checkLabel}>
            Usar mi mismo número para contacto
          </Text>
        </Pressable>
        <Text style={styles.label}>
          Whatsapp de contacto para esta mascota *
        </Text>
        <View
          style={[
            styles.phoneRow,
            usarMismoTelefono && styles.phoneRowDisabled,
          ]}
        >
          <View style={styles.phonePrefixBox}>
            <Text style={styles.phonePrefixText}>{PREFIJO_PAIS}</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="300 123 4567"
            placeholderTextColor={theme.colors.textDim}
            value={usarMismoTelefono ? phonePersonal : telefonoContacto}
            onChangeText={setTelefonoContacto}
            keyboardType="phone-pad"
            editable={!usarMismoTelefono}
            maxLength={13}
          />
        </View>
        {usarMismoTelefono && (
          <Text style={styles.hint}>
            Se usará tu celular. Desmarca para poner otro número.
          </Text>
        )}
      </View>

      {/* ── Tipo de mascota ────────────────────────────── */}
      <View style={styles.seccion}>
        <Text style={styles.label}>Tipo de mascota</Text>
        {controller.referenciasLoading ? (
          <ActivityIndicator color={theme.colors.green} />
        ) : (
          <SelectInput
            label="Tipo de mascota"
            icon="PawPrint"
            options={controller.tiposMascota.map((t) => ({
              value: t.id,
              label: t.nombre,
            }))}
            selectedValue={tipoMascotaId ?? 0}
            onSelect={(v) => setTipoMascotaId(Number(v))}
            placeholder="Elige el tipo de mascota..."
            theme={theme}
            focused={false}
            onFocus={() => {}}
            onBlur={() => {}}
          />
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

      {/* ── Ubicación (cascada) ─────────────────────────── */}
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
            <Image
              source={{ uri: fotoUri }}
              style={styles.fotoPreview}
              contentFit="cover"
            />
            <View style={styles.fotoActions}>
              <Pressable style={styles.fotoBtn} onPress={elegirFoto}>
                <Icon name="RefreshCw" size={16} color={theme.colors.green} />
                <Text style={styles.fotoBtnText}>Cambiar</Text>
              </Pressable>
              <Pressable
                style={styles.fotoBtn}
                onPress={() => {
                  setFotoUri(undefined);
                  setFotoFile(undefined);
                }}
              >
                <Icon name="Trash2" size={16} color={theme.colors.red} />
                <Text style={[styles.fotoBtnText, { color: theme.colors.red }]}>
                  Quitar
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable style={styles.fotoPicker} onPress={elegirFoto}>
            <Icon name="Camera" size={22} color={theme.colors.green} />
            <Text style={styles.fotoPickerText}>
              Agregar foto del animalito
            </Text>
            <Text style={styles.fotoPickerHint}>
              JPEG, PNG, HEIC... hasta 8 MB. Ayuda a identificarlo más rápido.
            </Text>
          </Pressable>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={[styles.submitBtn, enviando && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={enviando}
      >
        {enviando ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <Text style={styles.submitText}>Reportar ahora</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const getStyles = (theme: AppTheme, isDesktop: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: "transparent" },
    content: {
      padding: isDesktop ? 32 : 20,
      paddingBottom: 48,
      gap: 20,
      maxWidth: isDesktop ? 800 : undefined,
      alignSelf: "center",
      width: "100%",
    },
    seccion: { gap: 8 },
    label: {
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: theme.colors.textMuted,
    },
    hint: { fontSize: 12, color: theme.colors.textDim, lineHeight: 16 },
    tipoRow: { flexDirection: "row", gap: 12 },
    tipoCard: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 7,
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
    tipoCardTextActivo: { color: theme.colors.textPrimary, fontWeight: "700" },
    checkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 4,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceLight,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxActivo: {
      backgroundColor: theme.colors.green,
      borderColor: theme.colors.green,
    },
    checkLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      flex: 1,
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
    inputDisabled: { opacity: 0.5, backgroundColor: theme.colors.surfaceLight },
    phoneRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      overflow: "hidden",
    },
    phoneRowDisabled: {
      opacity: 0.5,
      backgroundColor: theme.colors.surfaceLight,
    },
    phonePrefixBox: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceLight,
    },
    phonePrefixText: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.textSecondary,
    },
    phoneInput: {
      flex: 1,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: theme.colors.textPrimary,
    },
    inputMultiline: { minHeight: 80, textAlignVertical: "top" },
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
    fotoPreviewBox: { gap: 8 },
    fotoPreview: {
      width: "100%",
      height: 200,
      borderRadius: 14,
      backgroundColor: theme.colors.surfaceLight,
    },
    fotoActions: { flexDirection: "row", gap: 12 },
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
    fotoBtnText: { fontSize: 13, fontWeight: "600", color: theme.colors.green },
    error: { color: theme.colors.red, fontSize: 13 },
    submitBtn: {
      backgroundColor: theme.colors.red,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 4,
    },
    submitBtnDisabled: { opacity: 0.6 },
    submitText: { color: theme.colors.white, fontSize: 15, fontWeight: "700" },
  });
