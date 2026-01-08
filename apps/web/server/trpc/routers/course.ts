import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, baseProcedure } from '@/server/trpc/init';
import { TRPCError } from '@trpc/server';

export const courseRouter = createTRPCRouter({
  // Get all published courses
  getAll: baseProcedure
    .input(
      z.object({
        category: z.string().optional(),
        difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where = {
        isPublished: true,
        ...(input?.category && { category: input.category }),
        ...(input?.difficulty && { difficulty: input.difficulty }),
      };

      const courses = await ctx.prisma.course.findMany({
        where,
        take: (input?.limit ?? 20) + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              modules: true,
              enrollments: true,
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (courses.length > (input?.limit ?? 20)) {
        const nextItem = courses.pop();
        nextCursor = nextItem?.id;
      }

      return { courses, nextCursor };
    }),

  // Get course structure for sidebar (with modules and lessons)
  getStructure: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const course = await ctx.prisma.course.findUnique({
        where: { id: input.courseId },
        include: {
          modules: {
            orderBy: { order: 'asc' },
            include: {
              lessons: {
                orderBy: { order: 'asc' },
                select: {
                  id: true,
                  title: true,
                  order: true,
                  duration: true,
                  type: true,
                  xpReward: true,
                },
              },
              quiz: {
                select: {
                  id: true,
                  title: true,
                  passingScore: true,
                  xpReward: true,
                },
              },
            },
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Course not found',
        });
      }

      return course;
    }),

  // Get course by slug
  getBySlug: baseProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const course = await ctx.prisma.course.findUnique({
        where: { slug: input.slug },
        include: {
          modules: {
            orderBy: { order: 'asc' },
            include: {
              lessons: {
                orderBy: { order: 'asc' },
                select: {
                  id: true,
                  title: true,
                  description: true,
                  order: true,
                  type: true,
                  duration: true,
                  xpReward: true,
                  bloomLevel: true,
                },
              },
            },
          },
          generatedBy: {
            select: {
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Course not found',
        });
      }

      return course;
    }),

  // Get user's enrolled courses
  getEnrolled: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: { clerkId: ctx.userId },
      select: { id: true },
    });

    if (!user) {
      return [];
    }

    const enrollments = await ctx.prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            _count: {
              select: { modules: true },
            },
          },
        },
      },
      orderBy: { lastAccessedAt: 'desc' },
    });

    return enrollments;
  }),

  // Enroll in a course
  enroll: protectedProcedure
    .input(z.object({ courseId: z.string() }))
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

      // Check if already enrolled
      const existingEnrollment = await ctx.prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: input.courseId,
          },
        },
      });

      if (existingEnrollment) {
        return existingEnrollment;
      }

      // Create enrollment
      const enrollment = await ctx.prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId: input.courseId,
          lastAccessedAt: new Date(),
        },
        include: {
          course: true,
        },
      });

      return enrollment;
    }),

  // Get course progress (enhanced for course player)
  getProgress: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { clerkId: ctx.userId },
        select: { id: true },
      });

      if (!user) {
        return null;
      }

      const enrollment = await ctx.prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: input.courseId,
          },
        },
      });

      if (!enrollment) {
        return null;
      }

      // Get all modules in course
      const modules = await ctx.prisma.module.findMany({
        where: { courseId: input.courseId },
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            select: { id: true },
            orderBy: { order: 'asc' },
          },
          quiz: {
            select: { id: true },
          },
        },
      });

      // Get all lesson IDs
      const allLessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));

      // Get completed lessons
      const completedLessons = await ctx.prisma.lessonProgress.findMany({
        where: {
          userId: user.id,
          lessonId: { in: allLessonIds },
          status: 'COMPLETED',
        },
        select: { lessonId: true },
      });

      const completedLessonIds = completedLessons.map((l) => l.lessonId);

      // Get completed quizzes (passed)
      const passedQuizzes = await ctx.prisma.quizAttempt.findMany({
        where: {
          userId: user.id,
          passed: true,
          quiz: {
            module: {
              courseId: input.courseId,
            },
          },
        },
        select: {
          quiz: {
            select: { moduleId: true },
          },
        },
      });

      // Determine completed modules (all lessons + quiz passed)
      const completedModuleIds: string[] = [];
      for (const module of modules) {
        const moduleLessonIds = module.lessons.map((l) => l.id);
        const allLessonsComplete = moduleLessonIds.every((id) =>
          completedLessonIds.includes(id)
        );
        const quizPassed = passedQuizzes.some(
          (q) => q.quiz.moduleId === module.id
        );
        
        // Module is complete if all lessons done AND quiz passed (if quiz exists)
        if (allLessonsComplete && (!module.quiz || quizPassed)) {
          completedModuleIds.push(module.id);
        }
      }

      const progress = allLessonIds.length > 0
        ? Math.round((completedLessonIds.length / allLessonIds.length) * 100)
        : 0;

      return {
        enrollment,
        currentModuleId: enrollment.currentModuleId,
        currentLessonId: enrollment.currentLessonId,
        totalLessons: allLessonIds.length,
        completedLessons: completedLessonIds.length,
        totalXpEarned: enrollment.totalXpEarned,
        progress,
        completedLessonIds,
        completedModuleIds,
      };
    }),

  // Get categories
  getCategories: baseProcedure.query(async ({ ctx }) => {
    const courses = await ctx.prisma.course.findMany({
      where: {
        isPublished: true,
        category: { not: null },
      },
      select: { category: true },
      distinct: ['category'],
    });

    return courses
      .map((c) => c.category)
      .filter((c): c is string => c !== null);
  }),

  // Get user's generated courses
  getGenerated: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: { clerkId: ctx.userId },
      select: { id: true },
    });

    if (!user) {
      return [];
    }

    const courses = await ctx.prisma.course.findMany({
      where: { generatedById: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
    });

    return courses;
  }),
});
