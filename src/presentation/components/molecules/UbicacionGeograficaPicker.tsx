import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { UbicacionGeografica } from "../../../application/ubicacion/useUbicacionGeografica";
import { AppTheme } from "../../theme/ThemeContext";
import { SelectInput } from "../atomic/SelectInput";

interface UbicacionGeograficaPickerProps {
  ubicacion: UbicacionGeografica;
  ciudadId: number | undefined;
  onChangeCiudadId: (municipioId: number) => void;
  theme: AppTheme;
  loading?: boolean;
}

/**
 * Cascada geográfica para el reporte de mascota (Departamento → Municipio →
 * Localidad → Barrio) + detalle libre. Mismo patrón visual que RegisterScreen.
 * <p>
 * Solo presenta y delega en `useUbicacionGeografica`; la screen decide qué
 * persistir (`ciudadId` = municipio, `ubicacion` = string compuesto).
 */
export function UbicacionGeograficaPicker({
  ubicacion,
  ciudadId,
  onChangeCiudadId,
  theme,
  loading = false,
}: UbicacionGeograficaPickerProps) {
  const [detalleFocused, setDetalleFocused] = useState(false);

  if (loading) {
    return (
      <Text style={getLoadingTextStyles(theme)}>Cargando catálogos...</Text>
    );
  }

  return (
    <View style={styles.container}>
      <SelectInput
        label="Departamento"
        icon="Map"
        options={ubicacion.departamentoOptions}
        selectedValue={ubicacion.departamento}
        onSelect={ubicacion.cambiarDepartamento}
        placeholder="Elige el departamento..."
        theme={theme}
        focused={false}
        onFocus={() => {}}
        onBlur={() => {}}
      />

      <SelectInput
        label="Municipio / Ciudad"
        icon="Building2"
        options={ubicacion.municipioOptions}
        selectedValue={ciudadId ?? 0}
        onSelect={(v) => {
          ubicacion.cambiarMunicipio(v);
          onChangeCiudadId(Number(v));
        }}
        placeholder={
          ubicacion.departamento
            ? "Elige el municipio..."
            : "Primero elige el departamento"
        }
        theme={theme}
        focused={false}
        onFocus={() => {}}
        onBlur={() => {}}
      />

      <SelectInput
        label="Localidad / Comuna"
        icon="MapPin"
        options={ubicacion.localidadOptions}
        selectedValue={ubicacion.localidadId}
        onSelect={ubicacion.cambiarLocalidad}
        placeholder={
          ubicacion.municipioId
            ? "Elige la localidad..."
            : "Primero elige el municipio"
        }
        theme={theme}
        focused={false}
        onFocus={() => {}}
        onBlur={() => {}}
      />

      <SelectInput
        label="Barrio"
        icon="House"
        options={ubicacion.barrioOptions}
        selectedValue={ubicacion.barrioId}
        onSelect={ubicacion.cambiarBarrio}
        placeholder={
          ubicacion.localidadId
            ? "Elige el barrio..."
            : "Primero elige la localidad"
        }
        theme={theme}
        focused={false}
        onFocus={() => {}}
        onBlur={() => {}}
        onLoadMore={ubicacion.cargarMasBarrios}
        hasMore={ubicacion.barriosHasMore}
        loadingMore={ubicacion.barriosLoadingMore}
      />

      <Text style={getDetalleLabelStyles(theme)}>
        Dirección / indicaciones (opcional)
      </Text>
      <TextInput
        style={[
          getDetalleInputStyles(theme),
          detalleFocused && getDetalleInputFocusedStyles(theme),
        ]}
        placeholder="Ej: dirección, cerca al parque, casa azul..."
        placeholderTextColor={theme.colors.textMuted}
        value={ubicacion.detalle}
        onChangeText={ubicacion.setDetalle}
        onFocus={() => setDetalleFocused(true)}
        onBlur={() => setDetalleFocused(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
});

const getLoadingTextStyles = (theme: AppTheme) =>
  StyleSheet.create({
    text: {
      color: theme.colors.textMuted,
      fontSize: 13,
    },
  }).text;

const getDetalleLabelStyles = (theme: AppTheme) =>
  StyleSheet.create({
    label: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.textSecondary,
      marginBottom: -6,
      marginLeft: 4,
    },
  }).label;

const getDetalleInputStyles = (theme: AppTheme) =>
  StyleSheet.create({
    input: {
      backgroundColor: theme.colors.surfaceLight,
      borderWidth: 1.5,
      borderColor: theme.colors.surfaceBorder,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 52,
      fontSize: 14,
      color: theme.colors.textPrimary,
    },
  }).input;

const getDetalleInputFocusedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    focused: {
      borderColor: theme.colors.green,
      backgroundColor: theme.colors.surface,
    },
  }).focused;
