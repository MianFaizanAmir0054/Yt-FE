"use client";

import Link from "next/link";
import { FileText, Clock, Mic, Image, ChevronRight } from "lucide-react";

import { Scene, Voiceover, Script } from "@/types";

interface ScriptSectionProps {
  script: Script;
}

export function ScriptSection({ script }: ScriptSectionProps) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-500" />
          Generated Script
        </h2>
      </div>
      <div className="p-4 max-h-64 overflow-y-auto">
        <p className="text-gray-300 text-sm whitespace-pre-wrap">
          {script.fullText}
        </p>
      </div>
    </div>
  );
}

interface TimelineSectionProps {
  scenes: Scene[];
  projectId: string;
}

export function TimelineSection({ scenes, projectId }: TimelineSectionProps) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-500" />
          Timeline ({scenes.length} scenes)
        </h2>
        <Link
          href={`/dashboard/projects/${projectId}/timeline`}
          className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
        >
          Edit Timeline
          <ChevronRight size={16} />
        </Link>
      </div>
      <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
        {scenes.map((scene) => (
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
                  {scene.startTime.toFixed(1)}s - {scene.endTime.toFixed(1)}s
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
  );
}

interface VoiceoverInfoProps {
  voiceover: Voiceover;
}

export function VoiceoverInfo({ voiceover }: VoiceoverInfoProps) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <Mic className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <h3 className="font-medium text-white">Voiceover Uploaded</h3>
          <p className="text-sm text-gray-400">
            Duration: {voiceover.duration.toFixed(1)}s
          </p>
        </div>
        <audio
          src={`/api/files/${encodeURIComponent(voiceover.filePath)}`}
          controls
          className="ml-auto h-10"
        />
      </div>
    </div>
  );
}
