import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, AlertTriangle, ArrowRight, EyeOff, Eye, CheckCircle, ChevronLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useFirebaseAuth } from '../lib/firebase-auth-context';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import './authmodal.css'; // Fixed import path for consistent location and casing

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
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { signIn, signUp } = useFirebaseAuth();

  // Clear fields and errors when switching tabs
  useEffect(() => {
    setError(null);
    setSuccessMessage(null);
  }, [activeTab]);

  // Modal animation variants
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
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  };

  // Backdrop variants
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
      transition: { duration: 0.2, delay: 0.1 }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (activeTab === AuthTab.Login) {
        await signIn(email, password);
        setSuccessMessage("Успешен вход!");
        
        // Close the modal after a short delay to show the success message
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        await signUp(email, password, name);
        setSuccessMessage("Регистрацията е успешна!");
        
        // Switch to login after successful registration after a delay
        setTimeout(() => {
          setActiveTab(AuthTab.Login);
          setIsLoading(false);
          setSuccessMessage(null);
        }, 1500);
      }
    } catch (error: any) {
      setError(error.message);
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

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (!isOpen && !showForgotPassword) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && !showForgotPassword && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-50"
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
                className="bg-black/90 border border-purple-500/30 rounded-xl max-w-md w-full mx-auto overflow-hidden shadow-auth"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with logo */}
                <div className="p-5 flex items-center justify-between bg-gradient-to-r from-purple-900/60 to-purple-800/60 border-b border-purple-500/30 relative overflow-hidden">
                  {/* Animated background effect */}
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
                  
                  <div className="flex items-center relative z-10">
                    <motion.div
                      initial={{ rotate: -10, scale: 0.9, opacity: 0 }}
                      animate={{ rotate: 0, scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                    >
                      <img
                        src="https://files.catbox.moe/tqqx05.png"
                        alt="BulgarGPT Logo"
                        className="w-9 h-9 mr-3"
                      />
                    </motion.div>
                    <motion.h2 
                      className="text-xl font-bold text-white"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <span className="text-purple-300">Bulgar</span>
                      <span className="text-white">G</span>
                      <span className="text-green-400">P</span>
                      <span className="text-red-400">T</span>
                    </motion.h2>
                  </div>
                  <motion.button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white rounded-full p-1.5 hover:bg-white/10 transition-colors"
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={18} />
                  </motion.button>
                </div>
                
                {/* Tabs */}
                <div className="flex border-b border-gray-800">
                  <motion.button
                    className={`flex-1 py-3.5 text-center font-medium transition-colors relative ${
                      activeTab === AuthTab.Login
                        ? 'text-purple-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab(AuthTab.Login)}
                    whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.05)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Вход
                    {activeTab === AuthTab.Login && (
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"
                        layoutId="activeTabIndicator"
                      />
                    )}
                  </motion.button>
                  <motion.button
                    className={`flex-1 py-3.5 text-center font-medium transition-colors relative ${
                      activeTab === AuthTab.Register
                        ? 'text-purple-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab(AuthTab.Register)}
                    whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.05)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Регистрация
                    {activeTab === AuthTab.Register && (
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"
                        layoutId="activeTabIndicator"
                      />
                    )}
                  </motion.button>
                </div>
                
                {/* Form */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                      {/* Form title with animation */}
                      <motion.h3
                        className="text-xl font-bold mb-4 text-white"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        {activeTab === AuthTab.Login ? (
                          <span className="flex items-center">
                            <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                            Добре дошли обратно
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                            Създаване на акаунт
                          </span>
                        )}
                      </motion.h3>
                      
                      {activeTab === AuthTab.Register && (
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <label className="text-sm text-gray-400">Име</label>
                          <div className="relative">
                            <div className="absolute left-0 inset-y-0 flex items-center pl-3 pointer-events-none">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <Input
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Вашето име"
                              className="bg-black/50 border-gray-800 pl-10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all"
                              required={activeTab === AuthTab.Register}
                            />
                          </div>
                        </motion.div>
                      )}
                      
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
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
                            className="bg-black/50 border-gray-800 pl-10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all"
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
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-gray-400">Парола</label>
                          {activeTab === AuthTab.Login && (
                            <motion.button 
                              type="button"
                              onClick={handleForgotPassword}
                              className="text-xs text-purple-400 hover:text-purple-300 flex items-center"
                              whileHover={{ x: 2 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              Забравена парола?
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </motion.button>
                          )}
                        </div>
                        <div className="relative">
                          <div className="absolute left-0 inset-y-0 flex items-center pl-3 pointer-events-none">
                            <Lock className="h-4 w-4 text-gray-500" />
                          </div>
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="bg-black/50 border-gray-800 pl-10 pr-12 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all"
                            required
                          />
                          <button 
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-0 inset-y-0 flex items-center pr-3 text-gray-500 hover:text-gray-300"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 
