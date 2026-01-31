import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import axios from "axios";
import fs from "fs";
import path from "path";

interface WhisperWord {
  word: string;
  start: number;
  end: number;
}

interface WhisperSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

interface WhisperAnalysis {
  fullTranscript: string;
  words: WhisperWord[];
  segments: WhisperSegment[];
  duration: number;
}

/**
 * Analyze voiceover audio using OpenAI Whisper API
 */
export async function analyzeVoiceover(
  audioFilePath: string,
  apiKey: string
): Promise<WhisperAnalysis> {
  // Read the audio file
  const audioFile = fs.readFileSync(audioFilePath);
  const fileName = path.basename(audioFilePath);

  // Create form data
  const formData = new FormData();
  formData.append("file", new Blob([audioFile]), fileName);
  formData.append("model", "whisper-1");
  formData.append("response_format", "verbose_json");
  formData.append("timestamp_granularities[]", "word");
  formData.append("timestamp_granularities[]", "segment");

  const response = await axios.post(
    "https://api.openai.com/v1/audio/transcriptions",
    formData,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  const data = response.data;

  // Extract word-level timestamps
  const words: WhisperWord[] = (data.words || []).map(
    (w: { word: string; start: number; end: number }) => ({
      word: w.word,
      start: w.start,
      end: w.end,
    })
  );

  // Extract segment-level timestamps
  const segments: WhisperSegment[] = (data.segments || []).map(
    (s: { id: number; start: number; end: number; text: string }) => ({
      id: s.id,
      start: s.start,
      end: s.end,
      text: s.text.trim(),
    })
  );

  // Calculate duration from last word/segment
  const lastWord = words[words.length - 1];
  const lastSegment = segments[segments.length - 1];
  const duration = Math.max(
    lastWord?.end || 0,
    lastSegment?.end || 0,
    data.duration || 0
  );

  return {
    fullTranscript: data.text,
    words,
    segments,
    duration,
  };
}

/**
 * Map script scenes to audio timestamps
 */
export async function mapScenesToTimestamps(
  scenes: Array<{ id: string; text: string; visualDescription: string }>,
  whisperAnalysis: WhisperAnalysis,
  provider: "openai" | "anthropic",
  apiKey: string
): Promise<
  Array<{
    sceneId: string;
    startTime: number;
    endTime: number;
    duration: number;
    matchedText: string;
    subtitles: Array<{ id: string; start: number; end: number; text: string }>;
  }>
> {
  const { words, segments, duration } = whisperAnalysis;

  // Use AI to match scenes to transcript
  const prompt = `Match these video scenes to the transcribed audio.

SCENES (from script):
${scenes.map((s, i) => `${i + 1}. "${s.text}"`).join("\n")}

TRANSCRIPT WITH TIMESTAMPS:
${segments.map((s) => `[${s.start.toFixed(2)}s - ${s.end.toFixed(2)}s] ${s.text}`).join("\n")}

For each scene, find the corresponding start and end timestamps from the transcript.
Scenes should be sequential and cover the entire audio duration (${duration}s).

Return JSON:
[
  {
    "sceneIndex": 0,
    "startTime": 0.0,
    "endTime": 5.5,
    "matchedSegments": [0, 1]
  }
]`;

  let result;

  if (provider === "openai") {
    result = await generateText({
      model: openai("gpt-4-turbo-preview", { apiKey }),
      prompt,
      maxTokens: 1000,
    });
  } else {
    // Fallback to OpenAI for Whisper-related tasks
    result = await generateText({
      model: openai("gpt-4-turbo-preview", { apiKey }),
      prompt,
      maxTokens: 1000,
    });
  }

  try {
    const jsonMatch = result.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON found");
    }

    const mappings = JSON.parse(jsonMatch[0]);

    return mappings.map(
      (
        m: { sceneIndex: number; startTime: number; endTime: number; matchedSegments: number[] },
        index: number
      ) => {
        const scene = scenes[m.sceneIndex] || scenes[index];
        const startTime = m.startTime;
        const endTime = m.endTime;

        // Get words within this time range for subtitles
        const sceneWords = words.filter(
          (w) => w.start >= startTime && w.end <= endTime
        );

        // Group words into subtitle chunks (3-5 words each)
        const subtitles = createSubtitleChunks(sceneWords, startTime);

        return {
          sceneId: scene.id,
          startTime,
          endTime,
          duration: endTime - startTime,
          matchedText: sceneWords.map((w) => w.word).join(" "),
          subtitles,
        };
      }
    );
  } catch (error) {
    console.error("Failed to map scenes:", error);
    
    // Fallback: Evenly distribute scenes
    const sceneDuration = duration / scenes.length;
    
    return scenes.map((scene, index) => {
      const startTime = index * sceneDuration;
      const endTime = (index + 1) * sceneDuration;
      
      const sceneWords = words.filter(
        (w) => w.start >= startTime && w.end <= endTime
      );

      return {
        sceneId: scene.id,
        startTime,
        endTime,
        duration: sceneDuration,
        matchedText: sceneWords.map((w) => w.word).join(" "),
        subtitles: createSubtitleChunks(sceneWords, startTime),
      };
    });
  }
}

/**
 * Create subtitle chunks from words
 */
function createSubtitleChunks(
  words: WhisperWord[],
  baseTime: number
): Array<{ id: string; start: number; end: number; text: string }> {
  const subtitles: Array<{
    id: string;
    start: number;
    end: number;
    text: string;
  }> = [];

  const WORDS_PER_CHUNK = 4;
  let chunkIndex = 0;

  for (let i = 0; i < words.length; i += WORDS_PER_CHUNK) {
    const chunk = words.slice(i, i + WORDS_PER_CHUNK);
    if (chunk.length === 0) continue;

    subtitles.push({
      id: `sub_${baseTime}_${chunkIndex}`,
      start: chunk[0].start,
      end: chunk[chunk.length - 1].end,
      text: chunk.map((w) => w.word).join(" "),
    });

    chunkIndex++;
  }

  return subtitles;
}

/**
 * Generate SRT subtitle file content
 */
export function generateSRT(
  subtitles: Array<{ id: string; start: number; end: number; text: string }>
): string {
  return subtitles
    .map((sub, index) => {
      const startTime = formatSRTTime(sub.start);
      const endTime = formatSRTTime(sub.end);
      return `${index + 1}\n${startTime} --> ${endTime}\n${sub.text}\n`;
    })
    .join("\n");
}

/**
 * Format seconds to SRT timestamp (HH:MM:SS,mmm)
 */
function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
}

export default {
  analyzeVoiceover,
  mapScenesToTimestamps,
  generateSRT,
};
