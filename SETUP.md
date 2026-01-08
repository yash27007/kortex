# Kortex Monorepo Setup Summary

## 📁 Monorepo Structure

```
kortex/
├── apps/                          # Applications
│   ├── core/                      # FastAPI backend service
│   │   ├── app/
│   │   │   └── main.py           # FastAPI application entry point
│   │   ├── package.json
│   │   ├── pyproject.toml        # Python dependencies (uv)
│   │   └── README.md
│   │
│   └── web/                       # Next.js frontend application
│       ├── app/                   # Next.js App Router
│       │   ├── api/
│       │   │   └── trpc/
│       │   │       └── [trpc]/
│       │   │           └── route.ts    # tRPC API route handler
│       │   ├── client-greeting.tsx     # Example: Prefetched query component
│       │   ├── normal-query-example.tsx # Example: Normal query component
│       │   ├── suspense-query-example.tsx # Example: Suspense query component
│       │   ├── layout.tsx              # Root layout with TRPCReactProvider
│       │   ├── page.tsx                # Home page with query examples
│       │   └── globals.css
│       │
│       ├── components/            # React components
│       │   └── ui/                # shadcn/ui components (50+ components)
│       │
│       ├── server/                # Server-side code
│       │   └── trpc/              # tRPC server setup
│       │       ├── init.ts        # tRPC initialization & context
│       │       ├── query-client.ts # React Query client factory
│       │       ├── server.tsx     # Server-side tRPC proxy
│       │       ├── client.tsx     # Client-side tRPC provider
│       │       └── routers/
│       │           └── _app.ts     # Main tRPC router
│       │
│       ├── hooks/                 # Custom React hooks
│       ├── lib/                   # Utility functions
│       ├── public/                # Static assets
│       ├── package.json
│       ├── next.config.js
│       ├── tsconfig.json
│       └── components.json        # shadcn/ui config
│
├── packages/                      # Shared packages
│   ├── db/                        # Database package (Prisma)
│   │   ├── prisma/
│   │   │   └── schema.prisma      # Prisma schema
│   │   ├── index.ts               # Database exports
│   │   ├── prisma.config.ts
│   │   └── package.json
│   │
│   ├── eslint-config/             # Shared ESLint configuration
│   │   ├── base.js
│   │   ├── next.js
│   │   ├── react-internal.js
│   │   └── package.json
│   │
│   └── typescript-config/         # Shared TypeScript configurations
│       ├── base.json
│       ├── nextjs.json
│       ├── react-library.json
│       └── package.json
│
├── package.json                   # Root package.json (workspace config)
├── turbo.json                     # Turborepo configuration
├── bun.lock                       # Bun lockfile
└── README.md
```

---

## 🛠️ Technology Stack

### **Monorepo Management**
- **Turborepo** - Build system and task orchestration
- **Bun** - Package manager (v1.3.3)
- **Workspaces** - npm workspaces for package management

### **Frontend (apps/web)**
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5.9** - Type safety
- **tRPC v11** - End-to-end typesafe APIs
  - `@trpc/server` - Server-side tRPC
  - `@trpc/client` - Client-side tRPC
  - `@trpc/tanstack-react-query` - React Query integration
- **TanStack React Query v5** - Data fetching & caching
- **SuperJSON** - Data transformation (Dates, Maps, Sets, etc.)
- **shadcn/ui** - UI component library (50+ components)
- **Tailwind CSS v4** - Styling
- **Zod v4** - Schema validation

### **Backend (apps/core)**
- **FastAPI** - Python web framework
- **uv** - Python package manager
- **Python 3.13** - Runtime

### **Database (packages/db)**
- **Prisma** - ORM and database toolkit
- **PostgreSQL** - Database (configured)
- **@prisma/client** - Prisma client
- **@prisma/adapter-pg** - PostgreSQL adapter

### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

---

## 🔧 tRPC Setup Details

### **1. Server-Side Setup**

#### **`server/trpc/init.ts`**
- Initializes tRPC with SuperJSON transformer
- Creates context factory (currently returns `{ userId: 'user_123' }`)
- Exports router and procedure helpers

#### **`server/trpc/routers/_app.ts`**
- Main application router
- Currently has one procedure: `hello` query
- Exports `AppRouter` type for client-side type inference

#### **`server/trpc/server.tsx`**
- Server-only file (uses `server-only` package)
- Creates `createTRPCOptionsProxy` for server components
- Cached query client getter for request stability
- Used for prefetching queries in server components

#### **`server/trpc/query-client.ts`**
- Factory function for React Query clients
- Configured with:
  - `staleTime: 30s` - Default cache time
  - SuperJSON serialization/deserialization
  - Pending query dehydration support

#### **`app/api/trpc/[trpc]/route.ts`**
- Next.js API route handler
- Uses `fetchRequestHandler` adapter
- Handles both GET and POST requests
- Endpoint: `/api/trpc`

### **2. Client-Side Setup**

#### **`server/trpc/client.tsx`**
- Client-only file (uses `'use client'` directive)
- Creates tRPC React context
- `TRPCReactProvider` - Wraps app with QueryClientProvider and TRPCProvider
- Singleton query client pattern for browser
- HTTP batch link configuration

#### **`app/layout.tsx`**
- Root layout component
- Wraps app with `TRPCReactProvider`
- Ensures tRPC is available throughout the app

### **3. Query Patterns Implemented**

#### **Pattern 1: Prefetched Query (Server → Client)**
```tsx
// Server Component (page.tsx)
await queryClient.prefetchQuery(
  trpc.hello.queryOptions({ text: "Hello" })
);

// Client Component (client-greeting.tsx)
const { data } = useSuspenseQuery(
  trpc.hello.queryOptions({ text: "Hello" })
);
```
- ✅ No loading flash
- ✅ Data ready on first render
- ✅ Server-side prefetching

#### **Pattern 2: Normal Query (Client-Only)**
```tsx
// Client Component
const greeting = useQuery(trpc.hello.queryOptions({ text: "Hello" }));
if (greeting.isLoading) return <div>Loading...</div>;
```
- Shows loading state
- Fetches entirely on client

#### **Pattern 3: Suspense Query**
```tsx
// Server Component
<Suspense fallback={<div>Loading...</div>}>
  <SuspenseQueryExample />
</Suspense>

// Client Component
const { data } = useSuspenseQuery(trpc.hello.queryOptions({...}));
```
- Uses React Suspense boundaries
- Better loading state management

---

## 📦 Package Dependencies

### **Root (`package.json`)**
- `turbo` - Build system
- `prettier` - Code formatting
- `typescript` - Type checking

### **apps/web (`package.json`)**
**Key Dependencies:**
- `next@16.0.10`
- `react@19.2.3`
- `@trpc/*@11.0.0` (server, client, tanstack-react-query)
- `@tanstack/react-query@5.90.12`
- `superjson@2.2.6`
- `zod@4.2.1`
- `@kortex/db` (workspace dependency)

### **packages/db (`package.json`)**
- `prisma@7.2.0`
- `@prisma/client@7.2.0`
- `@prisma/adapter-pg@7.2.0`
- `pg@8.16.3`

---

## 🚀 Available Scripts

### **Root Level**
```bash
bun dev              # Run all apps in dev mode
bun dev:web          # Run only web app
bun dev:core         # Run only core app
bun build            # Build all apps
bun lint             # Lint all packages
bun format           # Format code with Prettier
bun check-types      # Type check all packages
```

### **apps/web**
```bash
bun dev              # Start Next.js dev server (port 3000)
bun build            # Build for production
bun start            # Start production server
bun lint             # Run ESLint
bun check-types      # Type check
```

### **packages/db**
```bash
bun generate         # Generate Prisma client
bun db:push          # Push schema to database
bun db:migrate       # Run migrations
```

---

## 🎯 How to Proceed

### **1. Adding New tRPC Procedures**

#### **Step 1: Add to Router**
Edit `apps/web/server/trpc/routers/_app.ts`:
```typescript
export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(z.object({ text: z.string() }))
    .query((opts) => {
      return { greeting: `Hello ${opts.input.text}` };
    }),
  
  // Add new procedure here
  getUser: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async (opts) => {
      // Your logic here
      return { user: { id: opts.input.id, name: "John" } };
    }),
});
```

#### **Step 2: Use in Components**
```typescript
// Server Component
await queryClient.prefetchQuery(
  trpc.getUser.queryOptions({ id: "123" })
);

// Client Component
const { data } = useSuspenseQuery(
  trpc.getUser.queryOptions({ id: "123" })
);
```

### **2. Setting Up Database**

1. **Configure Database Connection**
   - Update `packages/db/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Add Models**
   ```prisma
   model User {
     id    String @id @default(cuid())
     name  String
     email String @unique
   }
   ```

3. **Generate Client**
   ```bash
   cd packages/db
   bun generate
   ```

4. **Use in tRPC**
   ```typescript
   import { db } from '@kortex/db';
   
   export const appRouter = createTRPCRouter({
     getUsers: baseProcedure.query(async () => {
       return await db.user.findMany();
     }),
   });
   ```

### **3. Adding Authentication**

1. **Update Context** (`server/trpc/init.ts`):
   ```typescript
   export const createTRPCContext = cache(async () => {
     // Get auth from cookies/headers
     const session = await getSession();
     return { 
       userId: session?.userId,
       user: session?.user 
     };
   });
   ```

2. **Create Protected Procedure**:
   ```typescript
   const protectedProcedure = baseProcedure.use((opts) => {
     if (!opts.ctx.userId) {
       throw new TRPCError({ code: 'UNAUTHORIZED' });
     }
     return opts.next();
   });
   ```

### **4. Adding More Routers**

Create modular routers:
```typescript
// server/trpc/routers/users.ts
export const usersRouter = createTRPCRouter({
  list: baseProcedure.query(async () => {
    // ...
  }),
});

// server/trpc/routers/_app.ts
import { usersRouter } from './users';

export const appRouter = createTRPCRouter({
  users: usersRouter,
  // ... other routers
});
```

### **5. Environment Variables**

Create `.env` files:
```bash
# .env (root)
DATABASE_URL="postgresql://user:password@localhost:5432/kortex"

# apps/web/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

---

## 📝 Key Files to Understand

1. **`apps/web/server/trpc/init.ts`** - tRPC initialization
2. **`apps/web/server/trpc/routers/_app.ts`** - API routes definition
3. **`apps/web/server/trpc/server.tsx`** - Server-side tRPC proxy
4. **`apps/web/server/trpc/client.tsx`** - Client-side provider
5. **`apps/web/app/api/trpc/[trpc]/route.ts`** - API endpoint
6. **`apps/web/app/page.tsx`** - Example usage patterns

---

## 🔍 Next Steps

1. ✅ **tRPC Setup** - Complete
2. ✅ **Query Patterns** - Implemented (prefetch, normal, suspense)
3. ⏭️ **Database Integration** - Set up Prisma models
4. ⏭️ **Authentication** - Add auth context
5. ⏭️ **More Routers** - Create feature-specific routers
6. ⏭️ **Error Handling** - Add error boundaries
7. ⏭️ **Testing** - Add unit/integration tests

---

## 📚 Resources

- [tRPC Documentation](https://trpc.io/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TanStack Query](https://tanstack.com/query/latest)
- [Turborepo Documentation](https://turborepo.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**Last Updated:** Based on current codebase structure
**Package Manager:** Bun v1.3.3
**Node Version:** >=18








