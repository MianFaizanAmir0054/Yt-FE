import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

interface VideoScene {
  id: string;
  imagePath: string;
  startTime: number;
  endTime: number;
  duration: number;
  subtitles: Array<{
    id: string;
    start: number;
    end: number;
    text: string;
  }>;
}

interface VideoAssemblyOptions {
  scenes: VideoScene[];
  audioPath: string;
  outputDir: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  subtitleStyle?: {
    fontName?: string;
    fontSize?: number;
    primaryColor?: string;
    outlineColor?: string;
    outline?: number;
    shadow?: number;
    alignment?: number;
  };
}

interface VideoAssemblyResult {
  success: boolean;
  videoPath?: string;
  duration?: number;
  error?: string;
}

/**
 * Get video dimensions based on aspect ratio
 */
function getDimensions(aspectRatio: "9:16" | "16:9" | "1:1"): {
  width: number;
  height: number;
} {
  switch (aspectRatio) {
    case "9:16":
      return { width: 1080, height: 1920 };
    case "16:9":
      return { width: 1920, height: 1080 };
    case "1:1":
      return { width: 1080, height: 1080 };
    default:
      return { width: 1080, height: 1920 };
  }
}

/**
 * Generate SRT file from subtitles
 */
function generateSRTFile(
  subtitles: Array<{ id: string; start: number; end: number; text: string }>,
  outputPath: string
): void {
  const srtContent = subtitles
    .map((sub, index) => {
      const startTime = formatSRTTime(sub.start);
      const endTime = formatSRTTime(sub.end);
      return `${index + 1}\n${startTime} --> ${endTime}\n${sub.text}\n`;
    })
    .join("\n");

  fs.writeFileSync(outputPath, srtContent);
}

/**
 * Format seconds to SRT timestamp
 */
function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms
    .toString()
    .padStart(3, "0")}`;
}

/**
 * Generate FFmpeg concat file for image sequence
 */
function generateConcatFile(
  scenes: VideoScene[],
  outputPath: string
): void {
  let content = "";

  scenes.forEach((scene, index) => {
    // Use forward slashes for FFmpeg compatibility
    const imagePath = scene.imagePath.replace(/\\/g, "/");
    content += `file '${imagePath}'\n`;
    content += `duration ${scene.duration}\n`;

    // Repeat last image (FFmpeg requirement)
    if (index === scenes.length - 1) {
      content += `file '${imagePath}'\n`;
    }
  });

  fs.writeFileSync(outputPath, content);
}

/**
 * Assemble video from scenes, audio, and subtitles
 */
export async function assembleVideo(
  options: VideoAssemblyOptions
): Promise<VideoAssemblyResult> {
  const {
    scenes,
    audioPath,
    outputDir,
    aspectRatio,
    subtitleStyle = {},
  } = options;

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const videoId = uuidv4();
  const dimensions = getDimensions(aspectRatio);

  // Generate temporary files
  const concatFilePath = path.join(outputDir, `concat_${videoId}.txt`);
  const srtFilePath = path.join(outputDir, `subtitles_${videoId}.srt`);
  const outputPath = path.join(outputDir, `video_${videoId}.mp4`);

  try {
    // Validate all image files exist
    for (const scene of scenes) {
      if (!fs.existsSync(scene.imagePath)) {
        throw new Error(`Image not found: ${scene.imagePath}`);
      }
    }

    // Validate audio file exists
    if (!fs.existsSync(audioPath)) {
      throw new Error(`Audio file not found: ${audioPath}`);
    }

    // Generate concat file
    generateConcatFile(scenes, concatFilePath);

    // Collect all subtitles
    const allSubtitles = scenes.flatMap((scene) => scene.subtitles);
    generateSRTFile(allSubtitles, srtFilePath);

    // Build subtitle style string
    const {
      fontName = "Arial",
      fontSize = 28,
      primaryColor = "&HFFFFFF",
      outlineColor = "&H000000",
      outline = 2,
      shadow = 1,
      alignment = 2, // Bottom center
    } = subtitleStyle;

    const subtitleFilter = `subtitles='${srtFilePath.replace(/\\/g, "/").replace(/'/g, "\\'")}':force_style='FontName=${fontName},Fontsize=${fontSize},PrimaryColour=${primaryColor},OutlineColour=${outlineColor},BorderStyle=3,Outline=${outline},Shadow=${shadow},Alignment=${alignment}'`;

    // Run FFmpeg
    return new Promise((resolve) => {
      ffmpeg()
        .input(concatFilePath)
        .inputOptions(["-f concat", "-safe 0"])
        .input(audioPath)
        .outputOptions([
          `-vf scale=${dimensions.width}:${dimensions.height}:force_original_aspect_ratio=decrease,pad=${dimensions.width}:${dimensions.height}:(ow-iw)/2:(oh-ih)/2,${subtitleFilter}`,
          "-c:v libx264",
          "-preset medium",
          "-crf 23",
          "-c:a aac",
          "-b:a 192k",
          "-shortest",
          "-y",
        ])
        .output(outputPath)
        .on("start", (cmd) => {
          console.log("FFmpeg command:", cmd);
        })
        .on("progress", (progress) => {
          console.log(`Processing: ${progress.percent?.toFixed(1)}%`);
        })
        .on("end", () => {
          // Clean up temporary files
          try {
            fs.unlinkSync(concatFilePath);
            fs.unlinkSync(srtFilePath);
          } catch (e) {
            console.warn("Failed to clean up temp files:", e);
          }

          // Get video duration
          ffmpeg.ffprobe(outputPath, (err, metadata) => {
            const duration = metadata?.format?.duration || 0;
            resolve({
              success: true,
              videoPath: outputPath,
              duration,
            });
          });
        })
        .on("error", (err) => {
          console.error("FFmpeg error:", err);

          // Clean up temporary files
          try {
            fs.unlinkSync(concatFilePath);
            fs.unlinkSync(srtFilePath);
          } catch (e) {
            // Ignore cleanup errors
          }

          resolve({
            success: false,
            error: err.message,
          });
        })
        .run();
    });
  } catch (error) {
    // Clean up temporary files on error
    try {
      if (fs.existsSync(concatFilePath)) fs.unlinkSync(concatFilePath);
      if (fs.existsSync(srtFilePath)) fs.unlinkSync(srtFilePath);
    } catch (e) {
      // Ignore cleanup errors
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate video thumbnail from first frame
 */
export async function generateThumbnail(
  videoPath: string,
  outputDir: string
): Promise<string | null> {
  return new Promise((resolve) => {
    const thumbnailPath = path.join(
      outputDir,
      `thumb_${path.basename(videoPath, ".mp4")}.jpg`
    );

    ffmpeg(videoPath)
      .screenshots({
        count: 1,
        folder: outputDir,
        filename: path.basename(thumbnailPath),
        size: "1080x1920",
      })
      .on("end", () => {
        resolve(thumbnailPath);
      })
      .on("error", (err) => {
        console.error("Thumbnail generation error:", err);
        resolve(null);
      });
  });
}

/**
 * Get audio duration
 */
export function getAudioDuration(audioPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(metadata.format.duration || 0);
    });
  });
}

/**
 * Validate video file
 */
export function validateVideo(videoPath: string): Promise<{
  valid: boolean;
  duration?: number;
  width?: number;
  height?: number;
  error?: string;
}> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        resolve({ valid: false, error: err.message });
        return;
      }

      const videoStream = metadata.streams.find(
        (s) => s.codec_type === "video"
      );

      resolve({
        valid: true,
        duration: metadata.format.duration,
        width: videoStream?.width,
        height: videoStream?.height,
      });
    });
  });
}

export default {
  assembleVideo,
  generateThumbnail,
  getAudioDuration,
  validateVideo,
};
