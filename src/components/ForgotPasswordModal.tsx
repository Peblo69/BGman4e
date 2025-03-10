import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { auth } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { getFirebaseErrorMessage } from '../lib/firebase-error-messages';

type ForgotPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
};

export function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
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
  
  // Handle closing the modal and resetting state
  const handleClose = () => {
    // First call the provided onClose function
    onClose();
    
    // Reset component state with a slight delay to ensure smooth animation
    setTimeout(() => {
      setIsSuccess(false);
      setEmail('');
      setError(null);
    }, 300);
  };

  // Handle form submission for password reset
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Моля, въведете имейл адрес');
      return;
    }
    
    setError(null);
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setIsSuccess(true);
    } catch (error: any) {
      setError(getFirebaseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
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
                    <span className="text-purple-300">Възстановяване на парола</span>
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white rounded-full p-1 hover:bg-black/20"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Form */}
              <div className="p-6 space-y-4">
                {isSuccess ? (
                  <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-400">
                      <p>Имейл за възстановяване на паролата беше изпратен на <strong>{email}</strong>.</p>
                      <p className="mt-2 text-sm">Моля, проверете вашата електронна поща и следвайте инструкциите, за да създадете нова парола.</p>
                    </div>
                    
                    <Button
                      onClick={handleClose}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Разбрано
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <button
                        type="button"
                        onClick={onBackToLogin}
                        className="flex items-center text-sm text-purple-400 hover:text-purple-300 mb-4"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Назад към вход
                      </button>
                      
                      <p className="text-sm text-gray-300 mb-4">
                        Въведете имейл адреса, с който сте се регистрирали, и ще ви изпратим инструкции за възстановяване на вашата парола.
                      </p>
                    </div>
                    
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
                          className="bg-black/50 border-gray-800 pl-10 py-2"
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
                          Изпращане...
                        </span>
                      ) : 'Изпрати инструкции за възстановяване'}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}