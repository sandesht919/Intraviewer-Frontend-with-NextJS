# IntraViewer - Interview Practice Platform

A modern web application for practicing interview skills with AI-powered feedback. Built with Next.js, React, and TypeScript.

## 🎯 Overview

IntraViewer is a practical interview preparation tool that helps users practice and improve their interview skills through:

- **User Authentication**: Simple signup and login system
- **Interview Setup**: Describe your target job role (optional CV upload)
- **AI Questions**: Personalized interview questions generated based on your role
- **Live Practice**: Real-time mock interview with video/audio support
- **Feedback**: Performance analysis and improvement suggestions

## 🚀 Getting Started

### Requirements
- Node.js 18 or higher
- npm or yarn
- Modern web browser with WebRTC support

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment** (`.env.local`)
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_WS_URL=ws://localhost:8080
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

4. **Build for production**
   ```bash
   npm run build
   npm run start
   ```

## 📁 Project Structure

```
my-app/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   ├── auth/
│   │   ├── login/page.tsx        # Login page
│   │   └── signup/page.tsx       # Registration page
│   └── interview/
│       ├── prepare/page.tsx      # Interview prep (CV optional)
│       ├── session/page.tsx      # Live interview
│       └── results/[id]/page.tsx # Results & analysis
├── lib/
│   ├── hooks/
│   │   ├── useAuth.ts            # Auth state management
│   │   ├── useInterview.ts       # Interview session management
│   │   ├── useWebRTC.ts          # WebRTC media handling
│   │   ├── useWebSocket.ts       # Real-time communication
│   │   └── index.ts              # Hooks export
│   └── utils.ts                  # Utility functions
├── components/ui/
│   └── button.tsx                # Reusable Button component
└── public/                       # Static assets
```

## 🔑 Key Features

### 1. Authentication (`lib/hooks/useAuth.ts`)
- User signup with password strength indicator
- Login with form validation
- Mock authentication system
- Local storage token management

### 2. Interview Preparation (`app/interview/prepare/page.tsx`)
- Optional CV upload with drag-drop support
- Job description input
- AI question generation
- 3-step workflow for easy setup

### 3. Interview Session (`app/interview/session/page.tsx`)
- WebRTC media capture (audio/video)
- Media controls (mute, camera toggle)
- 90-second timer per question
- Progress tracking
- Real-time feedback display

### 4. Performance Analysis (`app/interview/results/[id]/page.tsx`)
- Overall score with progress indicator
- Communication metrics
- Speech analysis (WPM, clarity, fillers)
- Facial expression breakdown
- Question-by-question feedback
- Improvement suggestions

## 🪝 Custom Hooks

### useAuth.ts
Manages user authentication state and operations.
```typescript
const { login, signup, logout, user, isLoading } = useAuth();
```

### useInterview.ts
Handles interview session state and question generation.
```typescript
const {
  uploadCV,
  setJobDescription,
  generateQuestions,
  startInterview,
  addResponse,
  completeInterview
} = useInterview();
```

### useWebRTC.ts
Manages WebRTC media connections and recording.
```typescript
const {
  localStream,
  initializeMedia,
  startCall,
  recordStream,
  stopCall
} = useWebRTC();
```

### useWebSocket.ts
Handles real-time WebSocket communication.
```typescript
const { isConnected, send, on, off } = useWebSocket(wsUrl);
```
- Link to signup for new users

**Signup Page** (`app/auth/signup/page.tsx`)
- Full name, email, password fields
- Password strength indicator
- Password confirmation with visual match indicator
- Terms of service acceptance
- Form validation
- OAuth placeholder buttons
- Link to login for existing users

### 2. Interview Preparation (`app/interview/prepare/page.tsx`)

**Step 1: Upload CV**
- Drag-and-drop file upload
- File type validation (PDF, JPG, PNG, DOCX)
- File size validation (max 10MB)
- File preview display

**Step 2: Describe Job**
- Textarea for job description input
- Character counter
- Generate questions button with loading state

**Step 3: Review Questions**
- Display all AI-generated questions
- Show question metadata (category, difficulty)
- Option to go back and regenerate
- Start interview button

### 3. Live Interview Session (`app/interview/session/page.tsx`)

**Video & Media Controls**
- Real-time camera and microphone access via WebRTC
- Video preview with recording indicator
- Mute/unmute microphone button
- Camera on/off toggle
- End interview button

**Interview Features**
- Current question display
- 90-second countdown timer
- Question-by-question navigation
- Progress indicator showing completed questions
- Auto-advance when time expires
- Skip question option

**Real-time Connection**
- WebRTC peer connection for video/audio
- WebSocket connection for signaling and data
- Connection status indicator
- Development debug info (visible in dev mode)

### 4. Performance Analysis (`app/interview/results/[id]/page.tsx`)

**Performance Metrics**
- Overall score (0-100) with circular progress indicator
- Technical accuracy score
- Communication effectiveness score
- Confidence level percentage

**Facial Expression Analysis**
- Happy percentage
- Confident percentage
- Nervous percentage
- Confused percentage
- Neutral percentage

**Speech Metrics**
- Words per minute (speaking pace)
- Clarity score (0-100)
- Filler words count (um, uh, etc.)
- Average pause duration

**Detailed Feedback**
- Question-by-question analysis
- Individual scores per response
- Strengths highlighted for each answer
- Areas for improvement suggestions
- Expandable detail view

**Action Buttons**
- Retake interview
- Download report (PDF - TODO)
- Share results (TODO)

## 🔧 Custom Hooks Documentation

### useAuth Hook
**Location**: `lib/hooks/useAuth.ts`

Manages user authentication state and operations.

```typescript
const { user, isLoading, error, isAuthenticated, login, signup, logout } = useAuth();

// Login
await login({ email: 'user@example.com', password: 'password123' });

// Signup
await signup({ 
  name: 'John Doe', 
  email: 'user@example.com', 
  password: 'password123',
  confirmPassword: 'password123'
});

// Logout
logout();
```

**Backend Integration Points:**
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Token refresh

### useInterview Hook
**Location**: `lib/hooks/useInterview.ts`

Manages interview session state, CV upload, and question generation.

```typescript
const {
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
} = useInterview();

// Upload CV
uploadCV(file);

// Set job description
setJobDescription('Senior Engineer role at tech company...');

// Generate questions
await generateQuestions();

// Start interview
startInterview();

// Record response
addResponse({
  questionId: 'q_123',
  answer: 'Response text...',
  duration: 60,
  audioBlob: blob
});

// Complete interview
await completeInterview();
```

**Backend Integration Points:**
- `POST /api/interviews/upload-cv` - Parse and store CV
- `POST /api/interviews/generate-questions` - LLM question generation
- `POST /api/interviews/start` - Initialize session
- `POST /api/interviews/add-response` - Record response
- `POST /api/interviews/complete` - Finish interview and trigger analysis

### useWebRTC Hook
**Location**: `lib/hooks/useWebRTC.ts`

Handles WebRTC connections for audio/video streaming.

```typescript
const {
  localStream,
  remoteStream,
  isConnected,
  error,
  initializeMedia,
  startCall,
  handleOffer,
  handleAnswer,
  handleICECandidate,
  stopCall,
  sendMessage,
  recordStream
} = useWebRTC();

// Initialize media devices
const stream = await initializeMedia();

// Start call
await startCall(true); // true = initiator

// Handle WebRTC signaling
handleOffer(offer);
handleAnswer(answer);
handleICECandidate(candidate);

// Send data
sendMessage({ type: 'metadata', questionId: 'q_123' });

// Record stream
const recorder = recordStream(stream);
const blob = recorder.stop();

// Stop call
stopCall();
```

**Key Features:**
- Automatic media device selection
- STUN server configuration for NAT traversal
- ICE candidate handling
- Data channel for metadata communication
- Audio/video recording capability

### useWebSocket Hook
**Location**: `lib/hooks/useWebSocket.ts`

Manages real-time bidirectional communication with backend.

```typescript
const { isConnected, error, send, on, off, reconnect } = useWebSocket(
  'ws://localhost:8080/interview',
  { reconnectInterval: 3000, maxReconnectAttempts: 5 }
);

// Send message
send('interview-start', {
  sessionId: 'session_123',
  questions: [...]
});

// Listen for messages
const unsubscribe = on('question', (question) => {
  console.log('New question:', question);
});

// Unsubscribe
off('question', handler);

// Manual reconnect
reconnect();
```

**Supported Message Types:**
- `interview-start` - Begin interview
- `question` - Receive next question
- `response-start` - User starts responding
- `response-end` - User finishes responding
- `webrtc-offer` - SDP offer for peer connection
- `webrtc-answer` - SDP answer from peer
- `ice-candidate` - ICE candidate for connection
- `facial-analysis` - Real-time facial data
- `speech-metrics` - Speech analysis data
- `interview-complete` - Interview finished
- `error` - Error messages

## 🎨 Design & UI

- **Color Scheme**: Dark mode with blue and purple accents
- **Components**: Reusable button component with multiple variants
- **Responsive**: Mobile-first responsive design
- **Animations**: Smooth transitions and hover effects
- **Icons**: Lucide React icons throughout
- **Accessibility**: Semantic HTML and keyboard navigation

## 🔐 Security Considerations

- JWT token-based authentication
- Secure password handling (backend)
- HTTPS required in production
- WebRTC DTLS encryption for media
- File upload validation
- Input sanitization

## 📱 Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Note**: Requires browser support for:
- WebRTC (getUserMedia, RTCPeerConnection)
- WebSocket
- MediaRecorder API

## 🧪 Testing & Debugging

### WebSocket Testing
```bash
# Install websocat
npm install -g websocat

# Connect to WebSocket
websocat ws://localhost:8080/interview

# Send test messages
{"type": "interview-start", "sessionId": "test_123"}
```

### WebRTC Debugging
- Chrome: Open `chrome://webrtc-internals`
- Firefox: Open `about:webrtc`
- View connection stats, ICE candidates, and bandwidth usage

### Development Debug Info
- Development mode shows connection status
- Check browser console for detailed logs
- Use Network tab to monitor API calls

## 📚 Documentation Files

- **DEVELOPMENT_GUIDE.md** - Comprehensive developer documentation
  - Architecture overview
  - Detailed component documentation
  - Backend integration checklist
  - Performance considerations
  - Security best practices

- **API_INTEGRATION.md** - Backend API specification
  - REST API endpoint details
  - WebSocket event format
  - Request/response examples
  - Error handling guide
  - Integration examples

## 🚀 Deployment

### Build
```bash
npm run build
```

### Environment Variables (Production)
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
```

### Deploy
- **Vercel** (recommended for Next.js)
  ```bash
  npm i -g vercel
  vercel deploy
  ```

- **Docker**
  ```bash
  docker build -t intraviewer-frontend .
  docker run -p 3000:3000 intraviewer-frontend
  ```

## 🤝 Contributing

### Code Style
- TypeScript for type safety
- Comprehensive comments explaining code
- Functional components with React hooks
- Tailwind CSS for styling

### Commit Message Format
```
type(scope): description

feature(auth): add password reset functionality
fix(interview): resolve WebRTC connection issues
docs(api): update endpoint documentation
```

## 📝 TODO Items

All integration points with the backend are marked with **TODO** comments throughout the codebase:

1. Replace mock authentication with real API calls
2. Integrate with LLM service for question generation
3. Implement WebRTC signaling through WebSocket
4. Add facial expression analysis visualization
5. Implement video recording and upload
6. Add PDF report generation
7. Implement social sharing
8. Add email notifications
9. Implement interview history and progress tracking
10. Add performance analytics dashboard

## ⚠️ Important Notes

### Current Status: Frontend Complete ✅
- All pages and components implemented
- Extensive comments for backend integration
- Mock data for testing
- Ready for backend integration

### Next Steps:
1. Set up backend API server
2. Implement authentication endpoints
3. Create LLM integration for question generation
4. Set up WebSocket server
5. Implement facial expression analysis
6. Integrate speech processing
7. Create analysis engine

## 🆘 Troubleshooting

### Camera/Microphone Not Working
- Check browser permissions
- Ensure HTTPS in production
- Test in device settings
- Try different browser

### WebSocket Connection Failed
- Verify backend server is running
- Check WebSocket URL in `.env.local`
- Ensure backend supports WebSocket
- Check firewall settings

### WebRTC Connection Issues
- Verify STUN servers are accessible
- Check network connectivity
- Review console for specific errors
- Test in `chrome://webrtc-internals`

### Performance Issues
- Check video constraints
- Monitor network bandwidth
- Profile with DevTools
- Consider reducing video quality

## 📞 Support

For issues and questions:
1. Check the DEVELOPMENT_GUIDE.md for detailed documentation
2. Review API_INTEGRATION.md for backend integration details
3. Check browser console for error messages
4. Refer to TODO comments in code for integration points

## 📄 License

This project is part of the IntraViewer platform.

---

**Last Updated**: November 26, 2025
**Frontend Version**: 1.0.0
**Status**: Production Ready (Awaiting Backend Integration)
