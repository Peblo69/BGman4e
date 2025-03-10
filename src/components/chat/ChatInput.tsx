import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { cn } from '../../lib/utils';
import { ImageAttachment } from '../../types/chat';
import { motion, AnimatePresence } from 'framer-motion';
import { processImageFile, revokeImageUrls } from '../../lib/image-processing';

export function ChatInput({ onSend }: { onSend: (message: string, images?: ImageAttachment[]) => void }) {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  // Resize textarea as content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach(img => {
        revokeImageUrls(img);
      });
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || images.length > 0) {
      try {
        // Create safe copies of images to avoid reference issues
        const safeImages = images.length > 0 
          ? images.map(img => ({
              id: img.id,
              url: img.url,
              thumbnailUrl: img.thumbnailUrl,
              width: img.width,
              height: img.height,
              filename: img.filename,
              contentType: img.contentType,
              size: img.size,
              analysisResult: img.analysisResult ? {
                description: img.analysisResult.description || '',
                labels: Array.isArray(img.analysisResult.labels) 
                  ? [...img.analysisResult.labels] 
                  : ['image'],
                source: img.analysisResult.source || 'local'
              } : undefined
            }))
          : undefined;
        
        onSend(message, safeImages);
        setMessage('');
        setImages([]);
        
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Грешка при изпращане на съобщението. Моля, опитайте отново.");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    await processImageUpload(files[0]);
    
    if (event.target) {
      event.target.value = '';
    }
  };

  const processImageUpload = async (file: File) => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(undefined);
    
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Моля, качете само изображения');
      }
      
      const imageAttachment = await processImageFile(file);
      setImages(prev => [...prev, imageAttachment]);
    } catch (err) {
      console.error("Image processing error:", err);
      setError(err instanceof Error ? err.message : 'Неуспешно обработване на изображението');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveImage = (id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        revokeImageUrls(imageToRemove);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const handleImageButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Set up drag and drop handlers
  useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (!dropArea) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.add('bg-purple-500/10');
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.remove('bg-purple-500/10');
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.remove('bg-purple-500/10');

      if (!e.dataTransfer?.files || e.dataTransfer.files.length === 0) return;

      await processImageUpload(e.dataTransfer.files[0]);
    };

    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);

    return () => {
      dropArea.removeEventListener('dragover', handleDragOver);
      dropArea.removeEventListener('dragleave', handleDragLeave);
      dropArea.removeEventListener('drop', handleDrop);
    };
  }, []);

  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

  return ( 
    <form onSubmit={handleSubmit} className="sticky bottom-0 p-3 md:p-6 backdrop-blur-xl mt-auto z-40 w-full">
      {/* Hidden file input */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        className="hidden"
      />
      
      {/* Image preview */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 mb-3"
          >
            {images.map(img => (
              <div key={img.id} className="relative inline-block">
                <img 
                  src={img.thumbnailUrl || img.url} 
                  alt={img.filename}
                  className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-md border border-purple-500/30"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 text-red-400 text-sm rounded-md p-2 mb-3"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="chat-input-container relative" ref={dropAreaRef}>
        <div className="chat-input-glow animate-pulse-slow" />
        <div className="chat-input-bg" />
        
        {/* Image button position fixed for all devices */}
        <div className="absolute left-3 inset-y-0 flex items-center z-20">
          <ImageIcon 
            onClick={handleImageButtonClick}
            className="h-5 w-5 text-purple-400 hover:text-purple-300 cursor-pointer"
          />
        </div>
        
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isProcessing ? "Обработва се изображение..." : "Здравейте! С какво мога да ви помогна днес?"}
          className={cn(
            "chat-input scrollbar-custom text-left text-base bg-black/70 w-full",
            isProcessing && "opacity-70",
            isMobile ? "min-h-[56px] max-h-[160px] py-4" : "min-h-[70px] max-h-[200px]"
          )}
          style={{
            paddingLeft: '40px',
            paddingRight: '40px'
          }}
          disabled={isProcessing}
        />
        
        {/* Send button position fixed for all devices */}
        <div className="absolute right-3 inset-y-0 flex items-center z-20">
          <Send 
            onClick={handleSubmit}
            className={cn(
              "h-5 w-5 text-purple-400 hover:text-purple-300 cursor-pointer",
              (isProcessing || (message.trim() === '' && images.length === 0)) && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>
        
        {/* Processing indicator */}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl z-10">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
              <span className="text-white text-sm">Обработка на изображение...</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-xs text-center text-muted-foreground">
        BulgarGPT може да допуска грешки.
      </div>
    </form>
  );
}