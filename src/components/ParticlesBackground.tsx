import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Enhanced animated background with particle effects and dynamic gradients
 */
const EnhancedBackground: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const particles = useRef<Particle[]>([]);
  
  // Initialize window size
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    // Set initial size
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Particle animation
  useEffect(() => {
    if (!canvasRef.current || windowSize.width === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = windowSize.width;
    canvas.height = windowSize.height;
    
    // Initialize particles if empty
    if (particles.current.length === 0) {
      const particleCount = Math.min(Math.floor(windowSize.width * windowSize.height / 15000), 100);
      particles.current = Array.from({ length: particleCount }, () => createParticle(windowSize.width, windowSize.height));
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw glow around mouse position
      if (mousePosition.x !== 0 && mousePosition.y !== 0) {
        const gradient = ctx.createRadialGradient(
          mousePosition.x, mousePosition.y, 0,
          mousePosition.x, mousePosition.y, 150
        );
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
        gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.05)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mousePosition.x, mousePosition.y, 150, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Update and draw particles
      particles.current.forEach((particle, index) => {
        // Update particle position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Check boundaries and reset if needed
        if (particle.x < -50) particle.x = canvas.width + 50;
        if (particle.x > canvas.width + 50) particle.x = -50;
        if (particle.y < -50) particle.y = canvas.height + 50;
        if (particle.y > canvas.height + 50) particle.y = -50;
        
        // Attract particles to mouse position
        const dx = mousePosition.x - particle.x;
        const dy = mousePosition.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const angle = Math.atan2(dy, dx);
          const force = (150 - distance) / 1500;
          particle.vx += Math.cos(angle) * force;
          particle.vy += Math.sin(angle) * force;
        }
        
        // Limit velocity
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (speed > 1) {
          particle.vx = (particle.vx / speed) * 1;
          particle.vy = (particle.vy / speed) * 1;
        }
        
        // Draw particle
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Connect particles
        particles.current.forEach((otherParticle, otherIndex) => {
          if (index !== otherIndex) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
              ctx.globalAlpha = (100 - distance) / 100 * 0.2;
              ctx.strokeStyle = particle.color;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.stroke();
            }
          }
        });
        
        ctx.globalAlpha = 1;
      });
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [windowSize, mousePosition]);
  
  // Create a new particle
  const createParticle = (width: number, height: number): Particle => {
    const colors = [
      'rgba(139, 92, 246, 0.7)', // Purple
      'rgba(168, 85, 247, 0.7)', // Purple/Pink
      'rgba(217, 70, 239, 0.7)', // Pink
      'rgba(236, 72, 153, 0.7)', // Pink
      'rgba(99, 102, 241, 0.7)'  // Indigo
    ];
    
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1
    };
  };
  
  return (
    <>
      {/* Static gradient background */}
      <div className="fixed inset-0 z-[-2] bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(25,25,35,0.8)_0%,rgba(0,0,0,1)_100%)]" />
        
        {/* Main gradient blobs */}
        <motion.div 
          className="absolute w-[600px] h-[600px] left-[10%] top-[20%] rounded-full bg-purple-600/5 blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute w-[500px] h-[500px] right-[5%] bottom-[10%] rounded-full bg-pink-600/5 blur-[100px]"
          animate={{
            scale: [1, 0.8, 1],
            x: [0, 40, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        <motion.div 
          className="absolute w-[300px] h-[300px] right-[30%] top-[15%] rounded-full bg-blue-600/5 blur-[80px]"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
      
      {/* Canvas for interactive particles */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-[-1]"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Noise texture overlay for grain effect */}
      <div className="fixed inset-0 z-[-1] opacity-[0.03] pointer-events-none bg-[url('/noise.png')] bg-repeat" />
    </>
  );
};

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  opacity: number;
}

export default EnhancedBackground;
