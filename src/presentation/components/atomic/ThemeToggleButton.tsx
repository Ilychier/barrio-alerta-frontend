import { StyleSheet, TouchableOpacity } from "react-native";
import Icon from "./Icon";
import { AppTheme, useAppTheme } from "../../theme/ThemeContext";

/**
 * Botón atómico de toggle dark/light. Reutilizable en cualquier pantalla
 * (autenticada o no): el Header lo usa, y las landings/login/register
 * también. Presentación pura — solo lee el tema y lo alterna.
 */
export function ThemeToggleButton() {
  const { theme, themeType, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={styles.toggle}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={
        themeType === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
      }
    >
      <Icon
        name={themeType === "dark" ? "Sun" : "Moon"}
        size={21}
        color={theme.colors.textPrimary}
      />
    </TouchableOpacity>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    toggle: {
      padding: 6,
      borderRadius: 32,
      backgroundColor: theme.colors.surfaceLight,
      alignItems: "center",
      justifyContent: "center",
    },
  });