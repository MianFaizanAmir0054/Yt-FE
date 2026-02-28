"use client";

import { CheckCircle, Download, RefreshCw } from "lucide-react";
import { buildOutputsUrl } from "@/lib/utils";

interface ProjectOutput {
  videoPath: string;
  thumbnailPath?: string;
  hashtags: string[];
  generatedAt: string;
}

interface CompletedStateProps {
  output: ProjectOutput;
  onRegenerate: () => void;
}

export function CompletedState({
  output,
  onRegenerate,
}: CompletedStateProps) {
  return (
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
            src={buildOutputsUrl(output.videoPath)}
            controls
            className="w-full h-full object-contain"
          />
        </div>

        {output.hashtags && output.hashtags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Suggested Hashtags:
            </h3>
            <div className="flex flex-wrap gap-2">
              {output.hashtags.map((tag) => (
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
            href={buildOutputsUrl(output.videoPath)}
            download
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download size={20} />
            Download Video
          </a>
          <button
            onClick={onRegenerate}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={20} />
            Regenerate
          </button>
        </div>
      </div>
    </>
  );
}
