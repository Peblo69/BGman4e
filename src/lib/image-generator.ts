import axios from 'axios';
import { translateBulgarianToEnglish, isBulgarian } from './translation';
import { containsRestrictedWords } from './restricted-words';

export const MODEL_CONFIGS = {
  'Rundiffusion X++': {
    model: 'rundiffusion:130@100',
    defaultSettings: { steps: 33, CFGScale: 3, scheduler: 'Euler Beta' }
  }
} as const;

export type ModelConfig = keyof typeof MODEL_CONFIGS;

export type ImageSize = {
  width: number;
  height: number;
};

export const IMAGE_SIZES = {
  'Square HD': { width: 1024, height: 1024 },
  'Portrait': { width: 832, height: 1216 },
  'Landscape': { width: 1216, height: 832 }
} as const;

export type GenerationResponse = {
  imageURL: string;
  isNSFW: boolean;
  originalPrompt: string;
  translatedPrompt?: string;
};

export async function generateImage({
  prompt,
  model = 'Rundiffusion X++',
  size = 'Square HD',
  steps = 33,
  apiKey
}: {
  prompt: string;
  model?: ModelConfig;
  size?: keyof typeof IMAGE_SIZES;
  steps?: number;
  apiKey?: string;
}): Promise<GenerationResponse> {
  const modelConfig = MODEL_CONFIGS[model];
  const imageSize = IMAGE_SIZES[size];
  
  // Store the original prompt
  const originalPrompt = prompt;
  
  // Get API key from environment variables if not provided
  const imageApiKey = apiKey || import.meta.env.VITE_IMAGE_API_KEY;
  
  // First check if prompt contains restricted words
  if (containsRestrictedWords(prompt)) {
    throw new Error("Забранено съдържание: Промптът съдържа неподходящи думи или фрази.");
  }
  
  // Check if the prompt is in Bulgarian and needs translation
  let translatedPrompt: string | undefined;
  let translationAttempted = false;
  
  if (isBulgarian(prompt)) {
    translationAttempted = true;
    console.log('Bulgarian text detected, attempting translation...');
    
    try {
      // First translation attempt
      translatedPrompt = await translateBulgarianToEnglish(prompt);
      
      // Validate the translation result
      if (!translatedPrompt || translatedPrompt === prompt || 
          translatedPrompt.length < prompt.length * 0.5) {
        console.log('Translation seems incomplete, retrying with fallback method...');
        
        // Retry with alternative method after a short delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          // Use a more robust translation API endpoint (defined in lib/translation.ts)
          const retryTranslation = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=bg&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
          const retryData = await retryTranslation.json();
          
          if (retryData && retryData[0] && Array.isArray(retryData[0])) {
            // Extract and construct full translation
            const translationParts = retryData[0].map((part: any) => part[0] || '');
            const fullRetryTranslation = translationParts.join('');
            
            if (fullRetryTranslation && fullRetryTranslation.length > translatedPrompt.length * 0.7) {
              translatedPrompt = fullRetryTranslation;
              console.log('Retry translation successful:', fullRetryTranslation);
            }
          }
        } catch (retryError) {
          console.error('Retry translation failed:', retryError);
        }
      }
      
      // Also check the translated prompt for restricted words
      if (translatedPrompt && containsRestrictedWords(translatedPrompt)) {
        throw new Error("Забранено съдържание: Преведеният промпт съдържа неподходящи думи или фрази.");
      }
      
      if (translatedPrompt) {
        prompt = translatedPrompt; // Use the translated prompt for generation
        console.log(`Final translated prompt: "${originalPrompt}" -> "${translatedPrompt}"`);
      } else {
        console.warn('Translation failed, using original prompt');
      }
    } catch (error) {
      // If the error is from our own restricted words check, rethrow it
      if (error instanceof Error && error.message.includes("Забранено съдържание")) {
        throw error;
      }
      
      console.error('Failed to translate prompt:', error);
      // Continue with original prompt if translation fails for other reasons
    }
  }

  const payload = [
    {
      taskType: "authentication",
      apiKey: imageApiKey
    },
    {
      taskType: "imageInference",
      taskUUID: crypto.randomUUID(),
      positivePrompt: prompt,
      model: modelConfig.model,
      width: imageSize.width,
      height: imageSize.height,
      steps,
      outputType: ["URL"],
      includeCost: true,
      checkNSFW: true
    }
  ];

  try {
    const response = await axios.post('https://api.runware.ai/v1', payload);
    
    // Extract the image URL and NSFW status from the response
    const imageData = response.data.data[0];
    const imageURL = imageData.imageURL;
    const isNSFW = imageData.nsfw === true; // Ensure we get a boolean value
    
    // If the image is flagged as NSFW but passed our word filter, 
    // still flag it so the UI can show the restriction
    if (isNSFW) {
      console.log("Image flagged as NSFW by the API");
    }
    
    return {
      imageURL,
      isNSFW,
      originalPrompt,
      translatedPrompt: translationAttempted ? translatedPrompt : undefined
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to generate image');
    }
    throw error;
  }
}