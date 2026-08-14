import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@kortex/db';
import { verifyInternalSecret } from '@/lib/internal-auth';

/**
 * API endpoint for Python backend to update lesson content.
 * This is called by the Author agent's Inngest function running in apps/core.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const unauthorized = verifyInternalSecret(request);
  if (unauthorized) return unauthorized;

  try {
    const { lessonId } = await params;
    const body = await request.json();

    const { mdxContent, duration } = body;

    const updateData: { mdxContent?: string; duration?: number } = {};
    if (mdxContent !== undefined) {
      updateData.mdxContent = mdxContent;
    }
    if (duration !== undefined) {
      updateData.duration = duration;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        mdxContent: lesson.mdxContent?.substring(0, 100) + '...',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error updating lesson:', message);
    return NextResponse.json(
      { error: 'Failed to update lesson', message },
      { status: 500 }
    );
  }
}
