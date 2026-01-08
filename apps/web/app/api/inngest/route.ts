import { NextRequest, NextResponse } from 'next/server';

// Inngest functions are registered in the FastAPI backend (apps/core)
// The main Inngest serve endpoint is at apps/core (FastAPI) /api/inngest
// This Next.js endpoint is not needed since all functions are in Python/FastAPI
// If you need to send events from Next.js, use the Inngest client directly

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Inngest functions are served from FastAPI backend at /api/inngest',
    backend: 'http://localhost:8000/api/inngest',
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: 'Inngest functions are served from FastAPI backend at /api/inngest',
    backend: 'http://localhost:8000/api/inngest',
  });
}



