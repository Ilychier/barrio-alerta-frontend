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
import { Localidad } from "../../domain/entities/localidad";
import { Ciudad } from "../../domain/mascotas/entities/Ciudad";
import { useRegisterController } from "../../application/controllers/useRegisterController";
import Icon from "../components/atomic/Icon";
import { SelectInput, SelectOption } from "../components/atomic/SelectInput";
import { SectionCard } from "../components/layout/SectionCard";
import { SVGBackground } from "../components/layout/SVGBackground";
import { useAuth } from "../context/AuthContext";
import { useDI } from "../context/DIContext";
import { AppTheme, useAppTheme } from "../theme/ThemeContext";

interface RegisterScreenProps {
  onLoginPress: () => void;
  onBackPress?: () => void;
}

// País quemado: solo Colombia por ahora (extensión lista para más países)
const PAISES: SelectOption[] = [{ value: 1, label: "Colombia" }];

export function RegisterScreen({
  onLoginPress,
  onBackPress,
}: RegisterScreenProps) {
  const { register } = useAuth();
  const container = useDI();
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  // Catálogos geográficos delegados al controller de aplicación (regla hexagonal)
  const {
    municipios,
    localidades,
    barrios,
    barriosHasMore,
    barriosLoadingMore,
    cargarLocalidades,
    cargarBarrios,
    cargarMasBarrios,
    resetCadenaGeografica,
  } = useRegisterController(container);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paisId, setPaisId] = useState<number>(1);
  const [departamento, setDepartamento] = useState<string>("");
  const [municipioId, setMunicipioId] = useState<number>(0);
  const [localidadId, setLocalidadId] = useState<number>(0);
  const [barrioId, setBarrioId] = useState<number>(0);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Departamentos únicos derivados del catálogo de municipios (KISS: sin endpoint extra)
  const departamentoOptions: SelectOption[] = [
    ...new Set(municipios.map((m) => m.departamento).filter(Boolean)),
  ]
    .sort()
    .map((d) => ({ value: d, label: d }));
  // Municipios filtrados por departamento seleccionado
  const municipioOptions: SelectOption[] = municipios
    .filter((m) => m.departamento === departamento)
    .map((m) => ({ value: m.id, label: m.nombre }));
  const localidadOptions: SelectOption[] = localidades.map((l) => ({
    value: l.id,
    label: l.nombre,
  }));
  const barrioOptions: SelectOption[] = barrios.map((b) => ({
    value: b.id,
    label: b.nombre,
  }));

  // Focus and visibility states
  const [nombreFocused, setNombreFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [addressFocused, setAddressFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [paisFocused, setPaisFocused] = useState(false);
  const [departamentoFocused, setDepartamentoFocused] = useState(false);
  const [municipioFocused, setMunicipioFocused] = useState(false);
  const [localidadFocused, setLocalidadFocused] = useState(false);
  const [barrioFocused, setBarrioFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const PAGE_SIZE = 20;

  // 2. Al elegir departamento, el handler resetea municipio/localidad/barrio
  //    (sin setState síncrono en effect — cumple react-hooks/set-state-in-effect)

  // 3. Al elegir municipio, carga sus localidades (auto-selecciona la primera)
  useEffect(() => {
    let active = true;
    async function fetchLocalidades() {
      const items = await cargarLocalidades(municipioId);
      if (!active) return;
      setLocalidadId(items.length > 0 ? items[0].id : 0);
    }
    fetchLocalidades();
    return () => {
      active = false;
    };
  }, [municipioId, cargarLocalidades]);

  // 4. Al elegir localidad, carga sus barrios (auto-selecciona el primero)
  useEffect(() => {
    let active = true;
    async function fetchBarrios() {
      const items = await cargarBarrios(localidadId);
      if (!active) return;
      setBarrioId(items.length > 0 ? items[0].id : 0);
    }
    fetchBarrios();
    return () => {
      active = false;
    };
  }, [localidadId, cargarBarrios]);

  const handleLoadMoreBarrios = () => {
    cargarMasBarrios(localidadId);
  };

  const handleDepartamentoChange = (value: number | string) => {
    setDepartamento(String(value));
    // Resetear la cadena inferior al cambiar departamento
    setMunicipioId(0);
    setLocalidadId(0);
    setBarrioId(0);
    resetCadenaGeografica();
  };

  const handleRegister = async () => {
    if (!nombre || !email || !phone || !address || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }
    if (!departamento) {
      setError("Por favor, selecciona tu departamento.");
      return;
    }
    if (!municipioId) {
      setError("Por favor, selecciona tu municipio/ciudad.");
      return;
    }
    if (!localidadId) {
      setError("Por favor, selecciona tu localidad.");
      return;
    }
    if (!barrioId) {
      setError("Por favor, selecciona tu barrio.");
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

            <SelectInput
              label="País"
              icon="Globe"
              options={PAISES}
              selectedValue={paisId}
              onSelect={(v) => setPaisId(Number(v))}
              placeholder="Elige tu país..."
              theme={theme}
              focused={paisFocused}
              onFocus={() => setPaisFocused(true)}
              onBlur={() => setPaisFocused(false)}
            />

            <SelectInput
              label="Departamento"
              icon="Map"
              options={departamentoOptions}
              selectedValue={departamento}
              onSelect={handleDepartamentoChange}
              placeholder="Elige tu departamento..."
              theme={theme}
              focused={departamentoFocused}
              onFocus={() => setDepartamentoFocused(true)}
              onBlur={() => setDepartamentoFocused(false)}
            />

            <SelectInput
              label="Municipio / Ciudad"
              icon="Building2"
              options={municipioOptions}
              selectedValue={municipioId}
              onSelect={(v) => setMunicipioId(Number(v))}
              placeholder={departamento ? "Elige tu municipio..." : "Primero elige tu departamento"}
              theme={theme}
              focused={municipioFocused}
              onFocus={() => setMunicipioFocused(true)}
              onBlur={() => setMunicipioFocused(false)}
            />

            <SelectInput
              label="Localidad / Comuna"
              icon="MapPin"
              options={localidadOptions}
              selectedValue={localidadId}
              onSelect={(v) => setLocalidadId(Number(v))}
              placeholder={municipioId ? "Elige tu localidad..." : "Primero elige tu municipio"}
              theme={theme}
              focused={localidadFocused}
              onFocus={() => setLocalidadFocused(true)}
              onBlur={() => setLocalidadFocused(false)}
            />

            <SelectInput
              label="Selecciona tu Barrio"
              icon="House"
              options={barrioOptions}
              selectedValue={barrioId}
              onSelect={(v) => setBarrioId(Number(v))}
              placeholder={localidadId ? "Elige tu barrio..." : "Primero elige tu localidad"}
              theme={theme}
              focused={barrioFocused}
              onFocus={() => setBarrioFocused(true)}
              onBlur={() => setBarrioFocused(false)}
              onLoadMore={handleLoadMoreBarrios}
              hasMore={barriosHasMore}
              loadingMore={barriosLoadingMore}
            />

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
      marginVertical: 50,
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
