import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { MessageList } from '../components/chat/MessageList';
import { ChatInput } from '../components/chat/ChatInput';
import { streamChat } from '../lib/chat';
import { useFirebaseAuth } from '../lib/firebase-auth-context';
import { AuthModal } from '../components/AuthModal';
import { Button } from '../components/ui/button';
import LoadingLogo from '../components/LoadingLogo';
import { Message, ImageAttachment } from '../types/chat';
import { getChatSessionById, updateChatSession } from '../lib/firebase-chat';

function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const messageIdRef = useRef<string>('');
  const contentRef = useRef<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Use Firebase auth context
  const { user, incrementMessageCount, hasReachedMessageLimit } = useFirebaseAuth();

  // Load chat session when component mounts
  useEffect(() => {
    async function loadChatSession() {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const session = await getChatSessionById(id);
        
        if (!session) {
          setError("Chat not found");
          navigate('/');
          return;
        }
        
        // Check if the user owns this chat
        if (user && session.userId !== user.uid) {
          setError("You don't have permission to view this chat");
          navigate('/');
          return;
        }
        
        setMessages(session.messages || []);
      } catch (err) {
        console.error("Failed to load chat:", err);
        setError("Failed to load chat");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadChatSession();
  }, [id, user, navigate]);

  // Improved scroll handling for chat container
  useEffect(() => {
    const currentContainer = chatContainerRef.current;
    if (!currentContainer) return;
    
    // Prevent body scrolling when touching the chat container
    const preventBodyScroll = (e: TouchEvent) => {
      // Only prevent if we're touching the chat container
      if (currentContainer.contains(e.target as Node)) {
        e.stopPropagation();
      }
    };
    
    document.body.addEventListener('touchmove', preventBodyScroll, { passive: false });
    
    return () => {
      document.body.removeEventListener('touchmove', preventBodyScroll);
    };
  }, []);

  // Prevent keyboard from pushing chat view up on mobile
  useEffect(() => {
    // Function to set proper viewport height based on window inner height
    const setViewportHeight = () => {
      // Set a CSS variable for the viewport height
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

  // Handle sending new messages
  const handleSendMessage = async (content: string, images?: ImageAttachment[]) => {
    // Check if user has reached message limit and is not logged in
    if (hasReachedMessageLimit && !user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!user) {
      navigate('/');
      return;
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
        
        try {
          // Save updated messages to Firestore
          await updateChatSession(id!, finalMessages);
        } catch (error) {
          console.error("Failed to update chat session:", error);
        }
        
        messageIdRef.current = '';
        contentRef.current = '';
      }
    );
  };

  // Check if the device is mobile for responsive adjustments
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingLogo message="Loading chat..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md mx-auto">
          <h2 className="text-xl font-bold text-red-400 mb-3">Error</h2>
          <p className="text-white">{error}</p>
          <Button 
            onClick={() => navigate('/')}
            className="mt-4 w-full"
          >
            Go back to home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={chatContainerRef}
      className="flex-1 flex flex-col items-center justify-center h-full w-full overflow-hidden"
    >
      <div 
        className="flex-1 flex flex-col w-full max-w-4xl px-3 md:px-4 relative h-full"
        style={{ 
          height: isMobile ? 'calc(100vh - 16px)' : 'calc(100vh - 32px)',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          overflowY: 'hidden'
        }}
      >
        <MessageList 
          messages={messages}
          streamingMessage={streamingMessage}
        />
        
        {/* Message limit reached and not logged in */}
        {hasReachedMessageLimit && !user ? (
          <div className="sticky bottom-28 md:bottom-32 w-full flex justify-center mb-4">
            <div className="bg-purple-500/20 backdrop-blur-lg border border-purple-500/30 rounded-xl p-3 md:p-4 shadow-lg max-w-xl">
              <div className="flex items-start gap-3">
                <Lock className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-purple-400 shrink-0 mt-1`} />
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
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default ChatPage;