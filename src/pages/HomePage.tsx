import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { MessageList } from '../components/chat/MessageList';
import { ChatInput } from '../components/chat/ChatInput';
import { streamChat } from '../lib/chat';
import { useFirebaseAuth } from '../lib/firebase-auth-context';
import { AuthModal, WelcomeAuthButton } from '../components/AuthModal';
import { LoginModal } from '../components/LoginModal';
import { Button } from '../components/ui/button';
import LoadingLogo from '../components/LoadingLogo';
import { Message, ImageAttachment } from '../types/chat';
import { saveChatSession } from '../lib/firebase-chat';
import { useNavigate } from 'react-router-dom';

// Preload the logo image
if (typeof window !== 'undefined') {
  const img = new Image();
  img.src = "https://files.catbox.moe/tqqx05.png";
}

function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  
  const messageIdRef = useRef<string>('');
  const contentRef = useRef<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();

  // Use Firebase auth context
  const { user, incrementMessageCount, hasReachedMessageLimit } = useFirebaseAuth();

  // Set proper viewport height based on window inner height - to prevent keyboard issues on mobile
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    // Initial call
    setViewportHeight();
    
    // Set up event listeners
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    
    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);

  // Improved scroll handling for the entire page - prevent browser pull-to-refresh
  useEffect(() => {
    if (!hasStartedChat) return; // Don't modify scrolling on welcome page
    
    const currentContainer = chatContainerRef.current;
    if (!currentContainer) return;
    
    // Prevent body scrolling when touching the chat container
    const preventBodyScroll = (e: TouchEvent) => {
      if (currentContainer.contains(e.target as Node)) {
        e.stopPropagation();
      }
    };
    
    document.body.addEventListener('touchmove', preventBodyScroll, { passive: false });
    
    return () => {
      document.body.removeEventListener('touchmove', preventBodyScroll);
    };
  }, [hasStartedChat]);

  const handleSendMessage = async (content: string, images?: ImageAttachment[]) => {
    // Check if user has reached message limit and is not logged in
    if (hasReachedMessageLimit && !user) {
      setIsAuthModalOpen(true);
      return;
    }
    
    if (!hasStartedChat) {
      setHasStartedChat(true);
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: 'Just now',
      images
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    messageIdRef.current = (Date.now() + 1).toString();
    contentRef.current = '';
    
    const assistantMessage: Message = {
      id: messageIdRef.current,
      content: '',
      role: 'assistant',
      timestamp: 'Just now'
    };

    setStreamingMessage(assistantMessage);
    setIsCreatingChat(true);

    // Increment the message counter in auth context
    incrementMessageCount();

    streamChat(
      updatedMessages,
      (chunk) => {
        contentRef.current += chunk;
        const cleanChunk = chunk.replace(/^["']|["']$/g, '');
        setStreamingMessage(prev => 
          prev ? { ...prev, content: prev.content + cleanChunk } : null);
      },
      (error) => {
        setStreamingMessage(null);
        messageIdRef.current = '';
        contentRef.current = '';
        setIsCreatingChat(false);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: `Error: ${error}`,
          role: 'assistant',
          timestamp: 'Just now'
        }]);
      },
      async () => {
        const finalMessage = {
          id: messageIdRef.current,
          content: contentRef.current,
          role: 'assistant',
          timestamp: 'Just now'
        };
        
        const finalMessages = [...updatedMessages, finalMessage];
        setMessages(finalMessages);
        setStreamingMessage(null);
        
        // Save conversation to Firestore if user is authenticated
        if (user) {
          try {
            if (currentSessionId) {
              // Update existing session (this would be handled in ChatPage)
            } else {
              // Create new session
              // Use first few words of first message as title
              const title = updatedMessages[0].content.split(' ').slice(0, 5).join(' ') + '...';
              const sessionId = await saveChatSession(user.uid, finalMessages, title);
              setCurrentSessionId(sessionId);
              
              // Navigate to the chat page
              navigate(`/chat/${sessionId}`);
            }
          } catch (error) {
            console.error("Failed to save chat session:", error);
          }
        }
        
        setIsCreatingChat(false);
        messageIdRef.current = '';
        contentRef.current = '';
      }
    );
  };

  // Check if the device is mobile for responsive adjustments
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

  return (
    <div 
      id="home-page-container" 
      ref={chatContainerRef}
      className="flex-1 flex flex-col h-full items-center justify-center w-full overflow-hidden"
    >
      <div 
        className="flex-1 flex flex-col w-full max-w-4xl px-3 md:px-4 relative h-full"
        style={{ 
          height: `calc(var(--vh, 1vh) * 100)`, 
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          overflowY: 'hidden'
        }}
      >
        {!hasStartedChat ? (
          <motion.div 
            className="flex flex-col items-center justify-center h-full text-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center mb-6 relative">
              <img
                src="https://files.catbox.moe/tqqx05.png"
                alt="BulgarGPT Logo"
                className={`${isMobile ? 'w-28 h-28' : 'w-36 h-36'} mb-4`}
                style={{ transform: 'translateZ(0)' }} /* Force GPU acceleration */
              />
              <h1 className={`${isMobile ? 'text-4xl' : 'text-5xl'} font-bold mb-2 logo-text tracking-wider font-orbitron`}>
                <span className="text-purple-500">Bulgar</span>
                <span className="text-white">G</span>
                <span className="text-green-500">P</span>
                <span className="text-red-500">T</span>
              </h1>
            </div>
            
            <p className={`${isMobile ? 'text-base' : 'text-lg'} text-muted-foreground mb-8 max-w-xl`}>
              Твоят български AI помощник за ежедневни задачи, учебна помощ, професионално развитие и креативни проекти.
            </p>
            
            {/* Auth Button in Homepage Center - only show when NOT logged in */}
            {!user && (
              <WelcomeAuthButton 
                className="mb-6"
                onOpenModal={() => setIsAuthModalOpen(true)}
              />
            )}
            
            <div className="w-full max-w-md mx-auto">
              <ChatInput onSend={handleSendMessage} />
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col flex-1" style={{ position: 'relative', height: '100%' }}>
            <MessageList 
              messages={messages}
              streamingMessage={streamingMessage}
            />
            
            {/* Message limit reached and not logged in */}
            {hasReachedMessageLimit && !user ? (
              <div className="sticky bottom-24 w-full flex justify-center mb-4">
                <div className="bg-purple-500/20 backdrop-blur-lg border border-purple-500/30 rounded-xl p-3 md:p-4 shadow-lg max-w-xl">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-purple-400 shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-white mb-1 text-sm md:text-base">Достигнахте лимита за съобщения без регистрация</h3>
                      <p className="text-xs md:text-sm text-purple-200 mb-2">
                        За да продължите да използвате BulgarGPT, моля, създайте безплатен акаунт или влезте във вашия съществуващ профил.
                      </p>
                      <Button 
                        onClick={() => setIsAuthModalOpen(true)}
                        className="btn-primary w-full text-xs md:text-sm py-1.5"
                      >
                        Вход / Регистрация
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <ChatInput onSend={handleSendMessage} />
            )}
          </div>
        )}
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
      />
      
      {/* Login Modal for limit prompt */}
      <LoginModal />
    </div>
  );
}

export default HomePage;