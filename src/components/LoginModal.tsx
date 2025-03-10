import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, X, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useFirebaseAuth } from '../lib/firebase-auth-context';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export function LoginModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const { hasReachedMessageLimit, signIn } = useFirebaseAuth();
  
  // Only show the login modal when the user has reached the message limit
  React.useEffect(() => {
    if (hasReachedMessageLimit) {
      setIsOpen(true);
    }
  }, [hasReachedMessageLimit]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      setIsOpen(false);
    } catch (error: any) {
      setError(error.message || 'Грешка при влизане. Моля, опитайте отново.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setIsOpen(false);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setIsOpen(true);
  };

  const handleCloseAll = () => {
    setIsOpen(false);
    setShowForgotPassword(false);
  };
  
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 rounded-lg max-w-md w-full p-6 shadow-xl border border-purple-500/30"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Вход</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <p className="text-gray-300 mb-6">
                За да продължите да използвате BulgarGPT, моля, влезте във вашия акаунт.
              </p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Имейл</label>
                  <div className="relative">
                    <div className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                    </div>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="bg-gray-800 border-gray-700 pl-10 py-2"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm text-gray-400">Парола</label>
                    <button 
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-purple-400 hover:text-purple-300"
                    >
                      Забравена парола?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-gray-800 border-gray-700 pl-10 py-2"
                      required
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-900/30 text-red-400 p-3 rounded text-sm">
                    {error}
                  </div>
                )}
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Зареждане...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <LogIn className="w-5 h-5 mr-2" />
                      Вход
                    </span>
                  )}
                </Button>
                
                <div className="text-center text-sm text-gray-400 mt-4">
                  Нямате акаунт?{' '}
                  <a href="#" className="text-purple-400 hover:text-purple-300">
                    Регистрирайте се
                  </a>
                </div>
              </form>
            </motion.div>
          </motion.div>
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