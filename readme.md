# UniGo Frontend

## Overview
UniGo is an Ionic Vue application packaged with Capacitor for native builds. The project ships with a Vite toolchain, TypeScript-first codebase, and Cypress/Vitest coverage to keep the mobile UI stable across web and iOS targets.

## Tech Stack
- Ionic Vue 8 + Vue Router 4
- Capacitor 7 (iOS project lives under `ios/`)
- Vite 5 with TypeScript, ESLint, and Vue TSC
- Vitest + Vue Test Utils for unit specs, Cypress for end-to-end flows

## Getting Started
1. Install Node.js 18+ and npm.
2. Install dependencies: `npm install`.
3. Run the dev server: `npm run dev` (served at `http://localhost:5173`).
4. Build production assets: `npm run build`; preview with `npm run preview`.

## Project Layout
```
src/           # Ionic Vue app (components, views, router, theme)
public/        # Static assets copied as-is to the Vite build
resources/     # Capacitor icons and splash assets
ios/           # Generated native iOS project (sync via Capacitor)
tests/unit     # Vitest specs (*.spec.ts)
tests/e2e      # Cypress specs grouped by feature
```

## Scripts & Tooling
- `npm run dev` – Start hot-reload development server.
- `npm run build` – Type-check with `vue-tsc` and emit `dist/` artifacts.
- `npm run preview` – Serve the built app for smoke testing.
- `npm run lint` – Run ESLint with the Vue + TypeScript config.
- `npm run test:unit` – Execute Vitest suites in jsdom.
- `npm run test:e2e` – Run Cypress specs headlessly.

 `npm run test:unit`, and the relevant Cypress suites. Aim for both happy-path and failure-path assertions when fixing bugs.

## Capacitor Notes
After changing web assets or Capacitor plugins, run `npx cap sync ios` to refresh the native project, then open Xcode from the `ios/` directory. Keep secrets in local `.env` files (Vite only exposes keys prefixed with `VITE_`).
