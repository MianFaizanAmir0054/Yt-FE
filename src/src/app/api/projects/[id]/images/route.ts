import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import Project from "@/lib/db/models/Project";
import User from "@/lib/db/models/User";
import { decrypt } from "@/lib/encryption";
import { generateImagePrompts } from "@/lib/ai/script-generator";
import { generateSceneImages } from "@/lib/ai/image-generator";
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
    const { provider = "pexels", styleGuide = "" } = body;

    await connectDB();

    // Get project
    const project = await Project.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.timeline?.scenes || project.timeline.scenes.length === 0) {
      return NextResponse.json(
        { error: "Timeline must exist before generating images" },
        { status: 400 }
      );
    }

    // Get user API keys
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const apiKeys = {
      openai: user.apiKeys.openai ? decrypt(user.apiKeys.openai) : undefined,
      anthropic: user.apiKeys.anthropic
        ? decrypt(user.apiKeys.anthropic)
        : undefined,
      pexels: user.apiKeys.pexels ? decrypt(user.apiKeys.pexels) : undefined,
      segmind: user.apiKeys.segmind ? decrypt(user.apiKeys.segmind) : undefined,
    };

    // Validate required keys
    if (provider === "segmind" && !apiKeys.segmind) {
      return NextResponse.json(
        { error: "Segmind API key required for AI image generation" },
        { status: 400 }
      );
    }

    if (provider === "pexels" && !apiKeys.pexels) {
      return NextResponse.json(
        { error: "Pexels API key required for stock photos" },
        { status: 400 }
      );
    }

    const llmProvider = apiKeys.openai ? "openai" : "anthropic";
    const llmKey = apiKeys.openai || apiKeys.anthropic;

    if (!llmKey) {
      return NextResponse.json(
        { error: "LLM API key required for generating image prompts" },
        { status: 400 }
      );
    }

    try {
      // Step 1: Generate image prompts for each scene
      console.log("Generating image prompts...");
      const scenes = project.timeline.scenes.map((s) => ({
        id: s.id,
        text: s.sceneText,
        visualDescription: s.sceneDescription,
      }));

      const imagePrompts = await generateImagePrompts(
        scenes,
        styleGuide,
        llmProvider,
        llmKey
      );

      // Update scenes with prompts
      project.timeline.scenes = project.timeline.scenes.map((scene, index) => ({
        ...scene,
        imagePrompt: imagePrompts[index] || scene.sceneDescription,
      }));

      await project.save();

      // Step 2: Generate/search images
      console.log(`Generating images using ${provider}...`);
      const outputDir = path.join(
        process.cwd(),
        "uploads",
        session.user.id,
        id,
        "images"
      );

      const imageResults = await generateSceneImages(
        project.timeline.scenes.map((s) => ({
          id: s.id,
          imagePrompt: s.imagePrompt,
        })),
        {
          provider: provider as "segmind" | "prodia" | "pexels",
          apiKeys: {
            segmind: apiKeys.segmind,
            pexels: apiKeys.pexels,
          },
          outputDir,
        }
      );

      // Update scenes with image paths
      project.timeline.scenes = project.timeline.scenes.map((scene) => {
        const result = imageResults.find((r) => r.sceneId === scene.id);
        return {
          ...scene,
          imagePath: result?.imagePath || scene.imagePath,
          imageSource:
            provider === "pexels" ? ("stock" as const) : ("ai-generated" as const),
        };
      });

      project.status = "images-ready";
      await project.save();

      return NextResponse.json({
        message: "Images generated successfully",
        results: imageResults,
        timeline: project.timeline,
      });
    } catch (imageError) {
      console.error("Image generation error:", imageError);
      return NextResponse.json(
        {
          error: "Failed to generate images",
          details:
            imageError instanceof Error ? imageError.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Generate images error:", error);
    return NextResponse.json(
      { error: "Failed to process image generation" },
      { status: 500 }
    );
  }
}
