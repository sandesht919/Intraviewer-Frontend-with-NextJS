/**
 * Interview Type Definitions
 */

export type QuestionCategory = 'technical' | 'behavioral' | 'experience';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type InterviewStatus = 'preparation' | 'in-progress' | 'completed' | 'cancelled';

export interface InterviewQuestion {
  id: string;
  question: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
}

export interface InterviewResponse {
  questionId: string;
  answer: string;
  recordingUrl?: string;
  duration: number;
  timestamp: Date;
}

export interface InterviewSession {
  id: number | string;
  jobDescription: string;
  cvContent?: string;
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  status: InterviewStatus;
  createdAt: Date;
  completedAt?: Date;
}

export interface GenerateQuestionsRequest {
  jobDescription: string;
  cvContent?: string;
}

export interface GenerateQuestionsResponse {
  questions: InterviewQuestion[];
  message?: string;
}
