// Project status configuration
export const PROJECT_STATUS = {
  DRAFT: "draft",
  RESEARCHING: "researching",
  SCRIPT_READY: "script-ready",
  VOICEOVER_UPLOADED: "voiceover-uploaded",
  IMAGES_READY: "images-ready",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export interface StatusConfig {
  color: string;
  bgColor: string;
  label: string;
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  [PROJECT_STATUS.DRAFT]: {
    color: "text-slate-400",
    bgColor: "bg-slate-500/10 border-slate-500/20",
    label: "Draft",
  },
  [PROJECT_STATUS.RESEARCHING]: {
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    label: "Researching",
  },
  [PROJECT_STATUS.SCRIPT_READY]: {
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10 border-yellow-500/20",
    label: "Script Ready",
  },
  [PROJECT_STATUS.VOICEOVER_UPLOADED]: {
    color: "text-orange-400",
    bgColor: "bg-orange-500/10 border-orange-500/20",
    label: "Voiceover",
  },
  [PROJECT_STATUS.IMAGES_READY]: {
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/20",
    label: "Images Ready",
  },
  [PROJECT_STATUS.PROCESSING]: {
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10 border-indigo-500/20",
    label: "Processing",
  },
  [PROJECT_STATUS.COMPLETED]: {
    color: "text-green-400",
    bgColor: "bg-green-500/10 border-green-500/20",
    label: "Completed",
  },
  [PROJECT_STATUS.FAILED]: {
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
    label: "Failed",
  },
};

// Simple color mapping for badges
export const STATUS_COLORS: Record<string, string> = {
  [PROJECT_STATUS.DRAFT]: "bg-gray-500",
  [PROJECT_STATUS.RESEARCHING]: "bg-blue-500",
  [PROJECT_STATUS.SCRIPT_READY]: "bg-yellow-500",
  [PROJECT_STATUS.VOICEOVER_UPLOADED]: "bg-orange-500",
  [PROJECT_STATUS.IMAGES_READY]: "bg-purple-500",
  [PROJECT_STATUS.PROCESSING]: "bg-indigo-500",
  [PROJECT_STATUS.COMPLETED]: "bg-green-500",
  [PROJECT_STATUS.FAILED]: "bg-red-500",
};

export const STATUS_LABELS: Record<string, string> = {
  [PROJECT_STATUS.DRAFT]: "Draft",
  [PROJECT_STATUS.RESEARCHING]: "Researching",
  [PROJECT_STATUS.SCRIPT_READY]: "Script Ready",
  [PROJECT_STATUS.VOICEOVER_UPLOADED]: "Voiceover Uploaded",
  [PROJECT_STATUS.IMAGES_READY]: "Images Ready",
  [PROJECT_STATUS.PROCESSING]: "Processing",
  [PROJECT_STATUS.COMPLETED]: "Completed",
  [PROJECT_STATUS.FAILED]: "Failed",
};

// Map project status to step number
export const STATUS_TO_STEP: Record<string, number> = {
  [PROJECT_STATUS.DRAFT]: 1,
  [PROJECT_STATUS.RESEARCHING]: 1,
  [PROJECT_STATUS.SCRIPT_READY]: 2,
  [PROJECT_STATUS.VOICEOVER_UPLOADED]: 3,
  [PROJECT_STATUS.IMAGES_READY]: 4,
  [PROJECT_STATUS.PROCESSING]: 4,
  [PROJECT_STATUS.COMPLETED]: 5,
  [PROJECT_STATUS.FAILED]: 0,
};
