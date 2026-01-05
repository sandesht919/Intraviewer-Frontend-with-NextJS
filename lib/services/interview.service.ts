/**
 * Interview Service
 * Handles all interview-related API calls
 */

import { API_CONFIG, handleAPIResponse } from '../config/api';
import type {
  GenerateQuestionsRequest,
  GenerateQuestionsResponse,
  InterviewSession,
} from '../types';

import { useInterviewStore } from '../stores/interviewStore';

const API_BASE_URL = API_CONFIG.BASE_URL;

export class InterviewService {
  /**
   * Generate interview questions using AI
   */
  static async generateQuestions(
    session_id: number,
    accessToken?: string
  ): Promise<GenerateQuestionsResponse> {
    // Use local Next.js API route for now (replace with backend when ready)
    const response = await fetch(`${API_BASE_URL}/questions/generate/${session_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });

    const data = await handleAPIResponse<{
      message: string;
      count: number;
      questions: Array<{
        id: number;
        question_text: string;
        session_id: number;
        difficulty_level: string | null;
        order: number;
        created_at: string;
      }>;
    }>(response);

    console.log('🔍 Raw API response for questions:', data);

    // Map backend question format to frontend InterviewQuestion format
    const mappedQuestions = data.questions.map((q) => ({
      id: String(q.id),
      question: q.question_text,
      category: 'technical' as const, // Default category since backend doesn't have it
      difficulty: (q.difficulty_level?.toLowerCase() || 'medium') as 'easy' | 'medium' | 'hard',
    }));

    console.log('🔍 Mapped questions:', mappedQuestions);

    return {
      questions: mappedQuestions,
      message: data.message,
    };
  }

  /**
   * Upload CV and job description to backend
   * Returns cv_id and prompt_id needed for session creation
   */
  static async uploadUserData(
    cvFile: File | null,
    cvText: string | null,
    jobTopic: string,
    jobText: string,
    accessToken?: string
  ): Promise<{ cv_id: number; prompt_id: number }> {
    const formData = new FormData();

    if (cvFile) {
      formData.append('cv_file', cvFile);
    } else if (cvText) {
      formData.append('cv_text', cvText);
    }

    formData.append('job_topic', jobTopic);
    formData.append('job_text', jobText);

    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/userinput/data`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });

    return handleAPIResponse<{ cv_id: number; prompt_id: number }>(response);
  }

  /**
   * Start a new interview session with cv_id and prompt_id
   * Returns session_id from backend
   */
  static async createSession(
    cvId: number,
    promptId: number,
    accessToken?: string
  ): Promise<{ message: string; session_id: number }> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/sessions/start`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ cv_id: cvId, prompt_id: promptId }),
    });

    return handleAPIResponse<{ message: string; session_id: number }>(response);
  }

  /**
   * Submit interview response
   */
  static async submitResponse(
    sessionId: number | string,
    questionId: string,
    answer: string,
    accessToken?: string
  ): Promise<void> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/interviews/${sessionId}/responses`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ questionId, answer }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit response');
    }
  }

  /**
   * Complete interview session
   */
  static async completeSession(sessionId: number | string, accessToken?: string): Promise<void> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/sessions/end/${sessionId}`, {
      method: 'POST',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to complete session');
    }
  }

  /**
   * Get interview results
   */
  static async getResults(sessionId: string, accessToken?: string): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/interviews/${sessionId}/results`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    return handleAPIResponse(response);
  }

  /**
   * Fetch all interview sessions for current user
   */
  static async fetchSessions(accessToken?: string): Promise<InterviewSession[]> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/interviews/sessions`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    return handleAPIResponse<InterviewSession[]>(response);
  }

  /**
   * Upload CV file
   */
  static async uploadCV(file: File, accessToken?: string): Promise<string> {
    const formData = new FormData();
    formData.append('cv', file);

    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch('/api/interviews/upload-cv', {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await handleAPIResponse<{ cvContent: string }>(response);
    return data.cvContent;
  }
}
