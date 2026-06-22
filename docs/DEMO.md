# 🎬 TaskBloom — Demo & Screenshots Guide

A short script to record/show the app and the screenshots to capture for the README.

## Setup

```bash
npm install
npm start          # http://localhost:4200
```
Open Chrome DevTools → **device toolbar** (Ctrl/Cmd+Shift+M) → pick a phone (e.g. iPhone 14 / Pixel 7)
for a true mobile frame. The app uses iOS mode styling.

## Suggested walkthrough (≈2 min)

1. **Splash** — launch shows the animated “bloom” mark + tagline, then auto‑navigates to Home.
2. **Home / empty state** — “A fresh start” message. Tap the **＋** FAB.
3. **Add a task** — the bottom sheet opens: type a title (the **Add** button stays disabled until
   it's non‑empty → inline validation), optionally pick a **category**, save. A success toast shows.
4. **Bloom progress** — add a few tasks, complete some with the checkbox; watch the **% and the aura
   grow/saturate** in the hero and the gradient meter fill.
5. **Categories** — tap the tag icon (top‑right) → create a category choosing **color + icon** (live
   preview), see the per‑category **task counter**.
6. **Filter** — back on Home, tap a category chip to filter; tap **All** to clear.
7. **Assign / delete** — swipe a task row for **assign category** / **delete** (confirm dialog).
8. **Feature flag** — set `categories_enabled = false` (Remote Config console, or
   `environment.ts` default) and reload: the whole categories surface disappears and the app works
   as a plain To‑Do list. (See feature‑flag section in the README.)
9. **Performance (dev)** — tap the **flask** icon → *Seed 500 tasks* → scroll/toggle/filter stays
   smooth.

## Screenshots to capture

Save PNGs into `docs/screenshots/` with these names (referenced by the README):

| File | Screen |
|---|---|
| `splash.png` | Splash / brand |
| `home.png` | Home with bloom hero + a few tasks |
| `add-task.png` | Add‑task bottom sheet (with category chips) |
| `categories.png` | Category list + the color/icon picker |
| `flag-off.png` | Home with `categories_enabled = false` (optional) |

Tip: capture at a 9:19.5 mobile viewport for consistent framing.
