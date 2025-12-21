import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, baseProcedure } from '@/server/trpc/init';
import { TRPCError } from '@trpc/server';

export const userRouter = createTRPCRouter({
  // Get current user's profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: { clerkId: ctx.userId },
      include: {
        badges: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' },
        },
        enrollments: {
          include: { course: true },
          orderBy: { lastAccessedAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            enrollments: true,
            lessonProgress: { where: { status: 'COMPLETED' } },
            badges: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User profile not found. Please complete onboarding.',
      });
    }

    return user;
  }),

  // Get user stats for dashboard
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: { clerkId: ctx.userId },
      select: {
        xp: true,
        level: true,
        streak: true,
        longestStreak: true,
        _count: {
          select: {
            enrollments: { where: { status: 'COMPLETED' } },
            lessonProgress: { where: { status: 'COMPLETED' } },
            badges: true,
          },
        },
      },
    });

    if (!user) {
      return {
        xp: 0,
        level: 1,
        streak: 0,
        longestStreak: 0,
        completedCourses: 0,
        completedLessons: 0,
        badgesEarned: 0,
      };
    }

    return {
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      longestStreak: user.longestStreak,
      completedCourses: user._count.enrollments,
      completedLessons: user._count.lessonProgress,
      badgesEarned: user._count.badges,
    };
  }),

  // Add XP to user
  addXP: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        reason: z.enum([
          'LESSON_COMPLETE',
          'QUIZ_PASS',
          'QUIZ_PERFECT',
          'COURSE_COMPLETE',
          'BADGE_EARNED',
          'STREAK_BONUS',
          'DAILY_LOGIN',
        ]),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
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

      const newXP = user.xp + input.amount;
      const newLevel = calculateLevel(newXP);

      // Update user XP and level
      const updatedUser = await ctx.prisma.user.update({
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
          amount: input.amount,
          reason: input.reason,
          metadata: input.metadata ?? undefined,
        },
      });

      return {
        xp: updatedUser.xp,
        level: updatedUser.level,
        leveledUp: newLevel > user.level,
      };
    }),

  // Get XP history
  getXPHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { clerkId: ctx.userId },
        select: { id: true },
      });

      if (!user) {
        return { items: [], nextCursor: undefined };
      }

      const items = await ctx.prisma.xPHistory.findMany({
        where: { userId: user.id },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { earnedAt: 'desc' },
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor };
    }),

  // Update email preferences
  updateEmailPreferences: protectedProcedure
    .input(
      z.object({
        studyReminders: z.boolean().optional(),
        weeklyDigest: z.boolean().optional(),
        courseUpdates: z.boolean().optional(),
      })
    )
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

      const currentPrefs = user.emailPreferences as Record<string, boolean>;
      const newPrefs = { ...currentPrefs, ...input };

      return ctx.prisma.user.update({
        where: { id: user.id },
        data: { emailPreferences: newPrefs },
        select: { emailPreferences: true },
      });
    }),

  // Get user badges
  getBadges: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: { clerkId: ctx.userId },
      select: { id: true },
    });

    if (!user) {
      return { earned: [], available: [] };
    }

    const [earnedBadges, allBadges] = await Promise.all([
      ctx.prisma.userBadge.findMany({
        where: { userId: user.id },
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
      }),
      ctx.prisma.badge.findMany(),
    ]);

    const earnedBadgeIds = new Set(earnedBadges.map((ub) => ub.badgeId));
    const availableBadges = allBadges.filter((b) => !earnedBadgeIds.has(b.id));

    return {
      earned: earnedBadges,
      available: availableBadges,
    };
  }),
});

// Calculate level based on XP (exponential curve)
function calculateLevel(xp: number): number {
  // Each level requires more XP than the previous
  // Level 1: 0 XP, Level 2: 1000 XP, Level 3: 3000 XP, etc.
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
