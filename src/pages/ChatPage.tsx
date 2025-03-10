@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: 139, 92, 246; /* Purple */
  --secondary: 59, 130, 246; /* Blue */
  --background: 0, 0, 0; /* Black */
  --vh: 1vh; /* Fallback, will be updated by JS */
}

/* Base styles with mobile-first approach */
* {
  -webkit-tap-highlight-color: transparent; /* Remove tap highlight on iOS */
}

html {
  font-size: 16px;
  overscroll-behavior: none; /* Prevent iOS overscroll */
  height: 100%;
  width: 100%;
  position: fixed;
  overflow: hidden;
}

@media (max-width: 768px) {
  html {
    font-size: 15px;
  }
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  @apply bg-black text-white;
  overflow: hidden; /* Prevent double scrollbars */
  touch-action: manipulation; /* Improve touch responsiveness on mobile */
  overscroll-behavior: none; /* Prevent browser pull-to-refresh */
  height: 100%;
  width: 100%;
  position: fixed;
  /* Use the CSS variable for height on mobile */
  height: calc(var(--vh, 1vh) * 100);
}

#root {
  height: 100%;
  overflow: hidden;
  position: relative;
}

/* Custom scrollbar styles */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-transparent rounded-full;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-purple-900/80 rounded-full transition-all duration-200;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  @apply bg-purple-700;
}

/* Firefox */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: theme('colors.purple.900') transparent;
}

/* Hide scrollbar by default, show on hover */
.custom-scrollbar-hidden::-webkit-scrollbar {
  width: 0;
  height: 0;
  background: transparent;
}

.custom-scrollbar-hidden:hover::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

/* Invisible scrollbar - always hidden */
.invisible-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
  width: 0;
  height: 0;
}

.invisible-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

/* Canvas background animation */
.canvas-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

/* Logo animation and glowing effects */
.logo-text {
  font-family: 'Orbitron', sans-serif;
  letter-spacing: 1px;
  animation: textGlow 3s ease-in-out infinite;
  will-change: transform, text-shadow; /* Performance optimization */
}

.logo-text span {
  display: inline-block;
  transition: transform 0.3s ease;
  transform: translateZ(0); /* Force GPU acceleration */
}

.logo-text:hover span {
  transform: translateY(-2px);
}

@keyframes textGlow {
  0% {
    text-shadow: 0 0 10px rgba(139, 92, 246, 0.5),
                 0 0 20px rgba(139, 92, 246, 0.3);
  }
  50% {
    text-shadow: 0 0 20px rgba(139, 92, 246, 0.8),
                 0 0 30px rgba(139, 92, 246, 0.5);
  }
  100% {
    text-shadow: 0 0 10px rgba(139, 92, 246, 0.5),
                 0 0 20px rgba(139, 92, 246, 0.3);
  }
}

.animate-glow {
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    filter: brightness(1) drop-shadow(0 0 0px rgb(var(--primary)));
  }
  to {
    filter: brightness(1.2) drop-shadow(0 0 10px rgb(var(--primary)));
  }
}

.font-orbitron {
  font-family: 'Orbitron', sans-serif;
}

/* Gradient animations */
.animate-gradient {
  background-size: 200% 200%;
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

/* Button styles */
.btn-primary {
  @apply bg-gradient-to-r from-purple-600 to-blue-600 
         hover:from-purple-700 hover:to-blue-700
         text-white rounded-lg shadow-lg
         transition-all duration-300
         border border-white/10;
}

.btn-ghost {
  @apply bg-transparent border border-purple-500/30 
         hover:bg-purple-500/20 text-white
         transition-all duration-300;
}

.btn-icon {
  @apply flex items-center justify-center
         p-0 rounded-full
         bg-gradient-to-r from-purple-500/40 to-blue-500/40 
         hover:from-purple-500/60 hover:to-blue-500/60;
}

/* Glass effect for UI components */
.glass-effect {
  @apply bg-black/40 backdrop-blur-md border border-white/10 shadow-lg;
}

/* Chat input styles - optimized for mobile */
.chat-input-container {
  @apply relative rounded-xl overflow-hidden;
  transform: translateZ(0); /* Force GPU acceleration */
}

.chat-input-glow {
  @apply absolute -inset-[1px] rounded-xl
         bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-purple-500/50
         animate-pulse blur-md;
  will-change: opacity; /* Performance optimization */
}

.chat-input-bg {
  @apply absolute inset-0 rounded-xl
         bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10
         backdrop-blur-xl;
}

.chat-input {
  @apply w-full resize-none rounded-xl backdrop-blur-xl
         focus:ring-1 focus:ring-purple-500/20 focus-visible:ring-purple-500/20
         border-none shadow-lg relative z-10
         placeholder:text-gray-400;
  font-size: 16px !important; /* Prevent iOS zoom */
  transform: translateZ(0); /* Force GPU acceleration */
}

/* Special textarea container to center placeholder only */
.textarea-container {
  position: relative;
}

/* Center the placeholder text only */
.chat-input::placeholder {
  text-align: left;
  opacity: 0.6;
}

.scrollbar-custom {
  @apply scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-gray-900;
}

/* Message bubbles with responsive sizing */
.user-message {
  @apply inline-block text-base leading-relaxed break-words
         px-4 md:px-5 py-3 md:py-4 bg-purple-500/20 rounded-xl shadow-lg
         whitespace-pre-wrap font-['Segoe_UI',sans-serif];
}

.assistant-message {
  @apply inline-block text-base leading-relaxed break-words
         w-full whitespace-pre-wrap font-['Segoe_UI',sans-serif]
         text-gray-200;
}

/* Markdown styles */
.markdown {
  @apply text-base text-gray-300 leading-relaxed font-['Segoe_UI',sans-serif];
}

.markdown h1, 
.markdown h2, 
.markdown h3, 
.markdown h4, 
.markdown h5, 
.markdown h6 {
  @apply font-bold text-white my-3;
}

.markdown h1 {
  @apply text-xl md:text-2xl;
}

.markdown h2 {
  @apply text-lg md:text-xl;
}

.markdown h3 {
  @apply text-base md:text-lg;
}

.markdown p {
  @apply my-2;
}

.markdown ul, 
.markdown ol {
  @apply my-2 ml-4 md:ml-6;
}

.markdown ul {
  @apply list-disc;
}

.markdown ol {
  @apply list-decimal;
}

.markdown li {
  @apply my-1;
}

.markdown a {
  @apply text-purple-400 hover:text-purple-300 hover:underline;
}

.markdown code {
  @apply font-mono text-xs bg-purple-900/30 px-1 py-0.5 rounded;
}

.markdown pre {
  @apply bg-gray-900/60 p-3 rounded-md overflow-x-auto my-3;
}

.markdown pre code {
  @apply bg-transparent text-gray-300 p-0 block;
}

.markdown blockquote {
  @apply border-l-4 border-purple-500/50 pl-4 italic my-3 text-gray-400;
}

.markdown table {
  @apply w-full border-collapse my-3;
}

.markdown th {
  @apply bg-purple-900/30 p-2 text-left font-semibold;
}

.markdown td {
  @apply border border-gray-800 p-2;
}

.markdown strong {
  @apply font-bold text-purple-300;
}

.markdown em {
  @apply italic text-blue-300;
}

.markdown img {
  @apply max-w-full my-2 rounded-md;
}

.markdown hr {
  @apply my-4 border-gray-700;
}

.markdown-content a,
.markdown-content p,
.markdown-content ul,
.markdown-content ol,
.markdown-content blockquote,
.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  @apply my-2 px-4 py-2 rounded-md bg-purple-900/10 inline-block;
}

/* Loading animation */
.loading-container {
  @apply flex flex-col items-center justify-center;
}

.loading-logo {
  @apply relative w-16 h-16 md:w-24 md:h-24;
}

.loading-glow {
  @apply absolute inset-0 bg-gradient-to-r from-purple-500/40 to-blue-500/40 rounded-full blur-md;
}

.loading-text {
  @apply text-base md:text-lg mt-4 text-white;
}

/* Modal styles with mobile responsiveness */
.modal-backdrop {
  @apply fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4;
}

.modal-container {
  @apply fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4;
}

.modal-content {
  @apply bg-black/90 border border-purple-500/30 rounded-xl max-w-sm md:max-w-md w-full mx-auto overflow-hidden;
}

.modal-header {
  @apply p-3 md:p-4 flex items-center justify-between bg-gradient-to-r from-purple-900/60 to-purple-800/60 border-b border-purple-500/20;
}

.modal-body {
  @apply p-4 md:p-6 space-y-4;
}

/* Sidebar styles - optimized for mobile */
.sidebar {
  @apply bg-black/60 backdrop-blur-xl border-r border-white/10;
  transform: translateZ(0); /* Force GPU acceleration */
  will-change: transform, width; /* Performance optimization */
}

.sidebar-item {
  @apply flex items-center rounded px-3 py-3 cursor-pointer;
}

.sidebar-item-active {
  @apply text-white bg-purple-900;
}

.sidebar-item-inactive {
  @apply text-gray-300 hover:bg-gray-800;
}

/* Form element mobile responsiveness */
@media (max-width: 768px) {
  input, select, textarea {
    font-size: 16px !important; /* Prevent zoom on iOS */
  }
  
  .btn-primary, .btn-ghost {
    @apply py-2.5 text-sm; /* Slightly larger touch targets */
  }
}

/* Handle notch/safe areas on mobile */
@supports (padding: max(0px)) {
  body {
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
    padding-bottom: env(safe-area-inset-bottom);
  }
}

/* Prevent text selection on mobile */
.no-select {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
