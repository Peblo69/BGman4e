import React, { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
};

const ParticlesBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Create particles - reduce count on mobile
    const createParticles = () => {
      const particles: Particle[] = [];
      const isMobile = window.innerWidth <= 768;
      // Fewer particles on mobile for better performance
      const particleCount = isMobile 
        ? Math.min(Math.floor(window.innerWidth * 0.03), 30) 
        : Math.min(Math.floor(window.innerWidth * 0.05), 100);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1, // Size between 1-4
          speedX: (Math.random() - 0.5) * 0.3, // Slow horizontal movement
          speedY: (Math.random() - 0.5) * 0.3, // Slow vertical movement
          color: getRandomColor(),
          alpha: Math.random() * 0.5 + 0.1, // Opacity between 0.1-0.6
        });
      }
      
      return particles;
    };

    // Get random color from purple/blue palette
    const getRandomColor = () => {
      const colors = [
        'rgba(139, 92, 246, alpha)', // Purple-500
        'rgba(124, 58, 237, alpha)', // Purple-600
        'rgba(109, 40, 217, alpha)', // Purple-700
        'rgba(79, 70, 229, alpha)',  // Indigo-600
        'rgba(99, 102, 241, alpha)', // Indigo-500
        'rgba(59, 130, 246, alpha)', // Blue-500
      ];
      
      return colors[Math.floor(Math.random() * colors.length)];
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.8
      );
      
      gradient.addColorStop(0, 'rgba(15, 15, 20, 1)');
      gradient.addColorStop(1, 'rgba(5, 5, 10, 1)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap particles around the edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace('alpha', particle.alpha.toString());
        ctx.fill();
        
        // Connect nearby particles with lines - limit connections on mobile
        const isMobile = window.innerWidth <= 768;
        if (!isMobile || index % 2 === 0) { // Skip some connections on mobile
          connectParticles(particle, index);
        }
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    // Draw connections between nearby particles
    const connectParticles = (particle: Particle, index: number) => {
      const isMobile = window.innerWidth <= 768;
      const distance = isMobile ? 100 : 150; // Shorter connection distance on mobile
      
      for (let i = index + 1; i < particlesRef.current.length; i++) {
        const otherParticle = particlesRef.current[i];
        
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < distance) {
          // Opacity based on distance (farther = more transparent)
          const opacity = 1 - (dist / distance);
          
          ctx!.beginPath();
          ctx!.strokeStyle = `rgba(139, 92, 246, ${opacity * 0.15})`; // Very subtle purple
          ctx!.lineWidth = 0.5;
          ctx!.moveTo(particle.x, particle.y);
          ctx!.lineTo(otherParticle.x, otherParticle.y);
          ctx!.stroke();
        }
      }
    };
    
    // Handle resize event to recreate particles
    const handleResize = () => {
      resizeCanvas();
      particlesRef.current = createParticles();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initialize
    particlesRef.current = createParticles();
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1]"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default ParticlesBackground;