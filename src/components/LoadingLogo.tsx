import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type LoadingLogoProps = {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
};

function LoadingLogo({ 
  message = 'Зареждане...', 
  size = 'md', 
  fullScreen = false 
}: LoadingLogoProps) {
  // Size mapping for the logo
  const sizeMap = {
    sm: { logo: 'w-16 h-16', orbits: 20, particles: 4 },
    md: { logo: 'w-24 h-24', orbits: 30, particles: 6 },
    lg: { logo: 'w-32 h-32', orbits: 40, particles: 8 }
  };
  
  const { logo: logoSize, orbits: orbitsSize, particles: particlesCount } = sizeMap[size];
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showHint, setShowHint] = useState(false);
  
  // Simulate loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const next = prev + Math.random() * 3;
        return next > 100 ? 100 : next;
      });
    }, 150);
    
    // Show a hint if loading takes too long
    const hintTimer = setTimeout(() => {
      setShowHint(true);
    }, 5000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(hintTimer);
    };
  }, []);
  
  // Container component based on fullScreen prop
  const Container = ({ children }: { children: React.ReactNode }) => 
    fullScreen ? (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center">
        {children}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center h-full py-6">
        {children}
      </div>
    );
  
  // Generate random particles positions for the orbits
  const generateOrbits = (count: number, radius: number) => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      return { x, y, angle };
    });
  };
  
  // Generate random floating particles
  const generateFloatingParticles = (count: number) => {
    return Array.from({ length: count }).map(() => ({
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
      size: Math.random() * 4 + 2,
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
    }));
  };
  
  const orbits = generateOrbits(12, orbitsSize);
  const floatingParticles = generateFloatingParticles(particlesCount);
  
  return (
    <Container>
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          className="absolute w-full h-full opacity-30 blur-3xl"
          animate={{
            background: [
              'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.3), transparent 70%)',
              'radial-gradient(circle at 70% 50%, rgba(59, 130, 246, 0.3), transparent 70%)',
              'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.3), transparent 70%)'
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="relative z-10">
        {/* Main logo with enhanced animations */}
        <motion.div 
          className="relative"
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 1, 0, -1, 0],
            filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Glowing effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 blur-xl"
            animate={{ 
              opacity: [0.4, 0.7, 0.4],
              scale: [0.8, 1.1, 0.8]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Orbiting particles */}
          {orbits.map((orbit, i) => (
            <motion.div
              key={`orbit-${i}`}
              className="absolute rounded-full bg-purple-400"
              style={{
                width: Math.random() * 3 + 2,
                height: Math.random() * 3 + 2,
                top: '50%',
                left: '50%',
                x: orbit.x,
                y: orbit.y
              }}
              animate={{
                x: [orbit.x, orbit.x * Math.cos(0.1), orbit.x],
                y: [orbit.y, orbit.y * Math.sin(0.1), orbit.y],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: Math.random() * 2 + 3,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Floating particles */}
          {floatingParticles.map((particle, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full bg-blue-400"
              style={{
                width: particle.size,
                height: particle.size,
                top: '50%',
                left: '50%',
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.7)'
              }}
              animate={{
                x: [particle.x, particle.x + (Math.random() * 40 - 20)],
                y: [particle.y, particle.y + (Math.random() * 40 - 20)],
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Main logo */}
          <div className={`relative ${logoSize}`}>
            <img
              src="https://files.catbox.moe/tqqx05.png"
              alt="BulgarGPT Logo"
              className={`${logoSize} object-contain z-10 relative`}
            />
          </div>
        </motion.div>
        
        {/* Loading progress indicator */}
        <div className="mt-6 w-48 h-1.5 bg-gray-800/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: '5%' }}
            animate={{ width: `${loadingProgress}%` }}
            transition={{ ease: "easeOut" }}
          />
        </div>
        
        {/* Loading message with typing effect */}
        {message && (
          <motion.div 
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.p 
              className="text-white/90 text-lg font-medium"
              animate={{
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {message}
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                .
              </motion.span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              >
                .
              </motion.span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              >
                .
              </motion.span>
            </motion.p>
            
            {/* Loading hint for long loading times */}
            <AnimatePresence>
              {showHint && (
                <motion.p
                  className="text-purple-400/80 text-sm mt-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  Това може да отнеме няколко секунди...
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </Container>
  );
}

export default LoadingLogo;
