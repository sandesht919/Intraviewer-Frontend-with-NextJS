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

import { useState } from 'react';
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
import { useInterview } from '@/lib/hooks/useInterview';

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
    uploadCV,
    setJobDescription,
    generateQuestions,
    startInterview
  } = useInterview();

  // Local state for managing steps
  const [currentStep, setCurrentStep] = useState<'upload' | 'describe' | 'preview'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [localJobDesc, setLocalJobDesc] = useState('');
  const [showPreview, setShowPreview] = useState(false);

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
   */
  const handleGenerateQuestions = async () => {
    // Persist job description in the hook state for later use
    setJobDescription(localJobDesc);
    // Pass the local job description to avoid relying on the
    // asynchronous state update; the hook accepts an override.
    await generateQuestions(localJobDesc);
    setCurrentStep('preview');
  };

  /**
   * Handle start interview
   */
  const handleStartInterview = () => {
    // startInterview is async (calls backend); fire-and-forget and navigate
    startInterview().then(() => {
      router.push('/interview/session');
    }).catch(() => {
      // keep user on page if start failed
    });
  };

  /**
   * Remove uploaded CV and reset step
   */
  const handleRemoveCV = () => {
    // Clear CV on backend/local state
    uploadCV(null as any).then(() => setCurrentStep('upload'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Start Your Interview Practice
          </h1>
          <p className="text-slate-400 text-lg">
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
            <span className="text-sm font-medium text-white">CV (Optional)</span>
          </div>

          {/* Connector Line */}
          <div
            className={`
              flex-1 h-1 my-auto mx-4 rounded-full transition-all
              ${localJobDesc ? 'bg-blue-500' : 'bg-slate-800'}
            `}
            style={{ alignSelf: 'center', height: '2px' }}
          ></div>

          {/* Step 2: Job Description */}
          <div className="flex flex-col items-center z-10">
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg mb-2 transition-all
                ${
                  currentStep === 'describe' || localJobDesc
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                    : 'bg-slate-800 text-slate-500'
                }
              `}
            >
              {localJobDesc ? <CheckCircle className="w-6 h-6" /> : '2'}
            </div>
            <span className="text-sm font-medium text-white">Job Description</span>
          </div>

          {/* Connector Line */}
          <div
            className={`
              flex-1 h-1 my-auto mx-4 rounded-full transition-all
              ${interviewQuestions.length > 0 ? 'bg-blue-500' : 'bg-slate-800'}
            `}
            style={{ alignSelf: 'center', height: '2px' }}
          ></div>

          {/* Step 3: Start Interview */}
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
              {interviewQuestions.length > 0 ? <CheckCircle className="w-6 h-6" /> : '3'}
            </div>
            <span className="text-sm font-medium text-white\">Start Interview</span>
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
          <div className="backdrop-blur-md bg-slate-900/30 border border-slate-700 rounded-2xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Upload Your CV (Optional)</h2>
              <p className="text-slate-400">
                Your CV helps us generate more personalized questions. Supported formats: PDF, JPG, PNG, DOCX (Max 10MB). You can skip this if you prefer.
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
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 hover:border-slate-500 bg-slate-800/30 hover:bg-slate-800/50'
                  }
                `}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-white font-semibold mb-2">Drag and drop your CV here</p>
                <p className="text-slate-400 text-sm mb-4">or click to browse your files</p>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
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
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    Select File
                  </Button>
                </label>
              </div>
            ) : (
              /* CV Uploaded Display */
              <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <FileText className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-white font-semibold">{cvData.fileName}</p>
                    <p className="text-slate-400 text-sm">Ready for analysis</p>
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
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Describe Job */}
        {currentStep === 'describe' && (
          <div className="backdrop-blur-md bg-slate-900/30 border border-slate-700 rounded-2xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Describe Your Target Role</h2>
              <p className="text-slate-400">
                Tell us about the position you're interviewing for. Include key responsibilities, required skills, and any other relevant details.
              </p>
            </div>

            {/* Job Description Input */}
            <div className="mb-6">
              <label htmlFor="job-desc" className="block text-sm font-medium text-white mb-3">
                Job Description or Role Details
              </label>
              <textarea
                id="job-desc"
                value={localJobDesc}
                onChange={(e) => setLocalJobDesc(e.target.value)}
                placeholder="E.g., Senior Frontend Engineer at a tech startup. Required: React, TypeScript, Web Performance. Responsibilities: Lead frontend architecture, mentor junior devs, optimize performance..."
                rows={6}
                className="
                  w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg
                  text-white placeholder-slate-500 resize-none
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                  transition-all
                "
              />
              <p className="text-slate-400 text-sm mt-2">
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
                disabled={!localJobDesc.trim() || isGenerating}
                onClick={handleGenerateQuestions}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Questions
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview Questions */}
        {currentStep === 'preview' && interviewQuestions.length > 0 && (
          <div className="backdrop-blur-md bg-slate-900/30 border border-slate-700 rounded-2xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Ready to Start?</h2>
              <p className="text-slate-400">
                {interviewQuestions.length} personalized questions have been generated for you. Click below to begin your interview.
              </p>
            </div>

            {/* Questions List */}
            <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
              {interviewQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className="p-4 bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500/50 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold">
                      Question {index + 1}
                    </h3>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                        {q.category}
                      </span>
                      <span className={`
                        px-2 py-1 text-xs rounded
                        ${q.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' : ''}
                        ${q.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' : ''}
                        ${q.difficulty === 'hard' ? 'bg-red-500/20 text-red-300' : ''}
                      `}>
                        {q.difficulty}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-200">{q.question}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('describe')}
              >
                Edit & Regenerate
              </Button>
              <Button
                onClick={handleStartInterview}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 flex items-center gap-2"
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
