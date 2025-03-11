import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, X, LogIn, Eye, EyeOff, AlertTriangle, ChevronLeft, ArrowRight, Sparkles, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useFirebaseAuth } from '../lib/firebase-auth-context';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import '../authmodal.css';

export function LoginModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { hasReachedMessageLimit, signIn } = useFirebaseAuth();
  
  useEffect(() => {
    if (hasReachedMessageLimit) {
      setIsOpen(true);
    }
  }, [hasReachedMessageLimit]);
  
  const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0, backdropFilter: "blur(0px)" },
    visible: { 
      opacity: 1, 
      backdropFilter: "blur(8px)",
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      backdropFilter: "blur(0px)",
      transition: { duration: 0.2 }
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      setSuccessMessage("Успешен вход!");
      
      setTimeout(() => {
        setIsOpen(false);
      }, 1000);
    } catch (error: any) {
      setError(error.message || 'Грешка при влизане. Моля, опитайте отново.');
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
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-black/90 border border-purple-500/30 rounded-xl max-w-md w-full shadow-auth"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-purple-800/60 p-5 flex justify-between items-center border-b border-purple-500/30 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 opacity-50"
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 0%'],
                    }}
                    transition={{
                      duration: 15,
                      repeat: Infinity,
                      repeatType: "mirror"
                    }}
                  />
                </div>
                
                <motion.div
                  className="flex items-center z-10"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                  <h2 className="text-2xl font-bold gradient-text-auth">Вход</h2>
                </motion.div>
                
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white bg-black/30 hover:bg-black/50 rounded-full p-2 transition-colors z-10"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={18} />
                </motion.button>
              </div>
              
              <div className="p-6">
                <motion.p 
                  className="text-gray-300 mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  За да продължите да използвате BulgarGPT, моля, влезте във вашия акаунт или създайте нов.
                </motion.p>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
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
                        className="bg-black/50 border-gray-800 pl-10 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all"
                        required
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex justify-between">
                      <label className="text-sm text-gray-400">Парола</label>
                      <motion.button 
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm text-purple-400 hover:text-purple-300 flex items-center"
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Забравена парола?
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </motion.button>
                    </div>
                    <div className="relative">
                      <div className="absolute left-0 inset-y-0 flex items-center pl-3">
                        <Lock className="h-5 w-5 text-gray-500" />
                      </div>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-black/50 border-gray-800 pl-10 pr-12 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all"
                        required
                      />
                      <button 
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-0 inset-y-0 flex items-center pr-3 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </motion.div>
                  
                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        className="bg-red-900/30 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm flex items-start"
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <AlertTriangle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                    
                    {successMessage && (
                      <motion.div 
                        className="bg-green-900/30 border border-green-500/30 text-green-400 p-3 rounded-lg text-sm"
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {successMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-2 relative overflow-hidden shadow-glow"
                      disabled={isLoading}
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full auth-shimmer"></span>
                      
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
                  </motion.div>
                  
                  <motion.div 
                    className="text-center text-sm text-gray-400 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="flex items-center justify-center">
                      <User className="w-3 h-3 mr-1" />
                      Нямате акаунт?{' '}
                      <motion.a 
                        href="#" 
                        className="text-purple-400 hover:text-purple-300 ml-1 flex items-center"
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Регистрирайте се
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </motion.a>
                    </p>
                  </motion.div>
                </form>
              </div>
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
