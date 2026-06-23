# Respuestas a las preguntas de la prueba — TaskBloom

> Respuestas a las preguntas técnicas del enunciado. Referencias a código entre paréntesis.

## 1. ¿Cuáles fueron los principales desafíos al implementar las nuevas funcionalidades?

**a) Integrar categorías sin acoplarlas a la lógica base de tareas.**
Lo resolví separando responsabilidades en repositorios independientes (`TaskService`,
`CategoryService` en `src/app/core/services/`) sobre una **capa de almacenamiento abstracta**
(`StorageService`). Las tareas referencian la categoría por `categoryId` (**datos normalizados**),
así una tarea puede existir sin categoría y desactivar la función no rompe nada. La regla de dominio
"al borrar una categoría, desvincularla de sus tareas" vive en un solo lugar
(`CategoryStateService.deleteCategory` → `TaskStateService.clearCategory`).

**b) Manejar Remote Config de forma segura.**
La app no debe depender de Firebase para arrancar. `RemoteConfigService` parte de **valores por
defecto locales**, omite Firebase si no hay configuración, y hace `fetchAndActivate` **contra un
timeout de 8 s** tragándose cualquier error → siempre resuelve. El flag se expone como **signal**,
de modo que la UI reacciona sola y un *route guard* protege `/categories`.

**c) Cumplir el requisito de Cordova** pese a estar deprecado por Ionic en favor de Capacitor: lo
dejé como decisión consciente (documentada), eliminé Capacitor para no tener dos runtimes nativos, y
configuré Cordova hasta **generar un APK real** (JDK 21 + Gradle 8.14.2 + Android SDK 36).

**d) Detalles de integración Ionic** que cuestan en la práctica: iconos dinámicos que fallaban dentro
del overlay del `ion-modal` (los registré con `addIcons`), y el layout del componente dentro del
modal (`:host` a `flex column; height:100%`).

## 2. ¿Qué técnicas de optimización de rendimiento aplicaste y por qué?

- **Lazy loading** por ruta (`loadComponent` en `app.routes.ts`) → bundle inicial menor y *time to
  interactive* más rápido. Cada página es un chunk aparte.
- **`track` en los `@for`** (listas de tareas y categorías) → Angular reutiliza nodos del DOM; marcar
  una tarea re‑renderiza **una fila**, no toda la lista.
- **`ChangeDetectionStrategy.OnPush`** en todos los componentes → la detección de cambios corre solo
  cuando cambia un signal que el componente lee.
- **Filtrado con `computed()`** (`TaskStateService.filteredTasks`) → derivación pura y memoizada que
  **no muta** ni reordena el array original.
- **Datos normalizados** → la tarea guarda `categoryId`, no la categoría embebida; sin duplicidad ni
  desincronización.
- **Sin suscripciones manuales** → todo es *signals*, no hay `subscribe()` que fugar.
- **Sin `backdrop-filter` por fila** (el blur se reserva al hero) y **stagger de animación acotado**:
  con 500 tareas, 500 capas con blur o *delays* crecientes generaban *jank*; lo eliminé.
- **Escritura en una sola operación** en repositorios y *seeder* (un `StorageService.set`, no N).

Relevante en **móvil** (CPU/RAM limitadas). Incluí un *seeder* de **500 tareas solo en desarrollo**
(`DevSeederService`, botón de matraz) para comprobar que la lista se mantiene fluida.

## 3. ¿Cómo aseguraste la calidad y mantenibilidad del código?

- **Arquitectura feature‑modular** (`core` / `features`) con límites claros y SRP: repositorios
  (persistencia) vs. *state stores* reactivos (signals) vs. componentes "tontos".
- **TypeScript estricto** y modelos fuertemente tipados (`Task`, `Category`, `FeatureFlags`).
- **Capa de almacenamiento desacoplada** (`StorageService`) → testeable y reemplazable.
- **ESLint + Prettier** (limpios), *naming* consistente, imports organizados, componentes pequeños.
- **Pruebas unitarias** (31 specs, Karma/Jasmine) sobre los 4 servicios core + el *state store*,
  con dobles en memoria; se prueba explícitamente el **camino de fallback** de Remote Config.
- **Commits descriptivos por bloque** y **documentación viva** (ADRs + bitácora) mantenida durante
  todo el desarrollo.

### Decisiones de diseño relevantes (bonus)
- **Signals en vez de NgRx**: reactividad fina con menos *boilerplate*, encaja con `OnPush`; NgRx
  sería sobre‑ingeniería para este alcance.
- **`categoryId` opcional**: permite tareas sin categoría y que el *flag off* degrade limpio sin
  perder datos.
- **Escalado a miles de tareas**: el siguiente paso natural es *virtual scroll* (CDK/Ionic), ya
  facilitado por el filtrado con `computed()`.
