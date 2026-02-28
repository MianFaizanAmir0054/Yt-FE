"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ASPECT_RATIO_OPTIONS, IDEA_SUGGESTIONS } from "@/constants";
import { useCreateProjectMutation } from "@/lib/store/api/projectsApi";
import { useGetWorkspacesQuery } from "@/lib/store/api/workspacesApi";

export default function NewProjectPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const { data: workspacesData, isLoading: isWorkspacesLoading } = useGetWorkspacesQuery({});

  type AspectRatio = "9:16" | "16:9" | "1:1";

  const [formData, setFormData] = useState<{ 
    title: string;
    reelIdea: string;
    workspaceId: string;
    channelId: string;
    aspectRatio: AspectRatio;
  }>({
    title: "",
    reelIdea: "",
    workspaceId: "",
    channelId: "",
    aspectRatio: "9:16",
  });

  const workspaces = workspacesData?.workspaces || [];

  const selectedWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace._id === formData.workspaceId),
    [workspaces, formData.workspaceId]
  );

  const channelOptions = useMemo(() => {
    const channels = selectedWorkspace?.channelIds || [];
    return channels.map((channel) => {
      if (typeof channel === "string") {
        return { id: channel, name: channel };
      }
      return { id: channel._id, name: channel.name };
    });
  }, [selectedWorkspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.workspaceId) {
      setError("Please select a workspace.");
      return;
    }

    if (!formData.channelId) {
      setError("Please select a channel.");
      return;
    }

    try {
      const data = await createProject(formData).unwrap();
      router.push(`/dashboard/projects/${data.project._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData({
      ...formData,
      reelIdea: suggestion,
      title: formData.title || suggestion.slice(0, 30) + "...",
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </Link>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Create New Reel Project
              </h1>
              <p className="text-sm text-gray-400">
                Enter your idea and let AI do the research
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Project Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="My Awesome Reel"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Workspace
            </label>
            <select
              value={formData.workspaceId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  workspaceId: e.target.value,
                  channelId: "",
                })
              }
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isWorkspacesLoading}
              required
            >
              <option value="" disabled>
                {isWorkspacesLoading ? "Loading workspaces..." : "Select a workspace"}
              </option>
              {workspaces.map((workspace) => (
                <option key={workspace._id} value={workspace._id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Channel
            </label>
            <select
              value={formData.channelId}
              onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={!formData.workspaceId || channelOptions.length === 0}
              required
            >
              <option value="" disabled>
                {!formData.workspaceId
                  ? "Select a workspace first"
                  : channelOptions.length === 0
                  ? "No channels in this workspace"
                  : "Select a channel"}
              </option>
              {channelOptions.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Reel Idea / Topic
            </label>
            <textarea
              value={formData.reelIdea}
              onChange={(e) =>
                setFormData({ ...formData, reelIdea: e.target.value })
              }
              placeholder="Describe your reel idea... e.g., 'Human rights and their importance in modern society'"
              rows={4}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              required
            />
            <p className="mt-2 text-xs text-gray-400">
              Be specific about your topic. The AI will research books,
              articles, and news to create an engaging script.
            </p>
          </div>

          {/* Idea Suggestions */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              💡 Need inspiration? Try one of these:
            </label>
            <div className="flex flex-wrap gap-2">
              {IDEA_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-3">
              {ASPECT_RATIO_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, aspectRatio: option.value })
                  }
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    formData.aspectRatio === option.value
                      ? "border-purple-500 bg-purple-500/20 text-white"
                      : "border-gray-600 bg-gray-700/50 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  <span className="block font-medium">{option.label}</span>
                  <span className="block text-xs mt-1">{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating || !formData.workspaceId || !formData.channelId}
            className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold rounded-lg transition-colors"
          >
            {isCreating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Creating...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Create Project
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
