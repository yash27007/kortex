import { NextRequest, NextResponse } from 'next/server';

/**
 * Upload file to FastAPI backend storage
 * This endpoint proxies file uploads to the Python backend
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string || 'pdfs';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDFs and Word documents are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Forward to FastAPI backend
    const fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('bucket', bucket);

    const response = await fetch(`${fastApiUrl}/storage/upload/${bucket}`, {
      method: 'POST',
      body: uploadFormData,
    });

            if (!response.ok) {
              let errorMessage = 'Upload failed';
              try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorData.error || errorMessage;
              } catch {
                const errorText = await response.text();
                errorMessage = errorText || errorMessage;
              }
              
              console.error('[Upload API] FastAPI error:', {
                status: response.status,
                error: errorMessage,
              });
              
              return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
              );
            }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Upload] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}




