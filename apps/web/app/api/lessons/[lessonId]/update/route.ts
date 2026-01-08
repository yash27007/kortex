import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@kortex/db';

/**
 * API endpoint for Python backend to update lesson content.
 * This is called by Inngest functions running in the Python backend.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;
    const body = await request.json();
    
    const { mdxContent, visualAid, duration } = body;
    
    // Update lesson in database
    const updateData: any = {};
    if (mdxContent !== undefined) {
      updateData.mdxContent = mdxContent;
    }
    if (visualAid !== undefined) {
      updateData.visualAid = visualAid;
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
        hasVisualAid: !!lesson.visualAid,
      },
    });
  } catch (error: any) {
    console.error('Error updating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson', message: error.message },
      { status: 500 }
    );
  }
}




