/**
 * Mock Interview Start Endpoint
 * 
 * This is a temporary local endpoint for testing. Replace with your
 * actual backend session management when ready.
 * 
 * Frontend calls: POST /api/interviews/start
 * Request body: { questions: InterviewQuestion[], jobDescription: string, cvFileName?: string }
 * Response: { sessionId: string, status: string, startTime: string, questions: InterviewQuestion[] }
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questions, jobDescription, cvFileName } = body;

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Questions are required to start an interview' },
        { status: 400 }
      );
    }

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    // Mock session creation
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = new Date().toISOString();

    return NextResponse.json({
      sessionId,
      status: 'in-progress',
      startTime,
      jobTitle: jobDescription.split('\n')[0] || 'Interview Session',
      jobDescription,
      questions,
      cvFileName: cvFileName || null,
      message: 'Interview session started (mock)'
    });
  } catch (err: any) {
    console.error('Interview start error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to start interview' },
      { status: 500 }
    );
  }
}
