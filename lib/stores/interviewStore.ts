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
import { useAuthStore } from './authStore';
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
  cv_id: number | null;
  prompt_id: number | null;

  // Actions
  uploadCV: (file: File | null) => Promise<void>;
  setJobDescription: (description: string) => void;
  generateQuestions: (session_id: number, accessToken?: string) => Promise<void>;
  createSession: () => Promise<void>;
  addResponse: (response: InterviewResponse) => Promise<void>;
  completeInterview: () => Promise<number | undefined>;
  fetchPreviousSessions: () => Promise<void>;
  clearCurrentSession: () => void;
  resetInterview: () => void;
  setError: (error: string | null) => void;
  SetUserData: () => Promise<void>;
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
      cv_id: null,
      prompt_id: null,

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

      generateQuestions: async (backendSessionId) => {
        const state = get();

        if (!backendSessionId) {
          set({ error: 'Please provide a job description' });
          return;
        }

        set({ isGenerating: true, error: null });

        try {
          const data = await InterviewService.generateQuestions(
            backendSessionId,
            useAuthStore.getState().accessToken!
          );

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

      createSession: async () => {
        const state = get();

        set({ isGenerating: true, error: null });

        try {
          // Get access token from auth store
          const accessToken = useAuthStore.getState().accessToken;
          const cv_id = state.cv_id;
          const prompt_id = state.prompt_id;

          if (!cv_id || !prompt_id) {
            throw new Error('Please upload CV and job description to start an interview');
          }

          if (!accessToken) {
            throw new Error('Please login to start an interview');
          }

          // Extract job title (first line) and description from combined text

          console.log('✅ User data uploaded - cv_id:', cv_id, 'prompt_id:', prompt_id);

          // Step 2: Create session with cv_id and prompt_id, get session_id
          const { session_id } = await InterviewService.createSession(
            cv_id,
            prompt_id,
            accessToken
          );

          await get().generateQuestions(session_id);

          // Always read the latest questions after generateQuestions updates state
          const updatedQuestions = get().interviewQuestions;

          console.log('✅ Session created - session_id:', session_id);

          // Step 3: Create local session object for UI using fresh questions
          const session: InterviewSession = {
            id: session_id,
            jobDescription: state.jobDescription,
            cvContent: state.cvData.parsedContent,
            questions: updatedQuestions,
            responses: [],
            status: 'in-progress',
            createdAt: new Date(),
          };

          set({
            currentSession: session,
            backendSessionId: session_id,
            isGenerating: false,
            error: null,
          });
          console.log(
            '✅ Interview started - session_id:',
            session_id,
            'cv_id:',
            cv_id,
            'prompt_id:',
            prompt_id,
            'accessToken:',
            accessToken,
            'currentsession:',
            session
          );
        } catch (err: any) {
          set({
            error: err?.message || 'Failed to start interview',
            isGenerating: false,
          });
          throw err;
        }
      },

      SetUserData: async () => {
        const state = get();

        if (!state.jobDescription.trim()) {
          set({ error: 'Job description is required to start interview' });
          return;
        }

        set({ isGenerating: true, error: null });

        try {
          // Get access token from auth store
          const accessToken = useAuthStore.getState().accessToken;

          if (!accessToken) {
            throw new Error('Please login to start an interview');
          }

          // Extract job title (first line) and description from combined text
          const lines = state.jobDescription.split('\n');
          const jobTitle = lines[0]?.trim() || 'Interview Position';
          const jobDescription = lines.slice(2).join('\n').trim() || state.jobDescription;

          // Step 1: Upload CV and job description to backend, get cv_id and prompt_id
          const { cv_id, prompt_id } = await InterviewService.uploadUserData(
            state.cvData.file,
            state.cvData.parsedContent || null,
            jobTitle, // job topic (extracted from first line)
            jobDescription, // job text (remaining content)
            accessToken // Pass access token for authentication
          );
          set({ cv_id, prompt_id, error: null, isGenerating: false });

          console.log('✅ User data uploaded - cv_id:', cv_id, 'prompt_id:', prompt_id);
        } catch (err: any) {
          set({ error: err?.message || 'Failed to upload CV' });
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

        if (!state.backendSessionId) {
          set({ error: 'No active interview session' });
          return;
        }

        set({ isGenerating: true, error: null });

        try {
          // Get access token from auth store
          const accessToken = useAuthStore.getState().accessToken;
          if (!accessToken) {
            throw new Error('Not authenticated');
          }

          // Call backend to complete session
          await InterviewService.completeSession(state.backendSessionId, accessToken);

          // Clear all session state (expire sessionid, promptid, cvid)
          set({
            currentSession: null,
            backendSessionId: null,
            cvData: { file: null, fileName: '' },
            jobDescription: '',
            interviewQuestions: [],
            error: null,
            isGenerating: false,
          });

          return state.backendSessionId; // Return session ID for redirect
        } catch (err: any) {
          set({ error: err.message || 'Failed to complete interview', isGenerating: false });
          throw err;
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
          error: null,
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
        interviewQuestions: [], // Don't persist questions - generate fresh each time
        currentSession: state.currentSession,
        backendSessionId: state.backendSessionId,
        // interviewQuestions: state.interviewQuestions,
        previousSessions: [], // Don't persist previous sessions
        isGenerating: false, // Reset on reload
        error: null, // Reset on reload
      }),
    }
  )
);
