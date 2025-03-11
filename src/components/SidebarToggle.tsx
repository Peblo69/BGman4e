import React, { useState, useEffect } from 'react';
import { Menu, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarToggleProps {
  isExpanded: boolean;
  toggleSidebar: () => void;
}

const SidebarToggle: React.FC<SidebarToggleProps> = ({ isExpanded, toggleSidebar }) => {
  const [hovered, setHovered] = useState(false);
  
  // Subtle pulse animation effect
  const [isPulsing, setIsPulsing] = useState(true);
  
  // Stop pulsing after first interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPulsing(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Glow effect background */}
      <AnimatePresence>
        {(hovered || isPulsing) && (
          <motion.div 
            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 blur-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: isPulsing ? [0.4, 0.8, 0.4] : 0.8, 
              scale: isPulsing ? [1, 1.2, 1] : 1.2 
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              duration: isPulsing ? 2 : 0.2,
              repeat: isPulsing ? Infinity : 0
            }}
          />
        )}
      </AnimatePresence>
      
      <motion.button
        onClick={toggleSidebar}
        className="relative bg-black/80 backdrop-blur-xl border border-purple-500/50 rounded-full p-3 shadow-lg overflow-hidden"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        style={{
          willChange: "transform, opacity",
          backfaceVisibility: "hidden"
        }}
      >
        {/* Inner glowing ring */}
        <motion.div 
          className="absolute inset-0 rounded-full border-2 border-purple-500/30"
          animate={{ 
            scale: hovered ? [1, 1.1, 1] : 1,
            opacity: hovered ? [0.5, 1, 0.5] : 0.5
          }}
          transition={{ 
            duration: 1.5, 
            repeat: hovered ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
        
        {/* Button icon with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isExpanded ? 'expanded' : 'collapsed'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isExpanded ? (
              <ChevronLeft className="h-5 w-5 text-purple-300" />
            ) : (
              <Menu className="h-5 w-5 text-purple-300" />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Subtle particle effect on hover */}
        <AnimatePresence>
          {hovered && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-1 h-1 rounded-full bg-purple-400"
                  initial={{ 
                    opacity: 0,
                    x: 0, 
                    y: 0 
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    x: Math.cos(i * (Math.PI * 2 / 6)) * 30, 
                    y: Math.sin(i * (Math.PI * 2 / 6)) * 30 
                  }}
                  transition={{ 
                    duration: 0.8 + (i * 0.1),
                    ease: "easeOut",
                    delay: i * 0.05
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default SidebarToggle;
