/**
 * Mock CV Upload Endpoint
 * 
 * This is a temporary local endpoint for testing. Replace with your
 * actual backend endpoint when the backend is ready.
 * 
 * Frontend calls: POST /api/interviews/upload-cv
 * Expected request: FormData with 'file' field containing CV file
 * Response: { fileName: string, parsedContent: string }
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read file content as text (basic mock — real backend would parse CV/PDF)
    const buffer = await file.arrayBuffer();
    const text = Buffer.from(buffer).toString('utf-8', 0, Math.min(1000, buffer.byteLength));

    // Mock parsed content from CV
    const mockParsedContent = `CV File: ${file.name}\nSize: ${file.size} bytes\nType: ${file.type}\n\nFile Preview:\n${text.substring(0, 200)}...`;

    return NextResponse.json({
      fileName: file.name,
      parsedContent: mockParsedContent,
      message: 'CV uploaded successfully (mock)'
    });
  } catch (err: any) {
    console.error('CV upload error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to upload CV' },
      { status: 500 }
    );
  }
}
