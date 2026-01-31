# Propi - Claude Code Instructions

## Project Overview

Propi is an AI-powered real estate co-brokerage platform for the Philippines, starting with Northern Luzon (Baguio, Benguet, La Union, Pangasinan).

**Live URL:** https://propi-ph-production.up.railway.app/

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router with Turbopack)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL with pgvector extension (Railway)
- **ORM:** Prisma
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth:** JWT (jose) + bcryptjs
- **AI:** Claude API (claude-sonnet-4-5-20250929) for descriptions, OpenAI text-embedding-3-small for semantic search
- **Storage:** Cloudflare R2 (S3-compatible)
- **Deployment:** Railway with Railpack builder

## Key Directories

```
app/
  (auth)/          # Public auth pages (login, register)
  (dashboard)/     # Protected agent pages (listings, discover, dashboard, leads, messages, analytics, settings)
  agents/[id]/     # Public agent profile pages
  api/             # API routes
components/
  ui/              # shadcn/ui components
  listings/        # Listing-related components
  leads/           # Lead/inquiry components
  messages/        # Messaging components
  analytics/       # Analytics dashboard components
  layout/          # Header, mobile nav, unread badge
lib/
  auth.ts          # JWT authentication
  db.ts            # Prisma client singleton
  claude.ts        # Anthropic API client (lazy init)
  embeddings.ts    # OpenAI embeddings (lazy init)
  storage.ts       # R2 file upload (lazy init)
  vector-search.ts # pgvector semantic search
  validations.ts   # Zod schemas for all features
prisma/
  schema.prisma    # Database schema
```

## Important Patterns

### Lazy Initialization for API Clients
All external API clients (Anthropic, OpenAI, S3) use lazy initialization to prevent build-time errors when env vars are missing:

```typescript
let client: Client | null = null;
function getClient(): Client {
  if (!client) {
    client = new Client({ apiKey: process.env.API_KEY });
  }
  return client;
}
```

### Form Data Handling
Numeric form fields come as strings. Use Zod transformers:
```typescript
const numericString = z.union([z.string(), z.number()]).transform((val) => {
  return typeof val === "string" ? parseFloat(val) : val;
});
```

### Photo Upload API Response
The `/api/listings/[id]/photos` endpoint returns:
```json
{
  "message": "N photo(s) uploaded successfully",
  "photos": ["...all photo URLs..."],
  "uploaded": ["...newly uploaded URLs..."]
}
```

## Environment Variables

Required for full functionality:
- `DATABASE_URL` - PostgreSQL connection (auto-injected by Railway)
- `JWT_SECRET` - 64-character hex secret for auth tokens
- `ANTHROPIC_API_KEY` - For AI description generation
- `OPENAI_API_KEY` - For embeddings/semantic search
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` - Cloudflare R2 storage

## Common Commands

```bash
pnpm dev              # Start dev server (Turbopack)
pnpm build            # Production build
pnpm prisma:studio    # Database GUI
pnpm prisma:push      # Push schema changes
```

## Development Status

**Completed:**
- Phase 1: Foundation (auth, agents, database)
- Phase 2: Listings (create, edit, photos)
- Phase 3: AI Features (description generation, embeddings)
- Phase 4: Discovery & Search (semantic search, discover page)
- Phase 5: Property Details & Polish (responsive nav, loading states, PWA basics)
- Phase 6: Testing & Deploy (verification complete, live on Railway)
- Phase 7: Agent Collaboration Features
  - Agent Profiles (public profiles, settings page)
  - Lead/Inquiry Management (inquiry form, leads dashboard, status tracking)
  - Analytics Dashboard (stats, charts, top listings)
  - Agent Messaging (conversations, real-time polling, unread badges)

## Database Models

- **Agent** - Real estate agents with profiles, credentials, social links
- **Property** - Listings with photos, specs, AI descriptions, embeddings
- **Inquiry** - Leads from property inquiries (status: NEW → CONTACTED → VIEWING_SCHEDULED → NEGOTIATING → CONVERTED/CLOSED)
- **Conversation** - Agent-to-agent messaging threads (optionally linked to properties)
- **Message** - Individual chat messages with read receipts
- **PropertyView** - Analytics tracking for property views

## Notes

- The project uses `master` branch (not `main`)
- Railway auto-deploys on push to master
- R2 bucket is configured with public access for photo URLs
- pgvector extension must be enabled in PostgreSQL for semantic search
