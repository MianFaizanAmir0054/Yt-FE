import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";
import { encrypt, decrypt, maskApiKey } from "@/lib/encryption";

// GET - Fetch user API keys (masked)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return masked keys
    const maskedKeys = {
      openai: user.apiKeys.openai
        ? maskApiKey(decrypt(user.apiKeys.openai))
        : null,
      anthropic: user.apiKeys.anthropic
        ? maskApiKey(decrypt(user.apiKeys.anthropic))
        : null,
      perplexity: user.apiKeys.perplexity
        ? maskApiKey(decrypt(user.apiKeys.perplexity))
        : null,
      pexels: user.apiKeys.pexels
        ? maskApiKey(decrypt(user.apiKeys.pexels))
        : null,
      segmind: user.apiKeys.segmind
        ? maskApiKey(decrypt(user.apiKeys.segmind))
        : null,
      elevenLabs: user.apiKeys.elevenLabs
        ? maskApiKey(decrypt(user.apiKeys.elevenLabs))
        : null,
    };

    // Return which keys are configured
    const configured = {
      openai: !!user.apiKeys.openai,
      anthropic: !!user.apiKeys.anthropic,
      perplexity: !!user.apiKeys.perplexity,
      pexels: !!user.apiKeys.pexels,
      segmind: !!user.apiKeys.segmind,
      elevenLabs: !!user.apiKeys.elevenLabs,
    };

    return NextResponse.json({
      maskedKeys,
      configured,
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Get API keys error:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

// PUT - Update user API keys
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { apiKeys, preferences } = body;

    await connectDB();
    
    const updateData: Record<string, unknown> = {};

    // Encrypt and update API keys if provided
    if (apiKeys) {
      const encryptedKeys: Record<string, string | null> = {};
      
      for (const [key, value] of Object.entries(apiKeys)) {
        if (value !== undefined) {
          // Only update if value is provided (can be empty string to clear)
          encryptedKeys[`apiKeys.${key}`] = value ? encrypt(value as string) : null;
        }
      }
      
      Object.assign(updateData, encryptedKeys);
    }

    // Update preferences if provided
    if (preferences) {
      for (const [key, value] of Object.entries(preferences)) {
        if (value !== undefined) {
          updateData[`preferences.${key}`] = value;
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Settings updated successfully",
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Update API keys error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
