import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { BAColors } from '../constants/colors';
import { SectionCard } from '../components/layout/SectionCard';
import { SectionBadge } from '../components/atomic/SectionBadge';

interface LoginScreenProps {
  onRegisterPress: () => void;
}

export function LoginScreen({ onRegisterPress }: LoginScreenProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor, ingresa correo y contraseña.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (e: any) {
      setError(e.message || 'Error al iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <SectionBadge label="Seguridad Vecinal" color="red" />
        <Text style={styles.title}>Iniciar Sesión</Text>
        <Text style={styles.subtitle}>Ingresa tus credenciales para ingresar a la red</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={BAColors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={BAColors.textMuted}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={BAColors.textPrimary} />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onRegisterPress} style={styles.switchContainer}>
            <Text style={styles.switchText}>
              ¿No tienes cuenta? <Text style={styles.switchHighlight}>Regístrate aquí</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BAColors.bg,
  },
  content: {
    padding: 16,
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: BAColors.textPrimary,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 12,
    color: BAColors.textTertiary,
    marginTop: 4,
    marginBottom: 20,
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: BAColors.textSecondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: BAColors.surfaceLight,
    borderWidth: 1,
    borderColor: BAColors.surfaceBorder,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: BAColors.textPrimary,
    fontSize: 14,
    marginBottom: 12,
  },
  button: {
    backgroundColor: BAColors.red,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: BAColors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: BAColors.redBg,
    borderWidth: 1,
    borderColor: BAColors.redBorder,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: BAColors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  switchContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  switchText: {
    color: BAColors.textTertiary,
    fontSize: 12,
  },
  switchHighlight: {
    color: BAColors.green,
    fontWeight: '600',
  },
});
