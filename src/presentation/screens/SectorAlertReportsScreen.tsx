import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSectorAlertsController } from '../../application/controllers/useSectorAlertsController';
import { SectionCard } from '../components/layout/SectionCard';
import { AlertCard } from '../components/molecules/AlertCard';
import { useAuth } from '../context/AuthContext';
import { AppTheme, useAppTheme } from '../theme/ThemeContext';

export function SectorAlertReportsScreen() {
  const [focusCount, forceUpdate] = useState(0);
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  // Refresca los datos del sector cada vez que la pantalla obtiene foco
  useFocusEffect(
    useCallback(() => {
      forceUpdate((n) => n + 1);
    }, []),
  );

  const {
    alertas,
    barrio,
    loading,
    fechaSeleccionada,
    cambiarDia,
    formatearFechaISO,
  } = useSectorAlertsController(userId, focusCount);

  const esHoy = formatearFechaISO(fechaSeleccionada) === formatearFechaISO(new Date());

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard style={styles.alertsBlock}>
        <View style={styles.alertsHeader}>
          <View>
            <Text style={styles.alertsTitle}>Canal de Alertas del Sector</Text>
          </View>
        </View>
        <Text style={styles.alertsSubtitle}>
          Reportes recientes emitidos por los residentes del sector {barrio?.nombre || 'de tu barrio'}.
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.green} />
            <Text style={styles.loadingText}>Cargando alertas del sector...</Text>
          </View>
        ) : (
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
        )}
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
  },
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  loadingText: {
    fontSize: 12,
    color: theme.colors.textMuted,
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
