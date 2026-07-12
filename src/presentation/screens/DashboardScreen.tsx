import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDashboardController } from '../../application/controllers/useDashboardController';
import { useSOSController } from '../../application/controllers/useSOSController';
import { SectionCard } from '../components/layout/SectionCard';
import { AlertCard } from '../components/molecules/AlertCard';
import { SOSButton } from '../components/molecules/SOSButton';
import { useAuth } from '../context/AuthContext';
import { AppTheme, useAppTheme } from '../theme/ThemeContext';

export function DashboardScreen() {
  const [focusCount, forceUpdate] = useState(0);
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  // Refresca los datos del repositorio cada vez que el tab obtiene foco
  useFocusEffect(
    useCallback(() => {
      forceUpdate((n) => n + 1);
    }, []),
  );

  const {
    alertas,
    barrio,
    cuadrante,
    fechaSeleccionada,
    cambiarDia,
    formatearFechaISO,
  } = useDashboardController(userId, focusCount);

  const esHoy = formatearFechaISO(fechaSeleccionada) === formatearFechaISO(new Date());
  const sos = useSOSController(userId, () => {
    forceUpdate((n) => n + 1);
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Bloque SOS (izquierda en web, arriba en mobile) */}
      <SectionCard style={styles.sosBlock}>
        <Text style={styles.sosTitle}>Botón de Pánico S.O.S</Text>
        <Text style={styles.sosDescription}>
          Contacto con el cuadrante {cuadrante?.nombre_unidad} en caso de emergencia.
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
            <Text style={styles.sosFooterText}>CAI: {cuadrante?.nombre_unidad}</Text>
          </View>
          {cuadrante?.telefono_emergencia && (
            <Text style={styles.phoneNumber}>{cuadrante.telefono_emergencia}</Text>
          )}
        </View>
      </SectionCard>

      {/* Bloque Alertas (derecha en web, abajo en mobile) */}
      <SectionCard style={styles.alertsBlock}>
        <View style={styles.alertsHeader}>
          <View>
            <Text style={styles.alertsTitle}>Canal de Alertas del Sector</Text>
          </View>
        </View>
        <Text style={styles.alertsSubtitle}>
          Reportes recientes emitidos por los residentes del sector {barrio?.nombre}.
        </Text>

        <View style={styles.alertList}>
          <View style={styles.dateSelectorContainer}>
            <TouchableOpacity onPress={() => cambiarDia(-1)} style={styles.dateButton}>
              <Text style={styles.dateButtonText}>◀</Text>
            </TouchableOpacity>
            
            <Text style={styles.dateText}>
              {esHoy ? 'Hoy' : formatearFechaISO(fechaSeleccionada)}
            </Text>
            
            <TouchableOpacity
              onPress={() => cambiarDia(1)}
              disabled={esHoy}
              style={[styles.dateButton, esHoy && styles.disabledButton]}
            >
              <Text style={[styles.dateButtonText, esHoy && styles.disabledButtonText]}>▶</Text>
            </TouchableOpacity>
          </View>

          {alertas.length === 0 ? (
            <Text style={styles.emptyText}>No se registran eventos activos en el sector.</Text>
          ) : (
            alertas.map((item) => <AlertCard key={item.alerta.id} item={item} />)
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

  // --- Alertas Block ---
  alertsBlock: {
    flex: 1,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  alertsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.green,
  },
  alertsSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  alertList: {
    marginTop: 24,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 48,
    fontSize: 12,
    color: theme.colors.textDim,
  },
  dateSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  dateButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.surfaceLight,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  disabledButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  dateButtonText: {
    fontSize: 14,
    color: theme.colors.green,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: theme.colors.textMuted,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
});
