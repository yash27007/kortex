import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { cache } from 'react';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@kortex/db';
import { getAdminSession } from '@/lib/admin-auth';

export const createTRPCContext = cache(async () => {
  const { userId } = await auth();
  const adminSession = await getAdminSession();

  return {
    userId,
    adminSession,
    prisma,
  };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

// Protected procedure - requires Clerk authentication (for learners)
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});

// Admin procedure - requires admin session (not Clerk)
export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.adminSession || !ctx.adminSession.isAdmin) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Admin access required',
    });
  }

  return next({
    ctx: {
      ...ctx,
      adminSession: ctx.adminSession,
    },
  });
});
