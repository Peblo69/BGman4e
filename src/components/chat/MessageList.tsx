import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';
import { Message, ImageAttachment } from '../../types/chat';
import { X, ZoomIn, Download, Info } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  streamingMessage?: Message | null;
}

export function MessageList({ messages = [], streamingMessage }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const [hasNewContent, setHasNewContent] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageAttachment | null>(null);
  const [showImageInfo, setShowImageInfo] = useState(false);
  
  const allMessages = [
    ...messages,
    ...(streamingMessage ? [streamingMessage] : [])
  ];

  // Track content changes to trigger smooth scrolling
  useEffect(() => {
    if (streamingMessage) {
      setHasNewContent(true);
      // Reset the flag after a short delay
      const timer = setTimeout(() => setHasNewContent(false), 100);
      return () => clearTimeout(timer);
    }
  }, [streamingMessage?.content]);

  // Smoothly scroll to bottom when content changes
  useEffect(() => {
    if (hasNewContent && containerRef.current) {
      const scrollElement = containerRef.current;
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [hasNewContent, streamingMessage?.content]);

  // Initial scroll and scroll when messages array changes
  useEffect(() => {
    if (containerRef.current) {
      const scrollElement = containerRef.current;
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: messages.length > 0 ? 'smooth' : 'auto'
      });
    }
  }, [messages.length]);

  // Enforce scroll to bottom for newly added messages
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end' 
      });
    }
  }, [allMessages.length]);

  // Check if we're on a mobile device
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

  // Clean AI message content by removing "BG" at the end of sentences
  const cleanContent = (content: string): string => {
    return content.replace(/\s+BG(?=\s|$|\.|\,|\;|\:|\!|\?)/g, '');
  };

  // Handle image download
  const handleDownloadImage = (img: ImageAttachment) => {
    if (!img.url) return;
    
    try {
      const link = document.createElement('a');
      link.href = img.url;
      link.download = img.filename || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  // Handle selecting an image to view
  const handleImageSelection = (img: ImageAttachment) => {
    // Create a safe copy to avoid reference issues
    setSelectedImage({
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
        labels: Array.isArray(img.analysisResult.labels) ? [...img.analysisResult.labels] : ['image'],
        source: img.analysisResult.source || 'local'
      } : undefined
    });
  };

  // Add wheel event handler to the container to allow scrolling anywhere in the chat
  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent default to ensure we handle scrolling
      e.preventDefault();
      
      // Calculate new scroll position
      const newScrollTop = currentContainer.scrollTop + e.deltaY;
      
      // Apply the scroll
      currentContainer.scrollTo({
        top: newScrollTop,
        behavior: 'auto' // Use auto for wheel events for responsive feel
      });
    };

    // Attach the wheel event listener with passive: false to allow preventDefault
    currentContainer.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      currentContainer.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Handle touch events for mobile scrolling
  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer || !isMobile) return;

    let startY = 0;
    let currentY = 0;
    let isScrolling = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      currentY = startY;
      isScrolling = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isScrolling) return;
      
      const deltaY = currentY - e.touches[0].clientY;
      currentY = e.touches[0].clientY;
      
      // Scroll the container
      currentContainer.scrollTop += deltaY;
      
      // Prevent default only if we're scrolling to avoid blocking other touch events
      if (Math.abs(deltaY) > 5) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      isScrolling = false;
    };

    currentContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    currentContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    currentContainer.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      currentContainer.removeEventListener('touchstart', handleTouchStart);
      currentContainer.removeEventListener('touchmove', handleTouchMove);
      currentContainer.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile]);

  return (
    <>
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto py-4 space-y-3 invisible-scrollbar w-full"
        style={{
          height: isMobile ? 'calc(100vh - 150px)' : 'calc(100vh - 240px)',
          overscrollBehavior: 'contain',
          paddingBottom: isMobile ? '4rem' : '5rem',
          WebkitOverflowScrolling: 'touch', // Better scrolling on iOS
        }}
      >
        <div className="min-h-[10px]"></div> {/* Spacer at the top */}
        <AnimatePresence>
          {allMessages.map((message, index) => (
            <motion.div
              ref={index === allMessages.length - 1 ? lastMessageRef : null}
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className={cn(
                'px-3 md:px-4 mb-3 w-full',
                message.role === 'user' ? 'text-right' : 'text-left'
              )}
            >
              {message.role === 'user' ? (
                <div className="inline-block max-w-[85%] ml-auto">
                  <div className="user-message">
                    {message.content}
                  </div>
                  
                  {/* Display user's images if any */}
                  {message.images && message.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 justify-end">
                      {message.images.map(img => (
                        <div 
                          key={img.id} 
                          className="relative group w-16 h-16 md:w-20 md:h-20 overflow-hidden rounded-lg cursor-pointer shadow-lg border border-purple-500/30"
                          onClick={() => handleImageSelection(img)}
                        >
                          <img 
                            src={img.thumbnailUrl || img.url} 
                            alt={img.filename || 'User uploaded image'}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="inline-block max-w-[95%] w-[95%] pl-1">
                  <div className="assistant-message">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      className="markdown"
                    >
                      {cleanContent(message.content)}
                    </ReactMarkdown>
                  </div>
                  {index === allMessages.length - 1 && streamingMessage && (
                    <div className="flex space-x-2 mt-2 ml-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDuration: '0.8s'}} />
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDuration: '0.8s', animationDelay: '0.2s'}} />
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{animationDuration: '0.8s', animationDelay: '0.4s'}} />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="h-20"></div> {/* Larger bottom padding to ensure visibility above input */}
      </div>
      
      {/* Image viewer modal - with different layouts for mobile/desktop */}
      {selectedImage && (
        <div 
          className="modal-backdrop"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className={`bg-black border border-gray-800 rounded-lg overflow-hidden ${isMobile ? 'w-[95%] max-h-[85vh]' : 'max-w-3xl max-h-[85vh]'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="relative">
              <div className="absolute top-2 right-2 flex space-x-2 z-10">
                {selectedImage.analysisResult && (
                  <button 
                    className="bg-blue-500/50 text-white p-1.5 rounded-full hover:bg-blue-500/70"
                    onClick={() => setShowImageInfo(!showImageInfo)}
                  >
                    <Info className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
                  </button>
                )}
                <button 
                  className="bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadImage(selectedImage);
                  }}
                >
                  <Download className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
                </button>
                <button 
                  className="bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
                </button>
              </div>
              
              <div style={{ maxHeight: isMobile ? '40vh' : '70vh', maxWidth: '100%' }}>
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.filename || 'Image'}
                  className="max-w-full max-h-full object-contain mx-auto"
                />
              </div>
            </div>
            
            {/* Image information overlay */}
            {selectedImage.analysisResult && showImageInfo && (
              <div className="absolute inset-0 bg-black/90 p-3 md:p-6 text-white overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-3">
                  <h3 className={isMobile ? "text-base font-semibold" : "text-xl font-semibold"}>Анализ на изображението</h3>
                  <button 
                    className="bg-white/10 hover:bg-white/20 p-1 rounded-full"
                    onClick={() => setShowImageInfo(false)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-blue-400 mb-1 text-sm">Описание:</h4>
                    <p className="text-xs md:text-sm">{selectedImage.analysisResult.description}</p>
                  </div>
                
                  {selectedImage.analysisResult.labels && selectedImage.analysisResult.labels.length > 0 && (
                    <div>
                      <h4 className="font-medium text-blue-400 mb-1 text-sm">Разпознати елементи:</h4>
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        {selectedImage.analysisResult.labels.map((label, i) => (
                          <span 
                            key={i}
                            className="bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded-full text-xs"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedImage.width && selectedImage.height && (
                    <div>
                      <h4 className="font-medium text-blue-400 mb-1 text-sm">Технически детайли:</h4>
                      <ul className="space-y-0.5 text-xs md:text-sm">
                        <li><strong>Размери:</strong> {selectedImage.width}x{selectedImage.height} пиксела</li>
                        <li><strong>Файлов формат:</strong> {selectedImage.contentType.split('/')[1]?.toUpperCase()}</li>
                        <li><strong>Размер на файла:</strong> {Math.round(selectedImage.size / 1024)} KB</li>
                      </ul>
                    </div>
                  )}

                  {selectedImage.analysisResult.source && (
                    <div className="text-xs text-gray-400 mt-3">
                      Анализът е извършен чрез: {selectedImage.analysisResult.source === 'api' ? 'Google Cloud Vision API' : 'Локален анализ'}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Simple image info footer when not showing full info */}
            {selectedImage.analysisResult && !showImageInfo && (
              <div className="bg-black/70 p-3 text-white">
                <p className={isMobile ? "font-semibold text-sm mb-1" : "font-semibold text-base mb-1"}>Информация:</p>
                <p className="text-xs md:text-sm truncate"><strong>Описание:</strong> {selectedImage.analysisResult.description}</p>
                {selectedImage.width && selectedImage.height && (
                  <p className="mt-0.5 text-xs">
                    <strong>Размери:</strong> {selectedImage.width}x{selectedImage.height} пиксела
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
