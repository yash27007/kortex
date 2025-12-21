import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc/init';
import { TRPCError } from '@trpc/server';

export const lessonRouter = createTRPCRouter({
  // Get lesson by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const lesson = await ctx.prisma.lesson.findUnique({
        where: { id: input.id },
        include: {
          module: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                },
              },
            },
          },
          quiz: {
            include: {
              questions: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      });

      if (!lesson) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lesson not found',
        });
      }

      // Get user's progress
      const user = await ctx.prisma.user.findFirst({
        where: { clerkId: ctx.userId },
        select: { id: true },
      });

      let progress = null;
      if (user) {
        progress = await ctx.prisma.lessonProgress.findUnique({
          where: {
            userId_lessonId: {
              userId: user.id,
              lessonId: input.id,
            },
          },
        });
      }

      return { lesson, progress };
    }),

  // Start a lesson
  start: protectedProcedure
    .input(z.object({ lessonId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { clerkId: ctx.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Upsert progress
      const progress = await ctx.prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId: input.lessonId,
          },
        },
        update: {
          status: 'IN_PROGRESS',
          lastAccessedAt: new Date(),
          startedAt: undefined, // Don't update if already started
        },
        create: {
          userId: user.id,
          lessonId: input.lessonId,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          lastAccessedAt: new Date(),
        },
      });

      // Update enrollment last accessed
      const lesson = await ctx.prisma.lesson.findUnique({
        where: { id: input.lessonId },
        include: { module: true },
      });

      if (lesson) {
        await ctx.prisma.enrollment.updateMany({
          where: {
            userId: user.id,
            courseId: lesson.module.courseId,
          },
          data: {
            lastAccessedAt: new Date(),
          },
        });
      }

      return progress;
    }),

  // Complete a lesson
  complete: protectedProcedure
    .input(z.object({ lessonId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { clerkId: ctx.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const lesson = await ctx.prisma.lesson.findUnique({
        where: { id: input.lessonId },
        include: { module: true },
      });

      if (!lesson) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lesson not found',
        });
      }

      // Check if already completed
      const existingProgress = await ctx.prisma.lessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId: input.lessonId,
          },
        },
      });

      if (existingProgress?.status === 'COMPLETED') {
        return { progress: existingProgress, xpEarned: 0, leveledUp: false };
      }

      // Update progress
      const progress = await ctx.prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId: input.lessonId,
          },
        },
        update: {
          status: 'COMPLETED',
          completedAt: new Date(),
          lastAccessedAt: new Date(),
        },
        create: {
          userId: user.id,
          lessonId: input.lessonId,
          status: 'COMPLETED',
          startedAt: new Date(),
          completedAt: new Date(),
          lastAccessedAt: new Date(),
        },
      });

      // Award XP
      const oldLevel = user.level;
      const newXP = user.xp + lesson.xpReward;
      const newLevel = calculateLevel(newXP);

      await ctx.prisma.user.update({
        where: { id: user.id },
        data: {
          xp: newXP,
          level: newLevel,
          lastActiveAt: new Date(),
        },
      });

      // Create XP history entry
      await ctx.prisma.xPHistory.create({
        data: {
          userId: user.id,
          amount: lesson.xpReward,
          reason: 'LESSON_COMPLETE',
          metadata: { lessonId: lesson.id, lessonTitle: lesson.title },
        },
      });

      // Update course progress
      await updateCourseProgress(ctx.prisma, user.id, lesson.module.courseId);

      return {
        progress,
        xpEarned: lesson.xpReward,
        leveledUp: newLevel > oldLevel,
        newLevel: newLevel > oldLevel ? newLevel : undefined,
      };
    }),

  // Update time spent on lesson
  updateTimeSpent: protectedProcedure
    .input(
      z.object({
        lessonId: z.string(),
        seconds: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { clerkId: ctx.userId },
        select: { id: true },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const progress = await ctx.prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId: input.lessonId,
          },
        },
        update: {
          timeSpent: { increment: input.seconds },
          lastAccessedAt: new Date(),
        },
        create: {
          userId: user.id,
          lessonId: input.lessonId,
          status: 'IN_PROGRESS',
          timeSpent: input.seconds,
          startedAt: new Date(),
          lastAccessedAt: new Date(),
        },
      });

      return progress;
    }),
});

// Calculate level based on XP
function calculateLevel(xp: number): number {
  const baseXP = 1000;
  const multiplier = 1.5;

  let level = 1;
  let requiredXP = 0;

  while (xp >= requiredXP) {
    level++;
    requiredXP += Math.floor(baseXP * Math.pow(multiplier, level - 2));
  }

  return level - 1;
}

// Update course progress after lesson completion
async function updateCourseProgress(
  prisma: any,
  userId: string,
  courseId: string
) {
  // Get total lessons in course
  const totalLessons = await prisma.lesson.count({
    where: {
      module: { courseId },
    },
  });

  // Get completed lessons
  const completedLessons = await prisma.lessonProgress.count({
    where: {
      userId,
      status: 'COMPLETED',
      lesson: {
        module: { courseId },
      },
    },
  });

  const progress = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  // Update enrollment
  await prisma.enrollment.updateMany({
    where: { userId, courseId },
    data: {
      progress,
      status: progress >= 100 ? 'COMPLETED' : 'ACTIVE',
      completedAt: progress >= 100 ? new Date() : null,
    },
  });
}
