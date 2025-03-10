import React, { useState } from 'react';
import { X, User, Mail, Lock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useFirebaseAuth } from '../lib/firebase-auth-context';
import { ForgotPasswordModal } from './ForgotPasswordModal';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

enum AuthTab {
  Login = 'login',
  Register = 'register',
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(AuthTab.Login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const { signIn, signUp } = useFirebaseAuth();

  // Modal animation variants
  const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95,
      transition: { duration: 0.15, ease: 'easeIn' }
    }
  };

  // Backdrop variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (activeTab === AuthTab.Login) {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Show forgot password modal and hide auth modal
  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  // Return to login from forgot password
  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };
  
  // Close all modals
  const handleCloseAll = () => {
    onClose();
    setTimeout(() => {
      setShowForgotPassword(false);
    }, 300);
  };

  if (!isOpen && !showForgotPassword) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && !showForgotPassword && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={onClose}
            />
            
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div
                className="bg-black/90 border border-purple-500/30 rounded-xl max-w-md w-full mx-auto overflow-hidden"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with logo */}
                <div className="p-4 flex items-center justify-between bg-gradient-to-r from-purple-900/60 to-purple-800/60 border-b border-purple-500/20">
                  <div className="flex items-center">
                    <img
                      src="https://files.catbox.moe/tqqx05.png"
                      alt="BulgarGPT Logo"
                      className="w-8 h-8 mr-2"
                    />
                    <h2 className="text-xl font-semibold text-white">
                      <span className="text-purple-300">Bulgar</span>
                      <span className="text-white">G</span>
                      <span className="text-green-400">P</span>
                      <span className="text-red-400">T</span>
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white rounded-full p-1 hover:bg-black/20"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {/* Tabs */}
                <div className="flex border-b border-gray-800">
                  <button
                    className={`flex-1 py-3 text-center font-medium transition-colors ${
                      activeTab === AuthTab.Login
                        ? 'text-purple-400 border-b-2 border-purple-500'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab(AuthTab.Login)}
                  >
                    Вход
                  </button>
                  <button
                    className={`flex-1 py-3 text-center font-medium transition-colors ${
                      activeTab === AuthTab.Register
                        ? 'text-purple-400 border-b-2 border-purple-500'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab(AuthTab.Register)}
                  >
                    Регистрация
                  </button>
                </div>
                
                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {activeTab === AuthTab.Register && (
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Име</label>
                      <div className="relative">
                        <div className="absolute left-0 inset-y-0 flex items-center pl-3 pointer-events-none">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Вашето име"
                          className="bg-black/50 border-gray-800 pl-10"
                          required={activeTab === AuthTab.Register}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Имейл</label>
                    <div className="relative">
                      <div className="absolute left-0 inset-y-0 flex items-center pl-3 pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-500" />
                      </div>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="bg-black/50 border-gray-800 pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-400">Парола</label>
                      {activeTab === AuthTab.Login && (
                        <button 
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-xs text-purple-400 hover:text-purple-300"
                        >
                          Забравена парола?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute left-0 inset-y-0 flex items-center pl-3 pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-500" />
                      </div>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-black/50 border-gray-800 pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded p-3 text-sm text-red-400 flex items-start">
                      <AlertTriangle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  
                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Зареждане...
                      </span>
                    ) : activeTab === AuthTab.Login ? 'Вход' : 'Регистрация'}
                  </Button>
                  
                  <div className="text-center text-sm text-gray-500">
                    {activeTab === AuthTab.Login ? (
                      <p>
                        Нямате акаунт?{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab(AuthTab.Register)}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          Регистрирайте се
                        </button>
                      </p>
                    ) : (
                      <p>
                        Вече имате акаунт?{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab(AuthTab.Login)}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          Влезте
                        </button>
                      </p>
                    )}
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ForgotPasswordModal 
        isOpen={showForgotPassword}
        onClose={handleCloseAll}
        onBackToLogin={handleBackToLogin}
      />
    </>
  );
}

// Welcome Auth Button component
export function WelcomeAuthButton({ 
  className, 
  onOpenModal 
}: { 
  className?: string, 
  onOpenModal: () => void 
}) {
  return (
    <div className={className}>
      <Button
        onClick={onOpenModal}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 rounded-lg shadow-lg text-lg"
        size="lg"
      >
        <User className="w-5 h-5 mr-2" />
        Вход / Регистрация
      </Button>
    </div>
  );
}