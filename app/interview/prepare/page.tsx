/**
 * Interview Preparation Page
 * 
 * Guides users through interview setup in 3 simple steps:
 * 1. Optional CV upload (drag-drop support)
 * 2. Job description input (required)
 * 3. AI generates interview questions
 * 
 * Features:
 * - Optional CV upload with file validation
 * - Job description textarea
 * - AI question generation
 * - Progress indicators
 * - Responsive design
 * 
 * TODO: Connect to backend for question generation
 */

'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader,
  ArrowRight,
  X,
  Sparkles
} from 'lucide-react';
import { useInterviewStore } from '@/lib/stores/interviewStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { AuthService } from '@/lib/services/auth.service';

/**
 * Interview Preparation Component
 * 
 * Manages the flow of uploading CV, describing job, and generating questions
 */
export default function InterviewPreparePage() {
  const router = useRouter();
  const {
    cvData,
    jobDescription,
    interviewQuestions,
    isGenerating,
    error,
    backendSessionId,
    uploadCV,
    setJobDescription,
    generateQuestions,
    createSession,
    SetUserData
  } = useInterviewStore();

  // Local state for managing steps
  const [currentStep, setCurrentStep] = useState<'upload' | 'describe' | 'createSession' |'preview'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [localJobTitle, setLocalJobTitle] = useState('');
  const [localJobDesc, setLocalJobDesc] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Clear only interviewQuestions from persisted storage (one-time cleanup)
  useEffect(() => {
    const stored = localStorage.getItem('interview-storage');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.state && data.state.interviewQuestions) {
          data.state.interviewQuestions = [];
          localStorage.setItem('interview-storage', JSON.stringify(data));
          console.log('🧹 Cleared old interview questions from storage');
        }
      } catch (e) {
        console.error('Failed to parse storage:', e);
      }
    }
  }, []);

  

  /**
   * Handle file upload via input or drag-drop
   */
  const handleFileUpload = (file: File) => {
    try {
      // uploadCV is async now — await to ensure backend parsing completes
      uploadCV(file).then(() => setCurrentStep('describe'));
    } catch (err) {
      console.error('File upload error:', err);
    }
  };

  /**
   * Handle drag and drop
   */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  /**
   * Handle drop event
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  /**
   * Handle generate questions click
   * 
   */
  const handleSetUserData = async () => {
    // Combine job title and description
    const fullJobDescription = `${localJobTitle}\n\n${localJobDesc}`;
    
    // Persist job description in the hook state for later use
    setJobDescription(fullJobDescription);
    // Pass the full job description to avoid relying on the
    // asynchronous state update; the hook accepts an override.
    await SetUserData();
    setCurrentStep('createSession');
  };

  /**
   * Handle start interview
   */
  const handleCreateSession = () => {
    // startInterview is async (calls backend); fire-and-forget and navigate
    createSession().then(() => {
      //router.push('/interview/session');
      console.log('Interview created successfully');
      setCurrentStep('preview');
    }).catch(() => {
      // keep user on page if start failed
      console.log('Interview creation failed');
    });
  };

  /** handle startinterview */
  const handleStartInterview = () => {
    // startInterview is async (calls backend); fire-and-forget and navigate
    if (backendSessionId) {
      router.push('/interview/session');
      console.log('Interview created successfully');
      setCurrentStep('preview');
    }
    else {
      console.log('Interview creation failed');
    }
  };
  console.log("the interview question length is  interviewQuestions", interviewQuestions);

  /**
   * Remove uploaded CV and reset step
   */
  const handleRemoveCV = () => {
    // Clear CV on backend/local state
    uploadCV(null as any).then(() => setCurrentStep('upload'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 py-12 px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Start Your Interview Practice
          </h1>
          <p className="text-slate-600 text-lg">
            Tell us about your target role and we'll generate personalized questions
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12 flex justify-between relative">
          {/* Step 1: Optional CV Upload */}
          <div className="flex flex-col items-center z-10">
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg mb-2 transition-all
                ${
                  currentStep === 'upload' || cvData.file
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                    : 'bg-slate-800 text-slate-500'
                }
              `}
            >
              {cvData.file ? <CheckCircle className="w-6 h-6" /> : '1'}
            </div>
            <span className="text-sm font-medium text-black">CV </span>
          </div>

          {/* Connector Line */}
          <div
            className={`
              flex-1 h-1 my-auto mx-4 rounded-full transition-all
              ${localJobTitle && localJobDesc ? 'bg-blue-500' : 'bg-slate-800'}
            `}
            style={{ alignSelf: 'center', height: '2px' }}
          ></div>

          {/* Step 2: Job Description */}
          <div className="flex flex-col items-center z-10">
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg mb-2 transition-all
                ${
                  currentStep === 'describe' || (localJobTitle && localJobDesc)
                   ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                    : 'bg-slate-800 text-slate-500'
                }
              `}
            >
              {(localJobTitle && localJobDesc) ? <CheckCircle className="w-6 h-6" /> : '2'}
            </div>
            <span className="text-sm font-medium text-black">Job Description</span>
          </div>

          {/* Connector Line */}
          <div
            className={`
              flex-1 h-1 my-auto mx-4 rounded-full transition-all
              ${interviewQuestions.length > 0 ? 'bg-blue-500' : 'bg-slate-800'}
            `}
            style={{ alignSelf: 'center', height: '2px' }}
          ></div>

          {/* Step 3: create session */}
          <div className="flex flex-col items-center z-10">
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg mb-2 transition-all
                ${
                  currentStep === 'createSession' || interviewQuestions.length > 0
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                    : 'bg-slate-800 text-slate-500'
                }
              `}
            >
              {interviewQuestions.length > 0 ? <CheckCircle className="w-6 h-6" /> : '3'}
            </div>
            <span className="text-sm font-medium text-black">create session</span>
          </div>
        
            {/* Connector Line */}
          <div
            className={`
              flex-1 h-1 my-auto mx-4 rounded-full transition-all
              ${interviewQuestions.length > 0 ? 'bg-blue-500' : 'bg-slate-800'}
            `}
            style={{ alignSelf: 'center', height: '2px' }}
          ></div>

                 {/* Step 4: Start Interview */}
          <div className="flex flex-col items-center z-10">
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg mb-2 transition-all
                ${
                  currentStep === 'preview' || interviewQuestions.length > 0
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                    : 'bg-slate-800 text-slate-500'
                }
              `}
            >
              {interviewQuestions.length > 0 ? <CheckCircle className="w-6 h-6" /> : '4'}
            </div>
            <span className="text-sm font-medium text-black">Start Interview</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Step 1: Optional Upload CV */}
        {currentStep === 'upload' && (
          <div className="backdrop-blur-sm bg-white/80 border border-sky-200 rounded-2xl p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Your CV (Optional)</h2>
              <p className="text-slate-600">
                Your CV helps us generate more personalized questions. Supported formats: PDF, Images (JPG, PNG, etc.), DOCX (Max 5MB). You can skip this if you prefer.
              </p>
            </div>

            {/* File Upload Area */}
            {!cvData.file ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all mb-6
                  ${
                    dragActive
                      ? 'border-sky-500 bg-sky-100'
                      : 'border-sky-300 hover:border-sky-400 bg-white hover:bg-sky-50'
                  }
                `}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-800 font-semibold mb-2">Drag and drop your CV here</p>
                <p className="text-slate-600 text-sm mb-4">or click to browse your files</p>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  id="file-input"
                />

                <label htmlFor="file-input">
                  <Button
                    type="button"
                    className="bg-sky-600 hover:bg-sky-700"
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    Select File
                  </Button>
                </label>
              </div>
            ) : (
              /* CV Uploaded Display */
              <div className="p-6 bg-green-100 border border-green-300 rounded-lg flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <FileText className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-slate-800 font-semibold">{cvData.fileName}</p>
                    <p className="text-slate-600 text-sm">Ready for analysis</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveCV}
                  className="text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Next Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => setCurrentStep('describe')}
                className="bg-sky-600 hover:bg-sky-700 shadow-md"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Describe Job */}
        {currentStep === 'describe' && (
          <div className="backdrop-blur-sm bg-white/80 border border-sky-200 rounded-2xl p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Describe Your Target Role</h2>
              <p className="text-slate-600">
                Tell us about the position you're interviewing for. Include the job title and detailed description.
              </p>
            </div>

            {/* Job Title Input */}
            <div className="mb-6">
              <label htmlFor="job-title" className="block text-sm font-medium text-slate-700 mb-3">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="job-title"
                value={localJobTitle}
                onChange={(e) => setLocalJobTitle(e.target.value)}
                placeholder="E.g., Senior Frontend Engineer"
                className="
                  w-full px-4 py-3 bg-white border border-sky-200 rounded-lg
                  text-slate-800 placeholder-slate-400
                  focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400
                  transition-all
                "
              />
            </div>

            {/* Job Description Input */}
            <div className="mb-6">
              <label htmlFor="job-desc" className="block text-sm font-medium text-slate-700 mb-3">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="job-desc"
                value={localJobDesc}
                onChange={(e) => setLocalJobDesc(e.target.value)}
                placeholder="E.g., We're seeking a skilled engineer to lead our frontend team. Required: React, TypeScript, Web Performance. Responsibilities: Lead frontend architecture, mentor junior devs, optimize performance..."
                rows={6}
                className="
                  w-full px-4 py-3 bg-white border border-sky-200 rounded-lg
                  text-slate-800 placeholder-slate-400 resize-none
                  focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400
                  transition-all
                "
              />
              <p className="text-slate-600 text-sm mt-2">
                {localJobDesc.length} characters
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('upload')}
              >
                Back
              </Button>
              <Button
                onClick={handleSetUserData}
                className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 flex items-center gap-2 shadow-md"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    uploading...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                   Next
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview Questions */}
        {currentStep === 'createSession'&& (
          <div className="backdrop-blur-sm bg-white/80 border border-sky-200 rounded-2xl p-8 shadow-xl">
           

           

            {/* Action Buttons */}
            <div className="flex gap-4 justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('describe')}
              >
               back
              </Button>
              <Button
                onClick={handleCreateSession}
                className="bg-gradient-to-r from-green-600 to-sky-600 hover:from-green-700 hover:to-sky-700 flex items-center gap-2 shadow-md"
              >
              {isGenerating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    creating session...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                   Create Session
                  </>
                )}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            
          </div>
        )}

         {/* Step 3: Preview Questions */}
        {currentStep === 'preview'&& (
          <div className="backdrop-blur-sm bg-white/80 border border-sky-200 rounded-2xl p-8 shadow-xl">
           

           

            {/* Action Buttons */}
            <div className="flex gap-4 justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('createSession')}
              >
               back
              </Button>
              <Button
                onClick={handleStartInterview}
                className="bg-gradient-to-r from-green-600 to-sky-600 hover:from-green-700 hover:to-sky-700 flex items-center gap-2 shadow-md"
              >
             Start Interview <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            
          </div>
        )}
      </div>
    </div>
  );
}
