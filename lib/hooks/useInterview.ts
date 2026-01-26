/**
 * useInterview Hook
 * 
 * Custom hook for managing interview session state and data.
 * Handles CV data, job description, generated questions, and interview responses.
 * Note: CV is optional — providing a clear job description is sufficient for
 * question generation in the mock flow. In production the backend may use both
 * CV and job description to produce more tailored questions.
 * 
 * Future Integration:
 * - NOTE: In the current design all heavy work (LLM question generation,
 *   analysis, and session orchestration) is performed by the backend. The
 *   frontend acts as a portal that uploads CVs, submits job descriptions,
 *   requests question generation, and starts interview sessions. Backend
 *   integration points are documented in `API_INTEGRATION.md`.
 * - Integrate WebSocket for real-time communication (signaling, analysis)
 * - Send interview session data to backend for analysis
 */

import { useState, useCallback } from 'react';

/**
 * Interface for CV data structure
 */
interface CVData {
  file: File | null;
  fileName: string;
  parsedContent?: string; // Will be populated after backend parses the CV
}

/**
 * Interface for interview question structure
 */
interface InterviewQuestion {
  id: string;
  question: string;
  category: string; // e.g., "technical", "behavioral", "experience"
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Interface for user response during interview
 */
interface InterviewResponse {
  questionId: string;
  answer: string;
  duration: number; // in seconds
  audioBlob?: Blob; // Will store audio recording
}

/**
 * Interface for interview session data
 */
interface InterviewSession {
  id: string;
  jobTitle: string;
  jobDescription: string;
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  startTime?: Date;
  endTime?: Date;
  status: 'not-started' | 'in-progress' | 'completed';
}

/**
 * Custom hook for managing interview state
 * 
 * @returns {Object} Interview state and methods
 * - cvData: Current CV file and content
 * - jobDescription: Job description text
 * - interviewQuestions: Generated interview questions
 * - currentSession: Active interview session
 * - uploadCV: Function to upload CV file
 * - setJobDescription: Function to update job description
 * - generateQuestions: Function to generate questions from CV and job desc
 * - startInterview: Function to initialize interview session
 * - addResponse: Function to record user response
 * - completeInterview: Function to finalize interview
 */
export const useInterview = () => {
  const [cvData, setCVData] = useState<CVData>({
    file: null,
    fileName: ''
  });

  const [jobDescription, setJobDescription] = useState<string>('');
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload CV file
   * TODO: Send file to backend for parsing and storage
   * Expected backend endpoint: POST /api/interviews/upload-cv
   * Expected response: { parsedContent: string }
   */
  const uploadCV = useCallback(async (file: File | null) => {
    try {
      if (!file) {
        setCVData({ file: null, fileName: '' });
        setError(null);
        return;
      }

      // Validate file type (should be PDF, JPG, PNG, DOCX)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload PDF, JPG, PNG, or DOCX.');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit.');
      }

      // Optimistic UI update
      setCVData({ file, fileName: file.name });

      // Send file to backend for parsing/storage
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const endpoint = API_URL ? `${API_URL}/userinput/data` : '/userinput/data';
      const formData = new FormData();
      formData.append('file', file);

      const resp = await fetch(endpoint, { method: 'POST', body: formData });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || 'Failed to upload CV');
      }

      const data = await resp.json();
      setCVData(prev => ({ file: prev.file, fileName: data.fileName || file.name, parsedContent: data.parsedContent || prev.parsedContent }));
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload CV');
    }
  }, []);

  /**
   * Generate interview questions using LLM
   * TODO: Send CV data and job description to backend for question generation
   * Expected backend endpoint: POST /api/interviews/generate-questions
   * Expected request: { cvContent: string, jobDescription: string }
   * Expected response: { questions: InterviewQuestion[] }
   */
  /**
   * Generate interview questions using LLM
   * Accepts an optional `jobDescOverride` to avoid relying on a
   * stale closure when `setJobDescription` is called immediately
   * before this function (common in forms which update local state
   * then call the generator).
   *
   * CV is optional now — generation will proceed when a job
   * description is provided. If CV is present it will be used to
   * enrich the questions, otherwise only the job description is
   * considered.
   */
  const generateQuestions = useCallback(async (jobDescOverride?: string) => {
    const effectiveJobDesc = (jobDescOverride ?? jobDescription)?.trim() ?? '';

    if (!effectiveJobDesc) {
      setError('Please provide a job description');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const endpoint = API_URL ? `${API_URL}/api/interviews/generate-questions` : '/api/interviews/generate-questions';

      const payload = { jobDescription: effectiveJobDesc, cvContent: cvData.parsedContent || undefined };

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(t || 'Server failed to generate questions');
      }

      const data = await resp.json();
      setInterviewQuestions(data.questions || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  }, [cvData, jobDescription]);

  /**
   * Start interview session
   * TODO: Initialize WebSocket connection for real-time communication
   * Initialize WebRTC connection for audio/video
   */
  const startInterview = useCallback(async () => {
    if (interviewQuestions.length === 0) {
      setError('No questions available. Please generate questions first.');
      return;
    }

    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const endpoint = API_URL ? `${API_URL}/api/interviews/start` : '/api/interviews/start';

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: interviewQuestions, jobDescription, cvFileName: cvData.fileName || undefined })
      });

      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(t || 'Failed to start interview session');
      }

      const data = await resp.json();

      const session: InterviewSession = {
        id: data.sessionId || 'session_' + Date.now(),
        jobTitle: data.jobTitle || '',
        jobDescription: data.jobDescription || jobDescription,
        questions: data.questions || interviewQuestions,
        responses: [],
        startTime: data.startTime ? new Date(data.startTime) : new Date(),
        status: data.status || 'in-progress'
      };

      setCurrentSession(session);
    } catch (err: any) {
      setError(err?.message || 'Failed to start interview');
    }
  }, [interviewQuestions, jobDescription, cvData]);

  /**
   * Add response to current question during interview
   * TODO: Send response to backend for real-time analysis if needed
   * Expected backend endpoint: POST /api/interviews/add-response
   */
  const addResponse = useCallback((response: InterviewResponse) => {
    if (!currentSession) {
      setError('No active interview session');
      return;
    }

    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        responses: [...prev.responses, response]
      };
    });

    // TODO: Send response to backend
    // await fetch('/api/interviews/add-response', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(response)
    // });
  }, [currentSession]);

  /**
   * Complete interview and trigger analysis
   * TODO: Send complete interview data to backend for analysis
   * Expected backend endpoint: POST /api/interviews/complete
   * Will trigger facial expression analysis and performance evaluation
   */
  const completeInterview = useCallback(async () => {
    if (!currentSession) {
      setError('No active interview session');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // TODO: Send interview data to backend for analysis
      // const response = await fetch('/api/interviews/complete', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     sessionId: currentSession.id,
      //     responses: currentSession.responses
      //   })
      // });
      // const analysisData = await response.json();

      // Simulating analysis processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      setCurrentSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'completed',
          endTime: new Date()
        };
      });
    } catch (err: any) {
      setError(err.message || 'Failed to complete interview');
    } finally {
      setIsGenerating(false);
    }
  }, [currentSession]);

  /**
   * Reset interview state
   */
  const resetInterview = useCallback(() => {
    setCVData({ file: null, fileName: '' });
    setJobDescription('');
    setInterviewQuestions([]);
    setCurrentSession(null);
    setError(null);
  }, []);

  return {
    cvData,
    jobDescription,
    interviewQuestions,
    currentSession,
    isGenerating,
    error,
    uploadCV,
    setJobDescription,
    generateQuestions,
    startInterview,
    addResponse,
    completeInterview,
    resetInterview
  };
};
