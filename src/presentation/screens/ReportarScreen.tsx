import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useReporteController } from '../../application/controllers/useReporteController';
import { CategoryButton } from '../components/atomic/CategoryButton';
import { SectionBadge } from '../components/atomic/SectionBadge';
import { SectionCard } from '../components/layout/SectionCard';
import { DescriptionSelector } from '../components/molecules/DescriptionSelector';
import { EvidenceCapture } from '../components/molecules/EvidenceCapture';
import { BAColors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

export function ReportarScreen() {
  const { user } = useAuth();
  const ctrl = useReporteController(user?.id ?? 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <SectionBadge label="Mecanismo Rápido" color="green" />
        <Text style={styles.title}>Reporte de Incidente</Text>

        {/* Categorías */}
        <View style={styles.categoriesSection}>
          <Text style={styles.label}>Selecciona la Categoría del Suceso</Text>
          <View style={styles.categoriesGrid}>
            {ctrl.categorias
              .filter((cat) => cat.id !== 4 && cat.id !== 5)
              .map((cat) => (
                <CategoryButton
                  key={cat.id}
                  iconName={cat.icono_referencia}
                  label={cat.nombre}
                  selected={ctrl.selectedCategory === cat.id}
                  onPress={() => ctrl.handleSelectCategory(cat.id)}
                />
              ))}
          </View>
        </View>

        {/* Formulario dinámico */}
        {ctrl.selectedCategory && (
          <View style={styles.formContainer}>
            <EvidenceCapture
              attached={ctrl.evidenceAttached}
              photoUrl={ctrl.mockPhotoUrl}
              onCapture={ctrl.triggerMockPhotoCapture}
              onRemove={ctrl.removeEvidence}
            />

            {ctrl.descripciones && ctrl.descripciones.length > 0 && (
              <DescriptionSelector
                descriptions={ctrl.descripciones.map((d) => d.descripcion)}
                selected={ctrl.selectedDescription}
                onSelect={ctrl.handleSelectDescription}
              />
            )}
          </View>
        )}

        {/* Acciones */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={ctrl.saveIncidentReport}
            disabled={!ctrl.selectedCategory || !ctrl.evidenceAttached}
            style={[styles.submitButton, (!ctrl.selectedCategory || !ctrl.evidenceAttached) && styles.submitDisabled]}
          >
            <Text style={[styles.submitText, (!ctrl.selectedCategory || !ctrl.evidenceAttached) && styles.submitTextDisabled]}>
              Transmitir Alerta Comunitaria
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={ctrl.cancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancelar</Text>
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
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: BAColors.textPrimary,
    marginTop: 12,
  },
  description: {
    fontSize: 12,
    color: BAColors.textMuted,
    marginTop: 4,
  },

  categoriesSection: {
    marginTop: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: BAColors.textTertiary,
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  formContainer: {
    marginTop: 24,
    padding: 20,
    backgroundColor: BAColors.surfaceLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BAColors.border,
    gap: 20,
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  submitButton: {
    flex: 1,
    backgroundColor: BAColors.red, // antes: BAColors.green
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.2,
  },
  submitText: {
  fontWeight: '800',
  fontSize: 12,
  color: BAColors.textPrimary, // antes: BAColors.bg
},
submitTextDisabled: {
  color: BAColors.textPrimary, // antes: BAColors.bg
},
  cancelButton: {
    backgroundColor: BAColors.border,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BAColors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontWeight: '700',
    fontSize: 12,
    color: BAColors.textTertiary,
  },
});
