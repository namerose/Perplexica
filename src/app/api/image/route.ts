import { getFalAiApiKey } from '@/lib/config';
import { NextRequest } from 'next/server';
import { fal } from '@fal-ai/client';

// Define enums for the image generation parameters
type OutputFormat = 'png' | 'jpeg';
type StyleName = '(No style)' | 'Cinematic' | 'Photographic' | 'Anime' | 'Manga' | 'Digital Art' | 'Pixel art' | 'Fantasy art' | 'Neonpunk' | '3D Model';

interface ImageGenerationBody {
  prompt: string;
  negative_prompt?: string;
  image_size?: {
    width: number;
    height: number;
  };
  num_inference_steps?: number;
  seed?: number;
  guidance_scale?: number;
  num_images?: number;
  enable_safety_checker?: boolean;
  output_format?: OutputFormat;
  style_name?: StyleName;
}

// Define the response types based on FAL AI API
interface Image {
  url: string;
  width?: number;
  height?: number;
  content_type?: string;
}

interface SanaOutput {
  images: Image[];
  seed: number;
  prompt: string;
  has_nsfw_concepts: boolean[];
}

export const POST = async (req: NextRequest) => {
  try {
    const body: ImageGenerationBody = await req.json();
    
    // Set FAL AI API Key
    fal.config({
      credentials: getFalAiApiKey(),
    });
    
    // Set defaults for missing values
    const prompt = body.prompt;
    const negative_prompt = body.negative_prompt || '';
    const image_size = body.image_size || { width: 1024, height: 1024 };
    const num_inference_steps = body.num_inference_steps || 18;
    const guidance_scale = body.guidance_scale || 5;
    const num_images = body.num_images || 1;
    const enable_safety_checker = body.enable_safety_checker !== false;
    const output_format = (body.output_format || 'png') as OutputFormat;
    const style_name = (body.style_name || '(No style)') as StyleName;
    const seed = body.seed || Math.floor(Math.random() * 1000000);
    
    // Call FAL AI API with all parameters
    const result = await fal.subscribe('fal-ai/sana', {
      input: {
        prompt,
        negative_prompt,
        image_size,
        num_inference_steps,
        guidance_scale,
        seed,
        num_images,
        enable_safety_checker,
        output_format,
        style_name,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Generation in progress:", update.logs.map(log => log.message));
        }
      },
    });
    
    // Return generated image data
    return Response.json({
      images: result.data.images,
      prompt: result.data.prompt,
      seed: result.data.seed,
    }, { status: 200 });
  } catch (error) {
    console.error('Error generating image:', error);
    return Response.json({
      error: 'Failed to generate image',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
};
