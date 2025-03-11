import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '../lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, MessageCircle, Plus, Pencil, Trash2, Users, User, ImageIcon, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
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
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <Link
        to={`/chat/${session.id}`}
        data-active={isActive ? "true" : "false"}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg w-full mb-1 group transition-all duration-300 ease-out relative overflow-hidden',
          isActive 
            ? 'bg-gradient-to-r from-purple-600/30 to-purple-800/30 text-white' 
            : 'text-muted-foreground hover:text-primary hover:bg-white/10'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Active indicator animation */}
        {isActive && (
          <motion.div 
            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500"
            layoutId="activeChatIndicator"
            initial={{ height: 0 }}
            animate={{ height: '100%' }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* Message icon with animation */}
        <motion.div
          animate={isHovered || isActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
        </motion.div>
        
        {isExpanded && (
          <>
            <motion.span 
              className="font-medium truncate flex-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {session.title}
            </motion.span>
            
            {/* Action buttons with enhanced animations */}
            <motion.button
              onClick={(e) => onEdit(session.id, session.title, e)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-500/20 rounded transition-all duration-200"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <Pencil className="w-3 h-3 text-blue-400" />
            </motion.button>
            <motion.button
              onClick={(e) => onDelete(session.id, e)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all duration-200"
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9, rotate: -5 }}
            >
              <Trash2 className="w-3 h-3 text-red-400" />
            </motion.button>
          </>
        )}
        
        {/* Subtle highlight effect on hover */}
        {(isHovered && !isActive) && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 200 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "loop" }}
          />
        )}
      </Link>
    </motion.div>
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
  const [sectionsExpanded, setSectionsExpanded] = useState({
    chats: true,
    navigation: true
  });
  
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

  // Toggle section expansion
  const toggleSection = (section: 'chats' | 'navigation') => {
    setSectionsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Animation variants
  const sidebarVariants: Variants = {
    expanded: { 
      width: expandedWidth,
      boxShadow: "0 0 15px rgba(0, 0, 0, 0.4)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    collapsed: { 
      width: isMobile ? 0 : collapsedWidth,
      boxShadow: "none",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants: Variants = {
    expanded: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    collapsed: { 
      opacity: 0, 
      x: -20,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  const fadeInVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      variants={sidebarVariants}
      initial="collapsed"
      animate={isExpanded ? "expanded" : "collapsed"}
      className={cn(
        'h-screen fixed left-0 top-0 z-40 flex flex-col sidebar',
        !isExpanded && isMobile ? 'w-0 overflow-hidden' : '',
        'bg-black/80 backdrop-blur-xl border-r border-white/10',
      )}
      style={{
        willChange: "transform, width",
        backfaceVisibility: "hidden"
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient blob */}
        <motion.div 
          className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-r from-purple-700/10 via-pink-600/10 to-blue-600/10 blur-3xl"
          animate={{
            x: [0, 20, -20, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.2, 0.8, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '30%', left: '-150px' }}
        />
        
        {/* Small floating particles */}
        {[...Array(8)].map((_, index) => (
          <motion.div
            key={`particle-${index}`}
            className="absolute w-1 h-1 rounded-full bg-purple-500/40"
            initial={{ 
              x: Math.random() * 300 - 100,
              y: Math.random() * 1000
            }}
            animate={{
              y: [null, -1000],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: Math.random() * 15 + 15,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* HEADER SECTION: Logo and menu */}
      <div className="flex-shrink-0 p-4 flex items-center justify-between border-b border-white/10 relative z-10">
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <span className="logo-text text-2xl font-bold">
                <motion.span 
                  className="text-purple-500"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  Bulgar
                </motion.span>
                <motion.span 
                  className="text-white"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  G
                </motion.span>
                <motion.span 
                  className="text-green-500"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  P
                </motion.span>
                <motion.span 
                  className="text-red-500"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  T
                </motion.span>
              </span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="flex items-center"
            >
              <span className="logo-text text-2xl font-bold">
                <span className="text-purple-500">B</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button 
          onClick={onToggle} 
          className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/5"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9, rotate: -5 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Menu size={20} />
        </motion.button>
      </div>

      {/* New Chat Button with enhanced animation */}
      <div className="flex-shrink-0 px-2 py-2 border-b border-white/10">
        <motion.div
          whileHover={{ 
            scale: 1.02,
            transition: { type: "spring", stiffness: 400, damping: 10 }
          }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            to="/"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg w-full relative overflow-hidden',
              'text-white hover:text-white',
              'transition-all duration-300 ease-out'
            )}
          >
            {/* Animated background for the button */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-purple-600/40 to-pink-600/40 rounded-lg -z-10"
              animate={{ 
                background: [
                  'linear-gradient(to right, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.4))',
                  'linear-gradient(to right, rgba(139, 92, 246, 0.6), rgba(236, 72, 153, 0.6))',
                  'linear-gradient(to right, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.4))'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Animated plus icon */}
            <motion.div
              animate={{ rotate: isExpanded ? [0, 0] : [0, 90, 180, 270, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear", repeatDelay: 5 }}
            >
              <Plus className="w-5 h-5 text-white" />
            </motion.div>
            
            {isExpanded && (
              <motion.span 
                className="font-medium"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: 0.1 }}
              >
                Нов чат
              </motion.span>
            )}
          </Link>
        </motion.div>
      </div>

      {/* MIDDLE SECTION: Chat sessions with fixed height */}
      <div className="flex flex-col" style={{ height: isAuthenticated ? 'auto' : '0' }}>
        {isAuthenticated && isExpanded && (
          <div className="flex items-center justify-between text-xs uppercase text-muted-foreground font-semibold px-3 py-2 border-b border-white/10">
            <div className="flex items-center">
              <Sparkles className="w-3 h-3 mr-1.5 text-purple-400 opacity-70" />
              <span>Последни чатове</span>
            </div>
            <motion.button
              onClick={() => toggleSection('chats')}
              className="p-1 rounded-full hover:bg-white/10"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {sectionsExpanded.chats ? 
                <ChevronDown className="w-3 h-3 text-gray-400" /> : 
                <ChevronRight className="w-3 h-3 text-gray-400" />
              }
            </motion.button>
          </div>
        )}
        
        {isAuthenticated && (
          <AnimatePresence>
            {(isExpanded && sectionsExpanded.chats) && (
              <motion.div 
                className="overflow-y-auto custom-scrollbar px-2 py-1"
                style={{ 
                  height: isMobile ? '100px' : '240px', // Reduce height on mobile
                  maxHeight: isMobile ? '100px' : '240px' // Reduce max height on mobile
                }}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: isMobile ? '100px' : '240px', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isLoading ? (
                  <motion.div 
                    className="flex justify-center items-center py-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {isExpanded ? (
                      <LoadingLogo size="sm" message="" />
                    ) : (
                      <div className="animate-pulse text-muted-foreground">...</div>
                    )}
                  </motion.div>
                ) : loadError ? (
                  <motion.div 
                    className="px-3 py-2 text-sm text-red-400 bg-red-500/10 rounded-lg border border-red-500/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {loadError}
                  </motion.div>
                ) : chatSessions.length > 0 ? (
                  <motion.div 
                    className="space-y-0.5"
                    variants={fadeInVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Show limited messages on mobile */}
                    <AnimatePresence>
                      {chatSessions.slice(0, getMaxVisibleSessions()).map((session) => (
                        <motion.div 
                          key={session.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                          {editingSessionId === session.id ? (
                            <motion.form 
                              onSubmit={(e) => handleSaveTitle(session.id, e)} 
                              className="px-3 py-1 mb-1"
                              initial={{ scale: 0.95 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            >
                              <input
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className="w-full bg-black/60 border border-purple-500/50 rounded-lg px-2 py-1 text-sm text-white focus:ring-2 focus:ring-purple-500/30 outline-none"
                                autoFocus
                                onBlur={() => setEditingSessionId(null)}
                              />
                            </motion.form>
                          ) : (
                            <ChatSessionItem
                              session={session}
                              isActive={session.id === getCurrentChatId()}
                              isExpanded={isExpanded}
                              onEdit={handleEditChatTitle}
                              onDelete={handleDeleteChat}
                            />
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  isExpanded && !isLoading && (
                    <motion.div 
                      className="px-3 py-2 text-sm text-muted-foreground text-center mt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {isAuthenticated ? (
                        <div className="flex flex-col items-center">
                          <MessageCircle className="w-8 h-8 text-gray-600 mb-2 opacity-50" />
                          <span>Няма история на чата.</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <User className="w-8 h-8 text-gray-600 mb-2 opacity-50" />
                          <span>Влезте, за да видите вашите чатове.</span>
                        </div>
                      )}
                    </motion.div>
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* FOOTER SECTION: Navigation Options - pushed to bottom with mt-auto */}
      <div className="mt-auto">
        <div className="px-2 py-2 border-t border-white/10">
          {isExpanded && (
            <div className="flex justify-between items-center text-xs uppercase text-muted-foreground font-semibold px-3 py-2">
              <span>Навигация</span>
              <motion.button
                onClick={() => toggleSection('navigation')}
                className="p-1 rounded-full hover:bg-white/10"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                {sectionsExpanded.navigation ? 
                  <ChevronDown className="w-3 h-3 text-gray-400" /> : 
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                }
              </motion.button>
            </div>
          )}
          
          <AnimatePresence>
            {(isExpanded && sectionsExpanded.navigation || !isExpanded) && (
              <motion.div 
                className="space-y-1"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <NavItem 
                  to="/" 
                  icon={<MessageCircle className="w-4 h-4" />} 
                  text="AI Чат" 
                  isActive={location.pathname === '/'}
                  isExpanded={isExpanded}
                />
                <NavItem 
                  to="/images" 
                  icon={<ImageIcon className="w-4 h-4" />} 
                  text="Генератор на изображения" 
                  isActive={location.pathname === '/images'}
                  isExpanded={isExpanded}
                />
                <NavItem 
                  to="/about" 
                  icon={<Users className="w-4 h-4" />} 
                  text="За Нас" 
                  isActive={location.pathname === '/about'}
                  isExpanded={isExpanded}
                />
                <NavItem 
                  to="/profile" 
                  icon={<User className="w-4 h-4" />} 
                  text="Профил" 
                  isActive={location.pathname === '/profile'}
                  isExpanded={isExpanded}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Text */}
        {isExpanded && (
          <motion.div 
            className="p-4 text-xs text-center border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.5, 0.7, 0.5],
              background: [
                'linear-gradient(to right, rgba(0, 0, 0, 0), rgba(139, 92, 246, 0.05), rgba(0, 0, 0, 0))',
                'linear-gradient(to right, rgba(0, 0, 0, 0), rgba(139, 92, 246, 0.1), rgba(0, 0, 0, 0))',
                'linear-gradient(to right, rgba(0, 0, 0, 0), rgba(139, 92, 246, 0.05), rgba(0, 0, 0, 0))'
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Създаден от Kiara Intelligence
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Navigation item component with animations
const NavItem = ({ 
  to, 
  icon, 
  text, 
  isActive, 
  isExpanded 
}: { 
  to: string, 
  icon: React.ReactNode, 
  text: string, 
  isActive: boolean, 
  isExpanded: boolean 
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Link
        to={to}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg relative overflow-hidden',
          isActive
            ? 'text-white' 
            : 'text-gray-300 hover:text-white'
        )}
      >
        {/* Background for active state */}
        {isActive && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 rounded-lg -z-10"
            layoutId="activeNavIndicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* Icon with subtle animation */}
        <motion.div
          animate={isActive ? { 
            scale: [1, 1.2, 1],
            rotate: [0, 5, 0],
            transition: { duration: 0.5 }
          } : {}}
        >
          {icon}
        </motion.div>
        
        {/* Text label */}
        {isExpanded && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ delay: 0.1 }}
          >
            {text}
          </motion.span>
        )}
      </Link>
    </motion.div>
  );
};

export default Sidebar;
