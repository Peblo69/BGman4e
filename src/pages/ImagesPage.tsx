import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Download, ImageIcon, Lock, AlertTriangle, Globe, Trash, X, Settings2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useFirebaseAuth } from '../lib/firebase-auth-context';
import { AuthModal } from '../components/AuthModal';
import LoadingLogo from '../components/LoadingLogo';
import { generateImage, MODEL_CONFIGS, IMAGE_SIZES } from '../lib/image-generator';
import type { ModelConfig } from '../lib/image-generator';
import { isBulgarian } from '../lib/translation';
import { containsRestrictedWords } from '../lib/restricted-words';

type GeneratedImage = {
  id: string;
  url: string;
  prompt: string;
  isNSFW: boolean;
  translatedPrompt?: string;
};

function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelConfig>('Rundiffusion X++');
  const [selectedSize, setSelectedSize] = useState<keyof typeof IMAGE_SIZES>('Square HD');
  const [steps, setSteps] = useState(33);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isBulgarianPrompt, setIsBulgarianPrompt] = useState(false);
  const [hasRestrictedWords, setHasRestrictedWords] = useState(false);
  const [translationStatus, setTranslationStatus] = useState<'idle' | 'translating' | 'success' | 'warning'>('idle');

  // Check if the prompt is in Bulgarian as user types
  useEffect(() => {
    const isBG = isBulgarian(prompt);
    setIsBulgarianPrompt(isBG);
    
    // If we have Bulgarian text, show a more prominent translation indicator
    if (isBG && prompt.trim().length > 0) {
      setTranslationStatus('translating');
    } else {
      setTranslationStatus('idle');
    }
    
    // Check for restricted words while typing
    setHasRestrictedWords(containsRestrictedWords(prompt));
  }, [prompt]);

  // Use Firebase auth context
  const { incrementImageCount, imageCount, user } = useFirebaseAuth();

  const handleGenerateClick = () => {
    if (hasRestrictedWords) {
      setError("Забранено съдържание: Промптът съдържа неподходящи думи или фрази.");
      return;
    }
    
    if (!prompt) return;
    handleGenerate();
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      // Increment the image counter in auth context
      incrementImageCount();
      
      // If Bulgarian text is detected, show translating status
      if (isBulgarianPrompt) {
        setTranslationStatus('translating');
      }
      
      const result = await generateImage({
        prompt,
        model: selectedModel,
        size: selectedSize,
        steps: steps
      });
      
      // Update translation status based on result
      if (isBulgarianPrompt) {
        if (result.translatedPrompt && result.translatedPrompt.length > prompt.length * 0.5) {
          setTranslationStatus('success');
        } else {
          setTranslationStatus('warning');
        }
      }
      
      const newImage = { 
        id: Date.now().toString(), 
        url: result.imageURL, 
        prompt: result.originalPrompt,
        translatedPrompt: result.translatedPrompt,
        isNSFW: result.isNSFW
      };
      
      setGeneratedImages(prev => [newImage, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
      setTranslationStatus('warning');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle image deletion
  const handleDeleteImage = (imageId: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== imageId));
    
    // If the deleted image is currently selected, close the modal
    if (selectedImage && selectedImage.id === imageId) {
      setSelectedImage(null);
    }
  };

  // Render NSFW placeholder instead of the actual image
  const renderImageContent = (image: GeneratedImage) => {
    if (image.isNSFW) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-red-500/10 p-4 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-2" />
          <p className="font-bold text-red-400">Забранено съдържание</p>
          <p className="text-xs text-red-300 mt-1">Изображението съдържа неподходящо съдържание</p>
        </div>
      );
    }
    
    return (
      <img
        src={image.url}
        alt={image.prompt}
        className="w-full h-full object-cover"
      />
    );
  };

  // Map the actual model key to a display name
  const getModelDisplayName = (modelKey: ModelConfig) => {
    // For the dropdown, show "Kiara Vision PRO" instead of "Rundiffusion X++"
    if (modelKey === 'Rundiffusion X++') {
      return "Kiara Vision PRO";
    }
    return modelKey;
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-1 flex flex-col h-full w-full max-w-5xl mx-auto"
    >
      {/* Scrollable image grid container with fixed height and custom scrollbar */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {generatedImages.map((image) => (
            <motion.div
              key={image.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer"
              onClick={() => !image.isNSFW && setSelectedImage(image)}
            >
              {renderImageContent(image)}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Show prompt on hover */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/70 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="truncate">{image.prompt}</p>
                
                {/* Show translation indicator if prompt was translated */}
                {image.translatedPrompt && image.translatedPrompt !== image.prompt && (
                  <div className="flex items-center mt-1 text-xs text-blue-300">
                    <Globe className="w-3 h-3 mr-1" />
                    <span className="truncate">{image.translatedPrompt}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {generatedImages.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center relative">
              <div className="relative">
                <img 
                  src="https://files.catbox.moe/xkzhs7.png"
                  alt="BulgarGPT Logo"
                  className="w-32 h-32"
                />
              </div>
              <h3 className="text-lg font-medium mb-2 mt-10">Нямате генерирани изображения</h3>
              <p className="text-muted-foreground">
                Започнете като опишете изображението, което искате да създадете в полето по-долу.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 p-8 px-4 sm:px-8 lg:px-12 relative w-full mx-auto backdrop-blur-xl z-20">
        {/* Options toggle button - positioned at a higher z-index */}
        <Button
          variant="ghost"
          size="sm" 
          className="absolute -top-12 left-1/2 -translate-x-1/2 text-muted-foreground hover:bg-transparent z-[25]"
          onClick={() => setShowOptions(!showOptions)}
        >
          {showOptions ? (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Скрий настройките
            </>
          ) : (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Покажи настройките
            </>
          )}
        </Button>

        {/* Options panel - with background and higher z-index to prevent overlap */}
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-xl overflow-hidden mb-4 z-[20] bg-black/50 backdrop-blur-xl border border-purple-500/20"
            >
              <div className="space-y-4 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value as ModelConfig)}
                    className="bg-black/40 rounded-lg border border-purple-500/30 px-3 py-2 text-sm"
                  >
                    {Object.keys(MODEL_CONFIGS).map((model) => (
                      <option key={model} value={model}>
                        {getModelDisplayName(model as ModelConfig)}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value as keyof typeof IMAGE_SIZES)}
                    className="bg-black/40 rounded-lg border border-purple-500/30 px-3 py-2 text-sm"
                  >
                    {Object.keys(IMAGE_SIZES).map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-muted-foreground">Стъпки: {steps}</label>
                    <Settings2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={50}
                    step={1}
                    value={steps}
                    onChange={(e) => setSteps(Number(e.target.value))}
                    className="w-full h-2 bg-purple-500/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input container with glass effect */}
        <div className="chat-input-container">
          <div className="chat-input-glow animate-pulse-slow" />
          <div className="flex items-center bg-transparent relative z-10">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Опишете изображението, което искате да създадете..."
              className={`bg-transparent backdrop-blur-xl rounded-xl border-none shadow-lg py-6 text-base min-h-[60px] pr-32 pl-5 ${hasRestrictedWords ? 'text-red-400' : ''}`}
            />
            <Button
              onClick={handleGenerateClick}
              disabled={!prompt || isGenerating || hasRestrictedWords}
              className="absolute right-2 z-20 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg h-[45px] flex items-center px-5"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                  <span>Генериране...</span>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Генериране
                </>
              )}
            </Button>
          </div>
          
          {/* Improved translation indicator when Bulgarian text is detected */}
          {isBulgarianPrompt && prompt.trim() !== '' && !hasRestrictedWords && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`absolute left-2 bottom-[-28px] flex items-center text-sm
                  ${translationStatus === 'success' ? 'text-green-400' : 
                    translationStatus === 'warning' ? 'text-yellow-400' : 'text-blue-300'}`}
              >
                <Globe className="w-4 h-4 mr-2" />
                {translationStatus === 'translating' ? (
                  <>
                    <span>Промптът ще бъде преведен автоматично</span>
                    {isGenerating && (
                      <div className="ml-2 w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                    )}
                  </>
                ) : translationStatus === 'success' ? (
                  <span>Успешно преведен промпт</span>
                ) : translationStatus === 'warning' ? (
                  <span>Частичен превод - може да не е напълно точен</span>
                ) : (
                  <span>Промптът ще бъде преведен автоматично</span>
                )}
              </motion.div>
            </AnimatePresence>
          )}
          
          {/* Show restricted words warning */}
          {hasRestrictedWords && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-2 bottom-[-28px] flex items-center text-sm text-red-400"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              <span>Промптът съдържа неподходящи думи</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && !selectedImage.isNSFW && (
        <div 
          className="modal-backdrop"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative bg-black/90 border border-purple-500/30 rounded-xl overflow-hidden mx-auto flex flex-col" 
            onClick={e => e.stopPropagation()}
            style={{ width: '90%', maxWidth: '900px', height: 'auto', maxHeight: '85vh' }}
          >
            {/* Header with buttons */}
            <div className="p-3 flex justify-between items-center bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-b border-purple-500/30">
              <h3 className="text-lg font-medium text-white truncate flex-1">
                {selectedImage.prompt}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-black/40 hover:bg-black/60 rounded-full"
                  onClick={() => selectedImage && handleDownload(selectedImage.url)}
                  title="Изтегли"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-red-900/40 hover:bg-red-900/60 rounded-full"
                  onClick={() => {
                    if (selectedImage) handleDeleteImage(selectedImage.id);
                  }}
                  title="Изтрий"
                >
                  <Trash className="h-4 w-4 text-red-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-black/40 hover:bg-black/60 rounded-full"
                  onClick={() => setSelectedImage(null)}
                  title="Затвори"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Image container */}
            <div className="bg-[#111] flex items-center justify-center" style={{ height: '60vh' }}>
              <img
                src={selectedImage.url}
                alt={selectedImage.prompt}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {/* Prompt and translation information */}
            <div className="bg-black/80 p-4 border-t border-purple-500/30">
              <div className="mb-3">
                <p className="font-medium text-purple-300">Промпт:</p>
                <p className="text-white">{selectedImage.prompt}</p>
              </div>
              
              {selectedImage.translatedPrompt && selectedImage.translatedPrompt !== selectedImage.prompt && (
                <div className="mt-2">
                  <p className="font-medium text-blue-300 flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Преведен промпт:
                  </p>
                  <p className="text-gray-300">{selectedImage.translatedPrompt}</p>
                </div>
              )}
              
              {/* Download button at the bottom */}
              <div className="flex mt-4 gap-2">
                <Button
                  onClick={() => selectedImage && handleDownload(selectedImage.url)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Изтегли изображението
                </Button>
                <Button
                  onClick={() => {
                    if (selectedImage) handleDeleteImage(selectedImage.id);
                    setSelectedImage(null);
                  }}
                  className="flex-1 bg-red-900/70 hover:bg-red-900/90 text-white"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Изтрий изображението
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {error && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-36 right-4 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-lg p-4 text-red-400"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
}

function ImagesPage() {
  const { user, isLoading } = useFirebaseAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  
  // Handle loading state
  useEffect(() => {
    // Set a timeout to ensure page is shown even if auth takes too long
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  // Handle authentication check - show auth modal instead of redirection
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setIsAuthModalOpen(true);
      }
      // Mark the page as loaded after auth check
      setPageLoaded(true);
    }
  }, [user, isLoading]);

  // When the user is not authenticated, show a special placeholder
  if (isLoading && !pageLoaded) {
    return <LoadingLogo message="Зареждане..." fullScreen={true} />;
  }

  if (!user && pageLoaded) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-xl text-center px-4">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-8 mb-6">
            <Lock className="w-16 h-16 mx-auto text-purple-400 mb-4" />
            <h1 className="text-3xl font-bold mb-4">Нужен е акаунт</h1>
            <p className="text-lg text-muted-foreground mb-6">
              За да използвате генератора на изображения, моля, създайте безплатен акаунт или влезте във вашия съществуващ профил.
            </p>
            <Button 
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-6"
              size="lg"
            >
              Вход / Регистрация
            </Button>
          </div>
        </div>
        
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <h1 className="text-3xl font-bold p-8 pb-4">Генератор на изображения</h1>
      
      <div className="flex-1 flex justify-center overflow-hidden">
        {pageLoaded ? <ImageGenerator /> : <LoadingLogo message="Зареждане на генератор..." />}
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default ImagesPage;