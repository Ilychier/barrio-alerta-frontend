# Plan de Refactorización Arquitectónica — `barrio-alerta-frontend`

> **Documento generado por:** Arquitecto de Software (rol Hexagonal/DDD/SOLID)
> **Alcance:** Frontend Expo/React Native — módulo `barrio-alerta-frontend`
> **Objetivo:** Restaurar la integridad de la arquitectura hexagonal, los principios SOLID y los criterios KISS/YAGNI sin romper la aplicación en producción.
> **Enfoque metodológico:** Lean + Design Thinking (MVP por iteración) + 5S japonés como fase final de limpieza.

---

## Tabla de Contenidos

1. [Principios Rectores del Plan](#1-principios-rectores-del-plan)
2. [Reglas de Seguridad Transversales](#2-reglas-de-seguridad-transversales)
3. [Inventario de Violaciones (Línea Base)](#3-inventario-de-violaciones-línea-base)
4. [Fase 0 — Verificación Pre-Refactor](#fase-0--verificación-pre-refactor)
5. [Fase 1 — Romper Dependencias Ilegales (Crítico)](#fase-1--romper-dependencias-ilegales-crítico)
6. [Fase 2 — Reemplazar Service Locator por DI Real](#fase-2--reemplazar-service-locator-por-di-real)
7. [Fase 3 — Refactor SRP (Single Responsibility)](#fase-3--refactor-srp-single-responsibility)
8. [Fase 4 — Limpieza de Dominio y Reglas de Negocio](#fase-4--limpieza-de-dominio-y-reglas-de-negocio)
9. [Fase 5 — Consolidación SOLID Restante (OCP/ISP/LSP/DIP)](#fase-5--consolidación-solid-restante-ocpisplspdip)
10. [Fase 6 — 5S Japonés (Limpieza Final)](#fase-6--5s-japonés-limpieza-final)
11. [Checklist de Aceptación Final](#checklist-de-aceptación-final)
12. [Apéndice A — Estrategia de Rollback](#apéndice-a--estrategia-de-rollback)
13. [Apéndice B — Matriz de Trazabilidad de Archivos](#apéndice-b--matriz-de-trazabilidad-de-archivos)

---

## 1. Principios Rectores del Plan

| Principio | Aplicación en este plan |
|---|---|
| **Strangler Fig Pattern** | Cada refactor se hace por envoltura: el nuevo código coexiste con el viejo hasta que este se elimina. Nunca reescribir de golpe. |
| **Test Harness antes de mover** | Antes de tocar cualquier archivo con lógica de dominio, debe existir un test que congele su comportamiento actual. |
| **One Change Per Commit** | Cada commit del repositorio hace una sola cosa. Si toca 3 capas, son 3 commits. |
| **MVP por iteración (Lean)** | Cada fase deja la app deployable. No se acumulan ramas largas. |
| **KISS sobre pureza** | Si una solución purista requiere más complejidad que la actual, se cuestiona antes de implementar. |
| **No Big Bang** | La app debe compilar y funcionar después de cada fase. Si una fase no cumple esto, se subdivide. |
| **5S al final, no antes** | La limpieza (eliminación de código muerto) se hace cuando el refactor está verde. Eliminar antes oculta dependencias. |
| **Delegación estricta** | El arquitecto diseña; el agente `developer` implementa con TDD; el agente `code auditor` valida al final de cada fase. |

---

## 2. Reglas de Seguridad Transversales

> **Estas reglas aplican a TODAS las fases sin excepción. Su violación detiene el plan.**

### 2.1 Protección de Contratos Externos

- **No modificar** las interfaces públicas de `domain/ports/*` sin crear un adaptador puente que mantenga la compatibilidad durante la transición.
- **No renombrar** métodos de repositorios que el backend consume (ej: `crearAlerta`, `obtenerTodas`). El backend es un consumidor implícito del contrato.
- **No eliminar** adaptadores `InMemory*` hasta la Fase 6 (5S). Pueden estar siendo usados en tests o en modo dev.

### 2.2 Protección de Rutas y Navegación

- **No tocar** `app/_layout.tsx` en la Fase 1. Se refactoriza aisladamente en la Fase 3.
- **No cambiar** los nombres de rutas de expo-router (`/mascotas`, `/reportar`, `/alertas-sector`, `/config`, `/`, `/mascotas/[id]`, `/mascotas/reportar`, `/mascotas/mis-reportes`, `/mascotas/historias`). Solo se mueve la implementación, no la URL.
- **No modificar** `app.json` ni `tsconfig.json` paths durante el refactor (salvo Fase 6 si se estandariza).

### 2.3 Protección de Estado Global

- `AuthContext` es la fuente de verdad de sesión. Cualquier refactor debe **preservar el contract** de `AuthContextType` o crear un adapter de compatibilidad.
- `ThemeContext` no se modifica. Es estable y cumple SRP.

### 2.4 Reglas de Commit

- **Prefijo:** `[refactor-fN]` donde N es la fase. Ej: `[refactor-f1] useDashboardController: recibir user via prop en vez de useAuth`.
- **Tamaño:** Máximo 80 líneas de diff por commit. Si el cambio es mayor, se parte.
- **Verificación:** Cada commit debe pasar `tsc --noEmit` y `lint` sin errores nuevos.

### 2.5 Regla de Oro

> **Si en cualquier punto `tsc --noEmit` falla o la app no compila, se detiene el plan, se arregla, y solo se continúa cuando está verde.**

---

## 3. Inventario de Violaciones (Línea Base)

> Registro congelado al inicio. Sirve para validar que cada violación se cerró al final.

### 3.1 Hexagonal — Violaciones de Dirección de Dependencias

| ID | Severidad | Archivo | Línea | Violación |
|---|---|---|---|---|
| H-01 | 🔴 Crítica | `application/controllers/useDashboardController.ts` | 1 | `import { useAuth } from 'presentation/context/AuthContext'` — application → presentation |
| H-02 | 🔴 Crítica | `application/controllers/useConfiguracionController.ts` | 3 | `import { useAuth } from 'presentation/context/AuthContext'` — application → presentation |
| H-03 | 🔴 Crítica | `presentation/screens/RegisterScreen.tsx` | 15 | `import { DependencyContainer }` — presentation → infrastructure |
| H-04 | 🔴 Crítica | `presentation/context/AuthContext.tsx` | 6 | `import { DependencyContainer }` — presentation → infrastructure |
| H-05 | 🔴 Crítica | `presentation/context/AuthContext.tsx` | 7 | `import { TokenStorage }` — presentation → infrastructure |
| H-06 | 🔴 Crítica | `presentation/mascotas/components/RegistroRapidoForm.tsx` | 17 | `import { DependencyContainer }` — presentation → infrastructure |
| H-07 | 🔴 Crítica | `presentation/mascotas/screens/DetalleReporteMascotaScreen.tsx` | 18 | `import { resolverUrlFoto } from infrastructure/mascotas/adapters/mappers` — presentation → infrastructure |
| H-08 | 🔴 Crítica | `presentation/mascotas/screens/DetalleReporteMascotaScreen.tsx` | 21 | `import { DependencyContainer }` — presentation → infrastructure |
| H-09 | 🔴 Crítica | `presentation/mascotas/screens/FeedMascotasScreen.tsx` | 18 | `import { resolverUrlFoto } from infrastructure/mascotas/adapters/mappers` — presentation → infrastructure |

### 3.2 Service Locator (Anti-pattern)

| ID | Severidad | Ubicación | Conteo |
|---|---|---|---|
| SL-01 | 🟠 Alta | `application/**` (12 ocurrencias) | Cada controller invoca `DependencyContainer.getInstance()` dentro del hook |
| SL-02 | 🟠 Alta | `presentation/**` (11 ocurrencias) | Screens y context invocan el container directamente |

### 3.3 SOLID — SRP (God Objects)

| ID | Archivo | Líneas | Responsabilidades mezcladas |
|---|---|---|---|
| SRP-01 | `app/_layout.tsx` | 992 | Routing + auth gate + drawer + 2 modales + modo emergencia + forzar password |
| SRP-02 | `infrastructure/email/alertaEmailTemplate.ts` | 463 | Plantillas HTML de email en el frontend (responsabilidad del backend) |
| SRP-03 | `presentation/mascotas/components/RegistroRapidoForm.tsx` | 600 | 12 estados + validación + upload + geo + envío |
| SRP-04 | `infrastructure/adapters/api/HttpAlertaRepository.ts` | 231 | CRUD + resolver email cuadrante + enviar email + subir evidencias + fallback SOS |
| SRP-05 | `presentation/context/AuthContext.tsx` | 215 | Login + registro + logout + sesión + cambiar password + autenticar con token + almacenar Configuracion |

### 3.4 SOLID — OCP

| ID | Problema |
|---|---|
| OCP-01 | `DependencyContainer` retorna clases concretas de use cases (`DispararSOSUseCase`, no `IDispararSOSUseCase`). No hay interfaces de use case → no se puede sustituir sin modificar el container. |

### 3.5 SOLID — LSP

| ID | Problema |
|---|---|
| LSP-01 | `dependencyContainer.ts:73` — modo `memory` usa `HttpReporteRapidoRepository` (no el InMemory). Inconsistencia: el consumidor espera comportamiento uniforme al cambiar `repoType`. |

### 3.6 SOLID — ISP

| ID | Problema |
|---|---|
| ISP-01 | `IReferenciaRepository` (9 símbolos) es un God Port: categorías + descripciones + usuarios + barrios + cuadrantes + ciudades + países. |

### 3.7 SOLID — DIP

| ID | Problema |
|---|---|
| DIP-01 | Controllers acceden al container concreto en lugar de recibir use cases inyectados |
| DIP-02 | Presentation accede a `TokenStorage` (clase concreta) en lugar de un puerto `ITokenStorage` |

### 3.8 Reglas de Negocio en Capas Equivocadas

| ID | Archivo | Línea | Problema |
|---|---|---|---|
| BN-01 | `presentation/screens/ReportarScreen.tsx` | 41 | `.filter((cat) => cat.id !== 4 && cat.id !== 5)` — regla de dominio hardcodeada con magic numbers |
| BN-02 | `application/controllers/useSOSController.ts` | 72-78 | `Alerta.crearDesdeFormulario(..., 5)` — categoria_id=5 ("todo bien") hardcodeado |
| BN-03 | `application/usecases/DispararSOSUseCase.ts` | 16 | `Math.floor(Math.random() * 1000) + 1000` — generación de IDs en application (responsabilidad de infraestructura) |
| BN-04 | `application/usecases/ReportarIncidenteUseCase.ts` | 21 | Mismo problema de generación de IDs |
| BN-04b | `application/controllers/useSOSController.ts` | 71 | Mismo problema de generación de IDs |

### 3.9 YAGNI / Código Muerto Sospechoso

| ID | Elemento | Cuestión |
|---|---|---|
| Y-01 | `alertaEmailTemplate.ts` (463 líneas) | ¿El backend envía emails? Si sí, esto es duplicación. Si no, el frontend no debería responsabilizarse de plantillas HTML |
| Y-02 | `performanceTracker` en `useSOSController` | ¿Es feature real o debug que llegó a producción? |
| Y-03 | IDs aleatorios en use cases | En modo `api`, el backend genera IDs. Código muerto en producción |
| Y-04 | `InMemory*Repository` (4 archivos) | Si en producción siempre es modo `api`, son peso muerto en el bundle |
| Y-05 | `darkTheme.ts` + `lightTheme.ts` + `ThemeContext` | Sistema dual de theming. ¿Existe toggle visible de dark mode? |

---

## Fase 0 — Verificación Pre-Refactor

> **Objetivo:** Establecer la línea base verde antes de tocar nada. Sin esto, cualquier fallo posterior es indetectable.

### 0.1 Snapshot de Estado Actual

```bash
# Verificar que compila
rtk tsc --noEmit

# Verificar lint
rtk lint

# Si hay tests, correrlos
rtk test
```

**Criterio de salida de Fase 0:** `tsc --noEmit` pasa sin errores. Se registra el output como línea base.

### 0.2 Decisión de Tests (Gate)

> **Pregunta al equipo:** ¿Existe suite de tests automatizada?
>
> - **Si NO:** Antes de Fase 1, se crea un **test de humo mínimo** que cubra:
>   - Render de `_layout` sin crash
>   - Llamada a `useDashboardController`, `useSOSController`, `useReporteController` con mock del container
>   - Un test por cada use case existente (`DispararSOSUseCase`, `ReportarIncidenteUseCase`, `ObtenerAlertasUseCase`, `ActualizarConfiguracionUseCase`) con un `InMemory*Repository` inyectado
>
> - **Si SÍ:** Se validan verdes antes de continuar. Los tests existentes son el test harness.

### 0.3 Commit de Referencia

```
[refactor-f0] snapshot: línea base antes de refactor arquitectónico
```

Este commit (o tag) permite comparar el antes y después, y hace rollback trivial.

---

## Fase 1 — Romper Dependencias Ilegales (Crítico)

> **Objetivo:** Eliminar las 9 violaciones de dirección de dependencias (H-01 a H-09).
> **Estrategia:** Strangler Fig — el nuevo código coexiste con el viejo; el viejo se elimina solo cuando el nuevo está verde.
> **Principio:** Una violación por commit. Si una violación toca 2 archivos, se hace en 2 commits encadenados.

### 1.1 Eliminar `application → presentation` (H-01, H-02)

#### Problema
`useDashboardController` y `useConfiguracionController` importan `useAuth` desde `presentation/context/AuthContext`. La capa de aplicación conoce la capa de presentación → violación hexagonal + dependencia circular (presentation también usa controllers).

#### Solución — Inyección por parámetro

**Archivos a modificar:**

1. `src/application/controllers/useDashboardController.ts`
2. `src/application/controllers/useConfiguracionController.ts`
3. `src/presentation/screens/DashboardScreen.tsx` (caller)
4. `src/presentation/screens/ConfigScreen.tsx` (caller)

**Cambio concreto:**

```ts
// ❌ ANTES — useDashboardController.ts
import { useAuth } from '../../presentation/context/AuthContext';
export function useDashboardController() {
  const { user, barrio, cuadrante, configuracion } = useAuth();
  ...
}

// ✅ DESPUÉS — useDashboardController.ts
// (sin import de presentation)
export interface DashboardControllerDeps {
  user?: Usuario;
  barrio?: Barrio;
  cuadrante?: Cuadrante;
  configuracion?: Configuracion;
}
export function useDashboardController(deps: DashboardControllerDeps) {
  return {
    usuario: deps.user,
    barrio: deps.barrio,
    cuadrante: deps.cuadrante,
    config: deps.config,
    loading: false,
  };
}
```

```tsx
// ❌ ANTES — DashboardScreen.tsx
const { cuadrante } = useDashboardController();

// ✅ DESPUÉS — DashboardScreen.tsx
const auth = useAuth();
const { cuadrante } = useDashboardController({
  user: auth.user ?? undefined,
  barrio: auth.barrio ?? undefined,
  cuadrante: auth.cuadrante ?? undefined,
  configuracion: auth.configuracion ?? undefined,
});
```

Mismo patrón para `useConfiguracionController`: recibe `{ configuracion, setConfiguracion }` via parámetros en vez de importar `useAuth`.

**Commits:**
```
[refactor-f1] useDashboardController: recibir deps via prop en vez de useAuth (H-01)
[refactor-f1] useConfiguracionController: recibir deps via prop en vez de useAuth (H-02)
```

**Verificación post-commit:**
```bash
rtk tsc --noEmit   # debe pasar
rtk grep "from '.*presentation/context/AuthContext'" src/application
# Output debe ser: cero resultados
```

### 1.2 Eliminar `presentation → infrastructure` en `FeedMascotasScreen` (H-09)

#### Problema
`FeedMascotasScreen.tsx:18` importa `resolverUrlFoto` desde `infrastructure/mascotas/adapters/mappers`. Una pantalla conoce un mapper de infraestructura.

#### Solución — Exponer el mapper via use case

`resolverUrlFoto` es una utilidad de presentación de datos. La opción más limpia (KISS) es moverla a la capa `application` como un servicio puro, o exponerla via el controller.

**Opción recomendada (KISS):** Mover `resolverUrlFoto` a `src/application/mascotas/services/UrlResolver.ts` (función pura, sin dependencia de `HttpGenericService` — recibe baseUrl por parámetro).

```ts
// ✅ NUEVO — src/application/mascotas/services/UrlResolver.ts
import { HttpGenericService } from '../../../infrastructure/adapters/api/HttpGenericService';

/**
 * Resuelve la URL pública de una foto.
 * Función pura de aplicación: usa el adapter de infraestructura solo para
 * obtener la baseUrl (boundary control), pero no acopla al consumidor.
 */
export function resolverUrlFoto(fotoUrl: string | null | undefined): string | null {
  if (!fotoUrl) return null;
  if (fotoUrl.startsWith('http://') || fotoUrl.startsWith('https://')) return fotoUrl;
  return `${HttpGenericService.getInstance().getBaseUrl()}${fotoUrl}`;
}
```

**Nota de arquitecto:** Esta función sigue tocando infraestructura (`HttpGenericService`). Es un compromiso temporal. En Fase 2, cuando se introduzca DI real, se inyectará un `IUrlResolver` puerto. Por ahora, el movimiento a `application` rompe la dependencia directa de `presentation → infrastructure`.

**Archivos a modificar:**
1. Crear `src/application/mascotas/services/UrlResolver.ts` (copia de la función)
2. `src/presentation/mascotas/screens/FeedMascotasScreen.tsx` — cambiar import
3. `src/presentation/mascotas/screens/DetalleReporteMascotaScreen.tsx` — cambiar import
4. Dejar la versión de `infrastructure/mascotas/adapters/mappers.ts` intacta por ahora (Fase 6 la elimina)

**Commits:**
```
[refactor-f1] application: extraer resolverUrlFoto a servicio de aplicación (H-09)
[refactor-f1] FeedMascotasScreen: consumir resolverUrlFoto desde application (H-09)
[refactor-f1] DetalleReporteMascotaScreen: consumir resolverUrlFoto desde application (H-07)
```

### 1.3 Eliminar `presentation → infrastructure` en `AuthContext` (H-04, H-05)

#### Problema
`AuthContext.tsx` importa `DependencyContainer` y `TokenStorage` directamente. Es el peor caso: un provider de presentación actúa como repositorio.

#### Solución — Crear `useAuthController` en application

**Nuevo archivo:** `src/application/controllers/useAuthController.ts`

Este controller encapsula toda la lógica de sesión que `AuthContext` tenía dispersa:

```ts
// ✅ src/application/controllers/useAuthController.ts
import { useState, useCallback, useEffect } from 'react';
import { DependencyContainer } from '../../infrastructure/config/dependencyContainer';
import type { Usuario, Barrio, Cuadrante, Configuracion } from '../../domain/entities';

export interface Sesion {
  user: Usuario | null;
  barrio: Barrio | null;
  cuadrante: Cuadrante | null;
  configuracion: Configuracion | null;
  ciudadNombre: string | null;
  paisNombre: string | null;
}

export function useAuthController() {
  const [sesion, setSesion] = useState<Sesion>({...nulls});
  const [loading, setLoading] = useState(true);
  const [passwordTemporal, setPasswordTemporal] = useState(false);

  const container = DependencyContainer.getInstance();
  const authRepo = container.getAuthRepository();

  // loadSession, login, register, logout, cambiarPassword, autenticarConToken
  // (migrar la lógica que estaba en AuthContext, pero ahora en application)

  return { sesion, loading, passwordTemporal, login, register, logout, cambiarPassword, autenticarConToken, setConfiguracion };
}
```

**Migración de `AuthContext`:**
- `AuthContext` queda como un **thin wrapper** de React Context que delega al controller.
- Conserva el contract `AuthContextType` para no romper consumers.
- Elimina imports de `DependencyContainer` y `TokenStorage`.

**Archivos a modificar:**
1. Crear `src/application/controllers/useAuthController.ts`
2. Refactorizar `src/presentation/context/AuthContext.tsx` — usar el controller, eliminar imports de infra

**Commits:**
```
[refactor-f1] application: crear useAuthController (extrae lógica de AuthContext) (H-04, H-05)
[refactor-f1] AuthContext: delegar a useAuthController, eliminar imports de infrastructure (H-04, H-05)
```

**⚠️ Riesgo:** `AuthContext` es consumido por muchas screens. El contract `AuthContextType` debe permanecer idéntico. Verificar con `tsc --noEmit` después del segundo commit.

### 1.4 Eliminar `presentation → infrastructure` en `RegisterScreen` (H-03), `RegistroRapidoForm` (H-06), `DetalleReporteMascotaScreen` (H-08)

#### Problema
Estos componentes invocan `DependencyContainer.getInstance().get*Repository()` directamente en el render/effect.

#### Solución — Un controller por pantalla

**Crear/ampliar controllers en `application`:**

1. `src/application/controllers/useRegisterController.ts` — expone `cargarBarrios`, `cargarCiudades`, `cargarPaises`, `registrar`
2. `src/application/mascotas/controllers/useRegistroRapidoController.ts` — expone `registrarReporteRapido` (envuelve el useCase existente)
3. Ampliar `src/application/mascotas/controllers/useReporteMascotaController.ts` — exponer `obtenerDetalle` para `DetalleReporteMascotaScreen`

**Commits:**
```
[refactor-f1] application: crear useRegisterController para RegisterScreen (H-03)
[refactor-f1] RegisterScreen: delegar a useRegisterController, eliminar DependencyContainer (H-03)
[refactor-f1] application: crear useRegistroRapidoController (H-06)
[refactor-f1] RegistroRapidoForm: delegar a useRegistroRapidoController (H-06)
[refactor-f1] useReporteMascotaController: exponer obtenerDetalle (H-08)
[refactor-f1] DetalleReporteMascotaScreen: consumir controller en vez de DependencyContainer (H-08)
```

### 1.5 Cierre de Fase 1

**Validación:**
```bash
# 1. Compilación
rtk tsc --noEmit

# 2. Verificar que no quedan imports ilegales
rtk grep "from '.*presentation" src/application
# Output esperado: cero resultados

rtk grep "from '.*infrastructure" src/presentation
# Output esperado: cero resultados (salvo theme/components que no son infra)

# 3. Lint
rtk lint

# 4. Smoke test manual
# - Login funciona
# - Dashboard renderiza con SOS
# - Reportar crea alerta
# - Feed mascotas carga
```

**Criterio de salida Fase 1:**
- [ ] `tsc --noEmit` verde
- [ ] Cero imports `application → presentation`
- [ ] Cero imports `presentation → infrastructure` (excluyendo `ThemeContext` y components que son de presentación)
- [ ] App arranca y flujos principales funcionan
- [ ] Commit de referencia: `[refactor-f1] cierre: dependencias hexagonales restauradas`

---

## Fase 2 — Reemplazar Service Locator por DI Real

> **Objetivo:** Eliminar las 23 llamadas a `DependencyContainer.getInstance()` dispersas en application y presentation.
> **Estrategia:** Introducir un `DIContext` de React que provea el container una sola vez en la raíz, y que los controllers consuman via hook. Los use cases siguen recibiendo repos por constructor (eso ya está bien).

### 2.1 Crear `DIContext` en presentation

**Nuevo archivo:** `src/presentation/context/DIContext.tsx`

```tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { DependencyContainer } from '../../infrastructure/config/dependencyContainer';

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
```

**Colocar el provider en `app/_layout.tsx`** (encima de `AuthProvider`):

```tsx
<DIProvider>
  <AuthProvider>
    <ThemeProvider>
      <TabLayout />
    </ThemeProvider>
  </AuthProvider>
</DIProvider>
```

### 2.2 Migrar controllers a `useDI`

**Patrón de migración (por controller):**

```ts
// ❌ ANTES
const container = DependencyContainer.getInstance();

// ✅ DESPUÉS
import { useDI } from '../../presentation/context/DIContext';
const container = useDI();
```

**⚠️ Nota de arquitecto:** Esto sigue siendo acoplamiento a `presentation/context` desde `application`. Es una **violación residual menor** que se resuelve en Fase 5 (DIP) con un `IContainer` puerto. La ventaja de este paso intermedio es que elimina el singleton disperso y centraliza el punto de inyección, permitiendo testear con un `DIProvider` mock.

**Commits (uno por controller):**
```
[refactor-f2] presentation: crear DIContext y DIProvider
[refactor-f2] _layout: envolver con DIProvider
[refactor-f2] useSOSController: migrar a useDI (SL-01)
[refactor-f2] useReporteController: migrar a useDI (SL-01)
[refactor-f2] useSectorAlertsController: migrar a useDI (SL-01)
[refactor-f2] useConfiguracionController: migrar a useDI (SL-01)
[refactor-f2] useUbicacionGeografica: migrar a useDI (SL-01)
[refactor-f2] useFeedMascotasController: migrar a useDI (SL-01)
[refactor-f2] useReporteMascotaController: migrar a useDI (SL-01)
[refactor-f2] useMisReportesMascotaController: migrar a useDI (SL-01)
[refactor-f2] useHistoriasRescateController: migrar a useDI (SL-01)
[refactor-f2] useAuthController: migrar a useDI (SL-02)
[refactor-f2] useRegisterController: migrar a useDI (SL-02)
[refactor-f2] useRegistroRapidoController: migrar a useDI (SL-02)
```

### 2.3 Cierre de Fase 2

**Validación:**
```bash
rtk grep "DependencyContainer.getInstance" src/application src/presentation
# Output esperado: cero (salvo DIContext.tsx que es el único punto legitimo)
```

**Criterio de salida Fase 2:**
- [ ] Solo `DIContext.tsx` y `dependencyContainer.ts` referencian `getInstance`
- [ ] `tsc --noEmit` verde
- [ ] App funciona
- [ ] Commit: `[refactor-f2] cierre: Service Locator eliminado, DI centralizado`

---

## Fase 3 — Refactor SRP (Single Responsibility)

> **Objetivo:** Descomponer los 5 God Objects detectados en SRP-01 a SRP-05.
> **Estrategia:** Extract Class/Component + Extract Method. Cada extracción preserva la API pública.

### 3.1 Descomponer `_layout.tsx` (SRP-01, 992 líneas)

#### Extracciones

| Nuevo archivo | Responsabilidad | Qué se extrae de `_layout.tsx` |
|---|---|---|
| `presentation/navigation/RootRouter.tsx` | Decidir qué mostrar (loading / auth / dashboard) | Bloques `if (loading)`, `if (!isAuthenticated)`, `if (modoEmergencia...)` |
| `presentation/navigation/AppDrawer.tsx` | Drawer hamburguesa + navegación | Bloque `{visible && (...)}` con `Animated.View` |
| `presentation/components/ProximamenteModal.tsx` | Modal "Próximamente" | Modal bloque de alertas |
| `presentation/navigation/EmergencyGate.tsx` | Lógica de modo emergencia + forzar password | `forzarCambioClave`, `vistaEmergencia`, `landingKey` |
| `presentation/hooks/useDrawerAnimation.ts` | Estado de animación del drawer | `slideAnim`, `fadeAnim`, `openMenu`, `closeMenu` |

**`_layout.tsx` queda en < 100 líneas:**

```tsx
export default function RootLayout() {
  return (
    <DIProvider>
      <AuthProvider>
        <ThemeProvider>
          <RootRouter />
        </ThemeProvider>
      </AuthProvider>
    </DIProvider>
  );
}
```

**Commits:**
```
[refactor-f3] _layout: extraer useDrawerAnimation hook (SRP-01)
[refactor-f3] _layout: extraer AppDrawer (SRP-01)
[refactor-f3] _layout: extraer ProximamenteModal (SRP-01)
[refactor-f3] _layout: extraer EmergencyGate (SRP-01)
[refactor-f3] _layout: extraer RootRouter (SRP-01)
[refactor-f3] _layout: reducir a orquestador fino (SRP-01)
```

### 3.2 Mover `alertaEmailTemplate.ts` al backend (SRP-02)

#### Decisión (Gate)

> **Pregunta al equipo:** ¿El backend ya envía emails o depende de que el frontend le pase el HTML renderizado?
>
> - **Si el backend ya renderiza:** Eliminar el archivo del frontend en Fase 6 (5S). El frontend solo pasa `toEmail` + `subject` + `alertaId`.
> - **Si el backend NO renderiza:** Mover el archivo a `infrastructure/email/` (ya está ahí, pero su contenido es HTML que pertenece al backend). Crear ticket al backend para asumir la responsabilidad. Mientras tanto, se mantiene pero se aísla tras un puerto `IEmailRenderer`.

**Acción segura (sin esperar al backend):**

1. Crear puerto `src/domain/ports/IEmailRenderer.ts`
2. `HttpAlertaRepository` deja de importar `alertaEmailTemplate` directamente; recibe `IEmailRenderer` inyectado
3. `alertaEmailTemplate.ts` se mueve a un adapter que implementa `IEmailRenderer`
4. Fase 6 evalúa si se elimina definitivamente

**Commits:**
```
[refactor-f3] domain: crear puerto IEmailRenderer (SRP-02)
[refactor-f3] infrastructure: crear EmailRendererAdapter implementando IEmailRenderer (SRP-02)
[refactor-f3] HttpAlertaRepository: recibir IEmailRenderer inyectado (SRP-02)
```

### 3.3 Descomponer `HttpAlertaRepository` (SRP-04)

#### Extracciones

| Nuevo archivo | Responsabilidad | Qué se extrae |
|---|---|---|
| `infrastructure/adapters/api/HttpEvidenciaRepository.ts` | Subir evidencias | Loop `for (const ev of evidencias)` + endpoint `/evidencias` |
| `infrastructure/adapters/api/HttpNotificacionEmailService.ts` | Resolver email cuadrante + enviar email | `getCuadranteEmailByUsuarioId` + `endpoints.email` |
| `infrastructure/adapters/api/mappers/AlertaMapper.ts` | Mapear response HTTP → entidad Alerta | Función pura de transformación |

**`HttpAlertaRepository` queda en ~80 líneas** y solo hace CRUD de alertas, delegando evidencias y email a sus servicios.

**Commits:**
```
[refactor-f3] infrastructure: extraer AlertaMapper (SRP-04)
[refactor-f3] infrastructure: extraer HttpEvidenciaRepository (SRP-04)
[refactor-f3] infrastructure: extraer HttpNotificacionEmailService (SRP-04)
[refactor-f3] HttpAlertaRepository: reducir a CRUD, delegar evidencias y email (SRP-04)
[refactor-f3] dependencyContainer: registrar nuevos repositorios
```

### 3.4 Descomponer `RegistroRapidoForm.tsx` (SRP-03, 600 líneas)

#### Extracciones

| Nuevo archivo | Responsabilidad |
|---|---|
| `presentation/mascotas/components/RegistroRapidoField.tsx` | Campos individuales (tel, descripción, tipo) |
| `presentation/mascotas/components/FotoPicker.tsx` | Lógica de `expo-image-picker` + validación de tamaño |
| `presentation/mascotas/components/RegistroRapidoValidator.ts` (en application) | Validación de formulario |
| `presentation/mascotas/hooks/useRegistroRapidoForm.ts` | Estado de los 12 inputs (custom hook) |

**`RegistroRapidoForm.tsx` queda en ~150 líneas** orquestando los componentes.

**Commits:**
```
[refactor-f3] presentation: extraer useRegistroRapidoForm hook (SRP-03)
[refactor-f3] presentation: extraer FotoPicker component (SRP-03)
[refactor-f3] application: extraer RegistroRapidoValidator (SRP-03)
[refactor-f3] presentation: extraer RegistroRapidoField (SRP-03)
[refactor-f3] RegistroRapidoForm: reducir a orquestador (SRP-03)
```

### 3.5 Descomponer `AuthContext` (SRP-05)

> Esta fase se hace **después** de 1.3 (que ya movió la lógica a `useAuthController`). Aquí solo se confirma que `AuthContext` es un thin wrapper y se evalúa si `Configuracion` merece su propio context.

**Acción:**
- Confirmar que `AuthContext` solo expone `{...sesion, ...actions}` sin lógica
- Si `Configuracion` se usa en muchos lugares distintos al auth, extraer `ConfigContext` separado
- Si no, dejarlo (KISS)

**Commit:**
```
[refactor-f3] AuthContext: confirmar thin-wrapper, eliminar lógica residual (SRP-05)
```

### 3.6 Cierre de Fase 3

**Validación:**
- [ ] `_layout.tsx` < 100 líneas
- [ ] `HttpAlertaRepository` < 100 líneas
- [ ] `RegistroRapidoForm.tsx` < 200 líneas
- [ ] `AuthContext.tsx` < 80 líneas
- [ ] `tsc --noEmit` verde
- [ ] Commit: `[refactor-f3] cierre: SRP restaurado, God Objects eliminados`

---

## Fase 4 — Limpieza de Dominio y Reglas de Negocio

> **Objetivo:** Mover las 5 reglas de negocio mal ubicadas (BN-01 a BN-04b) al dominio o application correcto, y eliminar la generación de IDs en use cases.

### 4.1 Mover filtro de categorías al dominio (BN-01)

#### Problema
`ReportarScreen.tsx:41`:
```tsx
.filter((cat) => cat.id !== 4 && cat.id !== 5)
```
Magic numbers que representan "ocultar SOS y Todo-bien" del formulario de reporte.

#### Solución

**Opción A (DDD estricto):** Añadir a `Categoria` un flag `esReportableEnFormulario: boolean` que el backend provea.

**Opción B (KISS pragmático):** Crear un método de dominio en una nueva entidad `Categoria` o un value object:

```ts
// src/domain/entities/categoria.ts
export class Categoria {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly icono_referencia: string,
  ) {}

  /** Categorías reservadas (SOS=4, Todo bien=5) no se muestran en el formulario de reporte manual. */
  esReportableEnFormulario(): boolean {
    return this.id !== 4 && this.id !== 5;
  }
}
```

**ReportarScreen.tsx** cambia a:
```tsx
.filter((cat) => cat.esReportableEnFormulario())
```

**Commits:**
```
[refactor-f4] domain: Categoria.esReportableEnFormulario (BN-01)
[refactor-f4] ReportarScreen: usar esReportableEnFormulario en vez de magic numbers (BN-01)
```

### 4.2 Mover creación de alerta "Todo bien" a un use case (BN-02)

#### Problema
`useSOSController.ts:72-78` crea una `Alerta.crearDesdeFormulario(..., 5)` dentro del controller. La regla "categoria 5 = fin de emergencia" es de dominio.

#### Solución

**Nuevo use case:** `src/application/usecases/FinalizarEmergenciaUseCase.ts`

```ts
export class FinalizarEmergenciaUseCase {
  constructor(private readonly alertaRepo: IAlertaRepository) {}

  async execute(usuarioId: number): Promise<void> {
    // El ID lo asigna el backend (modo api) o el repo in-memory.
    // No se genera aquí.
    await this.alertaRepo.crearAlerta(
      Alerta.crearDesdeFormulario(
        0, // placeholder — el backend lo asigna
        '¡Todo está bien ahora! Emergencia finalizada.',
        new Date().toISOString(),
        usuarioId,
        5, // TODO Fase 4.5: extraer a constante de dominio CATEGORIA_FIN_EMERGENCIA
      ),
    );
  }
}
```

**`useSOSController`** delega a este useCase.

**Commits:**
```
[refactor-f4] application: crear FinalizarEmergenciaUseCase (BN-02)
[refactor-f4] useSOSController: delegar finalización a useCase (BN-02)
[refactor-f4] dependencyContainer: registrar FinalizarEmergenciaUseCase
```

### 4.3 Eliminar generación de IDs en use cases (BN-03, BN-04, BN-04b)

#### Problema
`DispararSOSUseCase`, `ReportarIncidenteUseCase`, `useSOSController` generan IDs con `Math.random()`. En modo `api` (producción), el backend asigna el ID. Este código está muerto y ensucia el dominio.

#### Solución

**Cambiar el contrato:** Los use cases no pasan ID a la entidad. El repositorio lo asigna.

```ts
// ❌ ANTES — DispararSOSUseCase
const newId = Math.floor(Math.random() * 1000) + 1000;
const sosAlert = Alerta.crearEmergenciaSOS(newId, ...);

// ✅ DESPUÉS — DispararSOSUseCase
// El ID lo asigna el backend o el InMemoryRepository.
// El use case construye un "borrador" sin ID.
const sosAlert = Alerta.crearEmergenciaSOSSinId(...);
// o bien, el repo.crearAlerta ignora el ID entrante y devuelve la entidad con ID real
const saved = await this.alertaRepo.crearAlerta(sosAlert);
return { alerta: saved };
```

**⚠️ Decisión de arquitecto:** Esto requiere tocar el factory method `Alerta.crearEmergenciaSOS`. Hay dos caminos:

- **Camino A (limpio):** Añadir `Alerta.crearEmergenciaSOSDraft(...)` sin ID. El repo devuelve la entidad persistida con ID.
- **Camino B (KISS):** El repo siempre devuelve la entidad persistida; el use case ignora el ID que pasó. Menos cambio, mismo resultado.

**Recomendado: Camino B** (KISS). El use case pasa un ID placeholder (0) y usa el `saved` que devuelve el repo.

**Commits:**
```
[refactor-f4] DispararSOSUseCase: eliminar Math.random, usar ID del repo (BN-03)
[refactor-f4] ReportarIncidenteUseCase: eliminar Math.random, usar ID del repo (BN-04)
[refactor-f4] useSOSController: eliminar Math.random (BN-04b)
```

### 4.4 Cierre de Fase 4

**Validación:**
```bash
rtk grep "Math.random" src/application src/domain
# Output esperado: cero

rtk grep "cat.id !== 4 && cat.id !== 5" src/presentation
# Output esperado: cero
```

- [ ] `tsc --noEmit` verde
- [ ] Commit: `[refactor-f4] cierre: reglas de negocio en su capa correcta`

---

## Fase 5 — Consolidación SOLID Restante (OCP/ISP/LSP/DIP)

> **Objetivo:** Cerrar las violaciones restantes de SOLID que no se abordaron en fases previas.

### 5.1 OCP — Interfaces para Use Cases (OCP-01)

**Crear interfaces para cada use case** en `src/application/usecases/contracts/`:

```ts
// src/application/usecases/contracts/IDispararSOSUseCase.ts
export interface IDispararSOSUseCase {
  execute(request: DispararSOSRequest): Promise<DispararSOSResponse>;
}
```

`DependencyContainer` retorna estas interfaces, no las clases concretas. Permite mockear en tests sin tocar el container.

**Commits:**
```
[refactor-f5] application: crear interfaces de use cases (OCP-01)
[refactor-f5] dependencyContainer: retornar interfaces en vez de clases concretas (OCP-01)
```

### 5.2 LSP — Corregir inconsistencia en modo memory (LSP-01)

**`dependencyContainer.ts:73`:**
```ts
// ❌ ANTES
case 'memory':
  ...
  this._reporteRapidoRepo = new HttpReporteRapidoRepository(); // inconsistencia

// ✅ DESPUÉS
case 'memory':
  ...
  this._reporteRapidoRepo = new InMemoryReporteRapidoRepository();
```

**Pre-requisito:** Crear `InMemoryReporteRapidoRepository` si no existe.

**Commits:**
```
[refactor-f5] infrastructure: crear InMemoryReporteRapidoRepository (LSP-01)
[refactor-f5] dependencyContainer: usar InMemoryReporteRapidoRepository en modo memory (LSP-01)
```

### 5.3 ISP — Segregar `IReferenciaRepository` (ISP-01)

**Estado actual:** Un puerto con 9 métodos (categorias, descripciones, usuarios, barrios, cuadrantes, ciudades, países).

**Segregación propuesta:**

| Nuevo puerto | Métodos |
|---|---|
| `ICategoriaRepository` | `getCategorias()`, `getDescripcionesPorCategoria(id)`, `getCategoriaById(id)` |
| `IGeografiaRepository` | `getBarrioById(id)`, `getCuadranteById(id)`, `getCiudades()`, `getPaises()` |
| `IUsuarioRepository` | `getUsuarioById(id)` |

**Estrategia de migración (Strangler):**
1. Crear los 3 nuevos puertos
2. Hacer que `IReferenciaRepository` **extienda** los 3 (compatibilidad)
3. Migrar consumers uno por uno al puerto específico
4. Fase 6: eliminar `IReferenciaRepository` cuando nadie lo use

**Commits:**
```
[refactor-f5] domain: segregar IReferenciaRepository en ICategoria + IGeografia + IUsuario (ISP-01)
[refactor-f5] IReferenciaRepository: extender nuevos puertos por compatibilidad (ISP-01)
[refactor-f5] useReporteController: consumir ICategoriaRepository (ISP-01)
[refactor-f5] useSectorAlertsController: consumir IGeografiaRepository + IUsuarioRepository (ISP-01)
[refactor-f5] ObtenerAlertasUseCase: consumir puertos segregados (ISP-01)
```

### 5.4 DIP — Puerto para `TokenStorage` (DIP-02)

**Crear:** `src/domain/ports/ITokenStorage.ts`

```ts
export interface ITokenStorage {
  getToken(): Promise<string | null>;
  setToken(token: string): Promise<void>;
  clearToken(): Promise<void>;
}
```

`TokenStorage` implementa esta interfaz. `useAuthController` (creado en Fase 1) recibe `ITokenStorage` inyectado en vez de la clase concreta.

**Commits:**
```
[refactor-f5] domain: crear puerto ITokenStorage (DIP-02)
[refactor-f5] TokenStorage: implementar ITokenStorage (DIP-02)
[refactor-f5] useAuthController: consumir ITokenStorage inyectado (DIP-02)
[refactor-f5] dependencyContainer: exponer ITokenStorage (DIP-02)
```

### 5.5 DIP — Resolver la violación residual de Fase 2 (DIP-01)

**En Fase 2**, los controllers importan `useDI` desde `presentation/context/DIContext`. Esto es `application → presentation` (violación residual que advertimos).

**Solución final:** Mover `DIContext` a una capa neutra o usar inyección por props.

**Opción recomendada (KISS):** Inyectar el container via props del hook:

```ts
// ❌ ANTES (Fase 2)
const container = useDI();

// ✅ DESPUÉS (Fase 5)
export function useSOSController(
  container: DependencyContainer,
  currentUserId: number,
  onSuccess?: () => void,
) { ... }
```

**Esto hace los controllers funciones puras** que reciben sus dependencias. La pantalla llama `useSOSController(useDI(), userId)`.

**Commits:**
```
[refactor-f5] controllers: recibir container via prop en vez de useDI (DIP-01)
[refactor-f5] screens: pasar useDI() a controllers (DIP-01)
[refactor-f5] eliminar DIContext (ya no necesario) (DIP-01)
```

### 5.6 Cierre de Fase 5

**Validación:**
```bash
# OCP: interfaces de use cases creadas
rtk grep "interface I.*UseCase" src/application
# Output esperado: 9+ resultados

# ISP: IReferenciaRepository ya no se usa directamente
rtk grep "IReferenciaRepository" src/application src/presentation
# Output esperado: solo en dependencyContainer y archivo de compatibilidad

# LSP: modo memory consistente
# (verificación manual del switch en dependencyContainer)

# DIP: controllers no importan de presentation
rtk grep "from '.*presentation" src/application
# Output esperado: cero
```

- [ ] `tsc --noEmit` verde
- [ ] Commit: `[refactor-f5] cierre: SOLID consolidado`

---

## Fase 6 — 5S Japonés (Limpieza Final)

> **Metodología 5S aplicada a código.** Se ejecuta **solo después** de que Fases 1-5 están verde. Eliminar código antes oculta dependencias y rompe la app.

### Seiri (整理) — Clasificar: Separar lo necesario de lo innecesario

> **Acción:** Identificar todo el código que quedó obsoleto tras el refactor.

**Inventario de candidatos a eliminación:**

| Archivo / Elemento | Criterio | Decisión |
|---|---|---|
| `infrastructure/mascotas/adapters/mappers.ts::resolverUrlFoto` | Duplicada en `application/mascotas/services/UrlResolver.ts` desde Fase 1 | **Eliminar** si nadie la importa |
| `infrastructure/email/alertaEmailTemplate.ts` | Si el backend ya renderiza email | **Confirmar con equipo** → eliminar o aislar |
| `IReferenciaRepository` | Sustituido por 3 puertos segregados en Fase 5 | **Eliminar** si cero consumers |
| `DIContext.tsx` | Eliminado en Fase 5.5 | **Eliminar archivo** |
| `performanceTracker` en `useSOSController` | ¿Es feature real? | **Confirmar con equipo** → eliminar o documentar |
| IDs aleatorios residuales | Eliminados en Fase 4, pero buscar referencias | **Eliminar** cualquier leftover |
| `darkTheme.ts` + `lightTheme.ts` + `ThemeContext` | ¿Existe toggle visible? | **Confirmar con equipo** → eliminar dark si no se usa |
| `InMemory*Repository` (5 archivos) | ¿Se usan en tests o dev? | **Mantener** si hay tests; **eliminar** del bundle de producción si no |
| Comentarios explicativos del refactor | `// ANTES`, `// DESPUÉS`, TODO temporales | **Eliminar** todos |

**Comando de verificación:**
```bash
# Encontrar imports no usados
rtk tsc --noUnusedLocals --noUnusedParameters

# Encontrar archivos no importados desde ningún lado
# (usar dependency-cruiser o madge)
npx madge --circular --extensions ts,tsx src/app/_layout.tsx
```

**Commit:**
```
[refactor-f6-seiri] clasificar: inventario de código obsoleto completado
```

### Seiton (整頓) — Ordenar: Un lugar para cada cosa y cada cosa en su lugar

> **Acción:** Estandarizar la estructura de carpetas y convenciones de naming.

**Estructura objetivo final:**

```
src/
├── app/                          # Expo Router (solo routing, sin lógica)
│   ├── _layout.tsx               # < 100 líneas
│   ├── index.tsx
│   ├── alertas-sector.tsx
│   ├── config.tsx
│   ├── reportar.tsx
│   └── mascotas/
│       ├── [id].tsx
│       ├── historias.tsx
│       ├── index.tsx
│       ├── mis-reportes.tsx
│       └── reportar.tsx
├── application/                  # Casos de uso y controladores
│   ├── controllers/              # Hooks de React (application → domain)
│   │   ├── useAuthController.ts
│   │   ├── useDashboardController.ts
│   │   ├── useReporteController.ts
│   │   ├── useSectorAlertsController.ts
│   │   ├── useSOSController.ts
│   │   ├── useConfiguracionController.ts
│   │   └── useRegisterController.ts
│   ├── mascotas/
│   │   ├── controllers/
│   │   ├── services/             # UrlResolver y utilidades puras
│   │   └── usecases/
│   ├── usecases/
│   │   ├── contracts/            # Interfaces I*UseCase (OCP)
│   │   ├── ActualizarConfiguracionUseCase.ts
│   │   ├── DispararSOSUseCase.ts
│   │   ├── FinalizarEmergenciaUseCase.ts
│   │   ├── ObtenerAlertasUseCase.ts
│   │   └── ReportarIncidenteUseCase.ts
│   └── ubicacion/
├── domain/                       # Entidades y puertos (zero dependencias)
│   ├── entities/
│   ├── mascotas/
│   │   ├── entities/
│   │   └── ports/
│   └── ports/
├── infrastructure/               # Adaptadores concretos
│   ├── adapters/
│   │   ├── api/
│   │   ├── memory/
│   │   ├── mappers/              # AlertaMapper, etc.
│   │   └── storage/
│   ├── config/
│   │   └── dependencyContainer.ts
│   └── email/                    # Solo si se mantiene tras Seiri
└── presentation/                 # UI (solo consume application)
    ├── components/
    │   ├── atomic/
    │   ├── layout/
    │   └── molecules/
    ├── context/
    │   ├── AuthContext.tsx       # Thin wrapper
    │   └── ThemeContext.tsx
    ├── hooks/
    ├── mascotas/
    │   ├── components/
    │   └── screens/
    ├── navigation/               # RootRouter, AppDrawer, EmergencyGate
    ├── screens/
    └── theme/
```

**Convenciones de naming:**

| Tipo | Convención | Ejemplo |
|---|---|---|
| Puerto (interface) | `I<Nombre>Repository` / `I<Nombre>Service` | `IAlertaRepository`, `IEmailRenderer` |
| Use case | `<Verbo><Sustantivo>UseCase` | `DispararSOSUseCase` |
| Interface de use case | `I<Verbo><Sustantivo>UseCase` | `IDispararSOSUseCase` |
| Controller (hook) | `use<Entidad>Controller` | `useSOSController` |
| Adaptador HTTP | `Http<Nombre>Repository` | `HttpAlertaRepository` |
| Adaptador InMemory | `InMemory<Nombre>Repository` | `InMemoryAlertaRepository` |
| Entidad | `<Sustantivo>` (PascalCase, sustantivo) | `Alerta`, `ReporteMascota` |
| Mapper | `<Entidad>Mapper` | `AlertaMapper` |
| Screen | `<Nombre>Screen` | `DashboardScreen` |
| Componente atómico | `<Nombre>` (PascalCase) | `Icon`, `ToggleSwitch` |
| Componente molecular | `<Nombre>` | `AlertCard`, `SOSButton` |

**Commits:**
```
[refactor-f6-seiton] estandarizar estructura de carpetas
[refactor-f6-seiton] renombrar archivos según convención
[refactor-f6-seiton] actualizar imports tras reorganización
```

### Seiso (清掃) — Limpiar: Eliminar deuda técnica y código muerto

> **Acción:** Ejecutar las eliminaciones identificadas en Seiri.

**Limpieza técnica:**

```bash
# 1. Eliminar imports no usados
rtk tsc --noUnusedLocals --noUnusedParameters
# Corregir todos los warnings

# 2. Eliminar archivos no importados
# (verificar con madge)

# 3. Eliminar comentarios de refactor
# Buscar: "// ANTES", "// DESPUÉS", "TODO refactor", "FIXME"
rtk grep -r "TODO refactor\|FIXME\|// ANTES\|// DESPUÉS" src/

# 4. Eliminar console.log de debug
# (mantener console.warn de errores legitimos)
rtk grep "console.log" src/
# Revisar caso por caso

# 5. Eliminar código comentado
rtk grep -r "^//.*\(function\|const\|class\|import\)" src/
```

**Limpieza de duplicación:**

| Duplicado | Archivo a mantener | Archivo a eliminar |
|---|---|---|
| `resolverUrlFoto` | `application/mascotas/services/UrlResolver.ts` | `infrastructure/mascotas/adapters/mappers.ts` (solo esa función) |
| `IReferenciaRepository` | Puertos segregados (Fase 5) | `IReferenciaRepository.ts` (si cero consumers) |

**Commits:**
```
[refactor-f6-seiso] eliminar imports no usados
[refactor-f6-seiso] eliminar código comentado y TODOs de refactor
[refactor-f6-seiso] eliminar duplicación de resolverUrlFoto
[refactor-f6-seiso] eliminar IReferenciaRepository (reemplazado por puertos segregados)
[refactor-f6-seiso] eliminar console.log de debug
```

### Seiketsu (清潔) — Estandarizar: Crear reglas que mantengan el orden

> **Acción:** Institucionalizar las convenciones para que el desorden no vuelva.

**1. Reglas de lint arquitectónico (ESLint):**

Crear `.eslintrc.architecture.js` con reglas `no-restricted-imports`:

```js
// .eslintrc.architecture.js
module.exports = {
  overrides: [
    {
      // domain NO puede importar de nadie
      files: ['src/domain/**/*'],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [
            { group: ['**/application/**', '**/infrastructure/**', '**/presentation/**'], message: 'Domain no puede depender de capas externas.' },
          ],
        }],
      },
    },
    {
      // application NO puede importar de presentation o infrastructure (solo domain)
      files: ['src/application/**/*'],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [
            { group: ['**/presentation/**'], message: 'Application no puede depender de presentation.' },
            { group: ['**/infrastructure/**'], message: 'Application no puede depender de infrastructure directamente. Use DI.' },
          ],
        }],
      },
    },
    {
      // presentation NO puede importar de infrastructure (solo application y domain)
      files: ['src/presentation/**/*'],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [
            { group: ['**/infrastructure/**'], message: 'Presentation no puede depender de infrastructure. Use un controller.' },
          ],
        }],
      },
    },
  ],
};
```

**2. Regla de tamaño de archivo (límite blando):**

Añadir a ESLint:
```js
'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
```

Cualquier archivo > 300 líneas genera warning. Dispara refactor antes de convertirse en God Object.

**3. Regla de complejidad ciclomática:**
```js
'complexity': ['warn', 10],
```

**4. Documentar la arquitectura:**

Crear `src/ARCHITECTURE.md` con:
- Diagrama de capas y flechas de dependencia permitidas
- Regla de oro: "domain no importa de nadie; application solo de domain; presentation solo de application+domain; infrastructure implementa domain"
- Lista de puertos y adaptadores
- Patrón de inyección: "los controllers reciben el container via prop"

**Commits:**
```
[refactor-f6-seiketsu] eslint: reglas no-restricted-imports para capas
[refactor-f6-seiketsu] eslint: reglas max-lines y complexity
[refactor-f6-seiketsu] docs: crear ARCHITECTURE.md con reglas del proyecto
```

### Shitsuke (躾) — Disciplina: Asegurar el cumplimiento continuo

> **Acción:** Garantizar que las reglas se mantienen en el tiempo sin supervisión manual.

**1. CI Pipeline — Gate arquitectónico:**

Añadir al CI (`.github/workflows/` o equivalente):

```yaml
- name: Architecture lint
  run: npx eslint --config .eslintrc.architecture.js src/
```

**2. Pre-commit hook:**

```bash
# .husky/pre-commit
npx eslint --config .eslintrc.architecture.js src/ && npx tsc --noEmit
```

**3. Test de arquitectura automatizado (opcional, más robusto):**

Usar `dependency-cruiser` para validar reglas de dependencias:

```json
// .dependency-cruiser.js
{
  "forbidden": [
    {
      "name": "domain-to-outer",
      "comment": "Domain no puede depender de capas externas",
      "severity": "error",
      "from": { "path": "^src/domain/" },
      "to": { "path": "^src/(application|infrastructure|presentation)/" }
    },
    {
      "name": "application-to-presentation",
      "comment": "Application no puede depender de presentation",
      "severity": "error",
      "from": { "path": "^src/application/" },
      "to": { "path": "^src/presentation/" }
    },
    {
      "name": "presentation-to-infrastructure",
      "comment": "Presentation no puede depender de infrastructure",
      "severity": "error",
      "from": { "path": "^src/presentation/" },
      "to": { "path": "^src/infrastructure/" }
    }
  ]
}
```

**4. Revisión periódica:**

- Mensual: correr `madge --circular` para detectar dependencias circulares
- Mensual: revisar archivos > 300 líneas
- Trimestral: auditoría con agente `code auditor`

**Commits:**
```
[refactor-f6-shitsuke] ci: gate arquitectónico en pipeline
[refactor-f6-shitsuke] husky: pre-commit con eslint arquitectónico
[refactor-f6-shitsuke] dependency-cruiser: reglas de dependencias automatizadas
```

### Cierre de Fase 6 (y del plan)

**Validación final 5S:**
- [ ] Seiri: cero código muerto identificado
- [ ] Seiton: estructura de carpetas cumple el estándar
- [ ] Seiso: `tsc --noUnusedLocals` verde, cero TODOs de refactor
- [ ] Seiketsu: ESLint arquitectónico pasa, `ARCHITECTURE.md` existe
- [ ] Shitsuke: CI gate activo, pre-commit hook instalado

**Commit final:**
```
[refactor-f6] cierre: 5S completado, arquitectura estabilizada
```

---

## Checklist de Aceptación Final

> Checklist que debe estar 100% verde antes de declarar el refactor completo.

### Hexagonal

- [ ] Cero imports `application → presentation`
- [ ] Cero imports `presentation → infrastructure`
- [ ] Cero imports `domain → {application, infrastructure, presentation}`
- [ ] `DependencyContainer.getInstance()` aparece solo en `DIContext` (o equivalente) y `dependencyContainer.ts`

### SOLID

- [ ] **S:** Ningún archivo > 300 líneas (salvo excepción justificada)
- [ ] **S:** Ninguna clase/método con > 5 responsabilidades
- [ ] **O:** Todos los use cases tienen interfaz (`I*UseCase`)
- [ ] **L:** Modo `memory` usa solo adaptadores InMemory
- [ ] **I:** `IReferenciaRepository` segregado en 3 puertos
- [ ] **D:** Controllers reciben dependencias via props, no via Service Locator
- [ ] **D:** `TokenStorage` implemente `ITokenStorage`

### Reglas de Negocio

- [ ] Cero magic numbers en presentación (`cat.id !== 4`)
- [ ] Cero `Math.random` en use cases
- [ ] Cero creación de entidades de dominio en controllers

### KISS / YAGNI

- [ ] `alertaEmailTemplate.ts` eliminado o justificado
- [ ] `performanceTracker` eliminado o justificado
- [ ] `darkTheme` eliminado o toggle visible existe
- [ ] `InMemory*` repos fuera del bundle de producción o justificados

### 5S

- [ ] **Seiri:** Inventario de obsoletos completado y ejecutado
- [ ] **Seiton:** Estructura de carpetas estandarizada
- [ ] **Seiso:** Cero imports no usados, cero TODOs de refactor
- [ ] **Seiketsu:** ESLint arquitectónico + `ARCHITECTURE.md` activos
- [ ] **Shitsuke:** CI gate + pre-commit hook operativos

### Funcional

- [ ] `tsc --noEmit` verde
- [ ] `eslint` verde (cero errores, cero warnings nuevos)
- [ ] App compila y arranca
- [ ] Login funciona
- [ ] Dashboard + SOS funciona
- [ ] Reportar incidente funciona
- [ ] Alertas del sector funciona
- [ ] Configuración funciona
- [ ] Feed mascotas funciona
- [ ] Reportar mascota funciona
- [ ] Mis reportes funciona
- [ ] Detalle mascota funciona
- [ ] Historias de rescate funciona
- [ ] Registro rápido funciona
- [ ] Modo emergencia funciona

---

## Apéndice A — Estrategia de Rollback

### Rollback por commit

Cada fase termina con un commit de cierre `[refactor-fN] cierre: ...`. Si una fase introduce un bug imposible de arreglar rápidamente:

```bash
# Volver al cierre de la fase anterior
git reset --hard <commit-hash-fase-anterior>
```

### Rollback por tag (recomendado)

Al final de cada fase, crear un tag:

```bash
git tag refactor-f1-complete
git tag refactor-f2-complete
# ...
```

Rollback:
```bash
git reset --hard refactor-f1-complete
```

### Rollback del plan completo

El commit `[refactor-f0] snapshot: línea base antes de refactor arquitectónico` (o tag `pre-refactor`) permite volver al estado original:

```bash
git reset --hard pre-refactor
```

### Rollback seguro en producción

Si el refactor va a producción por fases (recomendado):

1. Cada fase se mergea a `main` solo cuando está verde
2. Usar **feature flags** para el comportamiento nuevo (ej: nuevo `useAuthController`) que permita volver al viejo `AuthContext` sin redeploy
3. Mantener `pre-refactor` tag accesible por 2 releases

---

## Apéndice B — Matriz de Trazabilidad de Archivos

> Cada archivo tocado en el plan, con la fase y la violación que cierra.

| Archivo | Fase | Violación que cierra |
|---|---|---|
| `application/controllers/useDashboardController.ts` | F1 | H-01 |
| `application/controllers/useConfiguracionController.ts` | F1 | H-02 |
| `presentation/screens/DashboardScreen.tsx` | F1 | H-01 (caller) |
| `presentation/screens/ConfigScreen.tsx` | F1 | H-02 (caller) |
| `application/mascotas/services/UrlResolver.ts` (nuevo) | F1 | H-09, H-07 |
| `presentation/mascotas/screens/FeedMascotasScreen.tsx` | F1, F4 | H-09 |
| `presentation/mascotas/screens/DetalleReporteMascotaScreen.tsx` | F1 | H-07, H-08 |
| `application/controllers/useAuthController.ts` (nuevo) | F1 | H-04, H-05 |
| `presentation/context/AuthContext.tsx` | F1, F3 | H-04, H-05, SRP-05 |
| `application/controllers/useRegisterController.ts` (nuevo) | F1 | H-03 |
| `presentation/screens/RegisterScreen.tsx` | F1 | H-03 |
| `application/mascotas/controllers/useRegistroRapidoController.ts` (nuevo) | F1 | H-06 |
| `presentation/mascotas/components/RegistroRapidoForm.tsx` | F1, F3 | H-06, SRP-03 |
| `application/mascotas/controllers/useReporteMascotaController.ts` | F1 | H-08 |
| `presentation/context/DIContext.tsx` (nuevo, luego eliminado) | F2, F5 | SL-01, SL-02 |
| `app/_layout.tsx` | F2, F3 | SRP-01 |
| `application/controllers/*` (todos) | F2 | SL-01 |
| `presentation/navigation/RootRouter.tsx` (nuevo) | F3 | SRP-01 |
| `presentation/navigation/AppDrawer.tsx` (nuevo) | F3 | SRP-01 |
| `presentation/navigation/EmergencyGate.tsx` (nuevo) | F3 | SRP-01 |
| `presentation/components/ProximamenteModal.tsx` (nuevo) | F3 | SRP-01 |
| `presentation/hooks/useDrawerAnimation.ts` (nuevo) | F3 | SRP-01 |
| `domain/ports/IEmailRenderer.ts` (nuevo) | F3 | SRP-02 |
| `infrastructure/adapters/api/EmailRendererAdapter.ts` (nuevo) | F3 | SRP-02 |
| `infrastructure/adapters/api/HttpEvidenciaRepository.ts` (nuevo) | F3 | SRP-04 |
| `infrastructure/adapters/api/HttpNotificacionEmailService.ts` (nuevo) | F3 | SRP-04 |
| `infrastructure/adapters/api/mappers/AlertaMapper.ts` (nuevo) | F3 | SRP-04 |
| `infrastructure/adapters/api/HttpAlertaRepository.ts` | F3 | SRP-04 |
| `presentation/mascotas/hooks/useRegistroRapidoForm.ts` (nuevo) | F3 | SRP-03 |
| `presentation/mascotas/components/FotoPicker.tsx` (nuevo) | F3 | SRP-03 |
| `application/mascotas/validators/RegistroRapidoValidator.ts` (nuevo) | F3 | SRP-03 |
| `presentation/mascotas/components/RegistroRapidoField.tsx` (nuevo) | F3 | SRP-03 |
| `domain/entities/categoria.ts` | F4 | BN-01 |
| `presentation/screens/ReportarScreen.tsx` | F1, F4 | BN-01 |
| `application/usecases/FinalizarEmergenciaUseCase.ts` (nuevo) | F4 | BN-02 |
| `application/controllers/useSOSController.ts` | F4 | BN-02, BN-04b |
| `application/usecases/DispararSOSUseCase.ts` | F4 | BN-03 |
| `application/usecases/ReportarIncidenteUseCase.ts` | F4 | BN-04 |
| `application/usecases/contracts/*` (nuevos) | F5 | OCP-01 |
| `infrastructure/config/dependencyContainer.ts` | F1, F3, F5 | OCP-01, LSP-01 |
| `infrastructure/mascotas/adapters/memory/InMemoryReporteRapidoRepository.ts` (nuevo) | F5 | LSP-01 |
| `domain/ports/ICategoriaRepository.ts` (nuevo) | F5 | ISP-01 |
| `domain/ports/IGeografiaRepository.ts` (nuevo) | F5 | ISP-01 |
| `domain/ports/IUsuarioRepository.ts` (nuevo) | F5 | ISP-01 |
| `domain/ports/IReferenciaRepository.ts` | F5, F6 | ISP-01 |
| `domain/ports/ITokenStorage.ts` (nuevo) | F5 | DIP-02 |
| `infrastructure/adapters/storage/TokenStorage.ts` | F5 | DIP-02 |
| `.eslintrc.architecture.js` (nuevo) | F6 | Seiketsu |
| `src/ARCHITECTURE.md` (nuevo) | F6 | Seiketsu |
| `.dependency-cruiser.js` (nuevo) | F6 | Shitsuke |

---

## Notas Finales del Arquitecto

1. **El plan es iterativo, no lineal.** Si en Fase 3 descubres una violación de Fase 1 que se reintrodujo, se vuelve a Fase 1 para ese caso puntual. No se avanza con deuda.

2. **La Fase 6 (5S) no es opcional.** Sin ella, el desorden vuelve en 3 meses. Las reglas de lint arquitectónico (`Seiketsu`) y el CI gate (`Shitsuke`) son la garantía de durabilidad.

3. **KISS prima sobre pureza.** Si una extracción de Fase 3 genera más complejidad de la que elimina, se cuestiona. Ej: si `ConfigContext` separado añade un provider más sin beneficio claro, se deja en `AuthContext`.

4. **Cada fase deja la app deployable.** Si una fase no puede completarse sin romper la app, se subdivide hasta que cada sub-paso sea seguro.

5. **Delegación:** La implementación de cada commit se delega al agente `developer` con TDD. La validación final de cada fase se delega al agente `code auditor`. El arquitecto no edita código.

---

*Fin del documento.*