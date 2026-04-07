# CloudSpace LLM Handoff Document

> **Purpose**: Context transfer for an LLM to continue building CloudSpace from Prompt #09 onward.
> **Last updated**: 2026-04-08 | **Last completed prompt**: #08 (Polish Pass)

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
│       │   │   ├── CommandPalette.tsx # Cmd+K command palette with search, nav, quick actions
│       │   │   ├── Sidebar.tsx       # Nav sidebar with collapse toggle, unread badges
│       │   │   └── TopBar.tsx        # Top bar with command palette, notification popover, user dropdown
│       │   └── ui/                   # shadcn/ui components (18 total)
│       │       ├── alert.tsx, badge.tsx, button.tsx, card.tsx, checkbox.tsx
│       │       ├── dialog.tsx, dropdown-menu.tsx, input.tsx, label.tsx
│       │       ├── popover.tsx, select.tsx, separator.tsx, skeleton.tsx
│       │       ├── slider.tsx, switch.tsx, tabs.tsx, textarea.tsx, tooltip.tsx
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
│           ├── Deck.tsx              # Kanban with @hello-pangea/dnd, card detail modal
│           ├── Mail.tsx              # 3-panel email client with compose dialog
│           ├── Activity.tsx          # Filterable activity feed with stats + date groups
│           ├── Media.tsx             # Photo gallery with lightbox, albums, multi-select
│           └── Settings.tsx          # Multi-section settings: profile, security, appearance, storage, etc.
├── server/
│   ├── index.ts                      # Express API server (all routes)
│   └── storage.ts                    # DatabaseStorage class, table creates, seed data
├── shared/
│   └── schema.ts                     # Drizzle table definitions + Zod insert schemas
├── HANDOFF.md                        # This file
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

## 5. Completed Screens (Prompts #01–#06)

| # | Prompt | Route | Screen | Status |
|---|--------|-------|--------|--------|
| 01 | Scaffold | `/login` | App shell, sidebar, topbar, login page, design tokens | Done |
| 02 | Dashboard + Files | `/`, `/files` | 5-widget dashboard, file browser with CRUD | Done |
| 03 | Talk | `/talk` | 3-panel chat, conversation list, messages, info panel | Done |
| 04 | Calendar + Notes | `/calendar`, `/notes` | Month/week/day/agenda calendar, split-pane markdown notes | Done |
| 05 | Contacts + Deck | `/contacts`, `/deck` | Contact manager with groups, kanban board with DnD | Done |
| 06 | Mail + Activity | `/mail`, `/activity` | 3-panel email client with compose; filterable activity feed | Done |
| 07 | Media + Settings | `/media`, `/settings` | Photo gallery with lightbox; multi-section settings page | Done |
| 08 | Polish Pass | All | Command palette, notifications, user dropdown, sidebar collapse, animations | Done |

### Prompt #06 Details (Mail + Activity)

**Mail page** (`Mail.tsx`, ~480 lines):
- 3-panel layout: folder list (200px) + message list (320px) + reading pane (flex-1)
- Folder list: Inbox (unread badge), Starred, Sent, Drafts (count badge), Spam, Trash + Labels (Work/Personal/Finance with colored dots) + storage indicator bar
- Message list: sender avatars (getAvatarColor), unread dot indicator, bold text for unread, attachment/star icons, search, sort (Newest/Oldest/Sender/Unread), bulk select with checkboxes
- Reading pane: full email header (avatar, sender, date, To), attachment chips, action toolbar (Reply/Reply All/Forward/Star toggle/Move to folder/Delete/Print), email body (whitespace-pre-wrap, max-w-prose), inline reply form
- Compose dialog: recipient chip input with contact autocomplete from `/api/contacts`, Cc/Bcc toggle, subject, body textarea, Send + Save Draft buttons
- Clicking email calls `GET /api/emails/:id` which auto-marks as read; invalidates counts

**Activity page** (`Activity.tsx`, ~230 lines):
- Stats bar: 4 cards (events today, files changed, new shares, unread)
- Filter tabs (shadcn Tabs): All/Files/Sharing/Comments/System/Talk with unread count badges per type
- Activity feed grouped by date: Today/Yesterday/This Week/Earlier with sticky backdrop-blur headers
- Each item: unread dot, type-colored icon circle (file=blue, share=green, comment=purple, system=slate, talk=indigo), actor inline avatar, description, subject (primary color), timestamp
- Hover actions: mark read/unread (Eye/EyeOff), open related (ExternalLink)
- Search (client-side on description/actor/subject) + "Mark all read" button

**Sidebar updates**: Mail and Activity nav items now show unread count badges (same style as Talk). Uses separate `useQuery` calls with `staleTime: 30_000`. Note: `Activity` type from schema imported as `ActivityType` to avoid conflict with lucide `Activity` icon.

### Prompt #07 Details (Media + Settings)

**Media page** (`Media.tsx`, ~320 lines):
- Two-panel layout: album sidebar (220px) + main gallery area (flex-1)
- Left panel: 5 albums (All Photos/Screenshots/Camera Roll/Favourites/Shared) with counts, 4 filter items (Videos/Favourites/Recently added/Trash), Upload button at bottom
- Mock data: 24 photos from `picsum.photos/seed/photoN/800/600`, 5 albums — no DB table needed
- Gallery toolbar: album name, photo count, sort dropdown (Newest/Oldest/Name/Size), view toggle (large grid/small grid/list), select mode button
- Photo grid grouped by month with month headers; each tile has hover overlay with filename, favourite heart indicator
- Multi-select mode: checkbox overlay on each photo, selection bar with Select all/Download/Favourite/Move/Delete/Cancel actions
- List view: table with thumbnail, filename, size, date, album, action buttons
- Lightbox: full-screen overlay (z-50, bg-black/95) with top bar (filename, size, date), action buttons (favourite/download/share/info/close), prev/next arrows, main image, thumbnail strip at bottom
- Keyboard navigation: ArrowLeft/ArrowRight/Escape via `useEffect` + `window.addEventListener('keydown')`
- Upload dialog: drag-drop area with dashed border, upload cloud icon, Browse files button → toast

**Settings page** (`Settings.tsx`, ~520 lines):
- Two-panel layout: settings nav (220px) + content area (flex-1, max-w-2xl centered)
- Left nav: 3 groups (Account: Profile/Security/Notifications; App: Appearance/Storage/Connected Apps; Admin: About CloudSpace)
- 7 sections rendered based on `activeSection` state:
  1. **Profile**: Avatar (80px circle, initials "PS"), form fields (name, email disabled with lock icon, username with @ prefix, bio with 160 char counter, language select, timezone select), Save/Discard buttons, PATCH /api/user on save
  2. **Security**: Change password form with strength indicator (weak=red/medium=amber/strong=green), 2FA toggle with TOTP setup dialog (mock QR grid, manual code `JBSWY3DPEHPK3PXP`, 6-digit verify input), active sessions list (3 devices with Laptop/Smartphone icons, "This device" badge, Revoke buttons)
  3. **Notifications**: Two-column toggle grid — email notifications (6 toggles) + in-app notifications (6 toggles), each with label + description + Switch
  4. **Appearance**: Theme cards (Light/Dark/System) with mini preview mockups + radio dot, 6 accent color swatches (Indigo/Violet/Rose/Emerald/Amber/Sky) that update `--primary` CSS var live, font size slider (12-18px) with live preview text, compact mode toggle
  5. **Storage**: Quota card (18.4 GB / 50 GB, 36.8% progress bar), usage breakdown (Files 12.1GB/Mail 3.2GB/Talk 1.8GB/Media 0.9GB/Notes 0.2GB/Other 0.2GB) with colored bars, action buttons (Empty Trash/Download all data/Upgrade storage)
  6. **Connected Apps**: OAuth apps table (4 mock apps: Nextcloud Talk Desktop, Calendar Sync iOS, Thunderbird, CloudSpace Mobile), Revoke with confirm dialog, "Authorize new app" button
  7. **About**: CloudSpace logo, version info table (Frontend 0.1.0, Build Apr 2026, NC 29.0.2, stack), GitHub link, tagline

**Backend changes**:
- Added `PATCH /api/user` route to update user profile (name, email, avatar fields)
- Added `updateUser(id, data)` method to `IStorage` interface and `DatabaseStorage` class

**New UI component**: `slider.tsx` — Radix UI Slider primitive (`@radix-ui/react-slider` installed), standard shadcn/ui pattern

### Prompt #08 Details (Polish Pass)

Cross-app polish pass implementing the most impactful UX improvements:

**Command Palette** (`CommandPalette.tsx`, new file):
- Dialog-based palette opened via Cmd+K or clicking the search bar in TopBar
- Results grouped into: Quick Actions (New note, Compose email, New event, Upload file), Navigation (all 11 nav items), Files (5 mock results), Contacts (4 mock results)
- Full keyboard navigation: ArrowUp/Down to navigate, Enter to select, Escape to close
- Client-side search filtering across all result types
- Uses `hideClose` prop on DialogContent to hide the X button

**TopBar rewrite** (`TopBar.tsx`):
- Search bar is now a clickable button that opens the CommandPalette
- Notification bell: Popover with 4 hardcoded notifications (FileUp blue, MessageSquare indigo, CalendarDays green, UserPlus purple), "Mark all read" button, "View all activity" link
- User avatar dropdown (DropdownMenu): Profile → settings, Appearance → `/#/settings?section=appearance`, Keyboard shortcuts → Dialog with 8 shortcuts, Sign out → login page + toast
- Removed separate Settings gear icon (user dropdown replaces it)

**Sidebar enhancements** (`Sidebar.tsx`):
- Added `onToggle` callback prop for collapse toggle
- Collapse toggle button at bottom with PanelLeftClose/PanelLeftOpen icons
- Badge pulse animation (`animate-badge-pulse`) on unread count badges

**Dashboard** (`Dashboard.tsx`):
- Time-based greeting with emojis (sunrise morning, sun afternoon, moon evening)

**Deck** (`Deck.tsx`):
- Enhanced drag ghost: `shadow-2xl ring-2 ring-primary/30 rotate-2 scale-105` during drag

**Settings** (`Settings.tsx`):
- Unsaved changes banner: sticky amber banner with "Save changes" / "Discard" when profile form is dirty

**App.tsx updates**:
- Removed StubPage component (all routes now have live components)
- Auto-collapse sidebar only at <768px (was <1024px)
- Added `toggleSidebar` callback passed to Sidebar

**UI component changes**:
- `dialog.tsx`: Added `hideClose` prop to DialogContent
- `dropdown-menu.tsx`: Added `DropdownMenuLabel` component + export

**Tailwind config**:
- Added `badge-pulse` keyframes animation (opacity 1 → 0.7 → 1, 2s infinite)

**Partially deferred to Prompt #09**:
- Skeleton loaders audit (pages already have skeletons from initial builds)
- Empty states audit (pages already have empty state UIs)
- Responsive 768px mobile layout (Sheet component, useIsMobile hook)
- Transition consistency pass
- Some micro-interactions (file drag pulse, talk message slide-in)

---

## 6. Remaining Screens (Prompts #09)

| # | Prompt | Route | Screen | Status |
|---|--------|-------|--------|--------|
| 09 | Final | All | Final QA, performance, accessibility, build + deploy | **Next** |

The spec documents for all 9 prompts are at:
`C:\Users\admin\Downloads\CLAUDE_CODE_PROMPT_01_SCAFFOLD.md` through `_09_*.md`

---

## 7. API Routes (Current State)

All routes are in `server/index.ts`. Response format: `{ data: ... }`.

```
POST /api/auth/login              -> { ok, user }
GET  /api/user                    -> { data: User }
PATCH /api/user                   -> { data: User }     (update profile: name, email, avatar)
GET  /api/dashboard               -> { data: { recentFiles, upcomingEvents, unreadMessages, ... } }

GET  /api/files?path=/            -> { data: File[] }
GET  /api/files/:id               -> { data: File }
POST /api/files                   -> { data: File }
PATCH /api/files/:id              -> { data: File }
DELETE /api/files/:id             -> { data: { success } }

GET  /api/conversations           -> { data: Conversation[] }
GET  /api/conversations/:id       -> { data: Conversation }
POST /api/conversations           -> { data: Conversation }
PATCH /api/conversations/:id/read -> { data: { success } }
GET  /api/conversations/:id/messages -> { data: Message[] }
POST /api/conversations/:id/messages -> { data: Message }

GET  /api/events                  -> { data: Event[] }
GET  /api/events/:id              -> { data: Event }
POST /api/events                  -> { data: Event }
PATCH /api/events/:id             -> { data: Event }
DELETE /api/events/:id            -> { data: { success } }

GET  /api/notes                   -> { data: Note[] }
GET  /api/notes/:id               -> { data: Note }
POST /api/notes                   -> { data: Note }
PATCH /api/notes/:id              -> { data: Note }
DELETE /api/notes/:id             -> { data: { success } }

GET  /api/contacts                -> { data: Contact[] }  (sorted by name)
GET  /api/contacts/:id            -> { data: Contact }
POST /api/contacts                -> { data: Contact }
PATCH /api/contacts/:id           -> { data: Contact }
DELETE /api/contacts/:id          -> { data: { success } }

GET  /api/boards                  -> { data: Board[] }
GET  /api/boards/:id              -> { data: { board, stacks: (Stack & { cards })[] } }
POST /api/boards                  -> { data: Board }
POST /api/boards/:id/stacks       -> { data: Stack }
POST /api/boards/:boardId/stacks/:stackId/cards -> { data: Card }
PATCH /api/cards/:id              -> { data: Card }
DELETE /api/cards/:id             -> { data: { success } }

GET  /api/emails/counts           -> { data: { inbox, drafts, spam } }  (unread counts per folder)
GET  /api/emails?folder=inbox     -> { data: Email[] }  (sorted by receivedAt desc)
GET  /api/emails/:id              -> { data: Email }     (marks as read on fetch)
POST /api/emails                  -> { data: Email }
PATCH /api/emails/:id             -> { data: Email }     (isRead, isStarred, folder)
DELETE /api/emails/:id            -> { data: { success } }

GET  /api/activity?limit=50&type=all -> { data: Activity[] }  (sorted by timestamp desc, type filter)
PATCH /api/activity/:id/read      -> { data: { success } }
POST /api/activity/read-all       -> { data: { success } }    (marks all as read)
GET  /api/activities              -> { data: Activity[] }
```

**Important**: `GET /api/emails/counts` is registered BEFORE `GET /api/emails/:id` in Express to avoid "counts" matching as an `:id` param.

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
- **8 calendar events** (Apr 7-28, 2026)
- **5 notes** (2 pinned)
- **10 contacts** (Indian names: Rohan, Priya, Arjun, Neha, Vikram, Anjali, Rahul, Kavita, Deepak, Sneha)
- **2 boards** ("Product Roadmap", "Sprint 12"), each with 4 stacks, ~11 cards each
- **8 inbox emails**, **3 sent**, **2 drafts** (realistic senders/subjects)
- **20 activity entries** (file, share, comment, talk, system types over 3 days)

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
<Route path="/mail">{() => <Mail />}</Route>
<Route path="/activity">{() => <Activity />}</Route>
<Route path="/media">{() => <Media />}</Route>
<Route path="/settings">{() => <Settings />}</Route>
```

---

## 11. Git History

```
ffb104e feat: add mail and activity screens             <- current HEAD
e1a88c2 feat: add contacts and deck screens
3d811c0 feat: add calendar and notes screens
e199fe1 feat: add talk screen with chat, calls, and group management
26063dd feat: add dashboard and files browser
a47198c chore: scaffold CloudSpace project -- design system, app shell, and login page
```

All commits use format: `feat: description` + `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`
Branch: `main`, remote: `origin` -> `https://github.com/DExPioson/Gaurav-NextCloud.git`

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
1. **Express server must be manually restarted** after editing `server/index.ts` or `storage.ts`. Find PID with `netstat -ano | findstr ":5000"`, kill it with `taskkill //PID <pid> //F`, then restart.
2. **Delete `dev.db` before restarting server** if you want fresh seed data (SQLite file persists).
3. **Vite HMR can get stale** — if you see errors about duplicate identifiers after refactoring, stop and restart the Vite dev server completely.
4. **Screenshot timeouts**: If using Claude Preview MCP tools, `preview_screenshot` times out due to Vite HMR WebSocket. Use `preview_snapshot` (accessibility tree) and `preview_inspect` (CSS) instead.
5. **Preview viewport**: After restart, preview may default to small viewport. Use `preview_resize` with width=1280, height=800.
6. **Radix Select**: `<SelectItem value="">` is invalid — Radix requires non-empty string values. Use a placeholder like `"unassigned"`.
7. **TypeScript check**: Run `npm run check` after every prompt to verify. Must pass before committing.
8. **Name conflicts**: lucide-react exports icon components named `Activity`, `Mail`, etc. When importing schema types with the same name, alias them: `import type { Activity as ActivityType } from "@shared/schema"`.

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

## 14. Storage Methods (server/storage.ts)

The `DatabaseStorage` class implements `IStorage` interface. Key methods per entity:

| Entity | Methods |
|--------|---------|
| Users | `getUser`, `getUserByEmail`, `createUser`, `updateUser` |
| Files | `getAllFiles`, `getFiles(parentPath)`, `getFile`, `createFile`, `updateFile`, `deleteFile` |
| Conversations | `getConversations`, `getConversation`, `createConversation`, `updateConversation` |
| Messages | `getMessages(convId)`, `createMessage` |
| Events | `getEvents`, `getEvent`, `createEvent`, `updateEvent`, `deleteEvent` |
| Notes | `getNotes`, `getNote`, `createNote`, `updateNote`, `deleteNote` |
| Contacts | `getContacts`, `getContact`, `createContact`, `updateContact`, `deleteContact` |
| Boards | `getBoards`, `getBoard`, `createBoard` |
| Stacks | `getStacks(boardId)`, `createStack` |
| Cards | `getCards(boardId)`, `getCard`, `createCard`, `updateCard`, `deleteCard` |
| Emails | `getEmails(folder)`, `getEmail`, `createEmail`, `updateEmail`, `deleteEmail`, `getEmailCounts` |
| Activities | `getActivities`, `getActivity`, `updateActivity`, `markAllActivitiesRead` |

---

## 15. Sidebar Badge System

`Sidebar.tsx` fetches 3 separate queries for badge counts:
1. **Talk**: `GET /api/conversations` -> sum of `unreadCount` across all conversations
2. **Mail**: `GET /api/emails/counts` -> `counts.inbox` (unread inbox emails)
3. **Activity**: `GET /api/activity?limit=50&type=all` -> count of items where `!isRead`

All use `staleTime: 30_000`. Badge style: `bg-primary text-primary-foreground text-[10px] rounded-full px-1.5 min-w-[18px] text-center`.

---

## 16. Next Step: Prompt #09

The next prompt to implement is **#09: Final QA + Build + Deploy**. The spec is at:
`C:\Users\admin\Downloads\CLAUDE_CODE_PROMPT_09_FINAL.md` (or similar naming)

All 12 screens are built and polished. What comes next:
- **Prompt #09**: Production build, final QA across all screens, performance audit, accessibility check, deploy

### Implementation notes
- Media uses **inline mock data** (no DB table) — 24 photos from `picsum.photos`, 5 albums
- Settings Appearance section directly modifies `document.documentElement` for theme/accent/fontSize — theme persists via `localStorage`, accent color and font size are ephemeral (reset on reload)
- The `@radix-ui/react-slider` package was installed for the font size slider in Settings > Appearance
- Command palette uses inline mock data for file/contact search results (no API call)
- Notification bell uses hardcoded notifications (no API endpoint)
- No new DB schema was needed for Prompts #07 or #08
