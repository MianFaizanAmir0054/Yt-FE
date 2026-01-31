import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import Project from "@/lib/db/models/Project";

// GET - List all projects for user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const projects = await Project.find({ userId: session.user.id })
      .sort({ updatedAt: -1 })
      .select("title reelIdea status aspectRatio createdAt updatedAt output.videoPath")
      .lean();

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, reelIdea, aspectRatio = "9:16" } = body;

    if (!title || !reelIdea) {
      return NextResponse.json(
        { error: "Title and reel idea are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const project = await Project.create({
      userId: session.user.id,
      title,
      reelIdea,
      aspectRatio,
      status: "draft",
      timeline: {
        totalDuration: 0,
        scenes: [],
      },
    });

    return NextResponse.json(
      {
        message: "Project created successfully",
        project: {
          id: project._id.toString(),
          title: project.title,
          reelIdea: project.reelIdea,
          status: project.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
