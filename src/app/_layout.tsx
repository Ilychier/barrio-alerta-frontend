import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { View, StyleSheet } from 'react-native';

import { BAColors } from '@/presentation/constants/colors';
import { Header } from '@/presentation/components/layout/Header';
import { useDashboardController } from '@/application/controllers/useDashboardController';
import { CURRENT_USER_ID } from '@/presentation/constants/currentUser';

function GlobalHeader() {
  const { usuario, barrio, cuadrante } = useDashboardController(CURRENT_USER_ID);
  return (
    <Header
      barrioNombre={barrio?.nombre}
      cuadranteNombre={cuadrante?.nombre_unidad}
      usuarioNombre={usuario?.nombre}
    />
  );
}

export default function TabLayout() {
  return (
    <View style={styles.root}>
      <GlobalHeader />
      <NativeTabs
        backgroundColor={BAColors.bg}
        indicatorColor={BAColors.surfaceLight}
        labelStyle={{
          selected: { color: BAColors.textPrimary },
          default: { color: BAColors.textMuted },
        }}
      >
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Dashboard</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="reportar">
          <NativeTabs.Trigger.Label>Reportar Incidencia</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="config">
          <NativeTabs.Trigger.Label>Ajustes Canal</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BAColors.bg,
  },
});
