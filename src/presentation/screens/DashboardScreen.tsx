import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDashboardController } from '../../application/controllers/useDashboardController';
import { useSOSController } from '../../application/controllers/useSOSController';
import { SectionCard } from '../components/layout/SectionCard';
import { SOSButton } from '../components/molecules/SOSButton';
import { useAuth } from '../context/AuthContext';
import { AppTheme, useAppTheme } from '../theme/ThemeContext';

export function DashboardScreen() {
  const [focusCount, forceUpdate] = useState(0);
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  // Refresca los datos del cuadrante cuando la pantalla obtiene foco
  useFocusEffect(
    useCallback(() => {
      forceUpdate((n) => n + 1);
    }, []),
  );

  const {
    cuadrante,
  } = useDashboardController(userId, focusCount);

  const sos = useSOSController(userId, () => {
    forceUpdate((n) => n + 1);
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Bloque SOS */}
      <SectionCard style={styles.sosBlock}>
        <Text style={styles.sosTitle}>Botón de Pánico S.O.S</Text>
        <Text style={styles.sosDescription}>
          Contacto con el cuadrante {cuadrante?.nombre_unidad || ''} en caso de emergencia.
        </Text>

        <SOSButton
          step={sos.sosStep}
          countdown={sos.sosCountdown}
          performanceTracker={sos.performanceTracker}
          onStart={sos.startSOS}
          onConfirm={sos.triggerSOSFinal}
          onCancel={sos.cancelSOS}
          onDismiss={sos.dismissSOS}
        />

        <View style={styles.sosFooter}>
          <View style={styles.sosFooterLeft}>
            <Text style={styles.sosFooterText}>CAI: {cuadrante?.nombre_unidad || 'Cargando...'}</Text>
          </View>
          {cuadrante?.telefono_emergencia && (
            <Text style={styles.phoneNumber}>{cuadrante.telefono_emergencia}</Text>
          )}
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
    gap: 24,
    justifyContent: 'flex-start',
    flexGrow: 1,
  },

  // --- SOS Block ---
  sosBlock: {
    minHeight: 400,
    justifyContent: 'space-between',
  },
  sosTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 12,
  },
  sosDescription: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  sosFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.bg,
    marginTop: 16,
  },
  sosFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sosFooterText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  phoneNumber: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: theme.colors.green,
  },
});
