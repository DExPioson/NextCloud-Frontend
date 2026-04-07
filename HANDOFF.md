# CloudSpace LLM Handoff Document

> **Purpose**: Context transfer for an LLM to continue building CloudSpace from Prompt #06 onward.
> **Last updated**: 2026-04-07 | **Last completed prompt**: #05 (Contacts + Deck)

---

## 1. Project Overview

**CloudSpace** is a modern React frontend redesign sandbox for a self-hosted Nextcloud instance. It's a **UI-only prototype** with a mock Express/SQLite backend. No real Nextcloud APIs are used. The project is built across 9 sequential numbered prompts, each adding specific screens.

**Repository**: `https://github.com/DExPioson/Gaurav-NextCloud`
**Owner**: Piyush Sharma (working with Gaurav)
**Local path**: `C:\Users\admin\Desktop\NextCloud With Gaurav\cloudspace\`

---

## 2. Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| UI Framework | React | 19.2.4 | With TypeScript |
| Build Tool | Vite | 8.0.4 | Root = `client/`, output = `dist/` |
| CSS | Tailwind CSS | 3.4.19 | **v3, NOT v4** |
| Components | shadcn/ui | Latest | Radix UI primitives, copy-pasted into `components/ui/` |
| Routing | wouter | 3.9.0 | Hash-based via `useHashLocation` from `wouter/use-hash-location` |
| Data Fetching | TanStack Query | 5.96.2 | `staleTime: 30s`, `gcTime: 5min`, `retry: 1` |
| ORM | Drizzle ORM | 0.45.2 | With `better-sqlite3` |
| Server | Express | 5.2.1 | Port 5000, Vite proxies `/api` to it |
| DnD | @hello-pangea/dnd | 18.0.1 | Used in Deck kanban |
| Icons | lucide-react | 1.7.0 | |
| Date utils | date-fns | 4.1.0 | |
| Variants | class-variance-authority | 0.7.1 | For component variant styling |

---

## 3. Project Structure

```
cloudspace/
├── client/
│   ├── index.html
│   └── src/
│       ├── main.tsx                  # Entry point, renders <App />
│       ├── App.tsx                   # Root: theme, QueryClient, hash router, AppShell
│       ├── index.css                 # Design tokens (HSL CSS vars), scrollbar, animations
│       ├── assets/                   # hero.png, react.svg, vite.svg
│       ├── components/
│       │   ├── layout/
│       │   │   ├── CloudSpaceLogo.tsx
│       │   │   ├── Sidebar.tsx       # Nav sidebar with Talk unread badge
│       │   │   └── TopBar.tsx        # Top bar with search, notifications, avatar
│       │   └── ui/                   # shadcn/ui components (17 total)
│       │       ├── alert.tsx, badge.tsx, button.tsx, card.tsx, checkbox.tsx
│       │       ├── dialog.tsx, dropdown-menu.tsx, input.tsx, label.tsx
│       │       ├── popover.tsx, select.tsx, separator.tsx, skeleton.tsx
│       │       ├── switch.tsx, tabs.tsx, textarea.tsx, tooltip.tsx
│       ├── lib/
│       │   ├── api.ts                # apiRequest(method, url, body?) fetch wrapper
│       │   ├── dateUtils.ts          # formatRelative, formatEventTime, formatEventDate
│       │   └── utils.ts              # cn(), getAvatarColor(), getInitials()
│       └── pages/
│           ├── Login.tsx             # Login form (piyush@cloudspace.home / cloudspace)
│           ├── Dashboard.tsx         # 5 widgets: storage ring, recent files, calendar, talk, activity
│           ├── Files.tsx             # File browser with breadcrumbs, grid/list, CRUD
│           ├── Talk.tsx              # 3-panel chat: conversation list, messages, info panel
│           ├── Calendar.tsx          # Month/week/day/agenda views, event CRUD
│           ├── Notes.tsx             # Split-pane markdown editor, auto-save
│           ├── Contacts.tsx          # 3-panel: groups, grid/list, detail panel, CRUD
│           └── Deck.tsx              # Kanban with @hello-pangea/dnd, card detail modal
├── server/
│   ├── index.ts                      # Express API server (all routes)
│   └── storage.ts                    # DatabaseStorage class, table creates, seed data
├── shared/
│   └── schema.ts                     # Drizzle table definitions + Zod insert schemas
├── package.json
├── vite.config.ts                    # Alias: @/ -> client/src/, @shared -> shared/
├── tsconfig.json, tsconfig.app.json, tsconfig.node.json
├── tailwind.config.ts
├── postcss.config.js
└── eslint.config.js
```

---

## 4. Architecture Patterns

### Routing
- Hash-based routing: `/#/`, `/#/files`, `/#/talk`, etc.
- `App.tsx` uses `<Router hook={useHashLocation}>` from wouter
- `/login` is outside the `AppShell`; all other routes are inside it

### Data Flow
- All API calls return `{ data: ... }` envelope
- Pages use `useQuery` with queryKey = `["/api/endpoint"]`
- Mutations use `useMutation` + `queryClient.invalidateQueries()`
- Optimistic updates used in Talk (messages) and Deck (card moves)

### Styling
- HSL CSS custom properties in `:root` and `.dark` (see `index.css`)
- Theme toggle: `localStorage.getItem("cloudspace-theme")`, toggles `.dark` class on `<html>`
- All colors reference CSS vars: `hsl(var(--primary))`, `bg-primary`, `text-muted-foreground`, etc.
- Layout vars: `--sidebar-width: 240px`, `--sidebar-collapsed-width: 60px`, `--topbar-height: 56px`

### Toast Pattern
Pages use an inline toast helper (not a shared component):
```ts
function showToast(msg: string) {
  const el = document.createElement("div");
  el.id = "cs-toast";
  el.className = "fixed bottom-4 right-4 z-50 bg-foreground text-background px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}
```

### Shared Utilities (`lib/utils.ts`)
- `cn(...classes)` — Tailwind merge via clsx + tailwind-merge
- `getAvatarColor(name)` — deterministic color class string from name hash (7 color pairs with dark mode)
- `getInitials(name)` — "Piyush Sharma" -> "PS"

---

## 5. Completed Screens (Prompts #01–#05)

| # | Prompt | Route | Screen | Status |
|---|--------|-------|--------|--------|
| 01 | Scaffold | `/login` | App shell, sidebar, topbar, login page, design tokens | Done |
| 02 | Dashboard + Files | `/`, `/files` | 5-widget dashboard, file browser with CRUD | Done |
| 03 | Talk | `/talk` | 3-panel chat, conversation list, messages, info panel | Done |
| 04 | Calendar + Notes | `/calendar`, `/notes` | Month/week/day/agenda calendar, split-pane markdown notes | Done |
| 05 | Contacts + Deck | `/contacts`, `/deck` | Contact manager with groups, kanban board with DnD | Done |

---

## 6. Remaining Screens (Prompts #06–#09)

| # | Prompt | Route | Screen | Status |
|---|--------|-------|--------|--------|
| 06 | Mail + Activity | `/mail`, `/activity` | 3-panel email client with compose; filterable activity feed | **Next** |
| 07 | Media + Settings | `/media`, `/settings` | Media gallery; settings page | Pending |
| 08 | Polish | All | Cross-screen polish, transitions, responsive fixes | Pending |
| 09 | Final | All | Final QA, performance, accessibility | Pending |

The spec documents for all 9 prompts are at:
`C:\Users\admin\Downloads\CLAUDE_CODE_PROMPT_01_SCAFFOLD.md` through `_09_*.md`

---

## 7. API Routes (Current State)

All routes are in `server/index.ts`. Response format: `{ data: ... }`.

```
POST /api/auth/login              → { ok, user }
GET  /api/user                    → { data: User }
GET  /api/dashboard               → { data: { recentFiles, upcomingEvents, unreadMessages, ... } }

GET  /api/files?path=/            → { data: File[] }
GET  /api/files/:id               → { data: File }
POST /api/files                   → { data: File }
PATCH /api/files/:id              → { data: File }
DELETE /api/files/:id             → { data: { success } }

GET  /api/conversations           → { data: Conversation[] }
GET  /api/conversations/:id       → { data: Conversation }
POST /api/conversations           → { data: Conversation }
PATCH /api/conversations/:id/read → { data: { success } }
GET  /api/conversations/:id/messages → { data: Message[] }
POST /api/conversations/:id/messages → { data: Message }

GET  /api/events                  → { data: Event[] }
GET  /api/events/:id              → { data: Event }
POST /api/events                  → { data: Event }
PATCH /api/events/:id             → { data: Event }
DELETE /api/events/:id            → { data: { success } }

GET  /api/notes                   → { data: Note[] }
GET  /api/notes/:id               → { data: Note }
POST /api/notes                   → { data: Note }
PATCH /api/notes/:id              → { data: Note }
DELETE /api/notes/:id             → { data: { success } }

GET  /api/contacts                → { data: Contact[] }  (sorted by name)
GET  /api/contacts/:id            → { data: Contact }
POST /api/contacts                → { data: Contact }
PATCH /api/contacts/:id           → { data: Contact }
DELETE /api/contacts/:id          → { data: { success } }

GET  /api/boards                  → { data: Board[] }
GET  /api/boards/:id              → { data: { board, stacks: (Stack & { cards })[] } }
POST /api/boards                  → { data: Board }
POST /api/boards/:id/stacks       → { data: Stack }
POST /api/boards/:boardId/stacks/:stackId/cards → { data: Card }
PATCH /api/cards/:id              → { data: Card }
DELETE /api/cards/:id             → { data: { success } }

GET  /api/emails?folder=inbox     → { data: Email[] }      ← minimal, needs expansion for #06
GET  /api/activity?limit=20       → { data: Activity[] }   ← minimal, needs expansion for #06
GET  /api/activities              → { data: Activity[] }
```

---

## 8. Database Schema (shared/schema.ts)

Tables defined with Drizzle ORM:
- `users` — id, name, email, avatar, role, storageUsed, storageQuota
- `files` — id, name, path, type, mimeType, size, modifiedAt, sharedWith, isFavourite, parentPath, ownerId
- `conversations` — id, name, type (dm/group), avatar, lastMessage, lastMessageAt, unreadCount, members (JSON)
- `messages` — id, conversationId, senderId, senderName, content, sentAt, reactions (JSON), replyToId
- `events` — id, title, description, startAt, endAt, allDay, calendar, color, location
- `notes` — id, title, content, tags (JSON), updatedAt, createdAt, isPinned
- `contacts` — id, name, email, phone, company, group, avatar, tags (JSON)
- `boards` — id, title, color
- `stacks` — id, boardId, title, order
- `cards` — id, stackId, boardId, title, description, dueDate, assignee, priority, labels (JSON), order
- `emails` — id, folder, from, fromEmail, to, subject, preview, body, receivedAt, isRead, isStarred, hasAttachment
- `activities` — id, type, actor, actorAvatar, description, subject, timestamp, isRead

All have corresponding TypeScript types exported (`User`, `File`, `Contact`, etc.).
Insert schemas via `drizzle-zod`: `insertUserSchema`, `insertFileSchema`, etc.

---

## 9. Seed Data Summary

- **1 user**: Piyush Sharma (piyush@cloudspace.home, admin)
- **6 folders** + **10 files** in the file system
- **5 conversations** (3 DM, 2 group) with **8 messages each**
- **8 calendar events** (Apr 7–28, 2026)
- **5 notes** (2 pinned)
- **10 contacts** (Indian names: Rohan, Priya, Arjun, Neha, Vikram, Anjali, Rahul, Kavita, Deepak, Sneha)
- **2 boards** ("Product Roadmap", "Sprint 12"), each with 4 stacks, ~11 cards each
- **8 inbox emails**, **3 sent**, **2 drafts** (all seeded)
- **20 activity entries** (file, share, comment, talk, system types)

---

## 10. Current App.tsx Routes

```tsx
<Route path="/">{() => <Dashboard />}</Route>
<Route path="/files">{() => <Files />}</Route>
<Route path="/talk">{() => <Talk />}</Route>
<Route path="/calendar">{() => <Calendar />}</Route>
<Route path="/notes">{() => <Notes />}</Route>
<Route path="/contacts">{() => <Contacts />}</Route>
<Route path="/deck">{() => <Deck />}</Route>
<Route path="/mail">{() => <StubPage title="Mail" />}</Route>        ← needs #06
<Route path="/activity">{() => <StubPage title="Activity" />}</Route> ← needs #06
<Route path="/media">{() => <StubPage title="Media" />}</Route>       ← needs #07
<Route path="/settings">{() => <StubPage title="Settings" />}</Route>  ← needs #07
```

---

## 11. Git History

```
e1a88c2 feat: add contacts and deck screens          ← current HEAD
3d811c0 feat: add calendar and notes screens
e199fe1 feat: add talk screen with chat, calls, and group management
26063dd feat: add dashboard and files browser
a47198c chore: scaffold CloudSpace project — design system, app shell, and login page
```

All commits use format: `feat: description` + `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`
Branch: `main`, remote: `origin` → `https://github.com/DExPioson/Gaurav-NextCloud.git`

---

## 12. Dev Workflow & Gotchas

### Running the project
```bash
cd cloudspace
npm run dev          # Vite dev server on port 5173
npx tsx server/index.ts  # Express API on port 5000 (run separately)
```
Vite auto-proxies `/api` requests to `localhost:5000`.

### Critical gotchas
1. **Express server must be manually restarted** after editing `server/index.ts`. Find PID with `netstat -ano | findstr ":5000"`, kill it with `taskkill //PID <pid> //F`, then restart.
2. **Delete `dev.db` before restarting server** if you want fresh seed data (SQLite file persists).
3. **Vite HMR can get stale** — if you see errors about duplicate identifiers after refactoring, stop and restart the Vite dev server.
4. **Screenshot timeouts**: If using Claude Preview MCP tools, `preview_screenshot` times out due to Vite HMR WebSocket. Use `preview_snapshot` (accessibility tree) and `preview_inspect` (CSS) instead.
5. **Preview viewport**: After restart, preview may default to small viewport. Use `preview_resize` with width=1280, height=800.
6. **Radix Select**: `<SelectItem value="">` is invalid — Radix requires non-empty string values.
7. **TypeScript check**: Run `npm run check` after every prompt to verify. Must pass before committing.

### Commit workflow
```bash
git add <specific files>   # Never git add -A
git commit -m "feat: <description>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git push origin main
```

---

## 13. Design Token Reference

Light mode key colors:
- Primary: `hsl(243 75% 59%)` — warm indigo
- Background: white
- Foreground: `hsl(220 13% 9%)`
- Muted: `hsl(220 14% 96%)`
- Border: `hsl(220 13% 91%)`
- Destructive: `hsl(0 84% 60%)`

Dark mode: `.dark` class on `<html>` flips all CSS vars.

Border radius: `--radius: 0.5rem`

---

## 14. Next Step: Prompt #06

The next prompt to implement is **#06: Mail + Activity**. The spec is at:
`C:\Users\admin\Downloads\CLAUDE_CODE_PROMPT_06_MAIL_ACTIVITY.md`

What already exists:
- Email schema + seed data (8 inbox, 3 sent, 2 drafts) in `storage.ts`
- Activity schema + seed data (20 entries) in `storage.ts`
- Minimal GET routes: `GET /api/emails?folder=inbox`, `GET /api/activities`
- Storage methods: `getEmails(folder)`, `getEmail(id)`, `getActivities()`
- StubPage placeholders at `/#/mail` and `/#/activity`

What needs building:
- Expand email API routes (CRUD, mark read, star, move between folders)
- Expand activity API routes (mark read, filter by type)
- Build `Mail.tsx` — 3-panel email client (folder nav, message list, reading pane) with compose dialog
- Build `Activity.tsx` — filterable activity feed with type icons
- Update `App.tsx` to import and route the new pages
- Add any missing storage methods to `storage.ts`
