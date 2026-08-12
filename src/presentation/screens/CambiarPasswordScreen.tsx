import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "../components/atomic/Icon";
import { SectionCard } from "../components/layout/SectionCard";
import { SVGBackground } from "../components/layout/SVGBackground";
import { useAuth } from "../context/AuthContext";
import { AppTheme, useAppTheme } from "../theme/ThemeContext";

interface CambiarPasswordScreenProps {
  onBackPress?: () => void;
}

/**
 * Cambio de contraseña.
 * - Si el usuario tiene clave temporal (registro rápido de emergencia),
 *   NO se pide la clave actual (el JWT ya autentica; nunca vio la temporal).
 * - Si tiene clave real, se pide la actual para verificar.
 */
export function CambiarPasswordScreen({ onBackPress }: CambiarPasswordScreenProps) {
  const { user, passwordTemporal, cambiarPassword } = useAuth();
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const [actualFocused, setActualFocused] = useState(false);
  const [nuevaFocused, setNuevaFocused] = useState(false);
  const [confirmarFocused, setConfirmarFocused] = useState(false);
  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);

  const identificador = user?.email ?? "";

  const handleSubmit = async () => {
    if (!passwordNueva || passwordNueva.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (passwordNueva !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!passwordTemporal && !passwordActual) {
      setError("Ingresa tu contraseña actual.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await cambiarPassword(identificador, passwordTemporal ? null : passwordActual, passwordNueva);
      setOk(true);
    } catch (e: any) {
      setError(e.message || "No se pudo cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SVGBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton} activeOpacity={0.7}>
            <Icon name="ArrowLeft" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
        <SectionCard style={styles.card}>
          <View style={styles.brandContainer}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.brandText}>Barrio Alerta</Text>
            <Text style={styles.brandTagline}>- Red de Seguridad Comunitaria -</Text>
          </View>

          <Text style={styles.title}>Cambiar Contraseña</Text>
          <Text style={styles.subtitle}>
            {passwordTemporal
              ? "Tu cuenta usa una clave temporal de emergencia. Define una nueva para continuar."
              : "Define una nueva contraseña para tu cuenta."}
          </Text>

          {ok && (
            <View style={styles.okContainer}>
              <Icon name="CircleCheck" size={18} color={theme.colors.green} />
              <Text style={styles.okText}>Contraseña actualizada correctamente.</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Icon name="ShieldAlert" size={18} color={theme.colors.red} style={styles.errorIcon} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            {!passwordTemporal && (
              <>
                <Text style={styles.label}>Contraseña Actual</Text>
                <View style={[styles.inputContainer, actualFocused && styles.inputContainerFocused]}>
                  <Icon
                    name="Lock"
                    size={18}
                    color={actualFocused ? theme.colors.red : theme.colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={passwordActual}
                    onChangeText={setPasswordActual}
                    onFocus={() => setActualFocused(true)}
                    onBlur={() => setActualFocused(false)}
                    placeholder="••••••••"
                    placeholderTextColor={theme.colors.textMuted}
                    secureTextEntry={!showActual}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowActual(!showActual)} style={styles.eyeIcon} activeOpacity={0.7}>
                    <Icon name={showActual ? "EyeOff" : "Eye"} size={18} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              </>
            )}

            <Text style={styles.label}>Nueva Contraseña</Text>
            <View style={[styles.inputContainer, nuevaFocused && styles.inputContainerFocused]}>
              <Icon
                name="Lock"
                size={18}
                color={nuevaFocused ? theme.colors.red : theme.colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={passwordNueva}
                onChangeText={setPasswordNueva}
                onFocus={() => setNuevaFocused(true)}
                onBlur={() => setNuevaFocused(false)}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry={!showNueva}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowNueva(!showNueva)} style={styles.eyeIcon} activeOpacity={0.7}>
                <Icon name={showNueva ? "EyeOff" : "Eye"} size={18} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
            <View style={[styles.inputContainer, confirmarFocused && styles.inputContainerFocused]}>
              <Icon
                name="Lock"
                size={18}
                color={confirmarFocused ? theme.colors.red : theme.colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={confirmar}
                onChangeText={setConfirmar}
                onFocus={() => setConfirmarFocused(true)}
                onBlur={() => setConfirmarFocused(false)}
                placeholder="Repite la nueva contraseña"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry={!showNueva}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading || ok}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={styles.buttonText}>{ok ? "Listo" : "Cambiar Contraseña"}</Text>
              )}
            </TouchableOpacity>
          </View>
        </SectionCard>
      </ScrollView>
    </SVGBackground>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: "transparent" },
    content: { padding: 24, justifyContent: "center", flexGrow: 1 },
    backButton: {
      position: "absolute", top: 16, left: 16, zIndex: 10, padding: 8,
      borderRadius: 20, backgroundColor: theme.colors.surface + "CC",
    },
    card: { backgroundColor: theme.colors.surface + "D9", alignItems: "center", padding: 24 },
    brandContainer: { alignItems: "center", marginBottom: 24 },
    logoImage: { width: 80, height: 80, marginBottom: 12 },
    brandText: { fontSize: 24, fontWeight: "800", color: theme.colors.textPrimary, letterSpacing: 0.5 },
    brandTagline: { fontSize: 12, color: theme.colors.textTertiary, marginTop: 2, fontWeight: "500" },
    title: { fontSize: 20, fontWeight: "700", color: theme.colors.textPrimary, textAlign: "left" },
    subtitle: { fontSize: 13, color: theme.colors.textTertiary, marginTop: 4, marginBottom: 20, lineHeight: 18 },
    form: { gap: 16, width: "100%" },
    label: { fontSize: 12, fontWeight: "700", color: theme.colors.textSecondary, marginBottom: -8, marginLeft: 4 },
    inputContainer: {
      flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.surfaceLight,
      borderWidth: 1.5, borderColor: theme.colors.surfaceBorder, borderRadius: 16,
      paddingHorizontal: 16, height: 52,
    },
    inputContainerFocused: {
      borderColor: theme.colors.red, backgroundColor: theme.colors.surface,
      shadowColor: theme.colors.red, shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1, shadowRadius: 6,
    },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, color: theme.colors.textPrimary, fontSize: 14, height: "100%" },
    eyeIcon: { padding: 8 },
    button: {
      backgroundColor: theme.colors.red, height: 52, borderRadius: 16,
      justifyContent: "center", alignItems: "center", marginTop: 12,
    },
    buttonText: { color: theme.colors.white, fontWeight: "700", fontSize: 15, letterSpacing: 0.5 },
    errorContainer: {
      flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.redBg,
      borderWidth: 1, borderColor: theme.colors.redBorder, borderRadius: 16,
      padding: 14, marginBottom: 16, gap: 10,
    },
    errorIcon: { marginTop: 1 },
    errorText: { color: theme.colors.textPrimary, fontSize: 13, fontWeight: "600", flex: 1 },
    okContainer: {
      flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.greenBg,
      borderWidth: 1, borderColor: theme.colors.greenBorder, borderRadius: 16,
      padding: 14, marginBottom: 16, gap: 10,
    },
    okText: { color: theme.colors.textPrimary, fontSize: 13, fontWeight: "600", flex: 1 },
  });
