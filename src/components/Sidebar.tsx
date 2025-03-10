import { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, MessageCircle, Plus, Pencil, Trash2, Users, User, ImageIcon } from 'lucide-react';
import { getUserChatSessions, deleteChatSession, updateChatSessionTitle } from '../lib/firebase-chat';
import { useFirebaseAuth } from '../lib/firebase-auth-context';
import LoadingLogo from './LoadingLogo';

type ChatSession = {
  id: string;
  title: string;
  updatedAt: any;
};

// Memoized session item component for better performance
const ChatSessionItem = memo(({ 
  session, 
  isActive, 
  isExpanded,
  onEdit,
  onDelete
}: { 
  session: ChatSession, 
  isActive: boolean,
  isExpanded: boolean,
  onEdit: (id: string, title: string, e: React.MouseEvent) => void,
  onDelete: (id: string, e: React.MouseEvent) => void
}) => {
  return (
    <div className="relative">
      <Link
        to={`/chat/${session.id}`}
        data-active={isActive ? "true" : "false"}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg w-full mb-1 group transition-all duration-100 ease-out',
          isActive 
            ? 'bg-purple-500/20 text-white' 
            : 'text-muted-foreground hover:text-primary hover:bg-white/10'
        )}
      >
        <MessageCircle className="w-4 h-4 shrink-0" />
        {isExpanded && (
          <>
            <span className="font-medium truncate flex-1">{session.title}</span>
            <button
              onClick={(e) => onEdit(session.id, session.title, e)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-opacity"
            >
              <Pencil className="w-3 h-3 text-blue-400" />
            </button>
            <button
              onClick={(e) => onDelete(session.id, e)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-opacity"
            >
              <Trash2 className="w-3 h-3 text-red-400" />
            </button>
          </>
        )}
      </Link>
    </div>
  );
});

interface SidebarProps {
  onResize?: (width: number) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

function Sidebar({ onResize, isExpanded, onToggle }: SidebarProps) {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get user from Firebase auth context
  const { user } = useFirebaseAuth();
  const isAuthenticated = !!user;
  
  // Sidebar width values
  const expandedWidth = 240;
  const collapsedWidth = 0; // Fully collapse on mobile

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

  // Get current chat ID from URL
  const getCurrentChatId = () => {
    const match = location.pathname.match(/\/chat\/([^/]+)/);
    return match ? match[1] : null;
  };

  // Update parent component with sidebar width
  useEffect(() => {
    if (onResize) {
      onResize(isExpanded ? expandedWidth : collapsedWidth);
    }
  }, [isExpanded, onResize]);

  // Load chat sessions when user changes
  const loadChatSessions = useCallback(async () => {
    if (!user) {
      setChatSessions([]);
      setLoadError(null);
      return;
    }
    
    try {
      setIsLoading(true);
      setLoadError(null);
      const sessions = await getUserChatSessions(user.uid);
      setChatSessions(sessions);
    } catch (error: any) {
      console.error("Failed to load chat sessions:", error);
      // Only set the error if user is authenticated - prevents showing error to guests
      if (isAuthenticated) {
        setLoadError(error.code === 'permission-denied' 
          ? "Нямате достъп. Моля, проверете правилата в Firebase."
          : "Не можахме да заредим чатовете.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  // Initial load with debounce
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        loadChatSessions();
      }, 100); // Small delay to prevent blocking initial render
      
      return () => clearTimeout(timer);
    } else {
      setChatSessions([]);
      setLoadError(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, loadChatSessions]);

  // Refresh chat sessions when the path changes
  useEffect(() => {
    if (user && isAuthenticated) {
      loadChatSessions();
    }
  }, [location.pathname, user, isAuthenticated, loadChatSessions]);

  const handleDeleteChat = async (sessionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm('Сигурни ли сте, че искате да изтриете този чат?')) {
      try {
        await deleteChatSession(sessionId);
        setChatSessions(prev => prev.filter(session => session.id !== sessionId));
        
        // If currently viewing this chat, redirect to home
        if (location.pathname === `/chat/${sessionId}`) {
          navigate('/');
        }
      } catch (error) {
        console.error("Failed to delete chat session:", error);
      }
    }
  };

  const handleEditChatTitle = (sessionId: string, currentTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSessionId(sessionId);
    setEditedTitle(currentTitle);
  };

  const handleSaveTitle = async (sessionId: string, e: React.FormEvent) => {
    e.preventDefault();
    
    if (editedTitle.trim()) {
      try {
        await updateChatSessionTitle(sessionId, editedTitle.trim());
        setChatSessions(prev => 
          prev.map(session => 
            session.id === sessionId ? { ...session, title: editedTitle.trim() } : session
          )
        );
      } catch (error) {
        console.error("Failed to update chat title:", error);
      }
    }
    
    setEditingSessionId(null);
  };

  // Get the maximum number of visible sessions based on device type
  const getMaxVisibleSessions = () => {
    return isMobile ? 3 : 8;
  };

  return (
    <motion.div
      initial={{ width: isMobile ? 0 : expandedWidth }}
      animate={{ 
        width: isExpanded ? expandedWidth : collapsedWidth,
        boxShadow: isExpanded ? "0 0 10px rgba(0, 0, 0, 0.3)" : "none"
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className={cn(
        'h-screen fixed left-0 top-0 z-40 flex flex-col sidebar',
        !isExpanded && isMobile ? 'w-0 overflow-hidden' : '',
        'bg-black/60 backdrop-blur-xl border-r border-white/10',
      )}
      style={{
        willChange: "transform, width",
        backfaceVisibility: "hidden"
      }}
    >
      {/* HEADER SECTION: Logo and menu */}
      <div className="flex-shrink-0 p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center">
          <span className={cn(
            "logo-text",
            isExpanded ? "text-2xl font-bold" : "text-2xl font-bold"
          )}>
            {isExpanded ? (
              <>
                <span className="text-purple-500">Bulgar</span>
                <span className="text-white">G</span>
                <span className="text-green-500">P</span>
                <span className="text-red-500">T</span>
              </>
            ) : (
              <span className="text-purple-500">B</span>
            )}
          </span>
        </div>
        <button onClick={onToggle} className="text-gray-400 hover:text-white">
          <Menu size={24} />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="flex-shrink-0 px-2 py-2 border-b border-white/5">
        <Link
          to="/"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg w-full',
            'text-white bg-purple-500/30 hover:bg-purple-500/40',
            'transition-all duration-100 ease-out'
          )}
        >
          <Plus className="w-5 h-5" />
          {isExpanded && (
            <span className="font-medium">Нов чат</span>
          )}
        </Link>
      </div>

      {/* MIDDLE SECTION: Chat sessions with fixed height */}
      <div className="flex flex-col" style={{ height: isAuthenticated ? 'auto' : '0' }}>
        {isAuthenticated && isExpanded && (
          <h3 className="text-xs uppercase text-muted-foreground font-semibold px-3 py-2 border-b border-white/5">
            Последни чатове
          </h3>
        )}
        
        {isAuthenticated && (
          <div 
            className="overflow-y-auto custom-scrollbar px-2 py-1"
            style={{ 
              height: isMobile ? '100px' : '240px', // Reduce height on mobile
              maxHeight: isMobile ? '100px' : '240px' // Reduce max height on mobile
            }}
          >
            {isLoading ? (
              <div className="flex justify-center items-center py-4">
                {isExpanded ? (
                  <LoadingLogo size="sm" message="" />
                ) : (
                  <div className="animate-pulse text-muted-foreground">...</div>
                )}
              </div>
            ) : loadError ? (
              <div className="px-3 py-2 text-sm text-red-400">
                {loadError}
              </div>
            ) : chatSessions.length > 0 ? (
              <div className="space-y-0.5">
                {/* Show limited messages on mobile */}
                {chatSessions.slice(0, getMaxVisibleSessions()).map((session) => (
                  <div key={session.id}>
                    {editingSessionId === session.id ? (
                      <form onSubmit={(e) => handleSaveTitle(session.id, e)} className="px-3 py-1 mb-1">
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-2 py-1 text-sm text-white"
                          autoFocus
                          onBlur={() => setEditingSessionId(null)}
                        />
                      </form>
                    ) : (
                      <ChatSessionItem
                        session={session}
                        isActive={session.id === getCurrentChatId()}
                        isExpanded={isExpanded}
                        onEdit={handleEditChatTitle}
                        onDelete={handleDeleteChat}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              isExpanded && !isLoading && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {isAuthenticated ? "Няма история на чата." : "Влезте, за да видите вашите чатове."}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* FOOTER SECTION: Navigation Options - pushed to bottom with mt-auto */}
      <div className="mt-auto">
        <div className="px-2 py-2 border-t border-white/5">
          {isExpanded && (
            <h3 className="text-xs uppercase text-muted-foreground font-semibold px-3 py-2">
              Навигация
            </h3>
          )}
          <div className="space-y-1">
            <Link
              to="/"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg',
                location.pathname === '/'
                  ? 'text-white bg-purple-900' 
                  : 'text-gray-300 hover:bg-gray-800'
              )}
            >
              <MessageCircle className="w-4 h-4" />
              {isExpanded && <span>AI Чат</span>}
            </Link>
            <Link
              to="/images"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg',
                location.pathname === '/images'
                  ? 'text-white bg-purple-900' 
                  : 'text-gray-300 hover:bg-gray-800'
              )}
            >
              <ImageIcon className="w-4 h-4" />
              {isExpanded && <span>Генератор на изображения</span>}
            </Link>
            <Link
              to="/about"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg',
                location.pathname === '/about'
                  ? 'text-white bg-purple-900' 
                  : 'text-gray-300 hover:bg-gray-800'
              )}
            >
              <Users className="w-4 h-4" />
              {isExpanded && <span>За Нас</span>}
            </Link>
            <Link
              to="/profile"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg',
                location.pathname === '/profile'
                  ? 'text-white bg-purple-900' 
                  : 'text-gray-300 hover:bg-gray-800'
              )}
            >
              <User className="w-4 h-4" />
              {isExpanded && <span>Профил</span>}
            </Link>
          </div>
        </div>

        {/* Footer Text */}
        {isExpanded && (
          <div className="p-4 text-xs text-gray-500 border-t border-white/5">
            Създаден от Kiara Intelligence
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Sidebar;