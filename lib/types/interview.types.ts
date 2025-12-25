/**
 * Interview Type Definitions














































































































































































































































































































This approach aligns the frontend session lifecycle with the backend, preventing premature media access and ensuring all recordings are properly associated with valid backend sessions.- Better **user experience** with clear navigation options- **No data loss** or orphaned recordings- The flow is **backend-driven** and properly validated- Users can **view and manage** previous sessions- Camera/mic **NEVER** starts without a valid backend session IDThe refactoring ensures that:## Summary---- Add session resume with question progress- Improve session status updates in real-time- Add session delete functionality- Add session search/filter in modal### **Frontend Enhancements:**- Implement `GET /interviews/sessions` endpoint to return user's sessions### **Backend TODO:**## Next Steps---5. ✅ `frontend/components/PreviousSessionsModal.tsx` - New modal component4. ✅ `frontend/app/interview/session/page.tsx` - Refactored session validation3. ✅ `frontend/lib/types/interview.types.ts` - Added audioBlob to InterviewResponse2. ✅ `frontend/lib/services/interview.service.ts` - Added fetchSessions method1. ✅ `frontend/lib/stores/interviewStore.ts` - Added backend session tracking## Files Modified---6. **✅ Proper Validation** - Backend session ID verified before recording5. **✅ Backend Aligned** - Frontend matches backend session lifecycle4. **✅ Clear Navigation** - Users always know their options3. **✅ Resource Efficiency** - Camera/mic only accessed when needed2. **✅ Better UX** - Users can view/continue previous sessions1. **✅ Data Integrity** - No recordings sent without valid backend session## Benefits---- [x] Modal shows "Continue" for in-progress sessions ✅- [x] Modal shows "View Results" for completed sessions ✅- [x] Valid session allows media recording ✅- [x] Completing prepare flow stores backendSessionId ✅- [x] Camera/mic ONLY starts with valid backendSessionId ✅- [x] "Create New Interview" button redirects to /interview/prepare ✅- [x] Modal displays previous sessions from backend ✅- [x] Navigate to /interview/session without session → Shows modal ✅## Testing Checklist---   - WebSocket for streaming audio/video chunks4. **`WS /sessions/ws/sessions/:session_id`** ✅ (Already exists)   - Returns results for completed session3. **`GET /interview/results/:id`** ✅ (Already exists)   - Response: `InterviewSession[]`   - Returns all sessions for current user2. **`GET /interviews/sessions`** ⚠️ (Needs implementation)   - Returns: `{ session_id: number, prompt_id: number }`   - Creates new interview session1. **`POST /sessions/start`** ✅ (Already exists)### **Required Endpoints:**The refactored frontend expects these backend endpoints:## Backend Integration Points---```8. Resumes recording from where user left off7. Starts camera/mic with valid backend session6. Page validates: currentSession ✅ + backendSessionId ✅5. Loads session data and backend session ID4. User clicks "Continue" on in-progress session3. Shows Previous Sessions Modal2. Has currentSession but no backendSessionId1. User navigates to /interview/session```### **Flow 3: Continuing Previous Session**```   d. Cancel → /dashboard   c. Continue → (loads session and starts media)   b. View Results → /interview/results/:id   a. Create New Interview → /interview/prepare5. User sees options:4. Fetches previous sessions from backend3. Shows Previous Sessions Modal2. Page checks: currentSession ❌ OR backendSessionId ❌1. User directly navigates to /interview/session```### **Flow 2: Direct Navigation (Without Session)**```9. Records and sends to backend with session_id8. Starts camera/mic with valid backend session7. Page validates: currentSession ✅ + backendSessionId ✅6. Navigates to /interview/session   → Stores backendSessionId in state   → Returns { session_id, prompt_id }   → Calls backend POST /sessions/start5. Clicks "Start Interview"4. Questions generated locally (Next.js API)3. Clicks "Generate Questions"2. Uploads CV (optional) + enters job description1. User goes to /interview/prepare```### **Flow 1: Starting New Interview (Correct)**## Complete User Flows---```           └─ Cancel → /dashboard           ├─ Create New Interview → /interview/prepare           ├─ Continue (for in-progress sessions)           ├─ View Results (for completed sessions)           Display options:           ↓           ├─ Fetch previous sessions from backend           ↓  └─ No → Show Previous Sessions Modal  │  ├─ Yes → Start camera/mic → Record → Send to backend with valid session ID ✅  ↓Checks if currentSession AND backendSessionId exist  ↓Component loads  ↓User visits /interview/session```### **After Refactoring:**```  No  → Redirects to /interview/prepare  Yes → Immediately starts camera/mic → Records → Sends to backend (⚠️ No backend session!)  ↓Checks if currentSession exists (from localStorage)  ↓Component loads  ↓User visits /interview/session```### **Before Refactoring:**## Flow Diagrams---Added optional `audioBlob` field to support local recording storage.```}  audioBlob?: Blob; // Added for local recording  timestamp: Date;  duration: number;  recordingUrl?: string;  answer: string;  questionId: string;export interface InterviewResponse {```typescript### 5. **Updated Interview Response Type** (`lib/types/interview.types.ts`)- Updated `useMediaStream` to only initialize with valid `backendSessionId`- Provides navigation options (create new / view results / continue)- Fetches previous sessions automatically- Shows `PreviousSessionsModal` when no valid session- Added `backendSessionId` validation before starting media**Key Changes:**```}, [currentSession, backendSessionId]);  setupMedia(); // Start camera/mic ONLY with valid backend session  if (!currentSession || !backendSessionId || localStream) return;useEffect(() => {// Only start media when backend session confirmed}, [currentSession, backendSessionId]);  validateSession();  };    }      await fetchPreviousSessions();      setShowSessionsModal(true);    if (!currentSession || !backendSessionId) {  const validateSession = async () => {useEffect(() => {// Check for valid backend session first```typescript#### **After:**```}, [currentSession]);  setupMedia(); // Started camera/mic  if (!currentSession || localStream) return;useEffect(() => {}, [currentSession]);  }    // Show error and redirect  if (!currentSession) {useEffect(() => {// Started media immediately if currentSession exists```typescript#### **Before:**### 4. **Refactored Session Page** (`app/interview/session/page.tsx`)- Empty state for first-time users- Loading state while fetching sessions- Session metadata (date, questions, responses)- Status badges with color coding**UI Elements:**- **"Cancel"** button to go back to dashboard- **"Create New Interview"** button to start fresh- **"Continue"** button for in-progress sessions  - **"View Results"** button for completed sessions- Displays creation date and question progress- Shows session status (completed, in-progress, cancelled)- Lists all previous interview sessions**Features:**A new modal component that displays when user navigates to `/interview/session` without a valid backend session:### 3. **Created Previous Sessions Modal** (`components/PreviousSessionsModal.tsx`)This method fetches all interview sessions for the current user from the backend.```}  return handleAPIResponse<InterviewSession[]>(response);  });    credentials: 'include',    headers,    method: 'GET',  const response = await fetch(`${API_BASE_URL}/interviews/sessions`, {static async fetchSessions(accessToken?: string): Promise<InterviewSession[]> {```typescript### 2. **Added Session Fetch Service** (`lib/services/interview.service.ts`)- Updated `startInterview()` to extract and store backend session ID- `clearCurrentSession()` - Clears current session to allow creating new one- `fetchPreviousSessions()` - Fetches all sessions from backend- `previousSessions` - Array of user's previous interview sessions- `backendSessionId` - Tracks the actual backend session ID returned from `/sessions/start`**Key Changes:**```}  clearCurrentSession: () => void;  fetchPreviousSessions: () => Promise<void>;  // New methods    previousSessions: InterviewSession[];  backendSessionId: number | null;  // Backend session ID from /sessions/start  // New fieldsinterface InterviewStore {```typescriptAdded tracking for backend session ID and previous sessions:### 1. **Updated Interview Store** (`lib/stores/interviewStore.ts`)## Changes Made---4. ✅ **Only start camera/mic** when backend session ID is confirmed3. ✅ **Provide options** to view results or create new session2. ✅ **Show previous sessions modal** when no valid session exists1. ✅ **Validate backend session** before starting any media streamRefactored the interview session flow to:## Solution Overview4. **No validation** - No check for backend session ID before starting media stream3. **Poor UX** - No way to view or continue previous sessions2. **Data loss** - Recordings sent to backend without valid session context1. **Premature media access** - Camera/mic started before backend session was createdThe interview session page was starting camera/microphone recording immediately upon page load, even without a valid backend session ID. This caused:## Problem */

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
  audioBlob?: Blob; // Optional audio blob for local recording
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
