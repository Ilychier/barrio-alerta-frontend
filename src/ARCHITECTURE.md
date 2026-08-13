# Arquitectura del Frontend — Barrio Alerta

> **Regla de oro:** `domain` no importa de nadie; `application` solo importa de `domain` (+ tipos de `infrastructure` para el container inyectado); `presentation` solo importa de `application` y `domain` (excepción: `DIContext`); `infrastructure` implementa `domain`.

## Capas

```
presentation/   → screens, components, context (AuthContext thin-wrapper), theme
application/    → controllers (React hooks), usecases (+ contracts/ para OCP), services puros
domain/         → entities, ports (interfaces) — ZERO dependencias externas
infrastructure/ → adapters (http/memory/storage), config (DependencyContainer), email
```

## Reglas de dependencia (Hexagonal)

| Capa | Puede importar | No puede importar |
|---|---|---|
| `domain` | nada externo | `application`, `infrastructure`, `presentation` |
| `application` | `domain` | `presentation`, `infrastructure` (excepto tipos del container) |
| `presentation` | `application`, `domain` | `infrastructure` (solo `DIContext` es composition root) |
| `infrastructure` | `domain` | — |

Estas reglas están **automatizadas** en `eslint.config.js` (`no-restricted-imports`) y fallan el build si se violan.

## Patrones obligatorios

1. **Inyección de dependencias por prop:** los controllers reciben `container: DependencyContainer` como primer parámetro. La pantalla lo obtiene con `useDI()` (única excepción al import de infraestructura).
2. **Use cases con interfaz:** cada use case en `application/usecases/**` tiene su contrato en `contracts/` (OCP). El container retorna interfaces, no clases.
3. **Puertos segregados (ISP):** `ICategoriaRepository`, `IGeografiaRepository`, `IUsuarioRepository`, `ITokenStorage`, `IEmailRenderer`... Un puerto = una responsabilidad.
4. **Reglas de negocio en dominio:** si una regla usa magic numbers (ej: categorías 4 y 5), vive como método de la entidad (`Categoria.esReportableEnFormulario()`), nunca en la UI.
5. **IDs los asigna el backend:** los use cases construyen borradores con id `0`; el repo devuelve la entidad persistida.

## Estructura de referencia

```
src/
├── app/                    # Expo Router (solo routing)
├── application/
│   ├── controllers/        # use*Controller — hooks React
│   ├── mascotas/{controllers,services,usecases}/
│   ├── usecases/           # + contracts/
│   └── ubicacion/
├── domain/
│   ├── entities/
│   ├── mascotas/{entities,ports}/
│   └── ports/
├── infrastructure/
│   ├── adapters/{api,memory,storage}/
│   ├── config/dependencyContainer.ts
│   └── email/
└── presentation/
    ├── components/{atomic,layout,molecules}/
    ├── context/            # AuthContext (thin), DIContext (root), ThemeContext
    ├── hooks/
    ├── mascotas/{components,screens,state}/
    ├── navigation/
    ├── screens/
    └── theme/
```

## Convenciones de naming

| Tipo | Convención | Ejemplo |
|---|---|---|
| Puerto | `I<Nombre>Repository` / `I<Nombre>Service` | `IAlertaRepository` |
| Use case | `<Verbo><Sustantivo>UseCase` + `I<Verbo>...UseCase` en contracts/ | `DispararSOSUseCase` |
| Controller | `use<Entidad>Controller` | `useSOSController` |
| Adaptador | `Http<Nombre>` / `InMemory<Nombre>` | `HttpAlertaRepository` |
| Mapper | `<Entidad>Mapper` | `AlertaMapper` |
| Screen | `<Nombre>Screen` | `DashboardScreen` |

## Límites de calidad (KISS)

- Archivo máximo: **400 líneas** (warning en lint).
- Complejidad ciclomática máxima: **12** (warning en lint).
- Cero `Math.random` en application (los IDs son del backend).
- Cero `console.log` en producción (usar `console.warn` para errores).

## Verificación

```bash
npx tsc --noEmit      # compilación estricta
npx jest              # suite de unit tests (use cases con adaptadores in-memory)
npx expo lint         # incluye reglas arquitectónicas (no-restricted-imports)
```
