"use client";

import { Search, Mic, Image, Film, Video, CheckCircle, LucideIcon } from "lucide-react";

interface Step {
  id: number;
  key: string;
  label: string;
  icon: LucideIcon;
}

export const PROJECT_STEPS: Step[] = [
  { id: 1, key: "research", label: "Research & Script", icon: Search },
  { id: 2, key: "voiceover", label: "Upload Voiceover", icon: Mic },
  { id: 3, key: "images", label: "Generate Images", icon: Image },
  { id: 4, key: "scene-videos", label: "AI Scene Videos", icon: Film },
  { id: 5, key: "video", label: "Create Video", icon: Video },
];

interface ProgressStepsProps {
  currentStep: number;
  /** The step currently being viewed (may differ from currentStep when navigating back) */
  activeStep?: number;
  /** When set, shows this step with a red error indicator */
  failedAtStep?: number;
  /** Called when a clickable step is clicked */
  onStepClick?: (step: number) => void;
}

export function ProgressSteps({ currentStep, activeStep, failedAtStep, onStepClick }: ProgressStepsProps) {
  const viewing = activeStep ?? currentStep;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 lg:p-6">
      <div className="flex items-center justify-between relative">
        {PROJECT_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isViewing = viewing === step.id && viewing !== currentStep;
          const isFailedStep = failedAtStep === step.id;
          // Allow clicking completed steps, the current step, and the failed step
          const isClickable = onStepClick && (isCompleted || isCurrent || isFailedStep);

          return (
            <div
              key={step.id}
              className={`flex flex-col items-center relative z-10 ${isClickable ? "cursor-pointer group" : ""}`}
              onClick={() => isClickable && onStepClick(step.id)}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isFailedStep
                    ? "bg-red-500 text-white ring-2 ring-red-400/50"
                    : isViewing
                      ? "bg-purple-500 text-white ring-2 ring-purple-400/50"
                      : isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                          ? "bg-purple-500 text-white"
                          : "bg-gray-700 text-gray-400"
                } ${isClickable ? "group-hover:ring-2 group-hover:ring-white/30" : ""}`}
              >
                {isCompleted && !isFailedStep && !isViewing ? <CheckCircle size={24} /> : <Icon size={24} />}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  isFailedStep
                    ? "text-red-400"
                    : isViewing
                      ? "text-purple-400"
                      : isCompleted || isCurrent
                        ? "text-white"
                        : "text-gray-500"
                }`}
              >
                {isFailedStep ? `${step.label} (Failed)` : isViewing ? `${step.label} (Edit)` : step.label}
              </span>
              {index < PROJECT_STEPS.length - 1 && (
                <div
                  className={`absolute top-6 left-full w-full h-0.5 -translate-y-1/2 ${
                    isCompleted ? "bg-green-500" : "bg-gray-700"
                  }`}
                  style={{ width: "calc(100% - 3rem)", left: "3rem" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
