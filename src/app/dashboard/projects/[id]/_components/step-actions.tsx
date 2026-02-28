"use client";

import { Search, Mic, Image, Film, Video, Loader2 } from "lucide-react";

interface StepActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  loadingText: string;
  onClick: () => void;
  isLoading: boolean;
  isProcessing?: boolean;
  processingText?: string;
  processingPercent?: number;
}

function StepActionCard({
  title,
  description,
  icon,
  buttonText,
  loadingText,
  onClick,
  isLoading,
  isProcessing = false,
  processingText = "Processing...",
  processingPercent,
}: StepActionProps) {
  return (
    <>
      <div className="p-4 lg:p-6 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </div>
      <div className="p-4 lg:p-6">
        {isProcessing ? (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-400">{processingText}</p>
            {typeof processingPercent === "number" && processingPercent > 0 && (
              <div className="mt-4 max-w-xs mx-auto">
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, processingPercent))}%` }}
                  />
                </div>
                <p className="text-sm text-purple-400 mt-2 font-medium">
                  {Math.round(processingPercent)}%
                </p>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              This may take 1-2 minutes
            </p>
          </div>
        ) : (
          <button
            onClick={onClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold rounded-lg transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {loadingText}
              </>
            ) : (
              <>
                {icon}
                {buttonText}
              </>
            )}
          </button>
        )}
      </div>
    </>
  );
}

interface ResearchStepProps {
  status: string;
  isLoading: boolean;
  onResearch: () => void;
  isFailed?: boolean;
}

export function ResearchStep({ status, isLoading, onResearch, isFailed }: ResearchStepProps) {
  const isProcessing = status === "researching";

  return (
    <StepActionCard
      title="Step 1: Research & Generate Script"
      description={isFailed ? "Previous attempt failed — click to retry" : "AI will research your topic and create an engaging script"}
      icon={<Search className="w-5 h-5 text-purple-500" />}
      buttonText={isFailed ? "Retry Research" : "Start Research"}
      loadingText="Researching..."
      onClick={onResearch}
      isLoading={isLoading}
      isProcessing={isProcessing}
      processingText="Researching and generating script..."
    />
  );
}

interface VoiceoverStepProps {
  isLoading: boolean;
  onUpload: (file: File) => void;
}

export function VoiceoverStep({ isLoading, onUpload }: VoiceoverStepProps) {
  return (
    <>
      <div className="p-4 lg:p-6 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Mic className="w-5 h-5 text-purple-500" />
          Step 2: Upload Voiceover
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Record your voiceover using the script, then upload it here
        </p>
      </div>
      <div className="p-4 lg:p-6">
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <Mic className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">
            Upload your voiceover file (MP3, WAV, M4A)
          </p>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="audio/mpeg,audio/wav,audio/mp4,audio/m4a,.mp3,.wav,.m4a"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
              }}
              className="hidden"
              disabled={isLoading}
            />
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Uploading & Analyzing...
                </>
              ) : (
                <>
                  <Mic size={20} />
                  Select Audio File
                </>
              )}
            </span>
          </label>
        </div>
      </div>
    </>
  );
}

interface ImagesStepProps {
  isLoading: boolean;
  onGenerate: () => void;
  isFailed?: boolean;
}

export function ImagesStep({ isLoading, onGenerate, isFailed }: ImagesStepProps) {
  return (
    <StepActionCard
      title="Step 3: Generate Images"
      description={isFailed ? "Previous attempt failed — click to retry" : "AI will generate or find images for each scene"}
      icon={<Image className="w-5 h-5 text-purple-500" />}
      buttonText={isFailed ? "Retry Image Generation" : "Generate Images"}
      loadingText="Generating Images..."
      onClick={onGenerate}
      isLoading={isLoading}
    />
  );
}

interface SceneVideosStepProps {
  isLoading: boolean;
  onGenerate: (options?: { useExisting?: boolean }) => void;
  progressPercent?: number;
  isFailed?: boolean;
  hasExistingVideos?: boolean;
  useExisting: boolean;
  onToggleUseExisting: (value: boolean) => void;
}

export function SceneVideosStep({ isLoading, onGenerate, progressPercent, isFailed, hasExistingVideos, useExisting, onToggleUseExisting }: SceneVideosStepProps) {
  return (
    <>
      <div className="p-4 lg:p-6 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Film className="w-5 h-5 text-cyan-500" />
          Step 4: Generate AI Scene Videos
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          {isFailed
            ? "Scene video generation failed — click to retry"
            : "AI will turn each scene image into an animated video clip"}
        </p>

        {/* Use Existing Videos Toggle */}
        {hasExistingVideos && (
          <div className="mt-3 flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
            <button
              type="button"
              role="switch"
              aria-checked={useExisting}
              onClick={() => onToggleUseExisting(!useExisting)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                useExisting ? "bg-cyan-500" : "bg-gray-600"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  useExisting ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <div>
              <p className="text-sm font-medium text-white">Use existing videos</p>
              <p className="text-xs text-gray-400">
                Skip AI generation — reuse previously generated video clips for testing
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 lg:p-6">
        {isLoading && !useExisting ? (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-400">Generating AI video clips for each scene... This may take a few minutes.</p>
            {typeof progressPercent === "number" && progressPercent > 0 && (
              <div className="mt-4 max-w-xs mx-auto">
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                  />
                </div>
                <p className="text-sm text-purple-400 mt-2 font-medium">
                  {Math.round(progressPercent)}%
                </p>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">This may take 1-2 minutes</p>
          </div>
        ) : (
          <button
            onClick={() => onGenerate({ useExisting })}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 py-4 ${
              useExisting
                ? "bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800"
                : "bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800"
            } text-white font-semibold rounded-lg transition-colors`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {useExisting ? "Applying Existing Videos..." : "Generating AI Videos..."}
              </>
            ) : (
              <>
                <Film className="w-5 h-5" />
                {isFailed
                  ? "Retry Scene Videos"
                  : useExisting
                    ? "Use Existing Videos"
                    : "Generate AI Videos"}
              </>
            )}
          </button>
        )}
      </div>
    </>
  );
}

interface VideoStepProps {
  status: string;
  isLoading: boolean;
  onGenerate: () => void;
  progressPercent?: number;
  isFailed?: boolean;
}

export function VideoStep({ status, isLoading, onGenerate, progressPercent, isFailed }: VideoStepProps) {
  const isProcessing = status === "processing";

  return (
    <StepActionCard
      title="Step 5: Create Final Video"
      description={isFailed ? "Video compilation failed — click to retry" : "Assemble scene videos, audio, and subtitles into final video"}
      icon={<Video className="w-5 h-5 text-purple-500" />}
      buttonText={isFailed ? "Retry Video Compilation" : "Create Final Video"}
      loadingText="Creating Video..."
      onClick={onGenerate}
      isLoading={isLoading}
      isProcessing={isProcessing || isLoading}
      processingText="Compiling final video..."
      processingPercent={progressPercent}
    />
  );
}
