import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FirebaseAuthProvider } from './lib/firebase-auth-context';
import ImagesPage from './pages/ImagesPage';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import Sidebar from './components/Sidebar';
import SidebarToggle from './components/SidebarToggle';
import ParticlesBackground from './components/ParticlesBackground';

function App() {
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Handle sidebar width changes from the Sidebar component
  const handleSidebarResize = (width: number) => {
    setSidebarWidth(width);
  };

  // Toggle sidebar expanded state
  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  // Load navbar collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('navbarCollapsed');
    if (savedState) {
      setIsNavbarCollapsed(savedState === 'true');
    }
    
    // Check if device is mobile and collapse sidebar by default
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      setIsSidebarExpanded(false);
    }
  }, []);

  // Watch for changes in navbar collapsed state
  useEffect(() => {
    const handleStorageChange = () => {
      const savedState = localStorage.getItem('navbarCollapsed');
      if (savedState) {
        setIsNavbarCollapsed(savedState === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Add resize event listener to adjust sidebar on orientation change
  useEffect(() => {
    const handleResize = () => {
      // On very small screens, collapse the sidebar
      if (window.innerWidth < 480 && isSidebarExpanded) {
        setIsSidebarExpanded(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [isSidebarExpanded]);

  return (
    <FirebaseAuthProvider>
      <Router>
        <div className={`flex h-screen overflow-hidden ${isNavbarCollapsed ? 'navbar-collapsed' : ''}`}>
          {/* Particles Background */}
          <ParticlesBackground />
          
          {/* Sidebar - visible on all devices */}
          <Sidebar onResize={handleSidebarResize} isExpanded={isSidebarExpanded} onToggle={toggleSidebar} />
          
          {/* Sidebar Toggle Button */}
          <SidebarToggle isExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} />
          
          {/* Main Content - adjust left margin based on sidebar width */}
          <div 
            className="flex-1 flex flex-col w-full"
            style={{ 
              marginLeft: isSidebarExpanded ? `${sidebarWidth}px` : '0',
              transition: 'margin-left 0.3s ease'
            }}
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/images" element={<ImagesPage />} />
              <Route path="/chat/:id" element={<ChatPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </FirebaseAuthProvider>
  );
}

export default App;