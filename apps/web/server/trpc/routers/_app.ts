import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '@/server/trpc/init';
import { userRouter } from './user';
import { courseRouter } from './course';
import { lessonRouter } from './lesson';

export const appRouter = createTRPCRouter({
  // Health check
  health: baseProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Sub-routers
  user: userRouter,
  course: courseRouter,
  lesson: lessonRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;