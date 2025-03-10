export interface ImageAnalysisResult {
  description?: string;
  labels?: string[];
  error?: string;
  source?: 'api' | 'local'; // Indicates whether analysis was done via API or locally
}

export interface ImageAttachment {
  id: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  filename: string;
  contentType: string;
  size: number;
  analysisResult?: ImageAnalysisResult;
}

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: string;
  images?: ImageAttachment[];
}