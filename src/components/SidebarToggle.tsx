import React from 'react';
import { Menu, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarToggleProps {
  isExpanded: boolean;
  toggleSidebar: () => void;
}

const SidebarToggle: React.FC<SidebarToggleProps> = ({ isExpanded, toggleSidebar }) => {
  return (
    <motion.button
      onClick={toggleSidebar}
      className="fixed top-4 right-4 z-50 bg-black/60 backdrop-blur-xl border border-purple-500/30 rounded-full p-2 shadow-lg"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        willChange: "transform, opacity",
        backfaceVisibility: "hidden"
      }}
    >
      {isExpanded ? (
        <ChevronLeft className="h-5 w-5 text-purple-400" />
      ) : (
        <Menu className="h-5 w-5 text-purple-400" />
      )}
    </motion.button>
  );
};

export default SidebarToggle;