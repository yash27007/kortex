import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc/init';
import { TRPCError } from '@trpc/server';

interface QuizQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false';
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export const quizRouter = createTRPCRouter({
  // Get quiz by module ID
  getByModuleId: protectedProcedure
    .input(z.object({ moduleId: z.string() }))
    .query(async ({ ctx, input }) => {
      const quiz = await ctx.prisma.quiz.findUnique({
        where: { moduleId: input.moduleId },
      });

      if (!quiz) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quiz not found for this module',
        });
      }

      // Remove correct answers from questions for client
      const questions = quiz.questions as unknown as QuizQuestion[];
      const sanitizedQuestions = questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        // Don't send correctAnswer to client during quiz
      }));

      return {
        ...quiz,
        questions: sanitizedQuestions,
      };
    }),

  // Get module info for quiz header
  getModuleInfo: protectedProcedure
    .input(z.object({ moduleId: z.string() }))
    .query(async ({ ctx, input }) => {
      const module = await ctx.prisma.module.findUnique({
        where: { id: input.moduleId },
        select: {
          id: true,
          title: true,
          description: true,
          bloomLevel: true,
          courseOutcome: true,
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      if (!module) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Module not found',
        });
      }

      return module;
    }),

  // Submit quiz answers
  submit: protectedProcedure
    .input(
      z.object({
        quizId: z.string(),
        answers: z.record(z.string(), z.string()),
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

      // Get quiz with correct answers
      const quiz = await ctx.prisma.quiz.findUnique({
        where: { id: input.quizId },
        include: {
          module: {
            include: {
              course: true,
            },
          },
        },
      });

      if (!quiz) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quiz not found',
        });
      }

      // Calculate score
      const questions = quiz.questions as unknown as QuizQuestion[];
      let correctCount = 0;

      for (const question of questions) {
        if (input.answers[question.id] === question.correctAnswer) {
          correctCount++;
        }
      }

      const score = Math.round((correctCount / questions.length) * 100);
      const passed = score >= quiz.passingScore;

      // Check if user already passed this quiz
      const existingPass = await ctx.prisma.quizAttempt.findFirst({
        where: {
          quizId: input.quizId,
          userId: user.id,
          passed: true,
        },
      });

      // Award XP only if first time passing
      const xpAwarded = passed && !existingPass ? quiz.xpReward : 0;

      // Create quiz attempt
      const attempt = await ctx.prisma.quizAttempt.create({
        data: {
          quizId: input.quizId,
          userId: user.id,
          score,
          passed,
          answers: input.answers,
          xpAwarded,
        },
      });

      // If passed for first time, update user XP and enrollment
      if (xpAwarded > 0) {
        // Update user XP
        await ctx.prisma.user.update({
          where: { id: user.id },
          data: {
            totalXp: { increment: xpAwarded },
            lastActiveAt: new Date(),
          },
        });

        // Update enrollment - mark module as complete and advance to next
        const courseId = quiz.module.courseId;

        // Get next module
        const nextModule = await ctx.prisma.module.findFirst({
          where: {
            courseId,
            order: { gt: quiz.module.order },
          },
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              take: 1,
            },
          },
        });

        await ctx.prisma.enrollment.updateMany({
          where: {
            userId: user.id,
            courseId,
          },
          data: {
            currentModuleId: nextModule?.id ?? null,
            currentLessonId: nextModule?.lessons[0]?.id ?? null,
            completedModules: { increment: 1 },
            totalXpEarned: { increment: xpAwarded },
            lastAccessedAt: new Date(),
            // If no next module, course is complete
            ...(nextModule ? {} : { status: 'COMPLETED', completedAt: new Date() }),
          },
        });
      }

      return {
        attemptId: attempt.id,
        score,
        passed,
        xpAwarded,
        correctCount,
        totalQuestions: questions.length,
        // Include correct answers for review
        questions: questions.map((q) => ({
          id: q.id,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        })),
      };
    }),

  // Get quiz history for a user
  getHistory: protectedProcedure
    .input(z.object({ quizId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { clerkId: ctx.userId },
        select: { id: true },
      });

      if (!user) {
        return [];
      }

      return ctx.prisma.quizAttempt.findMany({
        where: {
          quizId: input.quizId,
          userId: user.id,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
    }),
});





