import { v4 as uuidv4 } from 'uuid';
import { ImageAttachment, ImageAnalysisResult } from '../types/chat';

// Maximum file size (10MB in bytes)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed image types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

/**
 * Process an image file and return an ImageAttachment object
 */
export async function processImageFile(file: File): Promise<ImageAttachment> {
  const id = uuidv4();
  
  // Validate file
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`Неподдържан формат на файла. Поддържани формати: JPEG, PNG, GIF, WEBP`);
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Файлът е твърде голям. Максимален размер: 10MB`);
  }

  try {
    // Create local URLs for the image
    const imageUrl = URL.createObjectURL(file);
    
    // Get image dimensions
    const dimensions = await getImageDimensions(file);
    
    // Extract metadata from file name
    const metadata = extractMetadataFromFileName(file.name);
    
    // Create thumbnail for large images
    let thumbnailUrl = imageUrl;
    if (file.size > 500000) { // 500KB
      try {
        // Since we don't have image-conversion library imported yet, we'll just use the original
        thumbnailUrl = imageUrl;
      } catch (e) {
        console.warn("Couldn't create thumbnail", e);
      }
    }

    // Create initial attachment with analysis
    const initialAttachment: ImageAttachment = {
      id,
      url: imageUrl,
      thumbnailUrl,
      width: dimensions.width,
      height: dimensions.height,
      filename: file.name,
      contentType: file.type,
      size: file.size,
      // Start with a simple local analysis while the API processes in background
      analysisResult: {
        description: `Изображение във формат ${file.type.split('/')[1].toUpperCase()} с размери ${dimensions.width}x${dimensions.height} пиксела.`,
        labels: ['image', file.type.split('/')[1]],
        source: 'local'
      }
    };
    
    // Start image analysis in background
    analyzeImageInBackground(initialAttachment, file).catch(error => {
      console.error('Background image analysis failed:', error);
    });
    
    return initialAttachment;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Грешка при обработката на изображението');
  }
}

/**
 * Analyze image in background and update its analysis results
 */
async function analyzeImageInBackground(attachment: ImageAttachment, file: File): Promise<void> {
  try {
    // For now, we'll use local analysis since we don't have a real vision API integration
    // In a real app, you would make an API call to a service like Google Vision API
    
    const metadata = extractMetadataFromFileName(file.name);
    const dimensions = { width: attachment.width || 0, height: attachment.height || 0 };
    attachment.analysisResult = await analyzeImageLocally(file, metadata, dimensions);
    
    console.log('Image analysis completed:', attachment.id);
  } catch (error) {
    console.warn('Image analysis failed, using local analysis:', error);
    
    // If API fails, use more detailed local analysis
    const metadata = extractMetadataFromFileName(file.name);
    const dimensions = { width: attachment.width || 0, height: attachment.height || 0 };
    attachment.analysisResult = await analyzeImageLocally(file, metadata, dimensions);
  }
}

/**
 * Get image dimensions
 */
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Extract metadata from filename
 */
function extractMetadataFromFileName(filename: string): Record<string, string> {
  const metadata: Record<string, string> = {};
  
  // Remove extension
  const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
  const lowercaseName = nameWithoutExt.toLowerCase();
  
  // Look for date patterns (YYYY-MM-DD or YYYYMMDD)
  const datePattern1 = /(\d{4})[_-]?(\d{2})[_-]?(\d{2})/;
  const dateMatch = nameWithoutExt.match(datePattern1);
  if (dateMatch) {
    metadata.captureDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
  }
  
  // Look for device information (common in photo filenames)
  if (lowercaseName.includes('iphone') || lowercaseName.includes('ios')) {
    metadata.device = 'iPhone';
  } else if (lowercaseName.includes('android') || lowercaseName.includes('samsung')) {
    metadata.device = 'Android Phone';
  } else if (lowercaseName.includes('cam') || lowercaseName.includes('dcim')) {
    metadata.device = 'Camera';
  }
  
  // Look for location info
  const locations = ['sofia', 'plovdiv', 'varna', 'burgas', 'ruse', 'stara zagora', 'bulgaria'];
  for (const loc of locations) {
    if (lowercaseName.includes(loc)) {
      metadata.location = loc.charAt(0).toUpperCase() + loc.slice(1);
      break;
    }
  }
  
  return metadata;
}

/**
 * Local image analysis function (fallback when API fails)
 */
async function analyzeImageLocally(
  file: File,
  metadata?: Record<string, string>,
  dimensions?: { width: number; height: number }
): Promise<ImageAnalysisResult> {
  try {
    // Extract basic information
    const filename = file.name;
    const contentType = file.type;
    const width = dimensions?.width || 0;
    const height = dimensions?.height || 0;
    
    // Extract file extension from content type
    const fileExtension = contentType.split('/')[1]?.toUpperCase() || '';
    
    // Create detailed labels based on file type, dimensions, and other properties
    const labels = ['image', fileExtension.toLowerCase()];
    
    // Add format-specific labels
    if (['JPEG', 'JPG'].includes(fileExtension)) {
      labels.push('photograph', 'digital photo');
    } else if (fileExtension === 'PNG') {
      labels.push('graphic', 'digital image', 'transparent background');
    } else if (fileExtension === 'GIF') {
      labels.push('animation', 'animated graphic', 'motion');
    } else if (fileExtension === 'WEBP') {
      labels.push('web optimized', 'compressed photo');
    }
    
    // Add dimension-based labels
    if (width && height) {
      labels.push(`${width}x${height}`);
      
      // Detect aspect ratio type and add relevant labels
      if (width > height * 1.2) {
        labels.push('landscape', 'wide format');
      } else if (height > width * 1.2) {
        labels.push('portrait', 'tall format'); 
      } else {
        labels.push('square format');
      }
      
      // Detect resolution quality
      if (width >= 3000 || height >= 3000) {
        labels.push('high resolution', 'high quality');
      } else if (width >= 1500 || height >= 1500) {
        labels.push('medium resolution');
      } else {
        labels.push('low resolution');
      }
    }
    
    // Add metadata-based labels
    if (metadata?.captureDate) {
      labels.push('dated photo', metadata.captureDate);
    }
    
    if (metadata?.device) {
      labels.push(metadata.device.toLowerCase());
    }
    
    if (metadata?.location) {
      labels.push(metadata.location.toLowerCase());
    }
    
    // Add potential content-based labels using educated guesses from filename
    const photoTypes = [
      { keyword: 'screenshot', label: 'screenshot', description: 'снимка на екран' },
      { keyword: 'person', label: 'portrait', description: 'снимка на човек' },
      { keyword: 'selfie', label: 'selfie', description: 'селфи' },
      { keyword: 'family', label: 'family photo', description: 'семейна снимка' },
      { keyword: 'vacation', label: 'vacation', description: 'снимка от ваканция' },
      { keyword: 'travel', label: 'travel', description: 'пътуване' },
      { keyword: 'food', label: 'food', description: 'храна' },
      { keyword: 'nature', label: 'nature', description: 'природа' },
      { keyword: 'landscape', label: 'landscape', description: 'пейзаж' },
      { keyword: 'document', label: 'document', description: 'документ' },
      { keyword: 'diagram', label: 'diagram', description: 'диаграма' },
      { keyword: 'receipt', label: 'receipt', description: 'разписка или фактура' },
      { keyword: 'chart', label: 'chart', description: 'графика' },
      { keyword: 'graph', label: 'graph', description: 'график' },
      { keyword: 'meme', label: 'meme', description: 'мем' },
      { keyword: 'art', label: 'art', description: 'изкуство' },
      { keyword: 'logo', label: 'logo', description: 'лого' },
      { keyword: 'icon', label: 'icon', description: 'икона' },
      { keyword: 'pet', label: 'pet', description: 'домашен любимец' },
      { keyword: 'dog', label: 'dog', description: 'куче' },
      { keyword: 'cat', label: 'cat', description: 'котка' },
      { keyword: 'girl', label: 'girl', description: 'момиче' },
      { keyword: 'boy', label: 'boy', description: 'момче' },
      { keyword: 'woman', label: 'woman', description: 'жена' },
      { keyword: 'man', label: 'man', description: 'мъж' },
      { keyword: 'car', label: 'car', description: 'автомобил' },
      { keyword: 'building', label: 'building', description: 'сграда' },
    ];
    
    let contentDescription = '';
    
    for (const type of photoTypes) {
      if (filename.toLowerCase().includes(type.keyword)) {
        labels.push(type.label);
        contentDescription = type.description;
        break;
      }
    }
    
    // Generate a comprehensive description
    let description = 'Изображение, което показва ';
    
    if (contentDescription) {
      description += contentDescription + '. ';
    } else {
      description += `съдържание във формат ${fileExtension}`;
      
      if (width && height) {
        description += ` с размери ${width}x${height} пиксела`;
      }
      
      description += '.';
    }
    
    if (metadata?.location) {
      description += ` Изображението е заснето в ${metadata.location}.`;
    }
    
    if (metadata?.device) {
      description += ` Заснето с ${metadata.device}.`;
    }
    
    if (metadata?.captureDate) {
      description += ` Дата на заснемане: ${metadata.captureDate}.`;
    }
    
    // Return enhanced analysis with source indicator
    return {
      description,
      labels: [...new Set(labels)], // Remove duplicates
      source: 'local'
    };
  } catch (error) {
    console.error('Error in local image analysis:', error);
    return {
      description: 'Изображение без допълнителен анализ.',
      labels: ['image'],
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'local'
    };
  }
}

/**
 * Revoke all object URLs in an image attachment to prevent memory leaks
 */
export function revokeImageUrls(imageData: ImageAttachment) {
  if (imageData.url && imageData.url.startsWith('blob:')) {
    URL.revokeObjectURL(imageData.url);
  }
  if (imageData.thumbnailUrl && imageData.thumbnailUrl.startsWith('blob:')) {
    URL.revokeObjectURL(imageData.thumbnailUrl);
  }
}