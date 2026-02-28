"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";

import { useProjectActions } from "@/hooks";
import { resolveStepFromProjectData } from "@/constants";

import {
  ProgressSteps,
  ProjectHeader,
  ResearchStep,
  VoiceoverStep,
  ImagesStep,
  SceneVideosStep,
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
    project: projectData,
    loading,
    actionLoading,
    videoProgress,
    error,
    handleResearch,
    handleVoiceoverUpload,
    handleGenerateImages,
    handleGenerateSceneVideos,
    handleGenerateVideo,
  } = useProjectActions(id);

  // Extract project from response data
  const project = projectData?.project;

  const isFailed = project?.status === "failed";
  const currentStep = project ? resolveStepFromProjectData(project) : 1;

  // Allow navigating back to completed steps to redo them
  const [activeStep, setActiveStep] = useState(currentStep);

  // Sync activeStep when the real currentStep advances (e.g. after a successful action)
  useEffect(() => {
    setActiveStep(currentStep);
  }, [currentStep]);

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

  const viewingStep = activeStep;

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
      <ProgressSteps
        currentStep={currentStep}
        activeStep={activeStep}
        failedAtStep={isFailed ? currentStep : undefined}
        onStepClick={(step) => setActiveStep(step)}
      />

      {/* Failed Banner */}
      {isFailed && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>
            The previous attempt failed. Your progress is intact — you can retry
            from where you left off.
          </span>
        </div>
      )}

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
          {viewingStep === 1 && (
            <ResearchStep
              status={project.status}
              isLoading={actionLoading === "research"}
              onResearch={handleResearch}
              isFailed={isFailed && currentStep === 1}
            />
          )}

          {/* Step 2: Upload Voiceover */}
          {viewingStep === 2 && (
            <VoiceoverStep
              isLoading={actionLoading === "voiceover"}
              onUpload={handleVoiceoverUpload}
            />
          )}

          {/* Step 3: Generate Images */}
          {viewingStep === 3 && (
            <ImagesStep
              isLoading={actionLoading === "images"}
              onGenerate={handleGenerateImages}
              isFailed={isFailed && currentStep === 3}
            />
          )}

          {/* Step 4: AI Scene Videos */}
          {viewingStep === 4 && (
            <SceneVideosStep
              isLoading={actionLoading === "scene-videos"}
              onGenerate={handleGenerateSceneVideos}
              progressPercent={videoProgress}
              isFailed={isFailed && currentStep === 4}
            />
          )}

          {/* Step 5: Create Video */}
          {viewingStep === 5 && (
            <VideoStep
              status={project.status}
              isLoading={actionLoading === "video"}
              onGenerate={handleGenerateVideo}
              progressPercent={videoProgress}
              isFailed={isFailed && currentStep === 5}
            />
          )}

          {/* Completed State */}
          {viewingStep === 6 && project.output && (
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
