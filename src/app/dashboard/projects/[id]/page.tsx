"use client";

import { useEffect, use } from "react";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";

import { useProjectActions } from "@/hooks";
import { STATUS_TO_STEP } from "@/constants";

import {
  ProgressSteps,
  ProjectHeader,
  ResearchStep,
  VoiceoverStep,
  ImagesStep,
  VideoStep,
  CompletedState,
  ScriptSection,
  TimelineSection,
  VoiceoverInfo,
} from "./_components";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    project,
    loading,
    actionLoading,
    error,
    fetchProject,
    handleResearch,
    handleVoiceoverUpload,
    handleGenerateImages,
    handleGenerateVideo,
  } = useProjectActions(id);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-400">{error || "Project not found"}</p>
        <Link
          href="/dashboard"
          className="text-purple-400 hover:text-purple-300 mt-4 inline-block"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const currentStep = STATUS_TO_STEP[project.status] || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <ProjectHeader
        title={project.title}
        reelIdea={project.reelIdea}
        status={project.status}
        videoPath={project.output?.videoPath}
      />

      {/* Progress Steps */}
      <ProgressSteps currentStep={currentStep} />

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Current Step Action */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {/* Step 1: Research & Script */}
          {currentStep === 1 && (
            <ResearchStep
              status={project.status}
              isLoading={actionLoading === "research"}
              onResearch={handleResearch}
            />
          )}

          {/* Step 2: Upload Voiceover */}
          {currentStep === 2 && (
            <VoiceoverStep
              isLoading={actionLoading === "voiceover"}
              onUpload={handleVoiceoverUpload}
            />
          )}

          {/* Step 3: Generate Images */}
          {currentStep === 3 && (
            <ImagesStep
              isLoading={actionLoading === "images"}
              onGenerate={handleGenerateImages}
            />
          )}

          {/* Step 4: Create Video */}
          {currentStep === 4 && (
            <VideoStep
              status={project.status}
              isLoading={actionLoading === "video"}
              onGenerate={handleGenerateVideo}
            />
          )}

          {/* Completed State */}
          {currentStep === 5 && project.output && (
            <CompletedState
              output={project.output}
              onRegenerate={handleGenerateVideo}
            />
          )}
        </div>

        {/* Right Column - Script & Timeline */}
        <div className="space-y-6">
          {/* Script */}
          {project.script && <ScriptSection script={project.script} />}

          {/* Timeline */}
          {project.timeline.scenes.length > 0 && (
            <TimelineSection scenes={project.timeline.scenes} projectId={id} />
          )}

          {/* Voiceover Info */}
          {project.voiceover && <VoiceoverInfo voiceover={project.voiceover} />}
        </div>
      </div>
    </div>
  );
}
