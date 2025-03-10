import React, { useEffect, useRef } from 'react';

const PaintDrip: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dripsRef = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions - wide enough to cover area below logo
    canvas.width = 220;
    canvas.height = 300;
    
    // Drip colors - purple, blue, green shades
    const colors = [
      '#8b5cf6', // purple-500
      '#6d28d9', // purple-700
      '#3b82f6', // blue-500
      '#4f46e5', // indigo-600
      '#10b981', // emerald-500
      '#ef4444', // red-500
    ];
    
    class PaintDrip {
      x: number;
      y: number;
      length: number;
      speed: number;
      maxLength: number;
      width: number;
      color: string;
      growing: boolean;
      growthRate: number;
      curve: number;
      alpha: number;
      startFadeY: number;
      
      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.length = 0;
        this.speed = Math.random() * 0.5 + 0.2; // Speed of drip growth
        this.maxLength = Math.random() * 100 + 80; // Random max length - increased for longer drips
        this.width = Math.random() * 4 + 2; // Width of drip
        this.color = color;
        this.growing = true;
        this.growthRate = Math.random() * 0.8 + 0.2;
        this.curve = (Math.random() - 0.5) * 1.2; // Small random curve
        this.alpha = 1;
        this.startFadeY = y; // Store the starting Y position for top fade effect
      }
      
      update() {
        if (this.growing) {
          this.length += this.speed;
          
          // Apply some curve as it grows
          this.x += this.curve * 0.1;
          
          if (this.length >= this.maxLength) {
            this.growing = false;
          }
        } else {
          // Once fully grown, start fading
          this.alpha -= 0.005;
        }
      }
      
      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        
        // Create gradient for the drip with fade at top
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.length);
        gradient.addColorStop(0, `${this.color}00`); // Transparent at very top
        gradient.addColorStop(0.05, `${this.color}88`); // Semi-transparent near top
        gradient.addColorStop(0.2, `${this.color}ff`); // Fully opaque below top
        gradient.addColorStop(0.7, `${this.color}aa`); // Semi-transparent in middle
        gradient.addColorStop(1, `${this.color}00`); // Transparent at bottom
        
        // Draw the drip with rounded ends
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        
        // Draw curved path for the drip
        ctx.lineTo(this.x + this.curve, this.y + this.length);
        
        ctx.lineWidth = this.width;
        ctx.strokeStyle = gradient;
        ctx.globalAlpha = this.alpha;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Draw drip head (circle at the bottom) - but only if length is significant
        if (this.length > 8) {
          ctx.beginPath();
          ctx.arc(
            this.x + this.curve, 
            this.y + this.length, 
            this.width / 1.5, 
            0, 
            Math.PI * 2
          );
          ctx.fillStyle = this.color;
          ctx.fill();
        }
        
        ctx.restore();
      }
      
      isDead() {
        return this.alpha <= 0;
      }
    }
    
    // Initialize drips
    function createInitialDrips() {
      // Start with a few drips from different positions at the bottom of the logo
      const drips = [];
      
      // Create initial drips positioned at the bottom of the logo
      for (let i = 0; i < 7; i++) {
        // Space drips across the middle area of the canvas
        const x = canvas.width / 2 - 40 + Math.random() * 80;
        const y = 32; // Starting position adjusted to be closer to the logo
        const color = colors[Math.floor(Math.random() * colors.length)];
        drips.push(new PaintDrip(x, y, color));
      }
      
      return drips;
    }
    
    dripsRef.current = createInitialDrips();
    
    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw existing drips
      dripsRef.current = dripsRef.current.filter(drip => {
        drip.update();
        drip.draw(ctx);
        return !drip.isDead();
      });
      
      // Random chance to add new drips
      if (Math.random() < 0.03 && dripsRef.current.length < 15) {
        const x = canvas.width / 2 - 40 + Math.random() * 80;
        const y = 32; // Starting position adjusted to be closer to the logo
        const color = colors[Math.floor(Math.random() * colors.length)];
        dripsRef.current.push(new PaintDrip(x, y, color));
      }
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    return () => {
      // Cleanup
      dripsRef.current = [];
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none z-[5]"
      style={{ top: '32px' }} // Adjusted position to align perfectly with the bottom of the logo
    />
  );
};

export default PaintDrip;