import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import Project from "@/lib/db/models/Project";
import User from "@/lib/db/models/User";
import { decrypt } from "@/lib/encryption";
import { assembleVideo, generateThumbnail } from "@/lib/video/assembler";
import { generateHashtags } from "@/lib/ai/script-generator";
import path from "path";

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
    const body = await request.json();
    const { subtitleStyle = {} } = body;

    await connectDB();

    // Get project
    const project = await Project.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Validate project state
    if (!project.voiceover?.filePath) {
      return NextResponse.json(
        { error: "Voiceover is required before generating video" },
        { status: 400 }
      );
    }

    if (!project.timeline?.scenes || project.timeline.scenes.length === 0) {
      return NextResponse.json(
        { error: "Timeline with scenes is required" },
        { status: 400 }
      );
    }

    // Check all scenes have images
    const missingImages = project.timeline.scenes.filter((s) => !s.imagePath);
    if (missingImages.length > 0) {
      return NextResponse.json(
        {
          error: `${missingImages.length} scene(s) are missing images`,
          missingScenes: missingImages.map((s) => s.id),
        },
        { status: 400 }
      );
    }

    // Get user API keys for hashtag generation
    const user = await User.findById(session.user.id);
    const apiKeys = {
      openai: user?.apiKeys.openai ? decrypt(user.apiKeys.openai) : undefined,
      anthropic: user?.apiKeys.anthropic
        ? decrypt(user.apiKeys.anthropic)
        : undefined,
    };

    const llmProvider = apiKeys.openai ? "openai" : "anthropic";
    const llmKey = apiKeys.openai || apiKeys.anthropic;

    // Update status to processing
    project.status = "processing";
    await project.save();

    try {
      // Assemble video
      console.log("Assembling video...");
      const outputDir = path.join(
        process.cwd(),
        "outputs",
        session.user.id,
        id
      );

      const videoResult = await assembleVideo({
        scenes: project.timeline.scenes.map((scene) => ({
          id: scene.id,
          imagePath: scene.imagePath!,
          startTime: scene.startTime,
          endTime: scene.endTime,
          duration: scene.duration,
          subtitles: scene.subtitles,
        })),
        audioPath: project.voiceover.filePath,
        outputDir,
        aspectRatio: project.aspectRatio,
        subtitleStyle: {
          fontName: subtitleStyle.fontName || "Arial",
          fontSize: subtitleStyle.fontSize || 28,
          primaryColor: subtitleStyle.primaryColor || "&HFFFFFF",
          outlineColor: subtitleStyle.outlineColor || "&H000000",
          outline: subtitleStyle.outline || 2,
          shadow: subtitleStyle.shadow || 1,
          alignment: subtitleStyle.alignment || 2,
        },
      });

      if (!videoResult.success) {
        throw new Error(videoResult.error || "Video assembly failed");
      }

      // Generate thumbnail
      console.log("Generating thumbnail...");
      const thumbnailPath = await generateThumbnail(
        videoResult.videoPath!,
        outputDir
      );

      // Generate hashtags
      let hashtags: string[] = [];
      if (llmKey) {
        console.log("Generating hashtags...");
        hashtags = await generateHashtags(
          project.reelIdea,
          project.script?.fullText || "",
          llmProvider,
          llmKey
        );
      }

      // Update project with output
      project.output = {
        videoPath: videoResult.videoPath!,
        thumbnailPath: thumbnailPath || undefined,
        hashtags,
        generatedAt: new Date(),
      };

      project.status = "completed";
      await project.save();

      return NextResponse.json({
        message: "Video generated successfully",
        output: {
          videoPath: videoResult.videoPath,
          thumbnailPath,
          duration: videoResult.duration,
          hashtags,
        },
      });
    } catch (videoError) {
      console.error("Video generation error:", videoError);
      project.status = "failed";
      await project.save();

      return NextResponse.json(
        {
          error: "Failed to generate video",
          details:
            videoError instanceof Error ? videoError.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Generate video error:", error);
    return NextResponse.json(
      { error: "Failed to process video generation" },
      { status: 500 }
    );
  }
}
