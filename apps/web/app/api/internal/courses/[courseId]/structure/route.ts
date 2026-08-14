import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@kortex/db";
import { z } from "zod";
import { verifyInternalSecret } from "@/lib/internal-auth";

/**
 * Persists the Architect agent's generated course structure — modules,
 * lessons, and gatekeeper quizzes — into Postgres. Called once by the
 * Inngest `create-course-structure` function after it finishes researching
 * and drafting the curriculum.
 *
 * The Architect only knows placeholder ids (it can't mint valid cuids), so
 * this route creates the real rows and hands back id maps. The Architect
 * uses those maps to address the real lesson rows when it fans out
 * `lesson.generate` events to the Author agent.
 */

const BLOOM_LEVELS = [
  "REMEMBER",
  "UNDERSTAND",
  "APPLY",
  "ANALYZE",
  "EVALUATE",
  "CREATE",
] as const;

const QuizQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.enum(["multiple_choice", "true_false"]),
  options: z.array(z.string()).min(2),
  correctAnswer: z.string(),
  explanation: z.string().optional(),
});

const QuizInputSchema = z.object({
  title: z.string().default("Module Assessment"),
  questions: z.array(QuizQuestionSchema).min(1),
  passingScore: z.number().int().min(0).max(100).default(80),
  xpReward: z.number().int().default(100),
});

const LessonInputSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  order: z.number().int(),
  bloomLevel: z.enum(BLOOM_LEVELS),
  durationMinutes: z.number().int().default(30),
  keyConcepts: z.array(z.string()).default([]),
});

const ModuleInputSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  order: z.number().int(),
  bloomLevel: z.enum(BLOOM_LEVELS),
  courseOutcomes: z.array(z.string()).default([]),
  estimatedMinutes: z.number().int().default(60),
  lessons: z.array(LessonInputSchema).min(1),
  quiz: QuizInputSchema.optional(),
});

const StructurePayloadSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  courseOutcomes: z.array(z.string()).optional(),
  estimatedHours: z.number().int().optional(),
  modules: z.array(ModuleInputSchema).min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const unauthorized = verifyInternalSecret(request);
  if (unauthorized) return unauthorized;

  const { courseId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = StructurePayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const moduleIdMap: Record<string, string> = {};
  const lessonIdMap: Record<string, string> = {};

  try {
    await prisma.$transaction(async (tx) => {
      if (data.title || data.description || data.courseOutcomes || data.estimatedHours) {
        await tx.course.update({
          where: { id: courseId },
          data: {
            ...(data.title && { title: data.title }),
            ...(data.description && { description: data.description }),
            ...(data.courseOutcomes && { courseOutcomes: data.courseOutcomes }),
            ...(data.estimatedHours && { estimatedHours: data.estimatedHours }),
          },
        });
      }

      for (const mod of data.modules) {
        const courseOutcome =
          mod.courseOutcomes.length > 0
            ? mod.courseOutcomes.join("; ")
            : `Understand and apply the core concepts of ${mod.title}`;

        const createdModule = await tx.module.create({
          data: {
            courseId,
            title: mod.title,
            description: mod.description,
            order: mod.order,
            bloomLevel: mod.bloomLevel,
            courseOutcome,
            estimatedMinutes: mod.estimatedMinutes,
          },
        });
        moduleIdMap[mod.id] = createdModule.id;

        for (const lesson of mod.lessons) {
          const createdLesson = await tx.lesson.create({
            data: {
              moduleId: createdModule.id,
              title: lesson.title,
              description: lesson.description,
              order: lesson.order,
              bloomLevel: lesson.bloomLevel,
              duration: lesson.durationMinutes,
              keyConcepts: lesson.keyConcepts,
              // Filled in moments later by the Author agent's own callback.
              mdxContent: "",
            },
          });
          lessonIdMap[lesson.id] = createdLesson.id;
        }

        if (mod.quiz) {
          await tx.quiz.create({
            data: {
              moduleId: createdModule.id,
              title: mod.quiz.title,
              questions: mod.quiz.questions,
              passingScore: mod.quiz.passingScore,
              xpReward: mod.quiz.xpReward,
            },
          });
        }
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[internal/courses/structure] persist failed:", message);
    return NextResponse.json(
      { error: "Failed to persist course structure", message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    courseId,
    moduleIdMap,
    lessonIdMap,
  });
}
