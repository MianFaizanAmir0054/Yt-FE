// Shared types used across the application

export interface Project {
  _id: string;
  title: string;
  reelIdea: string;
  status: string;
  aspectRatio: string;
  createdAt: string;
  updatedAt: string;
  researchData?: ResearchData;
  script?: Script;
  voiceover?: Voiceover;
  whisperAnalysis?: WhisperAnalysis;
  timeline: Timeline;
  output?: ProjectOutput;
}

export interface ResearchData {
  sources: Array<{ title: string; url: string; snippet: string }>;
  keywords: string[];
  generatedAt: string;
}

export interface Script {
  fullText: string;
  scenes: Array<{
    id: string;
    text: string;
    visualDescription: string;
  }>;
  generatedAt: string;
}

export interface Voiceover {
  filePath: string;
  duration: number;
  uploadedAt: string;
}

export interface WhisperAnalysis {
  fullTranscript: string;
  analyzedAt: string;
}

export interface Timeline {
  totalDuration: number;
  scenes: Scene[];
}

export interface Scene {
  id: string;
  order: number;
  startTime: number;
  endTime: number;
  duration: number;
  sceneText: string;
  sceneDescription: string;
  imagePrompt: string;
  imagePath?: string;
  imageSource: string;
  subtitles: Subtitle[];
}

export interface Subtitle {
  id: string;
  start: number;
  end: number;
  text: string;
}

export interface ProjectOutput {
  videoPath: string;
  thumbnailPath?: string;
  hashtags: string[];
  generatedAt: string;
}

export interface ApiKeyConfig {
  maskedKeys: Record<string, string | null>;
  configured: Record<string, boolean>;
  preferences: {
    defaultLLM: string;
    defaultImageProvider: string;
    subtitleStyle: string;
  };
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "collaborator";
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface ProjectStats {
  total: number;
  completed: number;
  inProgress: number;
  failed: number;
}

export interface MessageState {
  type: "success" | "error";
  text: string;
}

// Form input types
export interface CreateProjectInput {
  title: string;
  reelIdea: string;
  aspectRatio: string;
}

export interface UserPreferences {
  defaultLLM: string;
  defaultImageProvider: string;
  subtitleStyle: string;
}
