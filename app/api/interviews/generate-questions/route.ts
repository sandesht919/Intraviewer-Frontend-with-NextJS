/**
 * Mock Question Generation Endpoint
 * 
 * This is a temporary local endpoint for testing. Replace with your
 * actual backend LLM integration when ready.
 * 
 * Frontend calls: POST /api/interviews/generate-questions
 * Request body: { jobDescription: string, cvContent?: string }
 * Response: { questions: InterviewQuestion[] }
 */

import { NextRequest, NextResponse } from 'next/server';

interface InterviewQuestion {
  id: string;
  question: string;
  category: 'technical' | 'behavioral' | 'experience';
  difficulty: 'easy' | 'medium' | 'hard';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobDescription, cvContent } = body;

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    // Mock LLM response — returns 5 sample questions
    const mockQuestions: InterviewQuestion[] = [
      {
        id: '1',
        question: 'Tell me about your most relevant project related to this role.',
        category: 'experience',
        difficulty: 'medium'
      },
      {
        id: '2',
        question: 'What are the key technologies you would use to solve this problem?',
        category: 'technical',
        difficulty: 'hard'
      },
      {
        id: '3',
        question: 'How do you handle tight deadlines in your work?',
        category: 'behavioral',
        difficulty: 'easy'
      },
      {
        id: '4',
        question: 'Describe your approach to debugging complex issues.',
        category: 'technical',
        difficulty: 'medium'
      },
      {
        id: '5',
        question: 'Tell me about a time you faced conflict with a team member.',
        category: 'behavioral',
        difficulty: 'medium'
      }
    ];

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      questions: mockQuestions,
      message: 'Questions generated (mock)'
    });
  } catch (err: any) {
    console.error('Question generation error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
