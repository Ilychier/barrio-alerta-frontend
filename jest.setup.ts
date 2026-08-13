/**
 * Setup global de Jest (Fase 0 — Test Harness).
 * Mocks de módulos nativos/Expo que no corren en Node.
 */
import 'react-native-gesture-handler/jestSetup';

// Mock de AsyncStorage (@react-native-async-storage)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock de expo-router (navigation)
jest.mock('expo-router', () => {
  const React = require('react');
  const actual = jest.requireActual('expo-router');
  return {
    ...actual,
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    usePathname: () => '/',
    useFocusEffect: (cb: () => void) => React.useEffect(cb, [cb]),
    Slot: () => React.createElement(React.Fragment, null),
    Stack: { Screen: () => null },
  };
});

// Mock de expo-image
jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { Image: (props: any) => React.createElement(View, props) };
});
