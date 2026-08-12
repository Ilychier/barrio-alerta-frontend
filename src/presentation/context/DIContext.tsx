import React, { createContext, useContext, ReactNode } from 'react';
import { DependencyContainer } from '../../infrastructure/config/dependencyContainer';

/**
 * Composition root: único punto donde la presentación toca infraestructura.
 * Provee el DependencyContainer al árbol; los controllers lo reciben por prop.
 */
const DIContext = createContext<DependencyContainer | null>(null);

export const DIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const container = DependencyContainer.getInstance();
  return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
};

export const useDI = (): DependencyContainer => {
  const container = useContext(DIContext);
  if (!container) throw new Error('useDI must be used within DIProvider');
  return container;
};
