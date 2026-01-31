"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Search,
  FileText,
  Mic,
  Image,
  Video,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  ChevronRight,
} from "lucide-react";

interface Scene {
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
  subtitles: Array<{
    id: string;
    start: number;
    end: number;
    text: string;
  }>;
}

interface Project {
  _id: string;
  title: string;
  reelIdea: string;
  status: string;
  aspectRatio: string;
  researchData?: {
    sources: Array<{ title: string; url: string; snippet: string }>;
    keywords: string[];
    generatedAt: string;
  };
  script?: {
    fullText: string;
    scenes: Array<{
      id: string;
      text: string;
      visualDescription: string;
    }>;
    generatedAt: string;
  };
  voiceover?: {
    filePath: string;
    duration: number;
    uploadedAt: string;
  };
  whisperAnalysis?: {
    fullTranscript: string;
    analyzedAt: string;
  };
  timeline: {
    totalDuration: number;
    scenes: Scene[];
  };
  output?: {
    videoPath: string;
    thumbnailPath?: string;
    hashtags: string[];
    generatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

const STEPS = [
  { id: 1, key: "research", label: "Research & Script", icon: Search },
  { id: 2, key: "voiceover", label: "Upload Voiceover", icon: Mic },
  { id: 3, key: "images", label: "Generate Images", icon: Image },
  { id: 4, key: "video", label: "Create Video", icon: Video },
];

const statusToStep: Record<string, number> = {
  draft: 1,
  researching: 1,
  "script-ready": 2,
  "voiceover-uploaded": 3,
  "images-ready": 4,
  processing: 4,
  completed: 5,
  failed: 0,
};

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch project");
      }

      setProject(data.project);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const handleResearch = async () => {
    setActionLoading("research");
    setError("");

    try {
      const res = await fetch(`/api/projects/${id}/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: "60s", tone: "educational" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Research failed");
      }

      await fetchProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Research failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleVoiceoverUpload = async (file: File) => {
    setActionLoading("voiceover");
    setError("");

    try {
      const formData = new FormData();
      formData.append("audio", file);

      const res = await fetch(`/api/projects/${id}/voiceover`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      await fetchProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateImages = async () => {
    setActionLoading("images");
    setError("");

    try {
      const res = await fetch(`/api/projects/${id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "pexels" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Image generation failed");
      }

      await fetchProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image generation failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateVideo = async () => {
    setActionLoading("video");
    setError("");

    try {
      const res = await fetch(`/api/projects/${id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Video generation failed");
      }

      await fetchProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video generation failed");
    } finally {
      setActionLoading(null);
    }
  };

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

  const currentStep = statusToStep[project.status] || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-2"
          >
            <ArrowLeft size={18} />
            Back to Projects
          </Link>
          <h1 className="text-2xl font-bold text-white">{project.title}</h1>
          <p className="text-gray-400 mt-1">{project.reelIdea}</p>
        </div>
        {project.status === "completed" && project.output?.videoPath && (
          <a
            href={`/api/files/${encodeURIComponent(project.output.videoPath)}`}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download size={20} />
            Download Video
          </a>
        )}
      </div>

      {/* Progress Steps */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 lg:p-6">
        <div className="flex items-center justify-between relative">
          {STEPS.map((step, index) => {
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
                {index < STEPS.length - 1 && (
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
            <>
              <div className="p-4 lg:p-6 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-purple-500" />
                  Step 1: Research & Generate Script
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  AI will research your topic and create an engaging script
                </p>
              </div>
              <div className="p-4 lg:p-6">
                {project.status === "researching" ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-gray-400">
                      Researching and generating script...
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      This may take 1-2 minutes
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleResearch}
                    disabled={actionLoading === "research"}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold rounded-lg transition-colors"
                  >
                    {actionLoading === "research" ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Researching...
                      </>
                    ) : (
                      <>
                        <Search size={20} />
                        Start Research
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}

          {/* Step 2: Upload Voiceover */}
          {currentStep === 2 && (
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
                        if (file) handleVoiceoverUpload(file);
                      }}
                      className="hidden"
                      disabled={actionLoading === "voiceover"}
                    />
                    <span className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
                      {actionLoading === "voiceover" ? (
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
          )}

          {/* Step 3: Generate Images */}
          {currentStep === 3 && (
            <>
              <div className="p-4 lg:p-6 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Image className="w-5 h-5 text-purple-500" />
                  Step 3: Generate Images
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  AI will generate or find images for each scene
                </p>
              </div>
              <div className="p-4 lg:p-6">
                <button
                  onClick={handleGenerateImages}
                  disabled={actionLoading === "images"}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold rounded-lg transition-colors"
                >
                  {actionLoading === "images" ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Generating Images...
                    </>
                  ) : (
                    <>
                      <Image size={20} />
                      Generate Images
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Step 4: Create Video */}
          {currentStep === 4 && (
            <>
              <div className="p-4 lg:p-6 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-500" />
                  Step 4: Create Video
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Assemble images, audio, and subtitles into final video
                </p>
              </div>
              <div className="p-4 lg:p-6">
                {project.status === "processing" ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-gray-400">Processing video...</p>
                    <p className="text-xs text-gray-500 mt-2">
                      This may take 1-2 minutes
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateVideo}
                    disabled={actionLoading === "video"}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold rounded-lg transition-colors"
                  >
                    {actionLoading === "video" ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Creating Video...
                      </>
                    ) : (
                      <>
                        <Video size={20} />
                        Create Video
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}

          {/* Completed State */}
          {currentStep === 5 && project.output && (
            <>
              <div className="p-4 lg:p-6 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Video Complete!
                </h2>
              </div>
              <div className="p-4 lg:p-6 space-y-4">
                <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden max-h-96 mx-auto">
                  <video
                    src={`/api/files/${encodeURIComponent(project.output.videoPath)}`}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>

                {project.output.hashtags && project.output.hashtags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      Suggested Hashtags:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.output.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <a
                    href={`/api/files/${encodeURIComponent(project.output.videoPath)}`}
                    download
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Download size={20} />
                    Download Video
                  </a>
                  <button
                    onClick={handleGenerateVideo}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <RefreshCw size={20} />
                    Regenerate
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column - Script & Timeline */}
        <div className="space-y-6">
          {/* Script */}
          {project.script && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" />
                  Generated Script
                </h2>
              </div>
              <div className="p-4 max-h-64 overflow-y-auto">
                <p className="text-gray-300 text-sm whitespace-pre-wrap">
                  {project.script.fullText}
                </p>
              </div>
            </div>
          )}

          {/* Timeline */}
          {project.timeline.scenes.length > 0 && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                  Timeline ({project.timeline.scenes.length} scenes)
                </h2>
                <Link
                  href={`/dashboard/projects/${id}/timeline`}
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  Edit Timeline
                  <ChevronRight size={16} />
                </Link>
              </div>
              <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                {project.timeline.scenes.map((scene) => (
                  <div key={scene.id} className="p-4 flex gap-4">
                    {scene.imagePath ? (
                      <img
                        src={`/api/files/${encodeURIComponent(scene.imagePath)}`}
                        alt={`Scene ${scene.order + 1}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-purple-400">
                          Scene {scene.order + 1}
                        </span>
                        <span className="text-xs text-gray-500">
                          {scene.startTime.toFixed(1)}s -{" "}
                          {scene.endTime.toFixed(1)}s
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {scene.sceneText || scene.sceneDescription}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Voiceover Info */}
          {project.voiceover && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Mic className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Voiceover Uploaded</h3>
                  <p className="text-sm text-gray-400">
                    Duration: {project.voiceover.duration.toFixed(1)}s
                  </p>
                </div>
                <audio
                  src={`/api/files/${encodeURIComponent(project.voiceover.filePath)}`}
                  controls
                  className="ml-auto h-10"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
