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

const API_BASE_URL = API_CONFIG.BASE_URL;

export class InterviewService {
  /**
   * Generate interview questions using AI
   */
  static async generateQuestions(
    request: GenerateQuestionsRequest
  ): Promise<GenerateQuestionsResponse> {
    // Use local Next.js API route for now (replace with backend when ready)
    const response = await fetch('/api/interviews/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    return handleAPIResponse<GenerateQuestionsResponse>(response);
  }

  /**
   * Start a new interview session
   */
  static async startSession(
    jobDescription: string,
    cvContent?: string,
    accessToken?: string
  ): Promise<InterviewSession> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/interviews/start`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ jobDescription, cvContent }),
    });

    return handleAPIResponse<InterviewSession>(response);
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

    const response = await fetch(`${API_BASE_URL}/interviews/${sessionId}/complete`, {
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
