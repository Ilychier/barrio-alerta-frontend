import { View, Text, Image, StyleSheet } from 'react-native';
import { BAColors } from '../../constants/colors';
import { IconRenderer } from '../atomic/IconRenderer';
import { AlertaConDatos } from '../../../application/usecases/ObtenerAlertasUseCase';

interface AlertCardProps {
  item: AlertaConDatos;
}

export function AlertCard({ item }: AlertCardProps) {
  const { alerta, categoria, usuario, evidencias } = item;
  const isSos = alerta.es_sos;
  const firstEvidence = evidencias.length > 0 ? evidencias[0] : null;

  const time = new Date(alerta.fecha_hora).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.card, isSos ? styles.cardSos : styles.cardNormal]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {isSos ? (
            <IconRenderer name="ShieldAlert" size={16} color={BAColors.red} />
          ) : (
            categoria && (
              <IconRenderer name={categoria.icono_referencia} size={16} color={BAColors.textTertiary} />
            )
          )}
          <Text style={[styles.categoryName, isSos && styles.categoryNameSos]}>
            {isSos ? 'BOTÓN DE PÁNICO ACTIVADO' : categoria?.nombre || 'Incidente'}
          </Text>
        </View>
        <Text style={styles.time}>{time}</Text>
      </View>

      {/* Description */}
      <Text style={styles.description}>{alerta.descripcion}</Text>

      {/* Evidence */}
      {firstEvidence && (
        <View style={styles.evidenceContainer}>
          <Image source={{ uri: firstEvidence.url_archivo }} style={styles.evidenceImage} />
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.reporter}>Reportado por: {usuario?.nombre || 'Anónimo'}</Text>
        <View style={styles.channelBadge}>
          <View style={styles.channelDot} />
          <Text style={styles.channelText}>Canal Directo</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardSos: {
    backgroundColor: BAColors.redBg,
    borderColor: 'rgba(255, 51, 51, 0.4)',
  },
  cardNormal: {
    backgroundColor: BAColors.surfaceLight,
    borderColor: BAColors.border,
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
    color: BAColors.textPrimary,
  },
  categoryNameSos: {
    color: BAColors.red,
  },
  time: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: BAColors.textMuted,
  },

  description: {
    fontSize: 12,
    color: BAColors.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },

  evidenceContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BAColors.bg,
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
    borderTopColor: BAColors.bg,
  },
  reporter: {
    fontSize: 10,
    fontWeight: '500',
    color: BAColors.textMuted,
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
    backgroundColor: BAColors.green,
  },
  channelText: {
    fontSize: 10,
    color: BAColors.textMuted,
  },
});
