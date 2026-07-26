import { useEffect, useState } from "react";
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
import { Barrio } from "../../domain/entities/barrio";
import { DependencyContainer } from "../../infrastructure/config/dependencyContainer";
import Icon from "../components/atomic/Icon";
import { SectionCard } from "../components/layout/SectionCard";
import { SVGBackground } from "../components/layout/SVGBackground";
import { useAuth } from "../context/AuthContext";
import { AppTheme, useAppTheme } from "../theme/ThemeContext";

interface RegisterScreenProps {
  onLoginPress: () => void;
  onBackPress?: () => void;
}

export function RegisterScreen({ onLoginPress, onBackPress }: RegisterScreenProps) {
  const { register } = useAuth();
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [barrioId, setBarrioId] = useState<number>(1);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [barrios, setBarrios] = useState<Barrio[]>([]);

  // Focus and visibility states
  const [nombreFocused, setNombreFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [addressFocused, setAddressFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function fetchBarrios() {
      try {
        const repo =
          DependencyContainer.getInstance().getReferenciaRepository();
        const list = await repo.getBarrios();
        setBarrios(list);
        if (list.length > 0) {
          setBarrioId(list[0].id);
        }
      } catch (e) {
        console.error("Error fetching barrios:", e);
      }
    }
    fetchBarrios();
  }, []);

  const handleRegister = async () => {
    if (!nombre || !email || !phone || !address || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(nombre, email, phone, address, barrioId, password);
    } catch (e: any) {
      setError(e.message || "Error al registrarse. Inténtalo de nuevo.");
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
          {/* Header branding */}
          <View style={styles.brandContainer}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.brandText}>Crear Cuenta</Text>
            <Text style={styles.brandTagline}>
              Regístrate para alertar y proteger a tu barrio
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Icon name="ShieldAlert" size={18} color={theme.colors.green} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Text style={styles.label}>Nombre Completo</Text>
            <View
              style={[
                styles.inputContainer,
                nombreFocused && styles.inputContainerFocused,
              ]}
            >
              <Icon
                name="User"
                size={18}
                color={
                  nombreFocused ? theme.colors.green : theme.colors.textMuted
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                onFocus={() => setNombreFocused(true)}
                onBlur={() => setNombreFocused(false)}
                placeholder="Juan Pérez"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <Text style={styles.label}>Correo Electrónico</Text>
            <View
              style={[
                styles.inputContainer,
                emailFocused && styles.inputContainerFocused,
              ]}
            >
              <Icon
                name="Mail"
                size={18}
                color={
                  emailFocused ? theme.colors.green : theme.colors.textMuted
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.label}>Teléfono de Emergencia</Text>
            <View
              style={[
                styles.inputContainer,
                phoneFocused && styles.inputContainerFocused,
              ]}
            >
              <Icon
                name="Phone"
                size={18}
                color={
                  phoneFocused ? theme.colors.green : theme.colors.textMuted
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
                placeholder="+57 310 555 0123"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="phone-pad"
              />
            </View>

            <Text style={styles.label}>Dirección Residencial</Text>
            <View
              style={[
                styles.inputContainer,
                addressFocused && styles.inputContainerFocused,
              ]}
            >
              <Icon
                name="MapPin"
                size={18}
                color={
                  addressFocused ? theme.colors.green : theme.colors.textMuted
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                onFocus={() => setAddressFocused(true)}
                onBlur={() => setAddressFocused(false)}
                placeholder="Calle 12 # 3-45"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <Text style={styles.label}>Selecciona tu Barrio</Text>
            <View style={styles.barriosContainer}>
              {barrios.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={[
                    styles.barrioOption,
                    barrioId === b.id && styles.barrioOptionSelected,
                  ]}
                  onPress={() => setBarrioId(b.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.barrioText,
                      barrioId === b.id && styles.barrioTextSelected,
                    ]}
                  >
                    {b.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
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
                  passwordFocused ? theme.colors.green : theme.colors.textMuted
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="Mínimo 6 caracteres"
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
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.textPrimary} />
              ) : (
                <Text style={styles.buttonText}>Registrar Cuenta</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onLoginPress}
              style={styles.switchContainer}
              activeOpacity={0.7}
            >
              <Text style={styles.switchText}>
                ¿Ya tienes cuenta?{" "}
                <Text style={styles.switchHighlight}>Inicia sesión aquí</Text>
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
      borderRadius: 28,
      padding: 24,
      marginVertical: 20,
    },
    brandContainer: {
      alignItems: "center",
      marginBottom: 20,
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
      textAlign: "center",
    },
    form: {
      gap: 14,
    },
    label: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.textSecondary,
      marginBottom: -6,
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
      borderColor: theme.colors.green,
      backgroundColor: theme.colors.surface,
      // Glow effect for focused input
      shadowColor: theme.colors.green,
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
    barriosContainer: {
      flexDirection: "row",
      gap: 10,
      marginTop: 4,
    },
    barrioOption: {
      flex: 1,
      backgroundColor: theme.colors.surfaceLight,
      borderWidth: 1.5,
      borderColor: theme.colors.surfaceBorder,
      borderRadius: 16,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      height: 48,
    },
    barrioOptionSelected: {
      borderColor: theme.colors.green,
      backgroundColor: theme.colors.greenBg,
      // Glow effect for selected option
      shadowColor: theme.colors.green,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 1,
    },
    barrioText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
    },
    barrioTextSelected: {
      color: theme.colors.textPrimary,
      fontWeight: "700",
    },
    button: {
      backgroundColor: theme.colors.green,
      height: 52,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 12,
    },
    buttonText: {
      color: theme.colors.surfaceLight,
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
      marginBottom: 10,
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
      marginTop: 8,
      paddingVertical: 8,
    },
    switchText: {
      color: theme.colors.textMuted,
      fontSize: 13,
    },
    switchHighlight: {
      color: theme.colors.green,
      fontWeight: "700",
    },
  });
