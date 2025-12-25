/**
 * Interview Store using Zustand
 *
 * This store manages the interview state including:
 * - CV data
 * - Job description
 * - Generated questions
 * - Current session
 * - Interview operations
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { InterviewService } from '../services';
import type { InterviewQuestion, InterviewResponse, InterviewSession } from '../types';
import { FILE_CONSTANTS, MESSAGES } from '../constants';

/**
 * Interface for CV data structure
 */
interface CVData {
  file: File | null;
  fileName: string;
  parsedContent?: string;
}

/**
 * Interview Store State
 */
interface InterviewStore {
  // State
  cvData: CVData;
  jobDescription: string;
  interviewQuestions: InterviewQuestion[];
  currentSession: InterviewSession | null;
  backendSessionId: number | null; // Backend session ID from /sessions/start
  previousSessions: InterviewSession[];
  isGenerating: boolean;
  error: string | null;

  // Actions
  uploadCV: (file: File | null) => Promise<void>;
  setJobDescription: (description: string) => void;
  generateQuestions: (jobDescOverride?: string) => Promise<void>;
  startInterview: () => Promise<void>;
  addResponse: (response: InterviewResponse) => Promise<void>;
  completeInterview: () => Promise<void>;
  fetchPreviousSessions: () => Promise<void>;
  clearCurrentSession: () => void;
  resetInterview: () => void;
  setError: (error: string | null) => void;
}

/**
 * Create Interview Store
 */
export const useInterviewStore = create<InterviewStore>()(
  persist(
    (set, get) => ({
      // Initial State
      cvData: {
        file: null,
        fileName: '',
      },
      jobDescription: '',
      interviewQuestions: [],
      currentSession: null,
      backendSessionId: null,
      previousSessions: [],
      isGenerating: false,
      error: null,

      // Actions
      setError: (error) => set({ error }),

      uploadCV: async (file) => {
        try {
          if (!file) {
            set({ cvData: { file: null, fileName: '' }, error: null });
            return;
          }

          // Validate file type
          if (!FILE_CONSTANTS.ALLOWED_CV_TYPES.includes(file.type as any)) {
            throw new Error(
              `Invalid file type. Allowed: ${Object.values(FILE_CONSTANTS.CV_EXTENSION_LABELS).join(
                ', '
              )}`
            );
          }

          // Validate file size
          if (file.size > FILE_CONSTANTS.MAX_CV_SIZE) {
            throw new Error(
              `File size exceeds ${FILE_CONSTANTS.MAX_CV_SIZE / 1024 / 1024}MB limit.`
            );
          }

          // Store file locally
          set({ cvData: { file, fileName: file.name }, error: null });
        } catch (err: any) {
          set({ error: err?.message || 'Failed to upload CV' });
        }
      },

      setJobDescription: (description) => set({ jobDescription: description }),

      generateQuestions: async (jobDescOverride) => {
        const state = get();
        const effectiveJobDesc = (jobDescOverride ?? state.jobDescription)?.trim() ?? '';

        if (!effectiveJobDesc) {
          set({ error: 'Please provide a job description' });
          return;
        }

        set({ isGenerating: true, error: null });

        try {
          const data = await InterviewService.generateQuestions({
            jobDescription: effectiveJobDesc,
            cvContent: state.cvData.parsedContent,
          });

          set({
            interviewQuestions: data.questions,
            error: null,
          });
        } catch (err: any) {
          set({ error: err?.message || MESSAGES.INTERVIEW.GENERATION_FAILED });
        } finally {
          set({ isGenerating: false });
        }
      },
      startInterview: async () => {
        const state = get();

        if (state.interviewQuestions.length === 0) {
          set({
            error: 'No questions available. Please generate questions first.',
          });
          return;
        }

        set({ error: null });

        try {
          const session = await InterviewService.startSession(
            state.jobDescription,
            state.cvData.parsedContent
          );

          // Extract backend session ID if returned
          const backendSessionId = typeof session.id === 'number' ? session.id : null;

          set({ 
            currentSession: session,
            backendSessionId 
          });
        } catch (err: any) {
          set({ error: err?.message || 'Failed to start interview' });
          throw err;
        }
      },

      addResponse: async (response) => {
        const state = get();

        if (!state.currentSession) {
          set({ error: 'No active interview session' });
          return;
        }

        // Update local state optimistically
        set((state) => ({
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                responses: [...state.currentSession.responses, response],
              }
            : null,
        }));

        // Send to backend
        try {
          await InterviewService.submitResponse(
            state.currentSession.id,
            response.questionId,
            response.answer
          );
        } catch (err: any) {
          console.error('Failed to save response:', err);
          // Continue even if backend fails
        }
      },

      completeInterview: async () => {
        const state = get();

        if (!state.currentSession) {
          set({ error: 'No active interview session' });
          return;
        }

        set({ isGenerating: true, error: null });

        try {
          await InterviewService.completeSession(state.currentSession.id);

          set((state) => ({
            currentSession: state.currentSession
              ? {
                  ...state.currentSession,
                  status: 'completed',
                  completedAt: new Date(),
                }
              : null,
          }));
        } catch (err: any) {
          set({ error: err.message || 'Failed to complete interview' });
          throw err;
        } finally {
          set({ isGenerating: false });
        }
      },

      fetchPreviousSessions: async () => {
        set({ isGenerating: true, error: null });
        try {
          const sessions = await InterviewService.fetchSessions();
          set({ previousSessions: sessions });
        } catch (err: any) {
          console.error('Failed to fetch previous sessions:', err);
          set({ previousSessions: [] });
        } finally {
          set({ isGenerating: false });
        }
      },

      clearCurrentSession: () => {
        set({ 
          currentSession: null, 
          backendSessionId: null,
          error: null 
        });
      },

      resetInterview: () => {
        set({
          cvData: { file: null, fileName: '' },
          jobDescription: '',
          interviewQuestions: [],
          currentSession: null,
          backendSessionId: null,
          previousSessions: [],
          error: null,
        });
      },
    }),
    {
      name: 'interview-storage',
      storage: createJSONStorage(() => localStorage),
      // Don't persist file objects
      partialize: (state) => ({
        cvData: {
          file: null, // Don't persist File object
          fileName: state.cvData.fileName,
          parsedContent: state.cvData.parsedContent,
        },
        jobDescription: state.jobDescription,
        interviewQuestions: state.interviewQuestions,
        currentSession: state.currentSession,
        backendSessionId: state.backendSessionId,
        previousSessions: [], // Don't persist previous sessions
        isGenerating: false, // Reset on reload
        error: null, // Reset on reload
      }),
    }
  )
);
