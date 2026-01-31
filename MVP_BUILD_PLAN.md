# Propi MVP Build Plan

> **Goal:** Working MVP for TowerHomes agent testing in 3-4 weeks
>
> **Core Loop:** Agent can list properties (with AI assist) and discover co-broke opportunities

---

## MVP Scope Summary

### In Scope (v0.1)
- [x] Agent authentication (register/login with PRC license)
- [x] Create listing with photo upload
- [x] AI description generator
- [x] My listings view (edit/delete/publish)
- [x] Discover properties (filters + map)
- [x] Semantic search
- [x] Property detail page with co-broke info

### Out of Scope (v0.2+)
- ❌ Viewings/Calendar
- ❌ Deals/Commissions
- ❌ AI chat assistant
- ❌ Email/SMS notifications

### Completed Post-MVP (v0.2)
- ✅ CRM/Inquiries pipeline (Phase 7)
- ✅ Admin dashboard (Phase 9)
- ✅ Public buyer portal (Phase 8)

---

## Tech Stack (Simplified for MVP)

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 16.1.6 (App Router) | Server components + API routes |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent UI |
| Database | PostgreSQL + pgvector | Railway hosted |
| ORM | Prisma | Type-safe queries |
| Auth | JWT (jose) + bcryptjs | Stateless, simple |
| AI | Claude API | Description generation |
| Embeddings | OpenAI text-embedding-3-small | Semantic search |
| Storage | Cloudflare R2 | Photo uploads |
| Maps | Google Maps | Property locations |

---

## Build Phases

### Phase 1: Foundation (Days 1-3)

**Goal:** Project setup + database + basic auth working

#### Day 1: Project Setup
- [x] Initialize Next.js project with TypeScript (upgraded to 16.1.6)
  ```bash
  pnpm create next-app@latest propi --typescript --tailwind --eslint --app --src-dir=false
  ```
- [x] Install core dependencies
  ```bash
  pnpm add prisma @prisma/client
  pnpm add jose bcryptjs
  pnpm add zod
  pnpm add @anthropic-ai/sdk openai
  pnpm add -D @types/bcryptjs
  ```
- [x] Set up shadcn/ui
  ```bash
  pnpm dlx shadcn@latest init
  pnpm dlx shadcn@latest add button input label card form toast
  ```
- [x] Create folder structure
- [x] Set up environment variables

#### Day 2: Database Schema
- [x] Create Prisma schema (simplified for MVP)
  - Agent model (auth + profile)
  - Property model (listings)
  - Skip: Inquiry, Viewing, Deal, Activity models
- [x] Set up Railway PostgreSQL
- [x] Enable pgvector extension
- [x] Run initial migration
- [x] Create seed script with sample data

#### Day 3: Authentication
- [x] `lib/db.ts` - Prisma client singleton
- [x] `lib/auth.ts` - JWT sign/verify utilities
- [x] `lib/password.ts` - bcrypt hash/verify (in auth.ts)
- [x] `POST /api/auth/register` - Agent registration
- [x] `POST /api/auth/login` - Login, set cookie
- [x] `POST /api/auth/logout` - Clear cookie
- [x] `GET /api/auth/me` - Get current agent
- [x] `middleware.ts` - Protected routes (note: deprecated in Next.js 16, rename to proxy.ts)
- [x] Login page UI
- [x] Register page UI (with PRC license field)

**Phase 1 Deliverable:** ✅ COMPLETE - Can register and login as an agent

---

### Phase 2: Listings Core (Days 4-7)

**Goal:** Agent can create, view, edit listings with photos

#### Day 4: Listing API
- [x] `POST /api/listings` - Create listing
- [x] `GET /api/listings` - List my listings
- [x] `GET /api/listings/[id]` - Get single listing
- [x] `PATCH /api/listings/[id]` - Update listing
- [x] `DELETE /api/listings/[id]` - Delete listing
- [x] Zod validation schemas

#### Day 5: Photo Upload
- [x] Set up Cloudflare R2 bucket
- [x] `lib/storage.ts` - R2 upload utilities
- [x] `POST /api/listings/[id]/photos` - Upload photos
- [x] `DELETE /api/listings/[id]/photos` - Delete photo
- [x] Photo upload component with preview

#### Day 6: Create Listing UI
- [x] Multi-step listing form
  - Step 1: Basic info (type, transaction, price)
  - Step 2: Location (province, city, barangay)
  - Step 3: Specs (beds, baths, area)
  - Step 4: Features & amenities
  - Step 5: Photos
  - Step 6: Review & publish
- [x] Form validation with Zod + react-hook-form

#### Day 7: My Listings UI
- [x] Listings grid/list view
- [x] Listing card component
- [x] Status badges (Draft, Available, etc.)
- [x] Edit listing page
- [x] Delete confirmation
- [x] Publish/Unlist actions

**Phase 2 Deliverable:** ✅ COMPLETE - Agent can create and manage their listings

---

### Phase 3: AI Description Generator (Days 8-9)

**Goal:** AI generates compelling listing descriptions

#### Day 8: Claude Integration
- [x] `lib/claude.ts` - Anthropic client setup
- [x] `POST /api/ai/generate-description` - Generate endpoint
- [x] Prompt engineering for Filipino real estate context
- [ ] Handle streaming response (optional - deferred)

#### Day 9: UI Integration
- [x] "Generate with AI" button in listing form
- [x] Loading state during generation
- [x] Preview generated description
- [x] Allow editing before saving
- [x] Regenerate option

**Phase 3 Deliverable:** ✅ COMPLETE - AI can generate listing descriptions from property details

---

### Phase 4: Discovery & Search (Days 10-14)

**Goal:** Agent can find properties for co-brokerage

#### Day 10: Basic Property Search
- [x] `GET /api/properties` - Public listings endpoint
- [x] Filter parameters:
  - propertyType
  - transactionType
  - priceMin/priceMax
  - province/city
  - bedrooms/bathrooms
- [x] Pagination

#### Day 11: Embeddings Setup
- [x] `lib/embeddings.ts` - OpenAI embeddings client
- [x] `lib/vector-search.ts` - pgvector queries
- [x] Generate embedding on listing publish
- [ ] Script to backfill embeddings for existing listings (deferred - no existing listings yet)

#### Day 12: Semantic Search
- [x] `GET /api/search?q={query}` - Semantic search endpoint
- [x] Combine vector similarity with filters
- [x] Return relevance scores
- [x] `GET /api/properties/[id]/similar` - Similar properties endpoint

#### Day 13: Discover Page UI
- [x] Search bar with natural language support
- [x] Filter sidebar/drawer
- [x] Property grid with cards
- [x] Sort options (newest, price, relevance)
- [x] Empty states
- [x] Public property detail page (`/properties/[id]`)

#### Day 14: Map View
- [ ] Set up Google Maps API
- [ ] `components/maps/property-map.tsx`
- [ ] Map markers for properties
- [ ] Info windows on click
- [ ] Map/List view toggle

**Phase 4 Deliverable:** ✅ MOSTLY COMPLETE - Agent can search and discover co-broke listings (Map view deferred to Phase 5)

---

### Phase 5: Property Details & Polish (Days 15-18)

**Goal:** Complete the user loop, polish for testing

#### Day 15: Property Detail Page
- [x] `/properties/[id]` - Property detail page (moved from discover)
- [x] Photo gallery (basic grid)
- [x] Property specs display
- [ ] Location map (from deferred Phase 4)
- [x] Agent info card
- [x] Co-broke split display
- [x] Contact agent CTA (phone/email)

#### Day 16: Dashboard & Navigation
- [x] Agent dashboard home
  - Quick stats (my listings count, views)
  - Recent listings
  - Quick actions
- [x] Responsive navigation
  - Mobile bottom nav
  - Desktop header with nav
- [x] User menu (profile, logout dropdown)

#### Day 17: Polish & Edge Cases
- [x] Loading states (skeletons)
- [x] Error states
- [x] Empty states
- [x] Form validation messages
- [x] Toast notifications
- [x] 404 page

#### Day 18: Mobile Optimization
- [ ] Test on mobile devices
- [x] Responsive styles (mobile bottom nav, layouts)
- [x] Touch targets
- [ ] Image optimization (deferred)
- [x] PWA basics (manifest, icons)

**Phase 5 Deliverable:** ✅ MOSTLY COMPLETE - Polished MVP (Map view and image optimization deferred)

---

### Phase 6: Testing & Deploy (Days 19-21)

**Goal:** Deploy and onboard TowerHomes testers

#### Day 19: Testing
- [ ] Manual testing of all flows
- [ ] Fix critical bugs
- [ ] Test with sample TowerHomes data
- [ ] Performance check

#### Day 20: Deployment
- [ ] Railway production setup
- [ ] Environment variables
- [ ] Custom domain (staging.propi.ph or similar)
- [ ] SSL verification
- [ ] Database backups

#### Day 21: Tester Onboarding
- [ ] Create test accounts for TowerHomes agents
- [ ] Brief documentation/guide
- [ ] Feedback collection method (form/chat)
- [ ] Monitor for issues

**Phase 6 Deliverable:** MVP live with TowerHomes testers

---

## Simplified Database Schema (MVP)

```prisma
// prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector]
}

model Agent {
  id            String    @id @default(cuid())
  email         String    @unique
  phone         String
  passwordHash  String
  name          String
  prcLicense    String    @unique
  photo         String?
  bio           String?   @db.Text
  areasServed   String[]
  specializations String[]
  defaultSplit  Decimal   @default(50)
  isActive      Boolean   @default(true)

  listings      Property[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
  @@index([prcLicense])
}

model Property {
  id              String          @id @default(cuid())
  agentId         String
  agent           Agent           @relation(fields: [agentId], references: [id])

  // Basic Info
  title           String
  description     String          @db.Text
  aiDescription   String?         @db.Text
  propertyType    PropertyType
  transactionType TransactionType

  // Pricing
  price           Decimal
  pricePerSqm     Decimal?

  // Location
  province        String
  city            String
  barangay        String?
  address         String?
  landmark        String?
  latitude        Decimal?
  longitude       Decimal?

  // Specifications
  bedrooms        Int?
  bathrooms       Int?
  carpark         Int?
  lotArea         Decimal?
  floorArea       Decimal?
  floors          Int?
  yearBuilt       Int?

  // Features
  features        String[]
  furnishing      Furnishing?

  // Media
  photos          String[]
  videoUrl        String?

  // Co-Brokerage
  allowCoBroke    Boolean         @default(true)
  coBrokeSplit    Decimal         @default(50)

  // Status
  status          PropertyStatus  @default(DRAFT)
  isFeatured      Boolean         @default(false)
  viewCount       Int             @default(0)

  // AI/Search
  embedding       Unsupported("vector(1536)")?
  embeddedAt      DateTime?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  publishedAt     DateTime?

  @@index([agentId])
  @@index([status])
  @@index([propertyType])
  @@index([transactionType])
  @@index([province, city])
  @@index([price])
}

enum PropertyType {
  HOUSE
  CONDO
  TOWNHOUSE
  APARTMENT
  LOT
  COMMERCIAL
  WAREHOUSE
  FARM
}

enum TransactionType {
  SALE
  RENT
}

enum PropertyStatus {
  DRAFT
  AVAILABLE
  RESERVED
  SOLD
  RENTED
  UNLISTED
}

enum Furnishing {
  UNFURNISHED
  SEMI_FURNISHED
  FULLY_FURNISHED
}
```

---

## API Routes (MVP)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register agent |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current agent |
| GET | `/api/listings` | My listings |
| POST | `/api/listings` | Create listing |
| GET | `/api/listings/[id]` | Get listing |
| PATCH | `/api/listings/[id]` | Update listing |
| DELETE | `/api/listings/[id]` | Delete listing |
| POST | `/api/listings/[id]/photos` | Upload photos |
| POST | `/api/listings/[id]/publish` | Publish listing |
| GET | `/api/properties` | Discover properties (public) |
| GET | `/api/properties/[id]` | Property detail |
| GET | `/api/search` | Semantic search |
| POST | `/api/ai/generate-description` | AI description |

---

## Page Routes (MVP)

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── layout.tsx          # Auth check + nav
│   ├── dashboard/page.tsx  # Home
│   ├── listings/
│   │   ├── page.tsx        # My listings
│   │   ├── new/page.tsx    # Create listing
│   │   └── [id]/page.tsx   # Edit listing
│   ├── discover/
│   │   ├── page.tsx        # Search & browse
│   │   └── [id]/page.tsx   # Property detail
│   └── settings/page.tsx   # Profile
└── api/
    └── ...
```

---

## Environment Variables (MVP)

```bash
# Database
DATABASE_URL="postgresql://..."

# Auth
JWT_SECRET="min-32-characters-secret-key-here"

# AI
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."

# Storage
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="propi-uploads"
R2_PUBLIC_URL="https://..."

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_KEY="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Success Metrics for MVP Test

After TowerHomes testing, measure:

1. **Adoption**
   - How many agents registered?
   - How many listings created?

2. **AI Usage**
   - % of listings using AI-generated descriptions
   - % of descriptions used as-is vs. edited

3. **Search Behavior**
   - What queries do agents type?
   - Do they use semantic search or filters?

4. **Feedback**
   - What features do they ask for?
   - What's frustrating?
   - What's valuable?

---

## Post-MVP Roadmap (v0.2+)

Based on tester feedback, likely additions:

1. **Inquiry Management** — CRM pipeline for buyer leads
2. **Viewing Scheduler** — Calendar + SMS reminders
3. **AI Chat** — Natural language property matching
4. **Commission Tracker** — Deal management
5. **Admin Dashboard** — Brokerage analytics

---

## Deployment Notes

### Railway Configuration (Updated January 2026)

Railway has migrated from **Nixpacks** to **Railpack** as the default builder. The `railway.toml` configuration:

```toml
[build]
builder = "railpack"
buildCommand = "pnpm run build"

[deploy]
startCommand = "pnpm start"
healthcheckPath = "/"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Important Version Notes

- **Next.js 16.1.6** is required due to `@next/swc` version alignment issues in 15.5.x
- Next.js 15.5.11 references `@next/swc@15.5.11` which doesn't exist on npm (latest stable 15.5.x is 15.5.7)
- The `middleware.ts` convention is deprecated in Next.js 16 - should be renamed to `proxy.ts`
- Dashboard pages require `export const dynamic = "force-dynamic"` since they use `cookies()` from `next/headers`

---

## Commands Reference

```bash
# Development
pnpm dev                     # Start dev server (uses Turbopack)
pnpm build                   # Production build
pnpm lint                    # Lint code

# Database
pnpm prisma generate         # Generate client
pnpm prisma db push          # Push schema
pnpm prisma migrate dev      # Create migration
pnpm prisma studio           # Database GUI
pnpm prisma db seed          # Seed data

# Deployment
git push                     # Auto-deploys to Railway via GitHub integration
```

---

*Created: January 2026*
*Target: 3-week MVP for TowerHomes testing*
