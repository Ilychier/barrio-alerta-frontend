import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Barrio } from '../../domain/entities/barrio';
import { DependencyContainer } from '../../infrastructure/config/dependencyContainer';
import { SectionCard } from '../components/layout/SectionCard';
import { useAuth } from '../context/AuthContext';
import { AppTheme, useAppTheme } from '../theme/ThemeContext';

interface RegisterScreenProps {
  onLoginPress: () => void;
}

export function RegisterScreen({ onLoginPress }: RegisterScreenProps) {
  const { register } = useAuth();
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [barrioId, setBarrioId] = useState<number>(1);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [barrios, setBarrios] = useState<Barrio[]>([]);

  useEffect(() => {
    async function fetchBarrios() {
      try {
        const repo = DependencyContainer.getInstance().getReferenciaRepository();
        const list = await repo.getBarrios();
        setBarrios(list);
        if (list.length > 0) {
          setBarrioId(list[0].id);
        }
      } catch (e) {
        console.error('Error fetching barrios:', e);
      }
    }
    fetchBarrios();
  }, []);

  const handleRegister = async () => {
    if (!nombre || !email || !phone || !address || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(nombre, email, phone, address, barrioId, password);
    } catch (e: any) {
      setError(e.message || 'Error al registrarse. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Regístrate para alertar y proteger a tu barrio</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Juan Pérez"
            placeholderTextColor={theme.colors.textMuted}
          />

          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Teléfono de Emergencia</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+573105550123"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Dirección Residencial</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Calle 12 # 3-45"
            placeholderTextColor={theme.colors.textMuted}
          />

          <Text style={styles.label}>Selecciona tu Barrio</Text>
          <View style={styles.barriosContainer}>
            {barrios.map((b) => (
              <TouchableOpacity
                key={b.id}
                style={[
                  styles.barrioOption,
                  barrioId === b.id && styles.barrioOptionSelected
                ]}
                onPress={() => setBarrioId(b.id)}
              >
                <Text
                  style={[
                    styles.barrioText,
                    barrioId === b.id && styles.barrioTextSelected
                  ]}
                >
                  {b.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={theme.colors.textPrimary} />
            ) : (
              <Text style={styles.buttonText}>Registrar Cuenta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onLoginPress} style={styles.switchContainer}>
            <Text style={styles.switchText}>
              ¿Ya tienes cuenta? <Text style={styles.switchHighlight}>Inicia sesión aquí</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SectionCard>
    </ScrollView>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    padding: 16,
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginTop: 4,
    marginBottom: 20,
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: theme.colors.textPrimary,
    fontSize: 14,
    marginBottom: 12,
  },
  barriosContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  barrioOption: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  barrioOptionSelected: {
    borderColor: theme.colors.green,
    backgroundColor: theme.colors.greenBg,
  },
  barrioText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  barrioTextSelected: {
    color: theme.colors.textPrimary,
  },
  button: {
    backgroundColor: theme.colors.green,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: theme.colors.redBg,
    borderWidth: 1,
    borderColor: theme.colors.redBorder,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  switchContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  switchText: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  switchHighlight: {
    color: theme.colors.green,
    fontWeight: '600',
  },
});
