import { useEffect, useState } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";
import { AppTheme } from "../../theme/ThemeContext";
import Icon from "../atomic/Icon";

/**
 * Arte visual de carga inicial: UNA bola central con relleno (verde) que LATE
 * lentamente como un corazón, con un corazón blanco dentro. Los iconos de
 * animalitos y rescatistas quedan estáticos alrededor (decoración).
 *
 * Claves para que el latido se perciba siempre:
 * - El Animated.Value arranca en 0.5 (punto medio) → visible desde el frame 1.
 * - Latido lento: 800ms sube + 800ms baja = 1.6s por latido completo.
 * - Solo anima transform (scale) y opacity — nunca layout (60fps).
 * - Móvil: useNativeDriver → UI Thread. Web: fallback JS.
 */
interface IconoConfig {
  name: string;
  left: number;
  top: number;
  color: string;
}

// 8 iconos alrededor de la bola (canvas 280x280, centro 140,140)
const ICONOS: IconoConfig[] = [
  { name: "Dog", left: 207, top: 51, color: "green" },
  { name: "Cat", left: 51, top: 51, color: "purple" },
  { name: "PawPrint", left: 19, top: 119, color: "red" },
  { name: "HeartHandshake", left: 239, top: 119, color: "green" },
  { name: "LifeBuoy", left: 51, top: 207, color: "purple" },
  { name: "Ambulance", left: 207, top: 207, color: "red" },
  { name: "Users", left: 129, top: 19, color: "green" },
  { name: "Heart", left: 129, top: 239, color: "red" },
];

const ICON_SIZE = 22;
const useNative = Platform.OS !== "web";
const SUBE_MS = 300; // "lub": expansión rápida y marcada (se nota desde el frame 1)
const BAJA_MS = 1000; // "relax": vuelve lento

export function AppLoadingArt({ theme }: { theme: AppTheme }) {
  // Arranca en 0: el primer movimiento es la expansión completa (0 → 1),
  // visible desde el primer frame. Si arrancara en 0.5, los primeros ms
  // serían un crecimiento sutil que parece estático.
  const [latido] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(latido, {
          toValue: 1,
          duration: SUBE_MS,
          easing: Easing.out(Easing.quad),
          useNativeDriver: useNative,
        }),
        Animated.timing(latido, {
          toValue: 0,
          duration: BAJA_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [latido]);

  const escala = latido.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });
  const opacidad = latido.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <View style={styles.container}>
      <View style={styles.canvas}>
        {/* LA bola central: late directamente (escala + opacidad) */}
        <Animated.View
          style={[
            styles.bolita,
            { backgroundColor: theme.colors.green },
            { transform: [{ scale: escala }], opacity: opacidad },
          ]}
        >
          <Icon name="Heart" size={40} color={theme.colors.white} />
        </Animated.View>

        {/* Iconos alrededor (estáticos, decorativos) */}
        {ICONOS.map((c) => (
          <View
            key={c.name}
            style={[styles.icono, { left: c.left, top: c.top }]}
          >
            <Icon
              name={c.name as any}
              size={ICON_SIZE}
              color={(theme.colors as any)[c.color]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  canvas: {
    width: 280,
    height: 280,
  },
  bolita: {
    position: "absolute",
    left: 96,
    top: 96,
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  icono: {
    position: "absolute",
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
});
