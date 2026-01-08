import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@kortex/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    // Get course with modules and lessons to determine progress
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
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
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const totalModules = course.modules.length;
    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    const lessonsWithContent = course.modules.reduce(
      (acc, m) => acc + m.lessons.filter(l => l.mdxContent && l.mdxContent.length > 0).length,
      0
    );

    // Determine current task based on progress
    const tasks = buildTaskList(course.modules, totalLessons, lessonsWithContent);

    return NextResponse.json({
      courseId,
      status: totalModules > 0 && lessonsWithContent === totalLessons ? 'completed' : 'generating',
      tasks,
      progress: {
        modules: totalModules,
        lessons: totalLessons,
        lessonsWithContent,
        percentage: totalLessons > 0 ? Math.round((lessonsWithContent / totalLessons) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching agent status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent status' },
      { status: 500 }
    );
  }
}

function buildTaskList(
  modules: any[],
  totalLessons: number,
  lessonsWithContent: number
): any[] {
  const hasModules = modules.length > 0;
  const allLessonsHaveContent = totalLessons > 0 && lessonsWithContent === totalLessons;

  return [
    {
      id: '1',
      name: 'Ingest Materials',
      description: 'Downloading and processing PDFs and documents',
      status: hasModules ? 'completed' : (totalLessons === 0 ? 'in_progress' : 'pending'),
      progress: hasModules ? 100 : (totalLessons === 0 ? 50 : undefined),
      subtasks: [
        {
          id: '1-1',
          name: 'Download PDFs',
          description: 'Fetching material URLs',
          status: hasModules ? 'completed' : (totalLessons === 0 ? 'in_progress' : 'pending'),
        },
        {
          id: '1-2',
          name: 'Extract Text',
          description: 'Extracting text content from PDFs',
          status: hasModules ? 'completed' : (totalLessons === 0 ? 'in_progress' : 'pending'),
        },
        {
          id: '1-3',
          name: 'Chunk Content',
          description: 'Breaking content into searchable chunks',
          status: hasModules ? 'completed' : 'pending',
        },
      ],
    },
    {
      id: '2',
      name: 'Web Research',
      description: 'Searching for university syllabi and course materials',
      status: hasModules ? 'completed' : (totalLessons === 0 ? 'in_progress' : 'pending'),
      progress: hasModules ? 100 : (totalLessons === 0 ? 30 : undefined),
      subtasks: [
        {
          id: '2-1',
          name: 'Search MIT/IIT Sources',
          description: 'Finding relevant course syllabi',
          status: hasModules ? 'completed' : (totalLessons === 0 ? 'in_progress' : 'pending'),
        },
        {
          id: '2-2',
          name: 'Index Web Content',
          description: 'Processing and indexing web sources',
          status: hasModules ? 'completed' : 'pending',
        },
      ],
    },
    {
      id: '3',
      name: 'Generate Course Structure',
      description: 'Creating modules and lessons following Bloom\'s Taxonomy',
      status: hasModules ? 'completed' : (totalLessons === 0 ? 'in_progress' : 'pending'),
      progress: hasModules ? 100 : (totalLessons === 0 ? 20 : undefined),
      subtasks: [
        {
          id: '3-1',
          name: 'Design Curriculum',
          description: 'Planning course progression',
          status: hasModules ? 'completed' : (totalLessons === 0 ? 'in_progress' : 'pending'),
        },
        {
          id: '3-2',
          name: 'Create Modules',
          description: `Generated ${modules.length} modules`,
          status: hasModules ? 'completed' : 'pending',
        },
        {
          id: '3-3',
          name: 'Create Lessons',
          description: `Generated ${totalLessons} lessons`,
          status: hasModules ? 'completed' : 'pending',
        },
      ],
    },
    {
      id: '4',
      name: 'Vectorize Content',
      description: 'Storing content in vector database for RAG',
      status: hasModules ? 'completed' : 'pending',
      progress: hasModules ? 100 : undefined,
      subtasks: [
        {
          id: '4-1',
          name: 'Generate Embeddings',
          description: 'Creating vector embeddings',
          status: hasModules ? 'completed' : 'pending',
        },
        {
          id: '4-2',
          name: 'Store in Qdrant',
          description: 'Saving to vector database',
          status: hasModules ? 'completed' : 'pending',
        },
      ],
    },
    {
      id: '5',
      name: 'Generate Lesson Content',
      description: `Creating MDX content for ${totalLessons} lessons`,
      status: allLessonsHaveContent ? 'completed' : (lessonsWithContent > 0 ? 'in_progress' : 'pending'),
      progress: totalLessons > 0 ? Math.round((lessonsWithContent / totalLessons) * 100) : undefined,
      subtasks: [],
    },
    {
      id: '6',
      name: 'Create Animations',
      description: 'Generating visual animations where needed',
      status: allLessonsHaveContent ? 'completed' : (lessonsWithContent > 0 ? 'in_progress' : 'pending'),
      progress: allLessonsHaveContent ? 100 : (lessonsWithContent > 0 ? 50 : undefined),
      subtasks: [],
    },
    {
      id: '7',
      name: 'Quality Verification',
      description: 'Verifying content quality and correctness',
      status: allLessonsHaveContent ? 'completed' : 'pending',
      progress: allLessonsHaveContent ? 100 : undefined,
      subtasks: [
        {
          id: '7-1',
          name: 'Check Content Quality',
          description: 'Reviewing generated content',
          status: allLessonsHaveContent ? 'completed' : 'pending',
        },
        {
          id: '7-2',
          name: 'Validate Structure',
          description: 'Ensuring proper course flow',
          status: allLessonsHaveContent ? 'completed' : 'pending',
        },
      ],
    },
    {
      id: '8',
      name: 'Save to Database',
      description: 'Storing course in staging mode',
      status: allLessonsHaveContent ? 'completed' : 'pending',
      progress: allLessonsHaveContent ? 100 : undefined,
      subtasks: [],
    },
  ];
}




