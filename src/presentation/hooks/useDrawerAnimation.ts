import { useCallback, useState } from 'react';
import { Animated } from 'react-native';

const DRAWER_WIDTH = -280;

/**
 * Estado y animación del drawer lateral (hamburguesa).
 * Extraído de _layout.tsx (SRP: el layout orquesta, este hook anima).
 */
export function useDrawerAnimation() {
  // Use state instead of useRef to avoid ESLint rules about accessing ref during render
  const [visible, setVisible] = useState(false);
  const [slideAnim] = useState(() => new Animated.Value(DRAWER_WIDTH));
  const [fadeAnim] = useState(() => new Animated.Value(0));

  const openMenu = useCallback(() => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const closeMenu = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: DRAWER_WIDTH,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  }, [fadeAnim, slideAnim]);

  return { visible, slideAnim, fadeAnim, openMenu, closeMenu };
}
