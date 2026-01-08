import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@kortex/db";

interface CoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { userId } = await auth();
  const { courseId } = await params;

  if (!userId) {
    redirect("/sign-in");
  }

  // Get user's enrollment and current progress
  const user = await prisma.user.findFirst({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) {
    redirect("/dashboard");
  }

  // Get enrollment with current position
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
    select: {
      currentLessonId: true,
      currentModuleId: true,
    },
  });

  // Get the course with modules and lessons
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            take: 1, // Just need first lesson
          },
        },
      },
    },
  });

  if (!course || course.modules.length === 0) {
    redirect("/dashboard");
  }

  // Determine where to redirect
  let targetLessonId: string;

  if (enrollment?.currentLessonId) {
    // Resume from last position
    targetLessonId = enrollment.currentLessonId;
  } else if (enrollment?.currentModuleId) {
    // Find first lesson of current module
    const currentModule = course.modules.find(
      (m) => m.id === enrollment.currentModuleId
    );
    if (currentModule?.lessons[0]) {
      targetLessonId = currentModule.lessons[0].id;
    } else {
      targetLessonId = course.modules[0]!.lessons[0]!.id;
    }
  } else {
    // Start from the beginning
    targetLessonId = course.modules[0]!.lessons[0]!.id;
  }

  // If no enrollment exists, create one
  if (!enrollment) {
    const firstModule = course.modules[0]!;
    const firstLesson = firstModule.lessons[0]!;

    await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId,
        currentModuleId: firstModule.id,
        currentLessonId: firstLesson.id,
      },
    });

    targetLessonId = firstLesson.id;
  }

  // Redirect to the lesson
  redirect(`/learn/${courseId}/lesson/${targetLessonId}`);
}





