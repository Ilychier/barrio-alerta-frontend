import { StyleSheet, Text, View } from 'react-native';
import { AlertaConDatos } from '../../../application/usecases/ObtenerAlertasUseCase';
import { AppTheme, useAppTheme } from '../../theme/ThemeContext';
import Icon from '../atomic/Icon';

interface AlertCardProps {
  item: AlertaConDatos;
}

export function AlertCard({ item }: AlertCardProps) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  const { alerta, categoria, usuario, evidencias } = item;
  const isSos = alerta.es_sos;
  const firstEvidence = evidencias.length > 0 ? evidencias[0] : null;
  const icono = categoria?.icono_referencia || 'AlertCircle';

  const time = new Date(alerta.fecha_hora).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isFine = alerta.categoria_id === 5;

  return (
    <View style={[styles.card, isSos ? styles.cardSos : (isFine ? styles.cardFine : styles.cardNormal)]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {isSos ? (
            <Icon name="ShieldAlert" size={16} color={theme.colors.red} />
          ) : isFine ? (
            <Icon name="Check" size={16} color={theme.colors.green} />
          ) : (
              categoria && (
              <Icon name={icono as any} size={16} color={theme.colors.textMuted} />
            )
          )}
          <Text style={[
            styles.categoryName,
            isSos && styles.categoryNameSos,
            isFine && styles.categoryNameFine
          ]}>
            {isSos ? 'BOTÓN DE PÁNICO ACTIVADO' : isFine ? 'EMERGENCIA FINALIZADA' : (categoria?.nombre || 'Incidente')}
          </Text>
        </View>
        <Text style={styles.time}>{time}</Text>
      </View>

      {/* Description */}
      <Text style={styles.description}>{alerta.descripcion}</Text>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.reporter}>Reportado por: {usuario?.nombre || 'Anónimo'}</Text>
      </View>
    </View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardSos: {
    backgroundColor: theme.colors.redBg,
    borderColor: 'rgba(255, 51, 51, 0.4)',
  },
  cardFine: {
    backgroundColor: theme.colors.greenBg,
    borderColor: theme.colors.greenBorder,
  },
  cardNormal: {
    backgroundColor: theme.colors.surfaceLight,
    borderColor: theme.colors.border,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  categoryNameSos: {
    color: theme.colors.red,
  },
  categoryNameFine: {
    color: theme.colors.green,
  },
  time: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: theme.colors.textMuted,
  },

  description: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },

  evidenceContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.bg,
    maxHeight: 140,
  },
  evidenceImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.bg,
  },
  reporter: {
    fontSize: 10,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  channelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  channelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.green,
  },
  channelText: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
});
