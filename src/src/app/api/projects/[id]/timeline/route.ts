import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import Project from "@/lib/db/models/Project";
import { v4 as uuidv4 } from "uuid";

// PUT - Update timeline (scenes, timestamps, images)
export async function PUT(
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
    const { scenes, totalDuration } = body;

    await connectDB();

    const project = await Project.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Update timeline
    if (scenes) {
      project.timeline.scenes = scenes;
    }

    if (totalDuration !== undefined) {
      project.timeline.totalDuration = totalDuration;
    }

    await project.save();

    return NextResponse.json({
      message: "Timeline updated",
      timeline: project.timeline,
    });
  } catch (error) {
    console.error("Update timeline error:", error);
    return NextResponse.json(
      { error: "Failed to update timeline" },
      { status: 500 }
    );
  }
}

// POST - Add new scene to timeline
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
    const { afterSceneId, scene } = body;

    await connectDB();

    const project = await Project.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Create new scene
    const newScene = {
      id: scene?.id || uuidv4(),
      order: 0,
      startTime: scene?.startTime || 0,
      endTime: scene?.endTime || 0,
      duration: scene?.duration || 0,
      sceneText: scene?.sceneText || "",
      sceneDescription: scene?.sceneDescription || "",
      imagePrompt: scene?.imagePrompt || "",
      imagePath: scene?.imagePath,
      imageSource: scene?.imageSource || "uploaded",
      subtitles: scene?.subtitles || [],
    };

    if (afterSceneId) {
      // Insert after specific scene
      const index = project.timeline.scenes.findIndex(
        (s) => s.id === afterSceneId
      );
      if (index !== -1) {
        project.timeline.scenes.splice(index + 1, 0, newScene);
      } else {
        project.timeline.scenes.push(newScene);
      }
    } else {
      // Add to end
      project.timeline.scenes.push(newScene);
    }

    // Recalculate orders
    project.timeline.scenes = project.timeline.scenes.map((s, i) => ({
      ...s,
      order: i,
    }));

    await project.save();

    return NextResponse.json({
      message: "Scene added",
      scene: newScene,
      timeline: project.timeline,
    });
  } catch (error) {
    console.error("Add scene error:", error);
    return NextResponse.json(
      { error: "Failed to add scene" },
      { status: 500 }
    );
  }
}

// DELETE - Remove scene from timeline
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const sceneId = searchParams.get("sceneId");

    if (!sceneId) {
      return NextResponse.json(
        { error: "Scene ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const project = await Project.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Remove scene
    project.timeline.scenes = project.timeline.scenes.filter(
      (s) => s.id !== sceneId
    );

    // Recalculate orders
    project.timeline.scenes = project.timeline.scenes.map((s, i) => ({
      ...s,
      order: i,
    }));

    await project.save();

    return NextResponse.json({
      message: "Scene removed",
      timeline: project.timeline,
    });
  } catch (error) {
    console.error("Remove scene error:", error);
    return NextResponse.json(
      { error: "Failed to remove scene" },
      { status: 500 }
    );
  }
}
