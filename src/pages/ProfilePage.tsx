import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, MessageSquare, ImageIcon, LogOut } from 'lucide-react';
import { useFirebaseAuth } from '../lib/firebase-auth-context';
import LoadingLogo from '../components/LoadingLogo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ProfileSettings } from '../components/profile/ProfileSettings';

// Separate profile content component for better performance
const ProfileContent = ({ user, userProfile, logout }: any) => {
  const [activeTab, setActiveTab] = useState('settings');
  
  return (
    <div className="max-w-4xl mx-auto w-full">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-purple-500/30 blur-md" />
        <div className="relative bg-black/40 backdrop-blur-xl rounded-xl p-8 border border-white/10">
          {/* User Account Section (moved from sidebar) */}
          <div className="mb-8 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/30 flex items-center justify-center">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.displayName || user.email}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            
            {userProfile?.isPremium && (
              <div className="inline-block bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg px-3 py-1 text-center">
                <span className="text-sm text-yellow-400 font-medium">Premium план</span>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold font-orbitron bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Профил и настройки
            </h1>
            <p className="text-muted-foreground mt-2">
              Управлявайте вашия акаунт и персонализирайте BulgarGPT според вашите нужди
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-8 w-full">
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Настройки</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Активност</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="min-h-[400px]">
              <ProfileSettings />
            </TabsContent>
            
            <TabsContent value="activity" className="min-h-[400px]">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Активност на профила</h3>
                  <p className="text-sm text-muted-foreground">
                    Преглед на вашата активност в платформата
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                      <h4 className="font-medium">Съобщения</h4>
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {userProfile?.messageCount || 0}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Общ брой изпратени съобщения
                    </p>
                  </div>
                  
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-5 h-5 text-blue-400" />
                      <h4 className="font-medium">Изображения</h4>
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {userProfile?.imageCount || 0}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Общ брой генерирани изображения
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-900/50 border border-white/5 rounded-lg p-4 mt-6">
                  <h4 className="font-medium mb-3">Информация за акаунта</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Създаден на:</span>
                      <span>
                        {new Date().toLocaleDateString('bg-BG')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Последно влизане:</span>
                      <span>
                        {new Date().toLocaleDateString('bg-BG')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => {
                      logout();
                      window.location.href = '/'; // Use direct navigation
                    }}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Изход от акаунта</span>
                  </button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
};

function ProfilePage() {
  const { user, isLoading, logOut } = useFirebaseAuth();
  const [isPageReady, setIsPageReady] = useState(false);

  // Optimize the auth check for faster rendering
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        window.location.href = '/'; // Use direct navigation instead of router
      } else {
        // Set a small delay to ensure Firebase data is loaded
        const timer = setTimeout(() => {
          setIsPageReady(true);
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, user]);

  // Mock user profile data
  const userProfile = {
    messageCount: 42,
    imageCount: 15,
    isPremium: false
  };

  // Show logo loading UI when Firebase is checking auth
  if (isLoading) {
    return <LoadingLogo message="Зареждане на профила..." fullScreen={true} />;
  }

  // Redirect in the useEffect above
  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto custom-scrollbar">
      {isPageReady ? (
        <ProfileContent user={user} userProfile={userProfile} logout={logOut} />
      ) : (
        <LoadingLogo message="Зареждане на профилна информация..." />
      )}
    </div>
  );
}

export default ProfilePage;