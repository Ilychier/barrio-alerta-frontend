import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppTheme } from "../../theme/ThemeContext";
import Icon from "./Icon";

export interface SelectOption {
  value: number | string;
  label: string;
}

interface SelectInputProps {
  options: SelectOption[];
  selectedValue: number | string;
  onSelect: (value: number | string) => void;
  label?: string;
  icon?: string;
  placeholder?: string;
  theme: AppTheme;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  /** Se llama cuando el usuario llega al final del scroll */
  onLoadMore?: () => void;
  /** Indica si hay más páginas por cargar */
  hasMore?: boolean;
  /** Indica si se está cargando la siguiente página */
  loadingMore?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export function SelectInput({
  options,
  selectedValue,
  onSelect,
  label,
  icon = "ChevronDown",
  placeholder = "Seleccionar...",
  theme,
  focused,
  onFocus,
  onBlur,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
}: SelectInputProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedLabel =
    options.find((o) => o.value === selectedValue)?.label ?? placeholder;

  const handlePress = () => {
    onFocus();
    setModalVisible(true);
  };

  const handleSelect = (value: number | string) => {
    onSelect(value);
    setModalVisible(false);
    onBlur();
  };

  const handleDismiss = () => {
    setModalVisible(false);
    onBlur();
  };

  const handleEndReached = () => {
    if (hasMore && !loadingMore && onLoadMore) {
      onLoadMore();
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.green} />
        <Text style={getFooterTextStyles(theme)}>Cargando más...</Text>
      </View>
    );
  };

  return (
    <View>
      {label && <Text style={getLabelStyles(theme)}>{label}</Text>}

      <TouchableOpacity
        style={[
          getInputContainerStyles(theme),
          focused && getInputContainerFocusedStyles(theme),
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Icon
          name={icon as any}
          size={18}
          color={focused ? theme.colors.green : theme.colors.textMuted}
          style={styles.inputIcon}
        />
        <Text
          style={[
            getValueStyles(theme),
            !selectedLabel && getPlaceholderStyles(theme),
          ]}
          numberOfLines={1}
        >
          {selectedLabel}
        </Text>
        <Icon
          name="ChevronDown"
          size={18}
          color={theme.colors.textTertiary}
          style={styles.chevron}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleDismiss}
      >
        <Pressable style={styles.overlay} onPress={handleDismiss}>
          <View
            style={[getModalContentStyles(theme)]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={getModalTitleStyles(theme)}>
              {label ?? placeholder}
            </Text>

            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              style={styles.list}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.3}
              ListFooterComponent={renderFooter}
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    style={[
                      getOptionStyles(theme),
                      isSelected && getOptionSelectedStyles(theme),
                    ]}
                    onPress={() => handleSelect(item.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        getOptionTextStyles(theme),
                        isSelected && getOptionTextSelectedStyles(theme),
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Icon
                        name="Check"
                        size={18}
                        color={theme.colors.green}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  inputIcon: {
    marginRight: 12,
  },
  chevron: {
    marginLeft: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  list: {
    maxHeight: SCREEN_HEIGHT * 0.45,
  },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
});

const getLabelStyles = (theme: AppTheme) =>
  StyleSheet.create({
    label: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.textSecondary,
      marginBottom: 8,
      marginLeft: 4,
    },
  }).label;

const getInputContainerStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surfaceLight,
      borderWidth: 1.5,
      borderColor: theme.colors.surfaceBorder,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 52,
    },
  }).container;

const getInputContainerFocusedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    focused: {
      borderColor: theme.colors.green,
      backgroundColor: theme.colors.surface,
      shadowColor: theme.colors.green,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
  }).focused;

const getValueStyles = (theme: AppTheme) =>
  StyleSheet.create({
    value: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: 14,
    },
  }).value;

const getPlaceholderStyles = (theme: AppTheme) =>
  StyleSheet.create({
    placeholder: {
      color: theme.colors.textMuted,
    },
  }).placeholder;

const getModalContentStyles = (theme: AppTheme) =>
  StyleSheet.create({
    content: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      paddingVertical: 20,
      width: "100%",
      maxWidth: 400,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
  }).content;

const getModalTitleStyles = (theme: AppTheme) =>
  StyleSheet.create({
    title: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      paddingHorizontal: 20,
      marginBottom: 12,
    },
  }).title;

const getOptionStyles = (theme: AppTheme) =>
  StyleSheet.create({
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
  }).option;

const getOptionSelectedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    selected: {
      backgroundColor: theme.colors.greenBg,
    },
  }).selected;

const getOptionTextStyles = (theme: AppTheme) =>
  StyleSheet.create({
    text: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
  }).text;

const getOptionTextSelectedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    textSelected: {
      color: theme.colors.textPrimary,
      fontWeight: "700",
    },
  }).textSelected;

const getFooterTextStyles = (theme: AppTheme) =>
  StyleSheet.create({
    text: {
      fontSize: 13,
      color: theme.colors.textMuted,
    },
  }).text;
