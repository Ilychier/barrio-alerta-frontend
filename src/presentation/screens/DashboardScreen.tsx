import { useState, useCallback } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { BAColors } from '../constants/colors';
import { CURRENT_USER_ID } from '../constants/currentUser';
import { useDashboardController } from '../../application/controllers/useDashboardController';
import { useSOSController } from '../../application/controllers/useSOSController';
import { SectionCard } from '../components/layout/SectionCard';
import { SectionBadge } from '../components/atomic/SectionBadge';
import { SOSButton } from '../components/molecules/SOSButton';
import { AlertCard } from '../components/molecules/AlertCard';
import { IconRenderer } from '../components/atomic/IconRenderer';

export function DashboardScreen() {
  const [, forceUpdate] = useState(0);

  // Refresca los datos del repositorio cada vez que el tab obtiene foco
  useFocusEffect(
    useCallback(() => {
      forceUpdate((n) => n + 1);
    }, []),
  );

  const { alertas, barrio, cuadrante } = useDashboardController(CURRENT_USER_ID);
  const sos = useSOSController(CURRENT_USER_ID);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Bloque SOS (izquierda en web, arriba en mobile) */}
      <SectionCard style={styles.sosBlock}>
        <SectionBadge label="Acceso Crítico" color="red" />
        <Text style={styles.sosTitle}>Activación Botón de Pánico S.O.S</Text>
        <Text style={styles.sosDescription}>
          Enlace de emergencia directa con el cuadrante {cuadrante?.nombre_unidad}. Requiere doble
          confirmación táctil para evitar falsos positivos (RF1, RNF4).
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
            <IconRenderer name="Clock" size={14} color={BAColors.textDim} />
            <Text style={styles.sosFooterText}>Monitoreo Continuo 24/7</Text>
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
            <SectionBadge label="En Vivo" color="green" />
            <Text style={styles.alertsTitle}>Canal de Alertas del Sector</Text>
          </View>
          <View style={styles.liveDot} />
        </View>
        <Text style={styles.alertsSubtitle}>
          Reportes recientes emitidos por los residentes del sector {barrio?.nombre}.
        </Text>

        <View style={styles.alertList}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BAColors.bg,
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
    color: BAColors.textPrimary,
    marginTop: 12,
  },
  sosDescription: {
    fontSize: 12,
    color: BAColors.textMuted,
    marginTop: 4,
  },
  sosFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BAColors.bg,
    marginTop: 16,
  },
  sosFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sosFooterText: {
    fontSize: 12,
    color: BAColors.textMuted,
  },
  phoneNumber: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: BAColors.green,
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
    color: BAColors.textPrimary,
    marginTop: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BAColors.green,
  },
  alertsSubtitle: {
    fontSize: 12,
    color: BAColors.textMuted,
    marginTop: 4,
  },
  alertList: {
    marginTop: 24,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 48,
    fontSize: 12,
    color: BAColors.textDim,
  },
});
