import { useEffect, useState } from "react";
import { Animated, Platform } from "react-native";

/**
 * Pulso de opacidad para skeletons (0.4 ↔ 1, 700ms por tramo).
 * Móvil: useNativeDriver → anima en el UI Thread (no bloquea JS).
 * Web: fallback JS (el native driver no está soportado y rompe Animated.loop).
 * Un solo Animated.Value compartido por instancia (KISS).
 */
export function useShimmerOpacity(): Animated.Value {
  const [opacity] = useState(() => new Animated.Value(0.4));
  const useNative = Platform.OS !== "web";

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: useNative,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: useNative,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, useNative]);

  return opacity;
}
