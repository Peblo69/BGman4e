import axios from 'axios';

// Define a simple cache to avoid repeated translations
type TranslationCache = {
  [key: string]: string;
};

const translationCache: TranslationCache = {};

/**
 * Detects if a text is primarily Bulgarian by checking for Cyrillic characters
 * @param text The text to check
 * @returns boolean indicating if the text is likely Bulgarian
 */
export function isBulgarian(text: string): boolean {
  // Cyrillic characters range - basic check for Bulgarian text
  const cyrillicPattern = /[\u0400-\u04FF\u0500-\u052F]/;
  
  // Count Cyrillic characters
  let cyrillicCount = 0;
  for (const char of text) {
    if (cyrillicPattern.test(char)) {
      cyrillicCount++;
    }
  }
  
  // If more than 40% of characters are Cyrillic, consider it Bulgarian
  return cyrillicCount > text.length * 0.4;
}

/**
 * Translates text from Bulgarian to English using Google Translate API
 * This is a better implementation with chunking to handle longer texts
 * @param text The Bulgarian text to translate
 * @returns Promise with the translated English text
 */
export async function translateBulgarianToEnglish(text: string): Promise<string> {
  // Return original text if it's empty or already in English
  if (!text || !isBulgarian(text)) {
    return text;
  }
  
  // Check cache first
  if (translationCache[text]) {
    console.log('Translation found in cache');
    return translationCache[text];
  }
  
  try {
    console.log('Translating Bulgarian text:', text);
    
    // Split text into smaller chunks if needed (4000 char limit for the API)
    const maxChunkSize = 1000; 
    const chunks = [];
    
    if (text.length > maxChunkSize) {
      // Split by sentences to avoid breaking context
      const sentences = text.split(/(?<=[.!?])\s+/);
      let currentChunk = '';
      
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > maxChunkSize) {
          chunks.push(currentChunk);
          currentChunk = sentence;
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
        }
      }
      
      if (currentChunk) {
        chunks.push(currentChunk);
      }
    } else {
      chunks.push(text);
    }
    
    // Translate each chunk
    const translatedChunks = [];
    for (const chunk of chunks) {
      const translatedChunk = await translateChunk(chunk);
      translatedChunks.push(translatedChunk);
    }
    
    // Join translated chunks
    const translatedText = translatedChunks.join(' ');
    
    // Cache the result for future use
    translationCache[text] = translatedText;
    
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    
    // Attempt alternative translation method if first method fails
    try {
      return await alternativeTranslate(text);
    } catch (altError) {
      console.error('Alternative translation also failed:', altError);
      return text; // Return original text on error
    }
  }
}

/**
 * Translates a chunk of text using Google Translate API
 */
async function translateChunk(text: string): Promise<string> {
  // Properly encode the text for URL
  const encodedText = encodeURIComponent(text);
  
  // Add a small random delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, Math.random() * 300));
  
  const response = await axios.get(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=bg&tl=en&dt=t&q=${encodedText}`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9,bg;q=0.8',
      },
      timeout: 10000 // 10 second timeout
    }
  );
  
  // Parse the response
  const translations = response.data[0];
  let translatedText = '';
  
  // Concatenate all translated parts
  for (const part of translations) {
    if (part[0]) {
      translatedText += part[0];
    }
  }
  
  return translatedText;
}

/**
 * Alternative translation method in case the primary method fails
 * This uses a different API endpoint format
 */
async function alternativeTranslate(text: string): Promise<string> {
  const encodedText = encodeURIComponent(text);
  
  const response = await axios.get(
    `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=bg&tl=en&q=${encodedText}`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000
    }
  );
  
  // This API returns a different format
  if (Array.isArray(response.data) && response.data.length > 0) {
    return response.data[0];
  }
  
  throw new Error('Alternative translation failed');
}

/**
 * A simplified version of the translation function that attempts direct translation
 * without chunking, for simpler use cases
 */
export async function quickTranslate(text: string): Promise<string> {
  if (!text || text.length < 1 || !isBulgarian(text)) {
    return text;
  }
  
  try {
    const encodedText = encodeURIComponent(text);
    const response = await axios.get(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodedText}`
    );
    
    const translationArray = response.data[0];
    if (!translationArray || !Array.isArray(translationArray)) {
      return text;
    }
    
    return translationArray
      .filter(item => item && item[0])
      .map(item => item[0])
      .join('');
  } catch (error) {
    console.error('Quick translation error:', error);
    return text;
  }
}