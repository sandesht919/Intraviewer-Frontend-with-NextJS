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

import { useState, useCallback } from "react";
import { API_CONFIG } from "../config/api";
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
  difficulty: "easy" | "medium" | "hard";
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
  status: "not-started" | "in-progress" | "completed";
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
    fileName: "",
  });

  const [jobDescription, setJobDescription] = useState<string>("");
  const [interviewQuestions, setInterviewQuestions] = useState<
    InterviewQuestion[]
  >([]);
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload CV file
   * Stores file locally for later submission with job description
   */
  const uploadCV = useCallback(async (file: File | null) => {
    try {
      if (!file) {
        setCVData({ file: null, fileName: "" });
        setError(null);
        return;
      }

      // Validate file type (should be PDF, JPG, PNG, DOCX)
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

      // Store file locally for later submission
      setCVData({ file, fileName: file.name });
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to upload CV");
    }
  }, []);

  /**
   * Generate interview questions using LLM
   * Sends CV file and job description to backend in a single request
   * Expected backend endpoint: POST /post/applications
   * Request: FormData with cv_file (optional), job_text (required)
   * Response: { questions: InterviewQuestion[] }
   */
  const generateQuestions = useCallback(
    async (jobDescOverride?: string) => {
      const effectiveJobDesc =
        (jobDescOverride ?? jobDescription)?.trim() ?? "";

      if (!effectiveJobDesc) {
        setError("Please provide a job description");
        return;
      }

      setIsGenerating(true);
      setError(null);

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL ||
          API_CONFIG.BASE_URL ||
          "http://localhost:8000";
        const endpoint = `${API_URL}/post/applications`;

        // Create FormData with CV file (if available) and job description text
        const formData = new FormData();

        if (cvData.file) {
          formData.append("cv_file", cvData.file);
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
          setCVData((prev) => ({ ...prev, parsedContent: data.cv_raw }));
        }

        // TODO: Generate questions from the application data
        // For now, using mock questions until backend implements question generation
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

        setInterviewQuestions(data.questions || mockQuestions);
      } catch (err: any) {
        setError(err?.message || "Failed to generate questions");
      } finally {
        setIsGenerating(false);
      }
    },
    [cvData, jobDescription]
  );

  /**
   * Start interview session
   * Calls backend to create session record and initialize interview
   * Backend endpoint: POST /sessions/start
   */
  const startInterview = useCallback(async () => {
    if (interviewQuestions.length === 0) {
      setError("No questions available. Please generate questions first.");
      return;
    }

    setError(null);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const endpoint = `${API_URL}/sessions/start`;

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: interviewQuestions,
          jobDescription,
          cvFileName: cvData.fileName || undefined,
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

      setCurrentSession(session);
    } catch (err: any) {
      setError(err?.message || "Failed to start interview");
    }
  }, [interviewQuestions, jobDescription, cvData]);

  /**
   * Add response to current question during interview
   * Sends response to backend for storage and analysis
   * Backend endpoint: POST /sessions/responses
   */
  const addResponse = useCallback(
    async (response: InterviewResponse) => {
      if (!currentSession) {
        setError("No active interview session");
        return;
      }

      // Update local state optimistically
      setCurrentSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          responses: [...prev.responses, response],
        };
      });

      // Send to backend
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const endpoint = `${API_URL}/sessions/responses`;

        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: currentSession.id,
            questionId: response.questionId,
            answer: response.answer,
            duration: response.duration,
            audioUrl: response.audioBlob ? "pending-upload" : undefined,
            videoUrl: undefined,
          }),
        });
      } catch (err: any) {
        console.error("Failed to save response:", err);
        // Continue even if backend fails - don't interrupt user experience
      }
    },
    [currentSession]
  );

  /**
   * Complete interview and trigger analysis
   * Sends completion request to backend which marks session as complete
   * Backend endpoint: POST /sessions/complete
   * Will trigger facial expression analysis and performance evaluation
   */
  const completeInterview = useCallback(async () => {
    if (!currentSession) {
      setError("No active interview session");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const endpoint = `${API_URL}/sessions/complete`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSession.id,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to complete interview");
      }

      const data = await response.json();

      setCurrentSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: data.status,
          endTime: new Date(data.endTime),
        };
      });
    } catch (err: any) {
      setError(err.message || "Failed to complete interview");
    } finally {
      setIsGenerating(false);
    }
  }, [currentSession]);

  /**
   * Reset interview state
   */
  const resetInterview = useCallback(() => {
    setCVData({ file: null, fileName: "" });
    setJobDescription("");
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
    resetInterview,
  };
};
