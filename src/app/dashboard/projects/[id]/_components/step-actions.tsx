"use client";

import { Search, Mic, Image, Video, Loader2 } from "lucide-react";

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
}

export function ResearchStep({ status, isLoading, onResearch }: ResearchStepProps) {
  const isProcessing = status === "researching";

  return (
    <StepActionCard
      title="Step 1: Research & Generate Script"
      description="AI will research your topic and create an engaging script"
      icon={<Search className="w-5 h-5 text-purple-500" />}
      buttonText="Start Research"
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
}

export function ImagesStep({ isLoading, onGenerate }: ImagesStepProps) {
  return (
    <StepActionCard
      title="Step 3: Generate Images"
      description="AI will generate or find images for each scene"
      icon={<Image className="w-5 h-5 text-purple-500" />}
      buttonText="Generate Images"
      loadingText="Generating Images..."
      onClick={onGenerate}
      isLoading={isLoading}
    />
  );
}

interface VideoStepProps {
  status: string;
  isLoading: boolean;
  onGenerate: () => void;
}

export function VideoStep({ status, isLoading, onGenerate }: VideoStepProps) {
  const isProcessing = status === "processing";

  return (
    <StepActionCard
      title="Step 4: Create Video"
      description="Assemble images, audio, and subtitles into final video"
      icon={<Video className="w-5 h-5 text-purple-500" />}
      buttonText="Create Video"
      loadingText="Creating Video..."
      onClick={onGenerate}
      isLoading={isLoading}
      isProcessing={isProcessing}
      processingText="Processing video..."
    />
  );
}
