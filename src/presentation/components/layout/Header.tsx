import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppTheme, useAppTheme } from "../../theme/ThemeContext";
import Icon from "../atomic/Icon";
import { IconRenderer } from "../atomic/IconRenderer";

interface HeaderProps {
  isMobile?: boolean;
  onMenuPress?: () => void;
  onBackPress?: () => void;
  onLogoutPress?: () => void;
}

export function Header({
  isMobile = false,
  onMenuPress,
  onBackPress,
  onLogoutPress,
}: HeaderProps) {
  const { theme, themeType, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.header}>
      <View style={styles.leftGroup}>
        {onMenuPress && (
          <TouchableOpacity
            onPress={onMenuPress}
            style={styles.menuButton}
            activeOpacity={0.7}
          >
            <IconRenderer
              name="Menu"
              size={22}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        )}
        {onBackPress && (
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Icon name="ArrowLeft" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View>
          <Text style={styles.title}>Barrio Alerta</Text>
          <Text style={styles.subtitle}>Red de Apoyo</Text>
        </View>
      </View>

      <View style={styles.rightGroup}>
        <TouchableOpacity
          onPress={toggleTheme}
          style={styles.themeToggle}
          activeOpacity={0.7}
        >
          <Icon
            name={themeType === "dark" ? "Sun" : "Moon"}
            size={21}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>

        {onLogoutPress && (
          <TouchableOpacity
            onPress={onLogoutPress}
            style={styles.logoutButton}
            activeOpacity={0.7}
          >
            <Icon name="LogOut" size={18} color={theme.colors.red} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceDark,
    },
    leftGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    menuButton: {
      padding: 6,
      marginRight: 2,
      borderRadius: 8,
    },
    backButton: {
      padding: 6,
      marginRight: 2,
      borderRadius: 8,
    },
    logoContainer: {
      borderRadius: 12,
    },
    logoImage: {
      width: 40,
      height: 40,
    },
    title: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 11,
      color: theme.colors.textMuted,
    },
    rightGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    themeToggle: {
      padding: 6,
      borderRadius: 32,
      backgroundColor: theme.colors.surfaceLight,
      alignItems: "center",
      justifyContent: "center",
    },
    logoutButton: {
      padding: 6,
      borderRadius: 32,
      backgroundColor: theme.colors.surfaceLight,
      alignItems: "center",
      justifyContent: "center",
    },
  });
