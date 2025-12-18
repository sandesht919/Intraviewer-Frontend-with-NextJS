/**
 * Interview Preparation Page
 * 
 * Guides users through interview setup in 2 simple steps:
 * 1. Optional CV upload (drag-drop support)
 * 2. Job description input and automatic question generation
 * 
 * Features:
 * - Optional CV upload with file validation
 * - Job description textarea
 * - Automatic AI question generation and interview start
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
 * Manages the flow of uploading CV and describing job, then automatically starts interview
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
  const [currentStep, setCurrentStep] = useState<'upload' | 'describe'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [localJobDesc, setLocalJobDesc] = useState('');

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
   * Handle generate questions and start interview
   */
  const handleGenerateQuestions = async () => {
    // Persist job description in the hook state for later use
    setJobDescription(localJobDesc);
    // Pass the local job description to avoid relying on the
    // asynchronous state update; the hook accepts an override.
    await generateQuestions(localJobDesc);
    // Directly start the interview after questions are generated
    await handleStartInterview();
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
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Start Your Interview Practice
          </h1>
          <p className="text-gray-600 text-lg">
            Tell us about your target role and we'll generate personalized questions
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12 flex justify-center relative max-w-md mx-auto">
          {/* Step 1: Optional CV Upload */}
          <div className="flex flex-col items-center z-10">
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg mb-2 transition-all
                ${
                  currentStep === 'upload' || cvData.file
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }
              `}
            >
              {cvData.file ? <CheckCircle className="w-6 h-6" /> : '1'}
            </div>
            <span className="text-sm font-medium text-gray-900">CV (Optional)</span>
          </div>

          {/* Connector Line */}
          <div
            className={`
              flex-1 h-1 my-auto mx-4 rounded-full transition-all
              ${localJobDesc ? 'bg-blue-500' : 'bg-gray-200'}
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
                    : 'bg-gray-200 text-gray-400'
                }
              `}
            >
              {localJobDesc ? <CheckCircle className="w-6 h-6" /> : '2'}
            </div>
            <span className="text-sm font-medium text-gray-900">Job Description</span>
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
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your CV (Optional)</h2>
              <p className="text-gray-600">
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
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
                  }
                `}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-900 font-semibold mb-2">Drag and drop your CV here</p>
                <p className="text-gray-600 text-sm mb-4">or click to browse your files</p>

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
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Describe Your Target Role</h2>
              <p className="text-gray-600">
                Tell us about the position you're interviewing for. Include key responsibilities, required skills, and any other relevant details.
              </p>
            </div>

            {/* Job Description Input */}
            <div className="mb-6">
              <label htmlFor="job-desc" className="block text-sm font-medium text-gray-900 mb-3">
                Job Description or Role Details
              </label>
              <textarea
                id="job-desc"
                value={localJobDesc}
                onChange={(e) => setLocalJobDesc(e.target.value)}
                placeholder="E.g., Senior Frontend Engineer at a tech startup. Required: React, TypeScript, Web Performance. Responsibilities: Lead frontend architecture, mentor junior devs, optimize performance..."
                rows={6}
                className="
                  w-full px-4 py-3 bg-white border border-gray-300 rounded-lg
                  text-gray-900 placeholder-gray-500 resize-none
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                  transition-all
                "
              />
              <p className="text-gray-600 text-sm mt-2">
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
                    Starting Interview...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Start Interview
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
