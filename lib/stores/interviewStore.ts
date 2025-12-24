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

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { API_CONFIG } from "../config/api";

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Interface for CV data structure
 */
interface CVData {
  file: File | null;
  fileName: string;
  parsedContent?: string;
}

/**
 * Interface for interview question structure
 */
interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

/**
 * Interface for user response during interview
 */
interface InterviewResponse {
  questionId: string;
  answer: string;
  duration: number;
  audioBlob?: Blob;
}

/**
 * Interface for interview session data
 */
interface InterviewSession {
  id: string | number;
  jobTitle: string;
  jobDescription: string;
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  startTime?: Date;
  endTime?: Date;
  status: "not-started" | "in-progress" | "completed";
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
  isGenerating: boolean;
  error: string | null;

  // Actions
  uploadCV: (file: File | null) => Promise<void>;
  setJobDescription: (description: string) => void;
  generateQuestions: (jobDescOverride?: string) => Promise<void>;
  startInterview: () => Promise<void>;
  addResponse: (response: InterviewResponse) => Promise<void>;
  completeInterview: () => Promise<void>;
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
        fileName: "",
      },
      jobDescription: "",
      interviewQuestions: [],
      currentSession: null,
      isGenerating: false,
      error: null,

      // Actions
      setError: (error) => set({ error }),

      uploadCV: async (file) => {
        try {
          if (!file) {
            set({ cvData: { file: null, fileName: "" }, error: null });
            return;
          }

          // Validate file type
          const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ];
          if (!allowedTypes.includes(file.type)) {
            throw new Error(
              "Invalid file type. Please upload PDF, JPG, PNG, or DOCX."
            );
          }

          // Validate file size (max 10MB)
          if (file.size > 10 * 1024 * 1024) {
            throw new Error("File size exceeds 10MB limit.");
          }

          // Store file locally
          set({ cvData: { file, fileName: file.name }, error: null });
        } catch (err: any) {
          set({ error: err?.message || "Failed to upload CV" });
        }
      },

      setJobDescription: (description) => set({ jobDescription: description }),

      generateQuestions: async (jobDescOverride) => {
        const state = get();
        const effectiveJobDesc =
          (jobDescOverride ?? state.jobDescription)?.trim() ?? "";

        if (!effectiveJobDesc) {
          set({ error: "Please provide a job description" });
          return;
        }

        set({ isGenerating: true, error: null });

        try {
          const endpoint = `${API_BASE_URL}/post/applications`;

          // Create FormData with CV file (if available) and job description text
          const formData = new FormData();

          if (state.cvData.file) {
            formData.append("cv_file", state.cvData.file);
          }

          formData.append("job_text", effectiveJobDesc);

          const resp = await fetch(endpoint, {
            method: "POST",
            body: formData,
          });

          if (!resp.ok) {
            const t = await resp.text();
            throw new Error(t || "Server failed to create application");
          }

          const data = await resp.json();

          // Store parsed CV content if returned
          if (data.cv_raw) {
            set((state) => ({
              cvData: { ...state.cvData, parsedContent: data.cv_raw },
            }));
          }

          // Mock questions for now
          const mockQuestions: InterviewQuestion[] = [
            {
              id: "1",
              question:
                "Tell me about your most relevant project related to this role.",
              category: "experience",
              difficulty: "medium",
            },
            {
              id: "2",
              question:
                "What are the key technologies you would use to solve this problem?",
              category: "technical",
              difficulty: "hard",
            },
            {
              id: "3",
              question: "How do you handle tight deadlines in your work?",
              category: "behavioral",
              difficulty: "medium",
            },
            {
              id: "4",
              question:
                "Describe a challenging bug you encountered and how you resolved it.",
              category: "technical",
              difficulty: "medium",
            },
            {
              id: "5",
              question:
                "How do you stay updated with the latest industry trends?",
              category: "behavioral",
              difficulty: "easy",
            },
          ];

          set({ interviewQuestions: data.questions || mockQuestions });
        } catch (err: any) {
          set({ error: err?.message || "Failed to generate questions" });
        } finally {
          set({ isGenerating: false });
        }
      },

      startInterview: async () => {
        const state = get();

        if (state.interviewQuestions.length === 0) {
          set({
            error: "No questions available. Please generate questions first.",
          });
          return;
        }

        set({ error: null });

        try {
          const endpoint = `${API_BASE_URL}/sessions/start`;

          const resp = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              questions: state.interviewQuestions,
              jobDescription: state.jobDescription,
              cvFileName: state.cvData.fileName || undefined,
            }),
          });

          if (!resp.ok) {
            const t = await resp.text();
            throw new Error(t || "Failed to start interview session");
          }

          const data = await resp.json();

          const session: InterviewSession = {
            id: data.sessionId,
            jobTitle: data.jobTitle || "",
            jobDescription: data.jobDescription,
            questions: data.questions,
            responses: [],
            startTime: new Date(data.startTime),
            status: data.status,
          };

          set({ currentSession: session });
        } catch (err: any) {
          set({ error: err?.message || "Failed to start interview" });
          throw err; // Re-throw to allow caller to handle
        }
      },

      addResponse: async (response) => {
        const state = get();

        if (!state.currentSession) {
          set({ error: "No active interview session" });
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
          const endpoint = `${API_BASE_URL}/sessions/responses`;

          await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: state.currentSession.id,
              questionId: response.questionId,
              answer: response.answer,
              duration: response.duration,
              audioUrl: response.audioBlob ? "pending-upload" : undefined,
              videoUrl: undefined,
            }),
          });
        } catch (err: any) {
          console.error("Failed to save response:", err);
          // Continue even if backend fails
        }
      },

      completeInterview: async () => {
        const state = get();

        if (!state.currentSession) {
          set({ error: "No active interview session" });
          return;
        }

        set({ isGenerating: true, error: null });

        try {
          const endpoint = `${API_BASE_URL}/sessions/complete`;

          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: state.currentSession.id,
            }),
          });

          if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Failed to complete interview");
          }

          const data = await response.json();

          set((state) => ({
            currentSession: state.currentSession
              ? {
                  ...state.currentSession,
                  status: data.status,
                  endTime: new Date(data.endTime),
                }
              : null,
          }));
        } catch (err: any) {
          set({ error: err.message || "Failed to complete interview" });
          throw err;
        } finally {
          set({ isGenerating: false });
        }
      },

      resetInterview: () => {
        set({
          cvData: { file: null, fileName: "" },
          jobDescription: "",
          interviewQuestions: [],
          currentSession: null,
          error: null,
        });
      },
    }),
    {
      name: "interview-storage",
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
        isGenerating: false, // Reset on reload
        error: null, // Reset on reload
      }),
    }
  )
);
