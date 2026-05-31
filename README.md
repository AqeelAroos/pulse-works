# Pulse Works

A real-time collaborative Kanban board application.

## Tech Stack

- **Frontend:** Next.js 14, Zustand, dnd-kit
- **Backend:** Fastify, PostgreSQL, Prisma
- **Real-time:** Socket.io
- **Auth:** JWT

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- pnpm (`npm install -g pnpm`)

### Installation

1. Clone the repo
   git clone https://github.com/AqeelAroos/pulse-works.git
   cd pulse-works

2. Install dependencies
   pnpm install

3. Configure environment variables

   Create apps/api/.env:
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/kanban_db"
   JWT_SECRET="your-secret-key"
   FRONTEND_URL="http://localhost:3000"
   PORT=4000

   Create apps/web/.env.local:
   NEXT_PUBLIC_API_URL=http://localhost:4000

4. Set up the database
   cd apps/api
   npx prisma migrate dev
   npx prisma db seed

5. Start the app
   pnpm dev

- Frontend: http://localhost:3000
- Backend: http://localhost:4000