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
- ❌ CRM/Inquiries pipeline
- ❌ Viewings/Calendar
- ❌ Deals/Commissions
- ❌ AI chat assistant
- ❌ Admin dashboard
- ❌ Public buyer portal
- ❌ Email/SMS notifications

---

## Tech Stack (Simplified for MVP)

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 15 (App Router) | Server components + API routes |
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
- [ ] Initialize Next.js 15 project with TypeScript
  ```bash
  pnpm create next-app@latest propi --typescript --tailwind --eslint --app --src-dir=false
  ```
- [ ] Install core dependencies
  ```bash
  pnpm add prisma @prisma/client
  pnpm add jose bcryptjs
  pnpm add zod
  pnpm add @anthropic-ai/sdk openai
  pnpm add -D @types/bcryptjs
  ```
- [ ] Set up shadcn/ui
  ```bash
  pnpm dlx shadcn@latest init
  pnpm dlx shadcn@latest add button input label card form toast
  ```
- [ ] Create folder structure
- [ ] Set up environment variables

#### Day 2: Database Schema
- [ ] Create Prisma schema (simplified for MVP)
  - Agent model (auth + profile)
  - Property model (listings)
  - Skip: Inquiry, Viewing, Deal, Activity models
- [ ] Set up Railway PostgreSQL
- [ ] Enable pgvector extension
- [ ] Run initial migration
- [ ] Create seed script with sample data

#### Day 3: Authentication
- [ ] `lib/db.ts` - Prisma client singleton
- [ ] `lib/auth.ts` - JWT sign/verify utilities
- [ ] `lib/password.ts` - bcrypt hash/verify
- [ ] `POST /api/auth/register` - Agent registration
- [ ] `POST /api/auth/login` - Login, set cookie
- [ ] `POST /api/auth/logout` - Clear cookie
- [ ] `GET /api/auth/me` - Get current agent
- [ ] `middleware.ts` - Protected routes
- [ ] Login page UI
- [ ] Register page UI (with PRC license field)

**Phase 1 Deliverable:** Can register and login as an agent

---

### Phase 2: Listings Core (Days 4-7)

**Goal:** Agent can create, view, edit listings with photos

#### Day 4: Listing API
- [ ] `POST /api/listings` - Create listing
- [ ] `GET /api/listings` - List my listings
- [ ] `GET /api/listings/[id]` - Get single listing
- [ ] `PATCH /api/listings/[id]` - Update listing
- [ ] `DELETE /api/listings/[id]` - Delete listing
- [ ] Zod validation schemas

#### Day 5: Photo Upload
- [ ] Set up Cloudflare R2 bucket
- [ ] `lib/storage.ts` - R2 upload utilities
- [ ] `POST /api/listings/[id]/photos` - Upload photos
- [ ] `DELETE /api/listings/[id]/photos` - Delete photo
- [ ] Photo upload component with preview

#### Day 6: Create Listing UI
- [ ] Multi-step listing form
  - Step 1: Basic info (type, transaction, price)
  - Step 2: Location (province, city, barangay)
  - Step 3: Specs (beds, baths, area)
  - Step 4: Features & amenities
  - Step 5: Photos
  - Step 6: Review & publish
- [ ] Form validation with Zod + react-hook-form

#### Day 7: My Listings UI
- [ ] Listings grid/list view
- [ ] Listing card component
- [ ] Status badges (Draft, Available, etc.)
- [ ] Edit listing page
- [ ] Delete confirmation
- [ ] Publish/Unlist actions

**Phase 2 Deliverable:** Agent can create and manage their listings

---

### Phase 3: AI Description Generator (Days 8-9)

**Goal:** AI generates compelling listing descriptions

#### Day 8: Claude Integration
- [ ] `lib/claude.ts` - Anthropic client setup
- [ ] `POST /api/ai/generate-description` - Generate endpoint
- [ ] Prompt engineering for Filipino real estate context
- [ ] Handle streaming response (optional)

#### Day 9: UI Integration
- [ ] "Generate with AI" button in listing form
- [ ] Loading state during generation
- [ ] Preview generated description
- [ ] Allow editing before saving
- [ ] Regenerate option

**Phase 3 Deliverable:** AI can generate listing descriptions from property details

---

### Phase 4: Discovery & Search (Days 10-14)

**Goal:** Agent can find properties for co-brokerage

#### Day 10: Basic Property Search
- [ ] `GET /api/properties` - Public listings endpoint
- [ ] Filter parameters:
  - propertyType
  - transactionType
  - priceMin/priceMax
  - province/city
  - bedrooms/bathrooms
- [ ] Pagination

#### Day 11: Embeddings Setup
- [ ] `lib/embeddings.ts` - OpenAI embeddings client
- [ ] `lib/vector-search.ts` - pgvector queries
- [ ] Generate embedding on listing publish
- [ ] Script to backfill embeddings for existing listings

#### Day 12: Semantic Search
- [ ] `GET /api/search?q={query}` - Semantic search endpoint
- [ ] Combine vector similarity with filters
- [ ] Return relevance scores

#### Day 13: Discover Page UI
- [ ] Search bar with natural language support
- [ ] Filter sidebar/drawer
- [ ] Property grid with cards
- [ ] Sort options (newest, price, relevance)
- [ ] Empty states

#### Day 14: Map View
- [ ] Set up Google Maps API
- [ ] `components/maps/property-map.tsx`
- [ ] Map markers for properties
- [ ] Info windows on click
- [ ] Map/List view toggle

**Phase 4 Deliverable:** Agent can search and discover co-broke listings

---

### Phase 5: Property Details & Polish (Days 15-18)

**Goal:** Complete the user loop, polish for testing

#### Day 15: Property Detail Page
- [ ] `/discover/[id]` - Property detail page
- [ ] Photo gallery/carousel
- [ ] Property specs display
- [ ] Location map
- [ ] Agent info card
- [ ] Co-broke split display
- [ ] Contact agent CTA (basic - just shows phone/email)

#### Day 16: Dashboard & Navigation
- [ ] Agent dashboard home
  - Quick stats (my listings count, views)
  - Recent listings
  - Quick actions
- [ ] Responsive navigation
  - Mobile bottom nav
  - Desktop sidebar
- [ ] User menu (profile, logout)

#### Day 17: Polish & Edge Cases
- [ ] Loading states (skeletons)
- [ ] Error states
- [ ] Empty states
- [ ] Form validation messages
- [ ] Toast notifications
- [ ] 404 page

#### Day 18: Mobile Optimization
- [ ] Test on mobile devices
- [ ] Fix responsive issues
- [ ] Touch targets
- [ ] Image optimization
- [ ] PWA basics (manifest, icons)

**Phase 5 Deliverable:** Polished, mobile-friendly MVP

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

## Commands Reference

```bash
# Development
pnpm dev                     # Start dev server
pnpm build                   # Production build
pnpm lint                    # Lint code

# Database
pnpm prisma generate         # Generate client
pnpm prisma db push          # Push schema
pnpm prisma migrate dev      # Create migration
pnpm prisma studio           # Database GUI
pnpm prisma db seed          # Seed data

# Deployment
railway up                   # Deploy to Railway
```

---

*Created: January 2026*
*Target: 3-week MVP for TowerHomes testing*
