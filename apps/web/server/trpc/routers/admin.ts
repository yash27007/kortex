import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '@/server/trpc/init';
import { TRPCError } from '@trpc/server';
import { subDays, format } from 'date-fns';

export const adminRouter = createTRPCRouter({
  // Get AI-powered suggestions for course creation
  getCourseSuggestions: adminProcedure
    .input(
      z.object({
        field: z.enum(["title", "description", "category", "outcome", "targetAudience"]),
        input: z.string().min(3),
        context: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          category: z.string().optional(),
          difficulty: z.string().optional(),
        }).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const coreApiUrl = process.env.CORE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${coreApiUrl}/agent/suggestions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            field: input.field,
            input: input.input,
            context: input.context || {},
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get suggestions');
        }

        const data = await response.json();
        return {
          suggestions: data.suggestions || [],
        };
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        // Return empty suggestions on error (graceful degradation)
        return { suggestions: [] };
      }
    }),

  // Get admin dashboard stats
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [
      totalUsers,
      totalCourses,
      totalXpEarned,
      weeklyActiveUsers,
      newUsersThisWeek,
    ] = await Promise.all([
      ctx.prisma.user.count(),
      ctx.prisma.course.count({ where: { isPublished: true } }),
      ctx.prisma.user.aggregate({ _sum: { totalXp: true } }),
      ctx.prisma.user.count({
        where: {
          lastActiveAt: { gte: subDays(new Date(), 7) },
        },
      }),
      ctx.prisma.user.count({
        where: {
          createdAt: { gte: subDays(new Date(), 7) },
        },
      }),
    ]);

    return {
      totalUsers,
      totalCourses,
      totalXpEarned: totalXpEarned._sum.totalXp ?? 0,
      weeklyActiveUsers,
      newUsersThisWeek,
    };
  }),

  // Get all users for admin table
  getAllUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              enrollments: true,
              lessonProgress: { where: { status: 'COMPLETED' } },
              badges: true,
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (users.length > input.limit) {
        const nextItem = users.pop();
        nextCursor = nextItem?.id;
      }

      return { users, nextCursor };
    }),

  // Get user by ID with full details
  getUserById: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        include: {
          badges: {
            include: { badge: true },
            orderBy: { earnedAt: 'desc' },
          },
          enrollments: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  imageUrl: true,
                  slug: true,
                },
              },
            },
            orderBy: { lastAccessedAt: 'desc' },
          },
          _count: {
            select: {
              enrollments: true,
              lessonProgress: { where: { status: 'COMPLETED' } },
              badges: true,
              quizAttempts: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return user;
    }),

  // Get user activity for chart
  getUserActivity: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get lesson completions for last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30);

      const lessonProgress = await ctx.prisma.lessonProgress.findMany({
        where: {
          userId: input.userId,
          completedAt: { gte: thirtyDaysAgo },
          status: 'COMPLETED',
        },
        include: {
          lesson: {
            select: { xpReward: true },
          },
        },
        orderBy: { completedAt: 'asc' },
      });

      // Aggregate by day
      const dailyData: Record<string, { xp: number; lessons: number }> = {};

      for (let i = 0; i < 30; i++) {
        const date = format(subDays(new Date(), 29 - i), 'MMM d');
        dailyData[date] = { xp: 0, lessons: 0 };
      }

      for (const progress of lessonProgress) {
        if (progress.completedAt) {
          const date = format(progress.completedAt, 'MMM d');
          if (dailyData[date]) {
            dailyData[date].xp += progress.lesson.xpReward;
            dailyData[date].lessons += 1;
          }
        }
      }

      return {
        daily: Object.entries(dailyData).map(([date, data]) => ({
          date,
          ...data,
        })),
      };
    }),

  // ==========================================
  // COURSE MANAGEMENT
  // ==========================================

  // Get all courses (admin view - includes unpublished)
  getAllCourses: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
        published: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const courses = await ctx.prisma.course.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: input.published !== undefined ? { isPublished: input.published } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              modules: true,
              enrollments: true,
            },
          },
          generatedBy: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (courses.length > input.limit) {
        const nextItem = courses.pop();
        nextCursor = nextItem?.id;
      }

      return { courses, nextCursor };
    }),

  // Get course by ID with full details
  getCourseById: adminProcedure
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
                  type: true,
                  duration: true,
                  xpReward: true,
                },
              },
              quiz: {
                select: {
                  id: true,
                  title: true,
                  passingScore: true,
                },
              },
            },
          },
          enrollments: {
            take: 10,
            orderBy: { lastAccessedAt: 'desc' },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  imageUrl: true,
                },
              },
            },
          },
          generatedBy: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              modules: true,
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

  // Update course publish status
  toggleCoursePublish: adminProcedure
    .input(z.object({ courseId: z.string(), isPublished: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const course = await ctx.prisma.course.update({
        where: { id: input.courseId },
        data: { isPublished: input.isPublished },
      });

      return course;
    }),

  // Delete course
  deleteCourse: adminProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 1. Clean up external resources (Qdrant, Redis) via Core API
      try {
        const coreApiUrl = process.env.CORE_API_URL || 'http://localhost:8000';
        await fetch(`${coreApiUrl}/agent/course/${input.courseId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Failed to clean up external resources:', error);
        // Continue with DB deletion even if cleanup fails
      }

      // 2. Delete from Database (Cascade will handle relations)
      await ctx.prisma.course.delete({
        where: { id: input.courseId },
      });

      return { success: true };
    }),

  // Create new course and trigger AI generation
  createCourse: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        category: z.string().nullable(),
        difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
        targetAudience: z.string().nullable(),
        courseOutcomes: z.array(z.string()),
        materials: z.array(z.string()),
        youtubeLinks: z.array(z.string()),
        estimatedHours: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate slug from title
      const slug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Create course in staging mode
      const course = await ctx.prisma.course.create({
        data: {
          title: input.title,
          slug: slug,
          description: input.description,
          category: input.category,
          difficulty: input.difficulty,
          targetAudience: input.targetAudience,
          courseOutcomes: input.courseOutcomes,
          estimatedHours: input.estimatedHours,
          isPublished: false, // Staging mode
        },
      });

      // Trigger AI generation via Inngest event
      try {
        const inngestEventKey = process.env.INNGEST_EVENT_KEY;
        const inngestUrl = process.env.INNGEST_URL || 'http://localhost:8288';
        
        const eventData = {
          name: 'course.create',
          data: {
            course_id: course.id,
            title: input.title,
            description: input.description,
            target_audience: input.targetAudience || 'undergraduate students',
            duration_weeks: Math.ceil(input.estimatedHours / 5),
            pdf_urls: input.materials,
            youtube_urls: input.youtubeLinks,
            course_outcomes: input.courseOutcomes,
          },
        };
        
        console.log('[Course Creation] Triggering Inngest event:', {
          url: `${inngestUrl}/api/v1/events`,
          event: eventData.name,
          course_id: course.id,
          pdf_count: input.materials.length,
          youtube_count: input.youtubeLinks.length,
        });
        
        if (inngestEventKey || process.env.NODE_ENV === 'development') {
          // Send event to Inngest (will trigger FastAPI function)
          const response = await fetch(`${inngestUrl}/api/v1/events`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(inngestEventKey && { 'Authorization': `Bearer ${inngestEventKey}` }),
            },
            body: JSON.stringify(eventData),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('[Course Creation] Failed to trigger Inngest event:', {
              status: response.status,
              statusText: response.statusText,
              error: errorText,
            });
          } else {
            console.log('[Course Creation] ✅ Inngest event triggered successfully');
          }
        } else {
          // Fallback: Direct FastAPI call if Inngest not configured
          const coreApiUrl = process.env.CORE_API_URL || 'http://localhost:8000';
          const response = await fetch(`${coreApiUrl}/agent/structure`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              course_id: course.id,
              title: input.title,
              description: input.description,
              target_audience: input.targetAudience || 'undergraduate students',
              duration_weeks: Math.ceil(input.estimatedHours / 5),
              pdf_urls: input.materials,
              youtube_urls: input.youtubeLinks,
              course_outcomes: input.courseOutcomes,
            }),
          });

          if (!response.ok) {
            console.error('Failed to trigger AI generation:', await response.text());
          }
        }
      } catch (error) {
        console.error('Error triggering AI generation:', error);
        // Don't fail the course creation if AI trigger fails
      }

      return { courseId: course.id, course };
    }),

  // Get course generation status
  getCourseGenerationStatus: adminProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const course = await ctx.prisma.course.findUnique({
        where: { id: input.courseId },
        select: {
          id: true,
          modules: {
            select: {
              id: true,
              title: true,
              lessons: {
                select: {
                  id: true,
                  title: true,
                  mdxContent: true,
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

      const totalModules = course.modules.length;
      const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
      const lessonsWithContent = course.modules.reduce(
        (acc, m) => acc + m.lessons.filter(l => l.mdxContent && l.mdxContent.length > 0).length,
        0
      );

      return {
        courseId: course.id,
        status: totalModules > 0 && lessonsWithContent === totalLessons ? 'completed' : 'generating',
        progress: {
          modules: totalModules,
          lessons: totalLessons,
          lessonsWithContent,
          percentage: totalLessons > 0 ? Math.round((lessonsWithContent / totalLessons) * 100) : 0,
        },
      };
    }),

  // Regenerate specific module with AI
  regenerateModule: adminProcedure
    .input(
      z.object({
        courseId: z.string(),
        moduleId: z.string().optional(),
        moduleTitle: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const course = await ctx.prisma.course.findUnique({
        where: { id: input.courseId },
        include: {
          modules: true,
        },
      });

      if (!course) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Course not found',
        });
      }

      // Trigger AI module generation
      try {
        const coreApiUrl = process.env.CORE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${coreApiUrl}/agent/module`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course_id: input.courseId,
            module_id: input.moduleId,
            module_title: input.moduleTitle,
            course_title: course.title,
            course_description: course.description,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to regenerate module');
        }

        return { success: true, message: 'Module regeneration started' };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to regenerate module',
        });
      }
    }),

  // ==========================================
  // ANALYTICS
  // ==========================================

  // Get platform analytics
  getAnalytics: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sevenDaysAgo = subDays(now, 7);

    // User growth
    const [
      totalUsers,
      newUsersLast30Days,
      newUsersLast7Days,
      activeUsersLast30Days,
      activeUsersLast7Days,
    ] = await Promise.all([
      ctx.prisma.user.count(),
      ctx.prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      ctx.prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      ctx.prisma.user.count({
        where: { lastActiveAt: { gte: thirtyDaysAgo } },
      }),
      ctx.prisma.user.count({
        where: { lastActiveAt: { gte: sevenDaysAgo } },
      }),
    ]);

    // Course stats
    const [
      totalCourses,
      publishedCourses,
      totalEnrollments,
      activeEnrollments,
    ] = await Promise.all([
      ctx.prisma.course.count(),
      ctx.prisma.course.count({ where: { isPublished: true } }),
      ctx.prisma.enrollment.count(),
      ctx.prisma.enrollment.count({
        where: {
          status: 'ACTIVE',
          lastAccessedAt: { gte: sevenDaysAgo },
        },
      }),
    ]);

    // Learning stats
    const [
      totalLessonsCompleted,
      totalXpEarned,
      totalQuizzesPassed,
    ] = await Promise.all([
      ctx.prisma.lessonProgress.count({
        where: { status: 'COMPLETED' },
      }),
      ctx.prisma.user.aggregate({ _sum: { totalXp: true } }),
      ctx.prisma.quizAttempt.count({
        where: { passed: true },
      }),
    ]);

    // User growth over time (last 30 days)
    const dailyUserGrowth: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const date = format(subDays(now, 29 - i), 'MMM d');
      dailyUserGrowth[date] = 0;
    }

    const newUsers = await ctx.prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    });

    for (const user of newUsers) {
      const date = format(user.createdAt, 'MMM d');
      if (dailyUserGrowth[date] !== undefined) {
        dailyUserGrowth[date] += 1;
      }
    }

    // Course performance (top courses by enrollment)
    const topCourses = await ctx.prisma.course.findMany({
      where: { isPublished: true },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        enrollments: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    // XP distribution
    const xpDistribution = await ctx.prisma.user.findMany({
      select: { totalXp: true },
      orderBy: { totalXp: 'desc' },
    });

    const xpRanges = {
      '0-1000': 0,
      '1001-5000': 0,
      '5001-10000': 0,
      '10000+': 0,
    };

    for (const user of xpDistribution) {
      const xp = user.totalXp;
      if (xp <= 1000) xpRanges['0-1000']++;
      else if (xp <= 5000) xpRanges['1001-5000']++;
      else if (xp <= 10000) xpRanges['5001-10000']++;
      else xpRanges['10000+']++;
    }

    return {
      users: {
        total: totalUsers,
        newLast30Days: newUsersLast30Days,
        newLast7Days: newUsersLast7Days,
        activeLast30Days: activeUsersLast30Days,
        activeLast7Days: activeUsersLast7Days,
        dailyGrowth: Object.entries(dailyUserGrowth).map(([date, count]) => ({
          date,
          count,
        })),
      },
      courses: {
        total: totalCourses,
        published: publishedCourses,
        totalEnrollments,
        activeEnrollments,
        topCourses: topCourses.map((c) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          enrollments: c._count.enrollments,
        })),
      },
      learning: {
        lessonsCompleted: totalLessonsCompleted,
        totalXpEarned: totalXpEarned._sum.totalXp ?? 0,
        quizzesPassed: totalQuizzesPassed,
        xpDistribution: Object.entries(xpRanges).map(([range, count]) => ({
          range,
          count,
        })),
      },
    };
  }),

  // Get enrollment trends
  getEnrollmentTrends: adminProcedure
    .input(z.object({ days: z.number().min(7).max(90).default(30) }))
    .query(async ({ ctx, input }) => {
      const startDate = subDays(new Date(), input.days);
      
      const enrollments = await ctx.prisma.enrollment.findMany({
        where: {
          startedAt: { gte: startDate },
        },
        select: {
          startedAt: true,
          courseId: true,
        },
      });

      const dailyData: Record<string, { total: number; byCourse: Record<string, number> }> = {};
      
      for (let i = 0; i < input.days; i++) {
        const date = format(subDays(new Date(), input.days - 1 - i), 'MMM d');
        dailyData[date] = { total: 0, byCourse: {} };
      }

      for (const enrollment of enrollments) {
        const date = format(enrollment.startedAt, 'MMM d');
        if (dailyData[date]) {
          dailyData[date].total += 1;
          dailyData[date].byCourse[enrollment.courseId] = 
            (dailyData[date].byCourse[enrollment.courseId] ?? 0) + 1;
        }
      }

      return {
        daily: Object.entries(dailyData).map(([date, data]) => ({
          date,
          total: data.total,
          byCourse: data.byCourse,
        })),
      };
    }),
});




