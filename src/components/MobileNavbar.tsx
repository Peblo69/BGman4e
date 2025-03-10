import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle, ImageIcon, Users, User, Home } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../lib/utils';

const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile navbar only shown on small screens */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-xl border-t border-white/10 z-50">
        <div className="flex justify-around items-center h-16">
          <Link
            to="/"
            className={cn(
              "flex flex-col items-center justify-center text-xs px-1 py-2 w-full",
              location.pathname === '/' ? "text-purple-400" : "text-gray-400"
            )}
          >
            <Home className="w-5 h-5 mb-1" />
            <span>Начало</span>
          </Link>

          <Link
            to="/images"
            className={cn(
              "flex flex-col items-center justify-center text-xs px-1 py-2 w-full",
              location.pathname === '/images' ? "text-purple-400" : "text-gray-400"
            )}
          >
            <ImageIcon className="w-5 h-5 mb-1" />
            <span>Изображения</span>
          </Link>

          <button
            onClick={toggleMenu}
            className="flex flex-col items-center justify-center text-xs px-1 py-2 w-full text-gray-400"
          >
            <Menu className="w-5 h-5 mb-1" />
            <span>Меню</span>
          </button>

          <Link
            to="/about"
            className={cn(
              "flex flex-col items-center justify-center text-xs px-1 py-2 w-full",
              location.pathname === '/about' ? "text-purple-400" : "text-gray-400"
            )}
          >
            <Users className="w-5 h-5 mb-1" />
            <span>За нас</span>
          </Link>

          <Link
            to="/profile"
            className={cn(
              "flex flex-col items-center justify-center text-xs px-1 py-2 w-full",
              location.pathname === '/profile' ? "text-purple-400" : "text-gray-400"
            )}
          >
            <User className="w-5 h-5 mb-1" />
            <span>Профил</span>
          </Link>
        </div>
      </div>

      {/* Full screen menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 md:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4 border-b border-white/10">
                <div className="flex items-center">
                  <img 
                    src="https://files.catbox.moe/tqqx05.png"
                    alt="BulgarGPT Logo"
                    className="w-8 h-8 mr-2" 
                  />
                  <span className="text-xl font-bold">
                    <span className="text-purple-500">Bulgar</span>
                    <span className="text-white">G</span>
                    <span className="text-green-500">P</span>
                    <span className="text-red-500">T</span>
                  </span>
                </div>
                <button
                  onClick={closeMenu}
                  className="text-gray-400 hover:text-white p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  <Link
                    to="/"
                    className="block px-4 py-3 rounded-lg text-white bg-purple-900/50 hover:bg-purple-900/70"
                    onClick={closeMenu}
                  >
                    <div className="flex items-center">
                      <Home className="w-5 h-5 mr-3" />
                      <span className="text-lg">Начало</span>
                    </div>
                  </Link>

                  <Link
                    to="/images"
                    className="block px-4 py-3 rounded-lg text-white bg-purple-900/50 hover:bg-purple-900/70"
                    onClick={closeMenu}
                  >
                    <div className="flex items-center">
                      <ImageIcon className="w-5 h-5 mr-3" />
                      <span className="text-lg">Генератор на изображения</span>
                    </div>
                  </Link>

                  <Link
                    to="/profile"
                    className="block px-4 py-3 rounded-lg text-white bg-purple-900/50 hover:bg-purple-900/70"
                    onClick={closeMenu}
                  >
                    <div className="flex items-center">
                      <User className="w-5 h-5 mr-3" />
                      <span className="text-lg">Профил</span>
                    </div>
                  </Link>

                  <Link
                    to="/about"
                    className="block px-4 py-3 rounded-lg text-white bg-purple-900/50 hover:bg-purple-900/70"
                    onClick={closeMenu}
                  >
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-3" />
                      <span className="text-lg">За нас</span>
                    </div>
                  </Link>
                </div>

                <div className="mt-8 border-t border-white/10 pt-4">
                  <p className="text-xs text-gray-500 text-center">
                    Създаден от Kiara Intelligence
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavbar;