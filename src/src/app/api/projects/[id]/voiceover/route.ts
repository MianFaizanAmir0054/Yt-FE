import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import Project from "@/lib/db/models/Project";
import User from "@/lib/db/models/User";
import { decrypt } from "@/lib/encryption";
import { analyzeVoiceover, mapScenesToTimestamps } from "@/lib/ai/whisper-analyzer";
import { getAudioDuration } from "@/lib/video/assembler";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    // Get project
    const project = await Project.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.script?.scenes || project.script.scenes.length === 0) {
      return NextResponse.json(
        { error: "Script must be generated before uploading voiceover" },
        { status: 400 }
      );
    }

    // Get user API keys
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const openaiKey = user.apiKeys.openai
      ? decrypt(user.apiKeys.openai)
      : undefined;

    if (!openaiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is required for audio analysis" },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("audio") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/mp4",
      "audio/m4a",
      "audio/x-m4a",
      "audio/mp3",
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|mp4)$/i)) {
      return NextResponse.json(
        { error: "Invalid audio format. Supported: MP3, WAV, M4A" },
        { status: 400 }
      );
    }

    // Create uploads directory
    const uploadDir = path.join(process.cwd(), "uploads", session.user.id, id);
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `voiceover_${uuidv4()}${path.extname(file.name)}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Get audio duration
    const duration = await getAudioDuration(filePath);

    // Save voiceover info
    project.voiceover = {
      filePath,
      duration,
      uploadedAt: new Date(),
    };

    try {
      // Analyze with Whisper
      console.log("Analyzing voiceover with Whisper...");
      const whisperResult = await analyzeVoiceover(filePath, openaiKey);

      project.whisperAnalysis = {
        fullTranscript: whisperResult.fullTranscript,
        words: whisperResult.words,
        segments: whisperResult.segments,
        analyzedAt: new Date(),
      };

      // Map scenes to timestamps
      console.log("Mapping scenes to timestamps...");
      const sceneMappings = await mapScenesToTimestamps(
        project.script.scenes,
        whisperResult,
        "openai",
        openaiKey
      );

      // Build timeline
      project.timeline = {
        totalDuration: duration,
        scenes: sceneMappings.map((mapping, index) => ({
          id: mapping.sceneId,
          order: index,
          startTime: mapping.startTime,
          endTime: mapping.endTime,
          duration: mapping.duration,
          sceneText: project.script!.scenes[index]?.text || "",
          sceneDescription:
            project.script!.scenes[index]?.visualDescription || "",
          imagePrompt: "", // Will be generated later
          imagePath: undefined,
          imageSource: "ai-generated" as const,
          subtitles: mapping.subtitles,
        })),
      };

      project.status = "voiceover-uploaded";
      await project.save();

      return NextResponse.json({
        message: "Voiceover uploaded and analyzed successfully",
        voiceover: {
          duration,
          transcript: whisperResult.fullTranscript,
        },
        timeline: project.timeline,
      });
    } catch (analysisError) {
      console.error("Whisper analysis error:", analysisError);
      project.status = "failed";
      await project.save();

      return NextResponse.json(
        {
          error: "Failed to analyze voiceover",
          details:
            analysisError instanceof Error
              ? analysisError.message
              : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Voiceover upload error:", error);
    return NextResponse.json(
      { error: "Failed to process voiceover" },
      { status: 500 }
    );
  }
}
