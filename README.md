<div align="center">

# 🌸 TaskBloom

**Organize your day with clarity.**

A premium hybrid mobile **To‑Do app** built with **Ionic + Angular (standalone)**, with local
persistence, task categorization, a **Firebase Remote Config feature flag**, and a Cordova native
shell for Android/iOS.

</div>

---

## ✨ Overview

TaskBloom is a technical-assessment project that demonstrates senior-level mobile/front-end
engineering: clean modular architecture, reactive state with Angular Signals, a polished custom UI,
a real remote feature flag with a safe local fallback, performance care, unit tests, and a
documented native-build pipeline.

### Core features

- ✅ Create, complete, and delete tasks — with **local persistence** (survives reloads/restarts).
- 🏷️ Create, edit, and delete **categories** (custom **color + icon** picker).
- 🔗 Assign a category to a task and **filter** tasks by category.
- 📊 Progress summary — the signature **“bloom” hero** whose aura grows with completion.
- 🚩 **Feature flag** `categories_enabled` (Firebase Remote Config) that hides the entire categories
  surface and degrades the app to a basic To‑Do list — **without breaking** if Firebase is absent.
- 🎨 Premium, animated, mobile‑first UI (deep‑indigo → violet, glassmorphism, coral/violet/mint).

---

## 📋 Deliverable docs

- **Answers to the assessment questions** → [`docs/ANSWERS.md`](docs/ANSWERS.md)
- **Demo & screenshots guide** → [`docs/DEMO.md`](docs/DEMO.md)

## 🖼️ Screenshots

See the demo walkthrough in [`docs/DEMO.md`](docs/DEMO.md). Drop captures into `docs/screenshots/`:

| Splash | Home (bloom hero) | Add task | Categories |
|---|---|---|---|
| `docs/screenshots/splash.png` | `docs/screenshots/home.png` | `docs/screenshots/add-task.png` | `docs/screenshots/categories.png` |

---

## 🧱 Tech stack

| Layer | Choice |
|---|---|
| Framework | Ionic 8 + Angular 20 (standalone components) |
| Language | TypeScript 5.9 (strict) |
| State | Angular **Signals** (`signal` / `computed` / `linkedSignal`) |
| Persistence | `@ionic/storage-angular` behind a `StorageService` abstraction |
| Remote flags | Firebase JS SDK v12 — Remote Config (lazy, safe local fallback) |
| Native shell | Cordova (Android + iOS) |
| Tooling | ESLint + Prettier, Karma/Jasmine unit tests |

---

## 🏛️ Architecture

Feature‑modular, with clear boundaries (Clean Code, SoC, SRP):

```
src/app/
├── core/                         # cross-cutting, no UI
│   ├── constants/                # storage keys, palette, icon list
│   ├── dev/                      # dev-only 500-task seeder
│   ├── guards/                   # categoriesEnabledGuard (feature-flag route guard)
│   ├── models/                   # Task, Category, FeatureFlags (strongly typed)
│   ├── services/                 # Storage, Task, TaskState, Category, CategoryState, RemoteConfig
│   ├── testing/                  # in-memory storage double (unit tests)
│   └── utils/                    # id + icon registration helpers
├── features/
│   ├── splash/                   # animated brand splash
│   ├── tasks/                    # task list page + add-task sheet component
│   └── categories/               # category list page + category form (color/icon picker)
├── app.config.ts                 # standalone providers (router, storage, app initializer)
└── app.routes.ts                 # lazy routes (loadComponent) + guard
```

**Layering**

- **Repositories** (`TaskService`, `CategoryService`) own persistence via `StorageService` — no UI.
- **State stores** (`TaskStateService`, `CategoryStateService`) expose read‑only **signals** +
  `computed()` projections; mutations delegate to the repositories and sync the signal.
- **Pages/components** are thin and use `ChangeDetectionStrategy.OnPush`.

**Data model** — tasks reference their category by id (normalized), so a task can be uncategorized
and toggling the feature flag never breaks it:

```ts
interface Task { id; title; completed; categoryId?: string | null; createdAt; updatedAt; }     // ISO 8601
interface Category { id; name; color?; icon?; createdAt; updatedAt; }
interface FeatureFlags { categoriesEnabled: boolean; }
```

---

## 🚩 Feature flag (Firebase Remote Config)

`RemoteConfigService` resolves `categories_enabled` with a **safe local fallback** (the app must
never depend on Firebase to start):

- Flags start at `environment.remoteConfigDefaults` (default `categories_enabled: true`).
- If there is **no usable Firebase config**, Firebase is skipped entirely.
- `fetchAndActivate` is **raced against a 4s timeout**; any error is swallowed and defaults stand.
- The flag is exposed as a **signal**, so the UI re‑renders automatically; a route guard protects
  `/categories`.

When `false`: the categories button, filter chips, per‑task tag, “assign category” action, the
add‑form selector, **and** the `/categories` route are all hidden — the app becomes a plain To‑Do
list. Existing `categoryId` values are preserved.

To enable live remote control, paste your Firebase web config into
`src/environments/environment.ts` and add a `categories_enabled` (Boolean) parameter in the Remote
Config console. Without it, the app simply runs on local defaults.

---

## 🚀 Getting started

### Prerequisites
- Node.js ≥ 22.9 and npm

### Install & run (web / dev)
```bash
npm install
npm start            # ng serve → http://localhost:4200
```

### Quality
```bash
npm run lint         # ESLint
npm run format       # Prettier (write)  ·  npm run format:check
npm run test:ci      # Karma + Jasmine (ChromeHeadless) → 31 specs
npm run build -- --configuration production
```

---

## 📱 Native builds (Cordova)

Cordova is a **local devDependency** — no global CLI needed (`npx cordova`). Web assets build to
`www/`; `config.xml` (app id `com.taskbloom.app`) drives the native shell.

### Android (requires Android SDK + JDK + Gradle)

| Requirement | Version |
|---|---|
| JDK | 17–21 (built with **21**) |
| Gradle | **8.14.2** (required by cordova‑android 15) |
| Android SDK | platform **API 36**, build‑tools ≥ 36 |

```bash
# one-time
setx JAVA_HOME "C:\Program Files\Java\jdk-21.0.10"
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
# install Gradle 8.14.2 and add its bin to PATH

npx cordova platform add android
npm run android:build           # ng build --prod + cordova build android (debug APK)
```

Debug APK → `platforms/android/app/build/outputs/apk/debug/app-debug.apk`.
Install on a device: `adb install -r <that path>` (or `npm run android:run`).

> A GitHub Actions workflow (`.github/workflows/android-build.yml`) builds the debug APK in CI and
> uploads it as an artifact — the easy path if you don't have the Android SDK locally.

### iOS (requires macOS + Xcode)
```bash
npx cordova platform add ios
npm run ios:build
```
Then open `platforms/ios/TaskBloom.xcworkspace` in Xcode → select a signing Team →
**Product → Archive** → export the `.ipa`.

---

## ⚡ Performance

- **Lazy loading** — every page is a separate chunk (`loadComponent`).
- **`track`** on task/category lists → toggling one task re‑renders one row.
- **`OnPush`** everywhere; no manual subscriptions (signals throughout).
- **Non‑mutating filtering** via `computed()`; **normalized** data (no category duplication).
- No per‑row `backdrop-filter` (blur is reserved for the hero) and a **capped** entry‑animation
  stagger — both keep scrolling smooth with the dev‑only **500‑task seeder** (flask icon, dev builds).

---

## 🧪 Testing

31 unit specs (Karma + Jasmine) cover the persistence + business‑logic layer with mocked
boundaries (an in‑memory storage double, no real IndexedDB/Firebase): `StorageService`,
`TaskService`, `CategoryService`, `RemoteConfigService` (fallback path), and `TaskStateService`.

```bash
npm run test:ci
```

---

## 📜 npm scripts

| Script | Purpose |
|---|---|
| `start` | Dev server |
| `build` | Production web build |
| `lint` / `format` / `format:check` | Quality |
| `test` / `test:ci` | Unit tests (watch / headless single run) |
| `android:build` / `android:build:release` / `android:run` | Android via Cordova |
| `ios:build` | iOS via Cordova (macOS) |
| `cordova:prepare` | Build web + `cordova prepare` |

---

## 📝 Notes & caveats

- **Firebase** config ships as a placeholder; the app runs on local defaults (categories ON) and
  exercises the fallback path on every run.
- **Fonts** (Sora + Inter) load from Google Fonts for the demo; self‑host them for full offline use
  in the packaged app.
- **iOS** is configured but the `.ipa` must be produced on macOS + Xcode.
- The app keeps a living documentation set under `docs/obsidian-mcp/` (ADRs, dev log) used during
  development; it is intentionally git‑ignored.

---

<div align="center">
Built by <b>Andres Lopez</b> · Ionic + Angular + Cordova
</div>
