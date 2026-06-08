# AgileDesk

A real-time collaborative project management app with Kanban boards, sprint planning, task management, and team meetings.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Radix UI |
| State | Zustand |
| Drag & Drop | dnd-kit |
| Backend | Fastify, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Real-time | Socket.io |
| Auth | JWT (via @fastify/jwt) |
| Monorepo | pnpm workspaces |
| Deployment | Railway (API + DB), Vercel (web) |

## Features

- **Authentication** — Register and login with JWT sessions; role-based access (PM / Engineer)
- **Boards** — Create and manage multiple project boards with member invites
- **Kanban** — Drag-and-drop tasks across columns (Backlog → Sprint Ready → In Progress → Review → QA → Done)
- **Tasks** — Priority levels, story points, labels, due dates, assignees, subtask checklists, comments, activity log
- **Sprints** — Create sprints, assign tasks to sprints, track sprint status (Planned / Active / Completed)
- **Meetings** — Schedule meetings per sprint, manage participants
- **Real-time** — Live board updates and presence indicators via Socket.io (all connected users see changes instantly)

## Project Structure

```
kanban-app/
├── apps/
│   ├── api/                  # Fastify backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts       # Demo data seed
│   │   │   └── migrations/
│   │   └── src/
│   │       ├── routes/       # auth, boards, columns, tasks, extras
│   │       ├── middleware/   # JWT auth guard
│   │       └── lib/          # Prisma client
│   └── web/                  # Next.js frontend
│       └── src/
│           ├── app/
│           │   ├── auth/     # login, register pages
│           │   ├── (dashboard)/
│           │   └── boards/[boardId]/  # board, sprints, meetings, members
│           ├── components/   # KanbanColumn, TaskCard, TaskModal, AppShell
│           ├── store/        # auth.store, board.store (Zustand)
│           ├── hooks/        # use-auth, use-board-socket, use-toast
│           └── lib/          # axios api client
└── packages/
    └── types/                # Shared TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 16
- pnpm — `npm install -g pnpm`

### Installation

```bash
git clone https://github.com/AqeelAroos/agile-desk.git
cd agile-desk
pnpm install
```

### Environment Variables

**`apps/api/.env`**
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/kanban_db"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:3000"
PORT=4000
```

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Database Setup

```bash
cd apps/api
npx prisma migrate dev
pnpm db:seed
```

### Run Locally

```bash
# From the repo root — starts both API and web
pnpm dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| PM | lubna@agiledesk.io | 123456 |
| PM | afdhal@gmail.com | afdhal123 |
| PM | umma@gmail.com | umma123 |
| Engineer | atheek@agiledesk.io | password123 |
| Engineer | sarah@agiledesk.io | password123 |
| Engineer | ahmad@agiledesk.io | password123 |

## Adding a New PM User (Without Redeploying)

Use the one-off script pattern to create a user, board, and seed data directly against any database:

```bash
# Copy the template
cp apps/api/prisma/add-umma.ts apps/api/prisma/add-newuser.ts
# Edit the email, name, password, and board content in the new file

# Run against local DB
npx tsx apps/api/prisma/add-newuser.ts

# Run against production Railway DB
$env:DATABASE_URL="postgresql://..." # paste Railway DB URL
npx tsx apps/api/prisma/add-newuser.ts
```

> Also add the user to `seed.ts` so they survive future redeployments.

## Deployment

The app deploys to Railway using `nixpacks.toml`. On every deploy Railway runs:

1. `prisma migrate deploy` — applies pending migrations
2. `prisma db seed` — resets and reseeds demo data
3. Starts the API server

The frontend deploys separately to Vercel (or Railway web service).
