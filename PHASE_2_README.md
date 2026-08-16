# AI Invoice Manager - Phase 2: Foundation

## Setup Complete ✅

### What's been set up:

1. **Next.js 15 Project**
   - TypeScript in strict mode
   - Tailwind CSS for styling
   - App Router architecture

2. **Database**
   - Prisma ORM configured for PostgreSQL
   - Complete schema with multi-tenant support
   - All business entities defined

3. **Authentication**
   - NextAuth v4 configuration (Credentials provider)
   - Password hashing with bcryptjs
   - Session management with JWT

4. **Multi-Tenant Architecture**
   - Organization-based isolation
   - Authorization layer with permission checks
   - IDOR protection patterns

5. **Project Structure**
   ```
   src/
   ├── app/              # Next.js App Router pages
   ├── components/       # React components
   ├── server/           # Backend business logic
   ├── lib/              # Shared utilities (money handling, etc)
   ├── types/            # TypeScript type definitions
   └── db/               # Prisma schema
   ```

6. **Configuration Files**
   - TypeScript configuration with strict mode enabled
   - Environment variables with Zod validation (.env.example)
   - Prettier for code formatting
   - Prisma schema with all entities

### Key Files:

- `src/env.ts` - Environment variable validation
- `src/server/auth/auth.config.ts` - NextAuth configuration
- `src/server/auth/helpers.ts` - Auth utilities
- `src/server/permissions/authorization.ts` - Multi-tenant authorization
- `src/lib/money.ts` - Safe financial calculations
- `prisma/schema.prisma` - Database schema
- `prisma/seed.ts` - Development seed data

## Getting Started

### 1. Set up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- Other API keys as needed

### 2. Initialize Database

```bash
# Create migrations
npm run db:migrate

# Or push schema directly (development only)
npm run db:push

# Seed with test data
npm run db:seed
```

### 3. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### 4. Test Login

Use the demo credentials from `prisma/seed.ts`:
- Email: `demo@example.com`
- Password: `demo123456`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Create/run migrations
- `npm run db:seed` - Seed development data
- `npm run test` - Run tests with Vitest

## Architecture Highlights

### Multi-Tenant Security

Every authorization check follows this pattern:

```typescript
async function requireOrganizationAccess(organizationId: string) {
  const user = await getCurrentUserOrThrow();
  const membership = await db.organizationMember.findFirst({
    where: { organizationId, userId: user.id },
  });
  if (!membership) throw new UnauthorizedError();
  return membership;
}
```

**Every server operation must verify organization membership.**

### Money Handling

All monetary amounts are stored as integers (cents):

```typescript
// Store: $19.99 = 1999 cents
const amountCents = dollarsToCents(19.99); // 1999

// Use decimal.js for calculations
const tax = calculateTax(amountCents, 1000); // basis points
const total = addCents(subtotal, tax);
```

### Database Queries

All tenant-specific queries include organization_id filtering:

```typescript
// ✓ CORRECT - includes organization_id
await db.invoice.findFirst({
  where: { id, organizationId }
});

// ✗ WRONG - IDOR vulnerability
await db.invoice.findUnique({
  where: { id }
});
```

## Next Steps (Phase 3)

Phase 3 will implement:
1. Customer CRUD operations
2. Product management
3. Invoice creation with calculations
4. Invoice numbering
5. Invoice status management
6. Unit tests for business logic

## Database Schema Overview

The database includes:
- **User** - Authentication users (global)
- **Organization** - Tenant containers
- **OrganizationMember** - User-to-org relationships with roles
- **Customer** - Client information (org-scoped)
- **Product** - Reusable products/services (org-scoped)
- **Invoice** - Invoice documents (org-scoped)
- **InvoiceItem** - Line items on invoices
- **Payment** - Payment records
- **Subscription** - SaaS billing
- **RecurringInvoice** - Recurring invoice templates
- **AuditLog** - Activity tracking

All entities except User and Account are organization-scoped.

---

**STATUS**: Foundation phase complete. Project is ready for Phase 3 (Core Domain Implementation).
