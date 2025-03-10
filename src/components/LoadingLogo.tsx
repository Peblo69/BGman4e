import { motion } from 'framer-motion';

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
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const logoSize = sizeMap[size];
  
  // Container component based on fullScreen prop
  const Container = ({ children }: { children: React.ReactNode }) => 
    fullScreen ? (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        {children}
      </div>
    ) : (
      <div className="loading-container h-full py-6">
        {children}
      </div>
    );

  return (
    <Container>
      <motion.div 
        className="relative"
        animate={{ 
          scale: [1, 1.03, 1],
          filter: ['brightness(1)', 'brightness(1.1)', 'brightness(1)']
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className={`loading-logo ${logoSize}`}>
          <motion.div
            className="loading-glow"
            animate={{ 
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <img
            src="https://files.catbox.moe/tqqx05.png"
            alt="BulgarGPT Logo"
            className={`${logoSize} object-contain z-10 relative`}
          />
        </div>
      </motion.div>
      {message && (
        <motion.p 
          className="loading-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {message}
        </motion.p>
      )}
    </Container>
  );
}

export default LoadingLogo;