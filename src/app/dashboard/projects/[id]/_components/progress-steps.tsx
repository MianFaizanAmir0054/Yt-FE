"use client";

import { Search, Mic, Image, Video, CheckCircle, LucideIcon } from "lucide-react";

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
  { id: 4, key: "video", label: "Create Video", icon: Video },
];

interface ProgressStepsProps {
  currentStep: number;
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 lg:p-6">
      <div className="flex items-center justify-between relative">
        {PROJECT_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center relative z-10"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isCurrent
                      ? "bg-purple-500 text-white"
                      : "bg-gray-700 text-gray-400"
                }`}
              >
                {isCompleted ? <CheckCircle size={24} /> : <Icon size={24} />}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  isCompleted || isCurrent ? "text-white" : "text-gray-500"
                }`}
              >
                {step.label}
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
