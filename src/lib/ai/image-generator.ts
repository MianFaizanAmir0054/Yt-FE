import axios from "axios";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

interface ImageGenerationResult {
  success: boolean;
  imagePath?: string;
  imageUrl?: string;
  error?: string;
}

interface PexelsPhoto {
  id: number;
  url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
  };
  alt: string;
  photographer: string;
}

/**
 * Generate image using Segmind API (Stable Diffusion)
 */
export async function generateWithSegmind(
  prompt: string,
  apiKey: string,
  outputDir: string
): Promise<ImageGenerationResult> {
  try {
    const response = await axios.post(
      "https://api.segmind.com/v1/sdxl1.0-txt2img",
      {
        prompt: prompt,
        negative_prompt:
          "low quality, blurry, distorted, deformed, ugly, bad anatomy, watermark, signature, text",
        style: "base",
        samples: 1,
        scheduler: "UniPC",
        num_inference_steps: 25,
        guidance_scale: 7.5,
        strength: 1,
        seed: Math.floor(Math.random() * 1000000),
        img_width: 1080,
        img_height: 1920, // 9:16 for reels
        base64: true,
      },
      {
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.image) {
      // Save base64 image to file
      const imageBuffer = Buffer.from(response.data.image, "base64");
      const fileName = `${uuidv4()}.png`;
      const filePath = path.join(outputDir, fileName);

      // Ensure directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(filePath, imageBuffer);

      return {
        success: true,
        imagePath: filePath,
      };
    }

    return {
      success: false,
      error: "No image returned from Segmind",
    };
  } catch (error) {
    console.error("Segmind generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate image using Prodia API (Free tier)
 */
export async function generateWithProdia(
  prompt: string,
  outputDir: string
): Promise<ImageGenerationResult> {
  try {
    // Prodia free API endpoint
    const generateResponse = await axios.post(
      "https://api.prodia.com/v1/sdxl/generate",
      {
        prompt: prompt,
        negative_prompt:
          "low quality, blurry, distorted, deformed, ugly, bad anatomy",
        model: "sdxl",
        steps: 25,
        cfg_scale: 7,
        width: 1080,
        height: 1920,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const jobId = generateResponse.data.job;

    // Poll for completion
    let imageUrl = null;
    let attempts = 0;
    const maxAttempts = 60; // Max 60 seconds

    while (!imageUrl && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const statusResponse = await axios.get(
        `https://api.prodia.com/v1/job/${jobId}`
      );

      if (statusResponse.data.status === "succeeded") {
        imageUrl = statusResponse.data.imageUrl;
      } else if (statusResponse.data.status === "failed") {
        throw new Error("Image generation failed");
      }

      attempts++;
    }

    if (!imageUrl) {
      throw new Error("Generation timed out");
    }

    // Download the image
    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const fileName = `${uuidv4()}.png`;
    const filePath = path.join(outputDir, fileName);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(filePath, imageResponse.data);

    return {
      success: true,
      imagePath: filePath,
      imageUrl,
    };
  } catch (error) {
    console.error("Prodia generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Search and download images from Pexels
 */
export async function searchPexels(
  query: string,
  apiKey: string,
  outputDir: string
): Promise<ImageGenerationResult> {
  try {
    const response = await axios.get(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=portrait`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    const photos: PexelsPhoto[] = response.data.photos;

    if (photos.length === 0) {
      return {
        success: false,
        error: "No images found for query",
      };
    }

    // Get the first relevant photo
    const photo = photos[0];
    const imageUrl = photo.src.large2x || photo.src.large;

    // Download the image
    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const fileName = `pexels_${photo.id}_${uuidv4()}.jpg`;
    const filePath = path.join(outputDir, fileName);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(filePath, imageResponse.data);

    return {
      success: true,
      imagePath: filePath,
      imageUrl,
    };
  } catch (error) {
    console.error("Pexels search error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Search images using Google Custom Search API (requires setup)
 */
export async function searchGoogleImages(
  query: string,
  apiKey: string,
  searchEngineId: string,
  outputDir: string
): Promise<ImageGenerationResult> {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/customsearch/v1`,
      {
        params: {
          key: apiKey,
          cx: searchEngineId,
          q: query,
          searchType: "image",
          imgSize: "xlarge",
          num: 5,
          safe: "active",
          rights: "cc_publicdomain,cc_attribute,cc_sharealike",
        },
      }
    );

    const items = response.data.items;

    if (!items || items.length === 0) {
      return {
        success: false,
        error: "No images found",
      };
    }

    const imageUrl = items[0].link;

    // Download the image
    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const fileName = `google_${uuidv4()}.jpg`;
    const filePath = path.join(outputDir, fileName);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(filePath, imageResponse.data);

    return {
      success: true,
      imagePath: filePath,
      imageUrl,
    };
  } catch (error) {
    console.error("Google search error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Main image generation function with fallback support
 */
export async function generateImage(
  prompt: string,
  options: {
    provider: "segmind" | "prodia" | "pexels" | "google";
    apiKeys: {
      segmind?: string;
      pexels?: string;
      googleApiKey?: string;
      googleSearchEngineId?: string;
    };
    outputDir: string;
    fallbackToPexels?: boolean;
  }
): Promise<ImageGenerationResult> {
  const { provider, apiKeys, outputDir, fallbackToPexels = true } = options;

  let result: ImageGenerationResult;

  switch (provider) {
    case "segmind":
      if (!apiKeys.segmind) {
        return { success: false, error: "Segmind API key not provided" };
      }
      result = await generateWithSegmind(prompt, apiKeys.segmind, outputDir);
      break;

    case "prodia":
      result = await generateWithProdia(prompt, outputDir);
      break;

    case "pexels":
      if (!apiKeys.pexels) {
        return { success: false, error: "Pexels API key not provided" };
      }
      result = await searchPexels(prompt, apiKeys.pexels, outputDir);
      break;

    case "google":
      if (!apiKeys.googleApiKey || !apiKeys.googleSearchEngineId) {
        return { success: false, error: "Google API credentials not provided" };
      }
      result = await searchGoogleImages(
        prompt,
        apiKeys.googleApiKey,
        apiKeys.googleSearchEngineId,
        outputDir
      );
      break;

    default:
      return { success: false, error: "Unknown provider" };
  }

  // Fallback to Pexels if primary provider fails
  if (!result.success && fallbackToPexels && apiKeys.pexels) {
    console.log(`Primary provider failed, falling back to Pexels`);
    result = await searchPexels(prompt, apiKeys.pexels, outputDir);
  }

  return result;
}

/**
 * Generate images for all scenes
 */
export async function generateSceneImages(
  scenes: Array<{
    id: string;
    imagePrompt: string;
  }>,
  options: {
    provider: "segmind" | "prodia" | "pexels";
    apiKeys: {
      segmind?: string;
      pexels?: string;
    };
    outputDir: string;
  }
): Promise<
  Array<{
    sceneId: string;
    success: boolean;
    imagePath?: string;
    error?: string;
  }>
> {
  const results = [];

  for (const scene of scenes) {
    console.log(`Generating image for scene ${scene.id}...`);

    const result = await generateImage(scene.imagePrompt, {
      provider: options.provider,
      apiKeys: options.apiKeys,
      outputDir: options.outputDir,
      fallbackToPexels: true,
    });

    results.push({
      sceneId: scene.id,
      success: result.success,
      imagePath: result.imagePath,
      error: result.error,
    });

    // Small delay between requests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}

export default {
  generateImage,
  generateSceneImages,
  generateWithSegmind,
  generateWithProdia,
  searchPexels,
  searchGoogleImages,
};
