import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Pressable, Text, View } from "react-native";
import { AppTheme } from "../../theme/ThemeContext";
import Icon from "../../components/atomic/Icon";

const MAX_FOTO_BYTES = 8 * 1024 * 1024; // 8 MB (mismo límite que el backend)

export interface FotoSeleccionada {
  uri: string;
  mime: string;
  file?: any;
}

interface FotoPickerProps {
  foto: FotoSeleccionada | null;
  theme: AppTheme;
  styles: Record<string, any>;
  onChange: (foto: FotoSeleccionada | null) => void;
}

/**
 * Selector de foto con preview y validación de tamaño (8 MB).
 * Extraído de RegistroRapidoForm (SRP: un componente, una responsabilidad).
 */
export function FotoPicker({ foto, theme, styles, onChange }: FotoPickerProps) {
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
      onChange({
        uri: asset.uri,
        mime: asset.mimeType ?? "image/jpeg",
        file: asset.file ?? undefined,
      });
    } catch (e) {
      console.warn("[FotoPicker] Error al elegir foto:", e);
      alert("No se pudo abrir la galería. Intenta de nuevo.");
    }
  };

  return (
    <View style={styles.seccion}>
      <Text style={styles.label}>Foto (opcional)</Text>
      {foto ? (
        <View style={styles.fotoPreviewBox}>
          <Image source={{ uri: foto.uri }} style={styles.fotoPreview} contentFit="cover" />
          <View style={styles.fotoActions}>
            <Pressable style={styles.fotoBtn} onPress={elegirFoto}>
              <Icon name="RefreshCw" size={16} color={theme.colors.green} />
              <Text style={styles.fotoBtnText}>Cambiar</Text>
            </Pressable>
            <Pressable style={styles.fotoBtn} onPress={() => onChange(null)}>
              <Icon name="Trash2" size={16} color={theme.colors.red} />
              <Text style={[styles.fotoBtnText, { color: theme.colors.red }]}>Quitar</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={styles.fotoPicker} onPress={elegirFoto}>
          <Icon name="Camera" size={22} color={theme.colors.green} />
          <Text style={styles.fotoPickerText}>Agregar foto del animalito</Text>
          <Text style={styles.fotoPickerHint}>
            JPEG, PNG, HEIC... hasta 8 MB. Ayuda a identificarlo más rápido.
          </Text>
        </Pressable>
      )}
    </View>
  );
}
