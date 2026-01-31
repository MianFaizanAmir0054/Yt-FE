import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText, streamText } from "ai";

interface ScriptScene {
  id: string;
  text: string;
  visualDescription: string;
}

interface GeneratedScript {
  fullText: string;
  scenes: ScriptScene[];
}

interface ScriptGenerationOptions {
  topic: string;
  researchSummary: string;
  duration: "30s" | "60s" | "90s" | "120s";
  tone: "educational" | "inspirational" | "dramatic" | "casual";
  provider: "openai" | "anthropic";
  apiKey: string;
}

const SCRIPT_GENERATION_PROMPT = `You are an expert video script writer specializing in short-form content for social media reels.

Based on the research provided, create an engaging video script that:
1. Hooks the viewer in the first 3 seconds
2. Presents information in a clear, engaging narrative
3. Uses emotional storytelling techniques
4. Ends with a memorable conclusion or call-to-action

IMPORTANT FORMATTING RULES:
- Divide the script into SCENES using [SCENE: description] markers
- Each scene represents a visual change in the video
- Each scene should be 5-15 seconds of narration
- Include visual descriptions for each scene
- Total duration should be approximately {duration}
- Tone should be {tone}

OUTPUT FORMAT:
Return the script in this exact JSON format:
{{
  "fullText": "The complete script text without scene markers",
  "scenes": [
    {{
      "id": "scene_1",
      "text": "The narration text for this scene",
      "visualDescription": "Description of what should be shown visually"
    }}
  ]
}}

TOPIC: {topic}

RESEARCH SUMMARY:
{researchSummary}`;

/**
 * Generate a video script using Vercel AI SDK
 */
export async function generateScript(
  options: ScriptGenerationOptions
): Promise<GeneratedScript> {
  const { topic, researchSummary, duration, tone, provider, apiKey } = options;

  const prompt = SCRIPT_GENERATION_PROMPT
    .replace("{duration}", duration)
    .replace("{tone}", tone)
    .replace("{topic}", topic)
    .replace("{researchSummary}", researchSummary);

  let result;

  if (provider === "openai") {
    result = await generateText({
      model: openai("gpt-4-turbo-preview", { apiKey }),
      prompt,
      maxTokens: 2000,
      temperature: 0.7,
    });
  } else {
    result = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022", { apiKey }),
      prompt,
      maxTokens: 2000,
      temperature: 0.7,
    });
  }

  // Parse the JSON response
  try {
    // Extract JSON from the response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate and ensure scene IDs
    const scenes = parsed.scenes.map((scene: Partial<ScriptScene>, index: number) => ({
      id: scene.id || `scene_${index + 1}`,
      text: scene.text || "",
      visualDescription: scene.visualDescription || "",
    }));

    return {
      fullText: parsed.fullText || scenes.map((s: ScriptScene) => s.text).join(" "),
      scenes,
    };
  } catch (parseError) {
    console.error("Failed to parse script JSON:", parseError);
    
    // Fallback: Create a single scene with the full text
    return {
      fullText: result.text,
      scenes: [
        {
          id: "scene_1",
          text: result.text,
          visualDescription: "Visual representation of " + topic,
        },
      ],
    };
  }
}

/**
 * Stream script generation for real-time UI updates
 */
export async function streamScriptGeneration(
  options: ScriptGenerationOptions
) {
  const { topic, researchSummary, duration, tone, provider, apiKey } = options;

  const prompt = SCRIPT_GENERATION_PROMPT
    .replace("{duration}", duration)
    .replace("{tone}", tone)
    .replace("{topic}", topic)
    .replace("{researchSummary}", researchSummary);

  if (provider === "openai") {
    return streamText({
      model: openai("gpt-4-turbo-preview", { apiKey }),
      prompt,
      maxTokens: 2000,
      temperature: 0.7,
    });
  } else {
    return streamText({
      model: anthropic("claude-3-5-sonnet-20241022", { apiKey }),
      prompt,
      maxTokens: 2000,
      temperature: 0.7,
    });
  }
}

/**
 * Detect scenes from existing script text
 */
export async function detectScenes(
  scriptText: string,
  provider: "openai" | "anthropic",
  apiKey: string
): Promise<ScriptScene[]> {
  const prompt = `Analyze this video script and divide it into distinct visual scenes.

For each scene:
1. Identify when the topic/visual context changes
2. Extract the narration text for that scene
3. Suggest what visuals should accompany it

Script:
${scriptText}

Return JSON array:
[
  {
    "id": "scene_1",
    "text": "narration for scene",
    "visualDescription": "what to show visually"
  }
]`;

  let result;

  if (provider === "openai") {
    result = await generateText({
      model: openai("gpt-4-turbo-preview", { apiKey }),
      prompt,
      maxTokens: 1500,
    });
  } else {
    result = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022", { apiKey }),
      prompt,
      maxTokens: 1500,
    });
  }

  try {
    const jsonMatch = result.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array found");
    }
    return JSON.parse(jsonMatch[0]);
  } catch {
    return [
      {
        id: "scene_1",
        text: scriptText,
        visualDescription: "Main visual",
      },
    ];
  }
}

/**
 * Generate image prompts for scenes
 */
export async function generateImagePrompts(
  scenes: ScriptScene[],
  styleGuide: string,
  provider: "openai" | "anthropic",
  apiKey: string
): Promise<string[]> {
  const prompt = `You are an expert at creating image generation prompts for AI image generators like Stable Diffusion.

For each scene, create a detailed image prompt that:
1. Captures the visual essence of the scene
2. Uses specific, descriptive language
3. Includes style, lighting, and composition details
4. Maintains visual consistency across all scenes

Style Guide: ${styleGuide || "Cinematic, photorealistic, professional quality"}

Scenes:
${scenes.map((s, i) => `${i + 1}. ${s.visualDescription}`).join("\n")}

Return a JSON array of prompts, one for each scene:
["prompt for scene 1", "prompt for scene 2", ...]`;

  let result;

  if (provider === "openai") {
    result = await generateText({
      model: openai("gpt-4-turbo-preview", { apiKey }),
      prompt,
      maxTokens: 1500,
    });
  } else {
    result = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022", { apiKey }),
      prompt,
      maxTokens: 1500,
    });
  }

  try {
    const jsonMatch = result.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array found");
    }
    return JSON.parse(jsonMatch[0]);
  } catch {
    // Fallback: Return generic prompts
    return scenes.map(
      (s) =>
        `${s.visualDescription}, cinematic lighting, professional photography, 8k quality`
    );
  }
}

/**
 * Generate hashtags for the video
 */
export async function generateHashtags(
  topic: string,
  script: string,
  provider: "openai" | "anthropic",
  apiKey: string
): Promise<string[]> {
  const prompt = `Generate 15-20 relevant hashtags for a social media reel about this topic.

Topic: ${topic}

Script summary: ${script.slice(0, 500)}

Include:
- Popular general hashtags
- Topic-specific hashtags
- Trending relevant hashtags
- Mix of broad and niche tags

Return as JSON array: ["hashtag1", "hashtag2", ...]
Do NOT include the # symbol.`;

  let result;

  if (provider === "openai") {
    result = await generateText({
      model: openai("gpt-4-turbo-preview", { apiKey }),
      prompt,
      maxTokens: 300,
    });
  } else {
    result = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022", { apiKey }),
      prompt,
      maxTokens: 300,
    });
  }

  try {
    const jsonMatch = result.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array found");
    }
    return JSON.parse(jsonMatch[0]);
  } catch {
    return ["video", "reel", "viral", "trending"];
  }
}

export default {
  generateScript,
  streamScriptGeneration,
  detectScenes,
  generateImagePrompts,
  generateHashtags,
};
