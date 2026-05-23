# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Calling Bird Auto-Announcement** is a school/institution announcement and attendance management system with biometric device integration. It plays audio greetings for students at scheduled times, tracks attendance, and integrates with ZKTeco biometric devices.

## Commands

### Backend (root)
```bash
npm start                          # Start dev server with nodemon (port 2323)
npm run create-zip-with-latest-code  # Package app for distribution
```

### Frontend (`/front-end`)
```bash
npm run dev    # Vite dev server on port 3006 (standalone UI dev only)
npm run build  # Production build → front-end/dist/ (backend serves this)
npm run watch  # Continuous watch build — use alongside nodemon during development
```

> **Typical dev workflow**: run `npm run watch` in `front-end/` and `npm start` in root simultaneously. The backend serves the built `front-end/dist/` at `/app`.

There are no test commands configured.

## Architecture

### Two-process system
- **Backend**: Express.js on port 2323 — serves REST API at `/api/*` and the built frontend from `front-end/dist/` via the `/app` route
- **WebSocket server**: `socket/socket.js` on port 2424 — acts as a simple message relay (broadcasts every received message to all connected clients); exposed globally as `global.socketServer`

### Configuration (two-tier)
`config.example.js` is the canonical defaults file. Copy it to `config.js` to override.

Config keys are split into two tiers:
- **`env` block** — loaded at startup only, never saved to DB (ports, secrets, device credentials, API URLs)
- **All other top-level keys** (`settings`, `classes`, `logo`, `css_vars`, etc.) — seeded into the `settings` DB table on first run and editable from the UI Settings panel at runtime

`src/fillGapConfig.js` deep-merges `config.example.js` with `config.js` so user config never needs to be complete. Settings panel changes persist to DB and override `config.js` values on next load.

Runtime state (`version`, `switch_mode`, `last_backup_date`) is stored in `tracker.json`. App version is tracked in `_appVers/version.json`.

### Backend (`/src`)
Each domain has a class file and a corresponding route file:

| Class | Route | Responsibility |
|---|---|---|
| `class-db.js` | — | SQLite schema init + inline migrations (`_addColumn`, `_removeColumn`) |
| `class-students.js` | `routes/students.js` | Student CRUD, Excel import/export, audio/image uploads |
| `class-schedules.js` | `routes/schedules.js` | Announcement/punch schedule management |
| `class-attendence.js` | `routes/attendance.js` | Attendance records and reports |
| `class-punchlog.js` | `routes/punchlog.js` | Raw punch event log |
| `class-leave-and-vacations.js` | `routes/leave.js` | Leave/vacation tracking |
| `class-sms.js` | `routes/sms.js` | SMS notification sending |
| — | `routes/config.js` | Config read/write endpoints |
| — | `routes/settings.js` | DB settings read/write endpoints |
| — | `routes/misc.js` | Miscellaneous utility endpoints |
| — | `routes/refresh.js` | App refresh/restart triggers |

Route files are mounted under `/api` in `server.js`. `settings.js` exports `getSettings`, `updateSetting`, `resetAllSettings` for use both in routes and during startup.

`device.biotimeApp.js` polls the ZKTeco BioTime server on a configurable interval to fetch punch records and push them into the local attendance flow.

`src/web-contents.js` holds the HTML shell template. The `/app` route injects `GLOBAL_DATA` (env vars + local IP), logo config, and CSS variables into it before sending to the browser.

### Frontend (`/front-end/src`)
Vue 3 SPA with hash-based routing (`/#/`). **`App.vue` is the central dependency-injection hub** — nearly all shared state and functions are `provide()`d there and consumed via `inject()` throughout pages and components. Pinia (`src/stores/`) is minimally used.

Path aliases defined in `vite.config.js`:
- `@` → `src/`
- `@pages` → `src/pages/`
- `@stores` → `src/stores/`
- `@utils` → `src/utilities/`

Cross-component events use `mitt` (imported from `src/import-hub.js` as `emitter`).

WebSocket client (`src/socket.js`) auto-reconnects every 5 s on disconnect and emits all incoming messages onto the `mitt` emitter (`on_socket_message` event).

Key components:
- `Playlist.vue` — audio announcement playback engine; watches `wattingList` for items ready to play and controls speaker relay ports via `controlSounds()`
- `SwitchBoard.vue` — relay/speaker switch UI; supports auto and manual modes
- `DevicesPreloader.vue` — initializes ZKTeco device connections on app mount
- `FetchBulkAttendanceFromDevice.vue` — batch-pulls historical punch records from the device

### Database
SQLite via `sqlite3`. Schema is managed entirely in `class-db.js` constructor — add new columns there using `_addColumn` / `_removeColumn`. Core tables: `students`, `schedules`, `attendance`, `leave_and_vacation`, `users`, `settings`.

### Deployment
PM2 config: `ecosystem.config.js` (process name: `callingbird`). Restart via `pm2 restart all`. The `/api/update-app` endpoint downloads a zip, extracts it, runs `npm install`, then restarts PM2. Deployment notes for relay hardware setups: `service.single.md`, `service.multi.md`, `relay.multiboard.md`.
