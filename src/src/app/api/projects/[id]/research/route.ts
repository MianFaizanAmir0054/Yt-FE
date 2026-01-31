import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import Project from "@/lib/db/models/Project";
import User from "@/lib/db/models/User";
import { decrypt } from "@/lib/encryption";
import { createResearchAgent } from "@/lib/ai/research-agent";
import { generateScript } from "@/lib/ai/script-generator";

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
    const { duration = "60s", tone = "educational" } = body;

    await connectDB();

    // Get project
    const project = await Project.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get user API keys
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Decrypt API keys
    const apiKeys = {
      openai: user.apiKeys.openai ? decrypt(user.apiKeys.openai) : undefined,
      anthropic: user.apiKeys.anthropic
        ? decrypt(user.apiKeys.anthropic)
        : undefined,
      perplexity: user.apiKeys.perplexity
        ? decrypt(user.apiKeys.perplexity)
        : undefined,
    };

    if (!apiKeys.openai && !apiKeys.anthropic) {
      return NextResponse.json(
        { error: "Please configure at least one LLM API key (OpenAI or Anthropic)" },
        { status: 400 }
      );
    }

    // Update status to researching
    project.status = "researching";
    await project.save();

    try {
      // Step 1: Research using LangChain agent
      console.log("Starting research for:", project.reelIdea);
      const researchResult = await createResearchAgent(project.reelIdea, apiKeys);

      // Save research data
      project.researchData = {
        sources: researchResult.sources,
        keywords: researchResult.keywords,
        generatedAt: new Date(),
      };

      // Step 2: Generate script using Vercel AI SDK
      console.log("Generating script...");
      const script = await generateScript({
        topic: project.reelIdea,
        researchSummary: researchResult.summary,
        duration: duration as "30s" | "60s" | "90s" | "120s",
        tone: tone as "educational" | "inspirational" | "dramatic" | "casual",
        provider: apiKeys.openai ? "openai" : "anthropic",
        apiKey: (apiKeys.openai || apiKeys.anthropic) as string,
      });

      // Save script
      project.script = {
        fullText: script.fullText,
        scenes: script.scenes,
        generatedAt: new Date(),
      };

      // Update status
      project.status = "script-ready";
      await project.save();

      return NextResponse.json({
        message: "Research and script generation completed",
        researchData: project.researchData,
        script: project.script,
      });
    } catch (aiError) {
      console.error("AI processing error:", aiError);
      project.status = "failed";
      await project.save();

      return NextResponse.json(
        {
          error: "Failed to generate research and script",
          details: aiError instanceof Error ? aiError.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Research error:", error);
    return NextResponse.json(
      { error: "Failed to process research" },
      { status: 500 }
    );
  }
}
