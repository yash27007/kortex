import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc/init';
import { TRPCError } from '@trpc/server';

export const lessonRouter = createTRPCRouter({
  // Get lesson by ID (for lesson page)
  getById: protectedProcedure
    .input(z.object({ lessonId: z.string() }))
    .query(async ({ ctx, input }) => {
      const lesson = await ctx.prisma.lesson.findUnique({
        where: { id: input.lessonId },
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
        },
      });

      if (!lesson) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lesson not found',
        });
      }

      return lesson;
    }),

  // Get lesson progress
  getProgress: protectedProcedure
    .input(z.object({ lessonId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { clerkId: ctx.userId },
        select: { id: true },
      });

      if (!user) {
        return null;
      }

      return ctx.prisma.lessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId: input.lessonId,
          },
        },
      });
    }),

  // Get navigation context (prev/next lessons)
  getNavigation: protectedProcedure
    .input(z.object({ lessonId: z.string(), courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get current lesson with module
      const currentLesson = await ctx.prisma.lesson.findUnique({
        where: { id: input.lessonId },
        include: {
          module: {
            include: {
              quiz: {
                select: { id: true, moduleId: true },
              },
              lessons: {
                select: {
                  id: true,
                  order: true,
                },
              },
            },
          },
        },
      });

      if (!currentLesson) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lesson not found',
        });
      }

      // Get all lessons in course ordered by module then lesson order
      const modules = await ctx.prisma.module.findMany({
        where: { courseId: input.courseId },
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              title: true,
              order: true,
              moduleId: true,
            },
          },
        },
      });

      // Flatten lessons with module context
      const allLessons = modules.flatMap((m) =>
        m.lessons.map((l) => ({
          ...l,
          moduleOrder: m.order,
        }))
      );

      // Find current lesson index
      const currentIndex = allLessons.findIndex((l) => l.id === input.lessonId);

      // Get prev/next
      const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
      const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

      // Check if this is the last lesson in the module (quiz trigger)
      const moduleLessons = currentLesson.module.lessons;
      const isLastInModule = moduleLessons?.length
        ? currentLesson.order === moduleLessons.length
        : false;

      return {
        prevLesson,
        nextLesson,
        currentModule: {
          id: currentLesson.module.id,
          title: currentLesson.module.title,
        },
        quiz: isLastInModule ? currentLesson.module.quiz : null,
        isLastInModule,
      };
    }),

  // Mark lesson complete
  markComplete: protectedProcedure
    .input(z.object({ lessonId: z.string(), courseId: z.string() }))
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

      // Get lesson with module info
      const lesson = await ctx.prisma.lesson.findUnique({
        where: { id: input.lessonId },
        include: {
          module: {
            include: {
              lessons: { select: { id: true } },
              quiz: { select: { id: true } },
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
        return {
          xpAwarded: 0,
          moduleComplete: false,
          alreadyCompleted: true,
        };
      }

      // Mark lesson complete
      await ctx.prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId: input.lessonId,
          },
        },
        update: {
          status: 'COMPLETED',
          completedAt: new Date(),
          xpAwarded: lesson.xpReward,
        },
        create: {
          userId: user.id,
          lessonId: input.lessonId,
          status: 'COMPLETED',
          startedAt: new Date(),
          completedAt: new Date(),
          xpAwarded: lesson.xpReward,
        },
      });

      // Award XP to user
      await ctx.prisma.user.update({
        where: { id: user.id },
        data: {
          totalXp: { increment: lesson.xpReward },
          lastActiveAt: new Date(),
        },
      });

      // Update enrollment XP
      await ctx.prisma.enrollment.updateMany({
        where: {
          userId: user.id,
          courseId: input.courseId,
        },
        data: {
          totalXpEarned: { increment: lesson.xpReward },
          lastAccessedAt: new Date(),
        },
      });

      // Check if all lessons in module are complete
      const moduleLessonIds = lesson.module.lessons.map((l) => l.id);
      const completedLessons = await ctx.prisma.lessonProgress.count({
        where: {
          userId: user.id,
          lessonId: { in: moduleLessonIds },
          status: 'COMPLETED',
        },
      });

      const moduleComplete = completedLessons === moduleLessonIds.length;

      // Find next lesson and update enrollment position
      const modules = await ctx.prisma.module.findMany({
        where: { courseId: input.courseId },
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            select: { id: true },
          },
        },
      });

      const allLessons = modules.flatMap((m) =>
        m.lessons.map((l) => ({ ...l, moduleId: m.id }))
      );
      const currentIndex = allLessons.findIndex((l) => l.id === input.lessonId);
      const nextLesson = allLessons[currentIndex + 1];

      if (nextLesson) {
        await ctx.prisma.enrollment.updateMany({
          where: {
            userId: user.id,
            courseId: input.courseId,
          },
          data: {
            currentLessonId: nextLesson.id,
            currentModuleId: nextLesson.moduleId,
            completedLessons: { increment: 1 },
          },
        });
      }

      return {
        xpAwarded: lesson.xpReward,
        moduleComplete,
        alreadyCompleted: false,
      };
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
        },
        create: {
          userId: user.id,
          lessonId: input.lessonId,
          status: 'IN_PROGRESS',
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
        },
        create: {
          userId: user.id,
          lessonId: input.lessonId,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // Award XP
      const oldLevel = user.level;
      const newXP = user.totalXp + lesson.xpReward;
      const newLevel = calculateLevel(newXP);

      await ctx.prisma.user.update({
        where: { id: user.id },
        data: {
          totalXp: newXP,
          level: newLevel,
          lastActiveAt: new Date(),
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
        update: {},
        create: {
          userId: user.id,
          lessonId: input.lessonId,
          status: 'IN_PROGRESS',
          // time tracking fields removed from schema
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
