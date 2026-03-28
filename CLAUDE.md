# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Calling Bird Auto-Announcement** is a school/institution announcement and attendance management system with biometric device integration. It plays audio greetings for students at scheduled times, tracks attendance, and integrates with ZKTeco biometric devices.

## Commands

### Backend (root)
```bash
npm start          # Start dev server with nodemon (port 2323)
npm run dev        # Same as start
```

### Frontend (`/front-end`)
```bash
npm run dev        # Vite dev server on port 3006
npm run build      # Production build → /front-end/dist/
npm run watch      # Watch mode build
```

There are no test commands configured.

## Architecture

### Two-process system
- **Backend**: Express.js on port 2323 — serves REST API at `/api/*` and the built frontend from `/front-end/dist/`
- **WebSocket server**: `socket/socket.js` on port 2424 — real-time barcode punch events and live notifications to connected Vue clients

### Backend (`/src`)
Business logic is split into class files:
- `class-db.js` — SQLite schema init and migrations; single source of truth for table structure
- `class-students.js` — student CRUD, Excel import/export, audio uploads
- `class-schedules.js` — announcement/punch schedule management
- `class-attendence.js` — attendance records and reports
- `class-punchlog.js` — raw punch event log
- `class-leave-and-vacations.js` — leave/vacation tracking
- `device.biotimeApp.js` — ZKTeco biometric device API integration
- `checkaccess.js` — encrypted license/access verification
- `backup.js` — compressed backup management
- `updater.js` — application update management
- `utls.js` — shared utilities: network check, date handling, relay (speaker) control, encoding

Routes are registered in `server.js` directly (no separate router files).

### Frontend (`/front-end/src`)
Vue 3 SPA with hash-based routing (`/#/`). Pages are in `src/pages/`, reusable components in `src/components/`. State is managed via Pinia stores in `src/stores/`.

Key components:
- `Playlist.vue` — audio announcement playback engine
- `SwitchBoard.vue` — relay/speaker switch controls
- `DevicesPreloader.vue` — initializes ZKTeco device connections on startup
- `FetchBulkAttendanceFromDevice.vue` — batch pulls punch records from device

WebSocket client is initialized in `src/socket.js` and used to receive real-time barcode punches.

### Configuration
Copy `config.example.js` → `config.js` and adjust settings before running. Key config sections:
- Port numbers (HTTP: 2323, WS: 2424)
- ZKTeco device IP/credentials
- Shift time definitions (morning/afternoon/evening)
- Attendance boundary rules
- Speaker control mode (auto/manual relay)
- Database path (defaults to `./database/database.db`)

Runtime state (version, switch_mode, last_backup_date) is persisted in `tracker.json`.

### Database
SQLite via `sqlite3`. Schema is managed in `class-db.js` with inline migration support (add/remove columns). Core tables: `students`, `schedules`, `attendance`, `leave_and_vacation`, `users`.

### Deployment
PM2 config is in `ecosystem.config.js`. Deployment notes for single-board and multi-board relay setups are in `service.single.md`, `service.multi.md`, and `relay.multiboard.md`.
