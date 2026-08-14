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
import { ThemeToggleButton } from "../components/atomic/ThemeToggleButton";
import { SectionCard } from "../components/layout/SectionCard";
import { SVGBackground } from "../components/layout/SVGBackground";
import { useAuth } from "../context/AuthContext";
import { AppTheme, useAppTheme } from "../theme/ThemeContext";

interface LoginScreenProps {
  onRegisterPress: () => void;
  onBackPress?: () => void;
}

export function LoginScreen({
  onRegisterPress,
  onBackPress,
}: LoginScreenProps) {
  const { login } = useAuth();
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor, ingresa tu correo o celular y contraseña.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (e: any) {
      setError(e.message || "Error al iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SVGBackground>
      {/* Toggle de tema flotante (esquina superior derecha) */}
      <View style={styles.themeToggleFloat}>
        <ThemeToggleButton />
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {onBackPress && (
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Icon
              name="ArrowLeft"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
        <SectionCard style={styles.card}>
          {/* Header branding */}
          <View style={styles.brandContainer}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.brandText}>Barrio Alerta</Text>
            <Text style={styles.brandTagline}>
              - Red de Seguridad Comunitaria -
            </Text>
          </View>

          <Text style={styles.title}>Iniciar Sesión</Text>
          <Text style={styles.subtitle}>
            Ingresa tus credenciales para ingresar a la red
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Icon
                name="ShieldAlert"
                size={18}
                color={theme.colors.red}
                style={styles.errorIcon}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Text style={styles.label}>Correo o Celular</Text>
            <View
              style={[
                styles.inputContainer,
                emailFocused && styles.inputContainerFocused,
              ]}
            >
              <Icon
                name="Mail"
                size={18}
                color={emailFocused ? theme.colors.red : theme.colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="+573001234567 ó Correo"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.label}>Contraseña</Text>
            <View
              style={[
                styles.inputContainer,
                passwordFocused && styles.inputContainerFocused,
              ]}
            >
              <Icon
                name="Lock"
                size={18}
                color={
                  passwordFocused ? theme.colors.red : theme.colors.textMuted
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                activeOpacity={0.7}
              >
                <Icon
                  name={showPassword ? "EyeOff" : "Eye"}
                  size={18}
                  color={theme.colors.textTertiary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onRegisterPress}
              style={styles.switchContainer}
              activeOpacity={0.7}
            >
              <Text style={styles.switchText}>
                ¿No tienes cuenta?{" "}
                <Text style={styles.switchHighlight}>Regístrate aquí</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </SectionCard>
      </ScrollView>
    </SVGBackground>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent",
    },
    themeToggleFloat: {
      position: "absolute",
      top: 16,
      right: 16,
      zIndex: 10,
    },
    content: {
      padding: 24,
      justifyContent: "center",
      flexGrow: 1,
    },
    backButton: {
      position: "absolute",
      top: 16,
      left: 16,
      zIndex: 10,
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surface + "CC",
    },
    card: {
      backgroundColor: theme.colors.surface + "D9",
      alignItems: "center",
      padding: 24,
    },
    brandContainer: {
      alignItems: "center",
      marginBottom: 24,
    },
    logoImage: {
      width: 80,
      height: 80,
      marginBottom: 12,
    },
    brandText: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.colors.textPrimary,
      letterSpacing: 0.5,
    },
    brandTagline: {
      fontSize: 12,
      color: theme.colors.textTertiary,
      marginTop: 2,
      fontWeight: "500",
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      textAlign: "left",
    },
    subtitle: {
      fontSize: 13,
      color: theme.colors.textTertiary,
      marginTop: 4,
      marginBottom: 20,
      lineHeight: 18,
    },
    form: {
      gap: 16,
    },
    label: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.textSecondary,
      marginBottom: -8, // Pulls label closer to the input field
      marginLeft: 4,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surfaceLight,
      borderWidth: 1.5,
      borderColor: theme.colors.surfaceBorder,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 52,
    },
    inputContainerFocused: {
      borderColor: theme.colors.red,
      backgroundColor: theme.colors.surface,
      // Glow effect for focused input
      shadowColor: theme.colors.red,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: 14,
      height: "100%",
    },
    eyeIcon: {
      padding: 8,
    },
    button: {
      backgroundColor: theme.colors.red,
      height: 52,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 12,
    },
    buttonText: {
      color: theme.colors.white,
      fontWeight: "700",
      fontSize: 15,
      letterSpacing: 0.5,
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.redBg,
      borderWidth: 1,
      borderColor: theme.colors.redBorder,
      borderRadius: 16,
      padding: 14,
      marginBottom: 16,
      gap: 10,
    },
    errorIcon: {
      marginTop: 1,
    },
    errorText: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: "600",
      flex: 1,
    },
    switchContainer: {
      alignItems: "center",
      marginTop: 12,
      paddingVertical: 8,
    },
    switchText: {
      color: theme.colors.textTertiary,
      fontSize: 13,
    },
    switchHighlight: {
      color: theme.colors.green,
      fontWeight: "700",
    },
  });
