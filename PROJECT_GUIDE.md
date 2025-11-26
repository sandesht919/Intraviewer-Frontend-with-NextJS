# 📚 PROJECT GUIDE - Understanding IntraViewer

## What is IntraViewer?

**Simple Definition:**
A web app that helps you practice job interviews. You describe a job, get AI-generated questions, and practice answering them with your camera on.

**Real-World Example:**
Instead of practicing alone in your bedroom, imagine you have an invisible interviewer that:
1. Asks you questions about a job you want
2. Records your answers
3. Tells you what you did well and what to improve

## 🎯 User Journey (How Someone Uses It)

### Step 1: Sign Up (Create Account)
- User goes to homepage
- Clicks "Get Started"
- Enters: full name, email, password
- Account created (saved locally in browser)

### Step 2: Describe the Job
- User clicks "Start Interview"
- (Optional) Uploads resume/CV
- Types: job title, company, required skills, responsibilities
- Clicks "Generate Questions"

### Step 3: Backend Creates Questions
- Frontend sends the job description (and optional CV) to the backend
- Backend (LLM service) generates 5 interview questions and returns them
- Questions appear for user to review in the frontend portal

### Step 4: Practice Interview
- User sees Question 1
- Clicks record, answers with camera/microphone
- 90 seconds per question
- Moves to next question
- This repeats for all 5 questions

### Step 5: Get Feedback
- Interview ends
- Backend analyzes responses:
  - Facial expressions (happy, confident, nervous)
  - Speech metrics (pace, clarity, filler words)
  - Answer quality (technical accuracy)
- Shows scores and suggestions

---

## 🏗️ How The Code is Organized

### 1️⃣ PAGES (What Users See)

```
Landing Page (page.tsx)
└─ Simple intro → buttons → "Get Started"

Signup Page (auth/signup/page.tsx)
└─ Form: Name, Email, Password
└─ Validation: Email correct format? Password long enough?
└─ Error messages if wrong

Login Page (auth/login/page.tsx)
└─ Form: Email, Password
└─ "Remember Me" checkbox
└─ Error messages if wrong

Job Description Page (interview/prepare/page.tsx)
└─ Step 1: Optional CV upload
└─ Step 2: Type job description
└─ Step 3: AI generates questions
└─ Shows progress bar

Interview Page (interview/session/page.tsx)
└─ Video preview (your camera)
└─ Question display
└─ 90-second timer (red when < 10 seconds)
└─ Mute/Camera buttons
└─ Skip/Next buttons

Results Page (interview/results/[id]/page.tsx)
└─ Score circles (overall, communication, technical)
└─ Charts (facial expressions, speech metrics)
└─ List of suggestions
└─ Retake button
```

### 2️⃣ HOOKS (Brains of the App)

A **Hook** is a JavaScript function that manages data and does work.

**Think of hooks like this:**
```
Page Component = Body (what users see)
Hook = Brain (what makes it work)
```

#### **useAuth.ts** (User Management Brain)
```
What it stores:
- user: { name, email }
- isLoggedIn: true/false
- isLoading: true/false (while signing up)
- error: error message

What it does:
- signup(name, email, password) → Create account
- login(email, password) → Sign in
- logout() → Sign out

Code location: lib/hooks/useAuth.ts (~150 lines)
```

#### **useInterview.ts** (Interview Management Brain)
```
What it stores:
- cvData: { fileName, file }
- jobDescription: "Senior React Engineer..."
- interviewQuestions: [ Question1, Question2, ... ]
- currentSession: { id, questions, responses }
- isGenerating: true/false

What it does:
- uploadCV(file) → Save resume
- setJobDescription(text) → Save job details
- generateQuestions() → Ask AI for questions
- startInterview() → Begin interview
- addResponse(answer) → Save each answer
- completeInterview() → Finish and analyze

Code location: lib/hooks/useInterview.ts (~250 lines)
```

#### **useWebRTC.ts** (Camera/Microphone Brain)
```
What it does:
- initializeMedia() → Ask permission for camera/mic
- startCall() → Turn on camera
- recordStream() → Start recording
- stopCall() → Turn off camera

Technical detail:
- Uses browser's WebRTC API (no external package)
- Connects to fake STUN servers (for testing)
- Prepares data channel for sending to backend

Code location: lib/hooks/useWebRTC.ts (~350 lines)
```

#### **useWebSocket.ts** (Real-Time Communication Brain)
```
What it does:
- connect() → Open WebSocket connection
- send(event, data) → Send message to backend
- on(event, callback) → Listen for messages
- Auto-reconnect if connection dies

How it works (simple):
1. Browser opens connection: ws://backend:8080
2. Browser can send: "interview-start"
3. Backend sends back: "question-received"
4. Like texting but for computers

Code location: lib/hooks/useWebSocket.ts (~250 lines)
```

---

## 💾 How Data Flows (Example)

### Example 1: User Signing Up

```
┌─────────────────────────────────────────────────────┐
│ USER ACTION: Clicks "Create Account"                │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ SIGNUP PAGE (signup/page.tsx)                       │
│ - Shows form                                        │
│ - Gets values: name, email, password                │
│ - Calls: signup({ name, email, password })          │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ useAuth HOOK (lib/hooks/useAuth.ts)                 │
│ - Validates: email format OK? password long enough? │
│ - Saves: localStorage["user"] = {...}               │
│ - Sets: isLoading = false                           │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ RESULT                                              │
│ ✅ Account created, User logged in                 │
│ → Redirects to: /interview/prepare                  │
└─────────────────────────────────────────────────────┘
```

### Example 2: User Taking Interview

```
┌─────────────────────────────────────────────────────┐
│ USER CLICKS: "Next Question"                        │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ INTERVIEW SESSION PAGE (interview/session/page.tsx) │
│ - Calls: stopRecording()                            │
│ - Saves answer to hook                              │
│ - Updates question index                            │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ useInterview HOOK                                   │
│ - Stores: responses[0] = "My answer to Q1..."       │
│ - Updates: currentQuestion = 1                      │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ useWebRTC HOOK                                      │
│ - Stops recording                                   │
│ - Returns: audio blob (recording)                   │
│ - TODO: Send to backend                             │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ RESULT                                              │
│ ✅ Answer saved                                     │
│ → Shows: Question 2                                 │
│ → Timer: 90 seconds                                 │
└─────────────────────────────────────────────────────┘
```

---

## 🔌 Backend Integration (What's Missing)

The frontend is intended to act as a portal: interview question generation,
session creation and analysis are performed by the backend. Some authentication
helpers in the frontend are still mocked for convenience; replace those mocks
by wiring real auth endpoints. Here's what needs to connect:

### API Endpoints to Create

**Authentication:**
```
POST /api/auth/signup
  Input:  { name, email, password }
  Output: { userId, token }

POST /api/auth/login
  Input:  { email, password }
  Output: { userId, token }

POST /api/auth/logout
  Input:  { token }
  Output: { success: true }
```

**Interview:**
```
POST /api/interviews/generate-questions
  Input:  { jobDescription, cv? }
  Output: { questions: [ { id, text, category, difficulty } ] }

POST /api/interviews/:id/responses
  Input:  { questionId, answer, audioBLOB }
  Output: { responseId, timestamp }

GET /api/interviews/:id/results
  Input:  { interviewId }
  Output: { score, metrics: { facial, speech }, feedback }
```

**WebSocket Events:**
```
Client sends:
- "interview-start" → Backend starts session
- "response-start" → Backend starts analyzing
- "response-end" → Backend gets recording
- "interview-complete" → Backend calculates scores

Backend sends:
- "question" → Here's the next question
- "facial-analysis" → Real-time emotion data
- "interview-complete" → Here are your scores
- "error" → Something went wrong
```

---

## 🎨 UI/Design Explanation

### Color Meaning
- **Blue (Primary):** Main action buttons, highlights, important text
- **Dark Gray/Slate:** Background, makes UI feel professional
- **Red:** Errors, warnings, timer when < 10 seconds
- **Green:** Success, completed questions
- **White:** Main text, easy to read

### Button Types
```
PRIMARY (Blue, Filled)
└─ Main action user should take
└─ Example: "Get Started", "Sign In", "Create Account"

OUTLINE (White Border, Hollow)
└─ Secondary action
└─ Example: "Sign In" link when viewing signup
└─ Doesn't distract from main action

DANGER (Red)
└─ Destructive action
└─ Example: "Delete", "End Interview"
```

### Layout Pattern
```
┌──────────────────────────────────────┐
│ Navigation Bar (Fixed Top)           │
├──────────────────────────────────────┤
│                                      │
│ Main Content (Centered, Max Width)   │
│                                      │
│ - Heading                            │
│ - Subtext (lighter gray)             │
│ - Input fields                       │
│ - Buttons                            │
│                                      │
├──────────────────────────────────────┤
│ Footer (Optional)                    │
└──────────────────────────────────────┘
```

---

## 📝 Code Comments Explained

Every function has comments like this:

```typescript
/**
 * Function Purpose
 * 
 * What it does in plain English
 */
function doSomething() {
  // What's happening here
  code here
}
```

**Why?** So future developers (or you) can understand why code exists.

---

## 🚀 How to Use This App

1. **Open browser:** `http://localhost:3000`

2. **On homepage:**
   - Click "Get Started" → Signup
   - Create account with email/password

3. **On interview prep:**
   - (Optional) Upload CV
   - Type job description
   - Click "Generate Questions"

4. **On interview:**
   - Click camera button
   - Answer each question (90 sec each)
   - Click "Next"

5. **On results:**
   - See your score
   - Read feedback
   - Click "Retake" to try again

---

## 🐛 Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| App won't load | Restart: `npm run dev` |
| Camera not working | Check browser permissions (top-left address bar) |
| Button text invisible | Already fixed! Buttons are now blue |
| Forgot password | Not implemented yet (click "Sign in" instead) |
| Questions don't show | Check browser console for errors (F12) |

---

## 📚 Learning Path

**Beginner:**
1. Read this document completely
2. Explore the landing page code
3. Try changing text/colors

**Intermediate:**
1. Look at signup page
2. Understand the useAuth hook
3. Add a new form field

**Advanced:**
1. Connect real backend API
2. Add more validation
3. Implement facial expression analysis

---

## 📞 Quick Reference

**Main Files to Know:**
- `app/page.tsx` - Homepage
- `lib/hooks/useAuth.ts` - Login/Signup logic
- `lib/hooks/useInterview.ts` - Interview logic
- `lib/hooks/useWebRTC.ts` - Camera/Mic logic
- `lib/hooks/useWebSocket.ts` - Real-time communication

**Commands:**
- `npm run dev` - Start app (http://localhost:3000)
- `npm run build` - Create production version
- `npm run lint` - Check for code errors

**Key Concepts:**
- **Hook:** React function that manages state
- **Component:** UI element (button, form, page)
- **State:** Data the app remembers
- **Props:** Data passed between components
- **TypeScript:** JavaScript with type checking

---

## ✅ Summary

- **What:** App for practicing interviews
- **How:** Upload job description → Get questions → Practice with camera → Get feedback
- **Tech:** Next.js, React, WebRTC, WebSocket
- **Status:** Frontend complete, needs backend API connection

**Next Steps:** Connect the backend API to make it fully functional!
