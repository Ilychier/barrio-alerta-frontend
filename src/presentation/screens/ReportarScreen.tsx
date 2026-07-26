import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useReporteController } from "../../application/controllers/useReporteController";
import { CategoryButton } from "../components/atomic/CategoryButton";
import { SectionCard } from "../components/layout/SectionCard";
import { DescriptionSelector } from "../components/molecules/DescriptionSelector";
import { useAuth } from "../context/AuthContext";
import { AppTheme, useAppTheme } from "../theme/ThemeContext";

export function ReportarScreen() {
  const { user } = useAuth();
  const ctrl = useReporteController(user?.id ?? 0);
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const router = useRouter();

  const handleSubmit = async () => {
    const success = await ctrl.saveIncidentReport();
    if (success) {
      router.push("/alertas-sector");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>Reporte de Incidente</Text>

        {/* Categorías */}
        <View style={styles.categoriesSection}>
          <Text style={styles.label}>Selecciona la Categoría de la Alerta</Text>
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
            {ctrl.descripciones && ctrl.descripciones.length > 0 && (
              <DescriptionSelector
                descriptions={ctrl.descripciones.map((d) => d.descripcion)}
                selected={ctrl.selectedDescription}
                onSelect={ctrl.handleSelectDescription}
              />
            )}

            <View>
              <Text style={styles.label}>Descripción Detallada</Text>
              <TextInput
                style={styles.textArea}
                value={ctrl.descripcionDetallada}
                onChangeText={ctrl.setDescripcionDetallada}
                placeholder="Describe el incidente con detalle..."
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        )}

        {/* Acciones */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!ctrl.selectedCategory}
            style={[
              styles.submitButton,
              !ctrl.selectedCategory && styles.submitDisabled,
            ]}
          >
            <Text
              style={[
                styles.submitText,
                !ctrl.selectedCategory && styles.submitTextDisabled,
              ]}
            >
              Enviar Reporte
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

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent",
    },
    content: {
      padding: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginTop: 12,
    },
    description: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 4,
    },

    categoriesSection: {
      marginTop: 24,
    },
    label: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.textTertiary,
      marginBottom: 12,
    },
    categoriesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },

    formContainer: {
      marginTop: 24,
      padding: 20,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 20,
    },

    textArea: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 14,
      fontSize: 13,
      color: theme.colors.textPrimary,
      minHeight: 100,
      lineHeight: 20,
    },

    actions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 24,
    },
    submitButton: {
      flex: 1,
      backgroundColor: theme.colors.red,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
    },
    submitDisabled: {
      opacity: 0.2,
    },
    submitText: {
      fontWeight: "800",
      fontSize: 12,
      color: theme.colors.surfaceLight,
    },
    submitTextDisabled: {
      color: theme.colors.textPrimary,
    },
    cancelButton: {
      backgroundColor: theme.colors.border,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.surfaceBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelText: {
      fontWeight: "700",
      fontSize: 12,
      color: theme.colors.textTertiary,
    },
  });
