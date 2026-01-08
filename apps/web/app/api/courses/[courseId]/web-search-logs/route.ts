import { NextRequest, NextResponse } from 'next/server';

// Simple Redis client using fetch (since we're in Next.js API route)
// Alternative: Use ioredis or redis package if available
async function getRedisLogs(courseId: string) {
  try {
    // Use a simple HTTP approach or direct Redis connection
    // For now, we'll use a Next.js API route that proxies to Redis
    // Or we can use the Redis client directly if available
    
    // Try to use Redis via a simple connection
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // Since we can't easily use Redis in Next.js without a package,
    // we'll create a helper that uses fetch to a Python endpoint
    // OR we can use the @upstash/redis package which works in serverless
    
    // For now, let's use a Python endpoint that reads from Redis
    const pythonApiUrl = process.env.CORE_API_URL || 'http://localhost:8000';
    const response = await fetch(`${pythonApiUrl}/api/web-search-logs/${courseId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    return { logs: [], count: 0 };
  } catch (error) {
    console.error('Error fetching Redis logs:', error);
    return { logs: [], count: 0 };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    
    // Fetch logs from Python backend (which has Redis access)
    const pythonApiUrl = process.env.CORE_API_URL || 'http://localhost:8000';
    const response = await fetch(`${pythonApiUrl}/api/web-search-logs/${courseId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store', // Always fetch fresh data
    });
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        courseId,
        logs: data.logs || [],
        count: data.count || 0,
      });
    }
    
    // Fallback: return empty logs if Python API is not available
    return NextResponse.json({
      courseId,
      logs: [],
      count: 0,
      error: 'Backend API not available',
    });
  } catch (error: any) {
    console.error('Error fetching web search logs:', error);
    
    return NextResponse.json({
      courseId: (await params).courseId,
      logs: [],
      count: 0,
      error: error.message || 'Failed to fetch logs',
    });
  }
}
