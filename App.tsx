  /**
   * @file App.tsx
   * @description Main Controller. Manages persistent floating state and user profiles.
   */

  import React, { useState, useEffect, useCallback, useRef } from 'react';
  import Camera from './components/Camera';
  import Gallery from './components/Gallery';
  import PhotoEditor from './components/PhotoEditor';
  import DraggablePhoto from './components/DraggablePhoto';
  import Guide from './components/Guide';
  import AuthModal from './components/AuthModal';
  import EditProfileModal from './components/EditProfileModal';
  import AboutModal from './components/AboutModal';
  import Notification from './components/Notification';
  import { generatePolaroid } from './services/imageProcessing';
  import { savePhoto, getPhotos, deletePhoto } from './services/storageService';
  import { getProfile } from './services/userService';
  import { supabase } from './supabaseClient';
  import { Photo, EditConfig, Language, FloatingPhoto, UserProfile, CameraSkin } from './types';
  import { Grid, Camera as CameraIcon, Sparkles, LayoutGrid, Sun, Moon, Palette } from 'lucide-react';
  import { t } from './locales';

  type View = 'camera' | 'gallery';

  const AmbientText = ({ lang }: { lang: Language }) => {
    const [textIndex, setTextIndex] = useState(0);
    const texts = lang === 'en' 
      ? ["Capture the vibe.", "Make it retro.", "Digital Nostalgia.", "Snap something cool."] 
      : ["捕捉此刻的氛围", "定格瞬间", "赛博复古体验", "来一张吧"];

    useEffect(() => {
      const interval = setInterval(() => {
        setTextIndex(prev => (prev + 1) % texts.length);
      }, 4000);
      return () => clearInterval(interval);
    }, [lang]);


    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none overflow-hidden">
        <div key={textIndex} className="animate-fade-in text-center transition-opacity duration-500">
            {/* 
                Visual Update:
                - Day: text-[#d6c0a0]/25 (Subtle Kraft) for a warm watermark look.
                - Night: text-zinc-800 for deep industrial background.
            */}
            <h2 className="text-4xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase whitespace-nowrap transform text-[#d6c0a0]/25 drop-shadow-sm dark:text-zinc-800 dark:drop-shadow-none">
              <span className="flex flex-col items-center gap-4 justify-center">
                {/* Responsive Star Size: Slightly smaller than text */}
                <Sparkles className="w-8 h-8 md:w-28 md:h-28 text-[#ffe974] mb-2 dark:opacity-40 transition-all duration-300" />
                <span>{texts[textIndex]}</span>
              </span>
            </h2>
        </div>
      </div>
    );
  };

  function App() {
    // Theme State
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Logic State
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [lang, setLang] = useState<Language>('zh'); 
    const [currentView, setCurrentView] = useState<View>('camera');
    const [currentSkin, setCurrentSkin] = useState<CameraSkin>('original');
    
    const [showGuide, setShowGuide] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Auth & User State
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [session, setSession] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    
    // New UI States
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    
    // --- Persistent Floating State ---
    const [floatingPhotos, setFloatingPhotos] = useState<FloatingPhoto[]>([]);
    const zIndexCounter = useRef(100);

    // 0. Theme Effect
    useEffect(() => {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, [theme]);

    // 1. Initialize Auth Listener
    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session) fetchUserProfile(session.user.id);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) {
          fetchUserProfile(session.user.id);
          getPhotos(session.user.id).then(setPhotos);
          // Don't show guide if logged in
          setShowGuide(false);
        } else {
          setUserProfile(null);
          getPhotos().then(data => {
              setPhotos(data);
              if (data.length === 0) setTimeout(() => setShowGuide(true), 1500);
          });
        }
      });

      return () => subscription.unsubscribe();
    }, []);

    const fetchUserProfile = async (userId: string) => {
      const profile = await getProfile(userId);
      if (profile) setUserProfile(profile);
    };

    const handleLoginSuccess = (isSignUp: boolean) => {
      if (!isSignUp && userProfile) {
          // Will be triggered after profile load, or we can just show generic
      }
    };

    // Show welcome notification when profile loads
    useEffect(() => {
      if (userProfile && session) {
          setNotification(`${t(lang, 'welcome.back')}${userProfile.username}`);
      }
    }, [userProfile, session, lang]);


    const toggleLang = () => setLang(prev => prev === 'en' ? 'zh' : 'en');
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const toggleSkin = () => {
      const skins: CameraSkin[] = ['original', 'crimson', 'silver', 'alpha', 'lumix'];
      const currentIndex = skins.indexOf(currentSkin);
      const nextSkin = skins[(currentIndex + 1) % skins.length];
      setCurrentSkin(nextSkin);
      setNotification(`${t(lang, `skins.${nextSkin}` as any)}`);
    };

    const getEjectOrigin = () => {
      const isMobile = window.innerWidth < 768;
      const cardWidth = isMobile ? 180 : 280;
      return {
        x: window.innerWidth / 2 - (cardWidth / 2),
        y: window.innerHeight - (isMobile ? 260 : 400) 
      };
    };

    const [ejectOrigin, setEjectOrigin] = useState(getEjectOrigin());

    useEffect(() => {
        const handleResize = () => setEjectOrigin(getEjectOrigin());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleCaptureInit = useCallback((file: File) => setSelectedFile(file), []);

    const handlePrint = useCallback(async (config: EditConfig) => {
      if (!selectedFile) return;
      const fileToProcess = selectedFile;
      setSelectedFile(null); 
      setIsProcessing(true);
      
      try {
        const dataUrl = await generatePolaroid(fileToProcess, config);
        
        const isMobile = window.innerWidth < 768;
        const cardWidth = isMobile ? 180 : 280;
        const safeW = window.innerWidth - cardWidth - 20;
        const safeH = window.innerHeight - 350;
        
        const targetX = 10 + Math.random() * Math.max(0, safeW);
        const targetY = 80 + Math.random() * Math.max(0, safeH);
        
        zIndexCounter.current += 1;

        const newPhoto: FloatingPhoto = {
          id: crypto.randomUUID(), // Use UUID for Supabase compatibility
          dataUrl,
          originalUrl: URL.createObjectURL(fileToProcess),
          createdAt: Date.now(),
          filter: config.filter,
          caption: config.caption,
          frameType: config.frameType,
          x: targetX,
          y: targetY,
          rotation: (Math.random() * 10) - 5,
          scale: 1,
          zIndex: zIndexCounter.current,
          isNew: true, 
          isSaved: false
        };
        
        setFloatingPhotos(prev => [...prev, newPhoto]);
        setIsProcessing(false);
        setCurrentView('camera');
      } catch (error) {
        console.error(error);
        setIsProcessing(false);
      }
    }, [selectedFile]);

    // --- Handlers ---
    const handleUpdateFloating = (id: string, updates: Partial<FloatingPhoto>) => {
      setFloatingPhotos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const handleBringToFront = (id: string) => {
      zIndexCounter.current += 1;
      handleUpdateFloating(id, { zIndex: zIndexCounter.current });
    };

    const handleDeleteFloating = (id: string) => {
      setFloatingPhotos(prev => prev.filter(p => p.id !== id));
    };

    const handleResetSinglePhoto = (id: string) => {
      const isMobile = window.innerWidth < 768;
      const cardWidth = isMobile ? 180 : 280;
      setFloatingPhotos(prev => prev.map(p => {
          if (p.id !== id) return p;
          let newX = p.x;
          let newY = p.y;
          if (newX < 0) newX = 10;
          if (newX > window.innerWidth - cardWidth) newX = window.innerWidth - cardWidth - 10;
          if (newY < 80) newY = 80;
          if (newY > window.innerHeight - 200) newY = window.innerHeight - 300;
          return { ...p, x: newX, y: newY, rotation: 0, scale: 1 };
      }));
    };

    const handleResetLayout = () => {
      const isMobile = window.innerWidth < 768;
      const cardW = isMobile ? 180 : 280;
      const cardH = isMobile ? 220 : 340;
      const viewportW = window.innerWidth;
      const cols = isMobile ? 2 : Math.max(2, Math.floor((viewportW - 40) / (cardW + 20)));
      const totalGridW = cols * cardW + (cols - 1) * 20;
      const startX = Math.max(10, (viewportW - totalGridW) / 2);
      const startY = 100;

      setFloatingPhotos(prev => prev.map((p, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          return {
              ...p,
              x: startX + col * (cardW + 20),
              y: startY + row * (cardH + 20),
              rotation: (Math.random() * 4) - 2,
              scale: 1,
              zIndex: index + 100
          };
      }));
      zIndexCounter.current = 100 + floatingPhotos.length;
    };

    const handleToggleSave = async (photo: Photo) => {
      const userId = session?.user?.id;
      const isAlreadySaved = photos.some(p => p.id === photo.id);

      if (isAlreadySaved) {
          try {
              await deletePhoto(photo.id, userId);
              setPhotos(prev => prev.filter(p => p.id !== photo.id));
              setFloatingPhotos(prev => prev.map(p => 
                  p.id === photo.id ? { ...p, isSaved: false } : p
              ));
          } catch (e) {
              console.error("Failed to unsave", e);
          }
      } else {
          try {
              await savePhoto(photo, userId);
              setPhotos(prev => [photo, ...prev]);
              setFloatingPhotos(prev => prev.map(p => 
                  p.id === photo.id ? { ...p, isSaved: true } : p
              ));
          } catch (e) {
              console.error("Failed to save", e);
          }
      }
    };

    return (
      <div className="h-screen w-screen flex flex-col bg-[#e0dfd5] dark:bg-zinc-950 font-sans overflow-hidden fixed inset-0 transition-colors duration-500">
        
        {/* Toast Notification */}
        {notification && (
          <Notification message={notification} onClose={() => setNotification(null)} />
        )}

        {showGuide && <Guide onDismiss={() => setShowGuide(false)} lang={lang} />}
        
        {currentView === 'camera' && floatingPhotos.length === 0 && !selectedFile && !showGuide && (
          <AmbientText lang={lang} />
        )}

        {/* --- Header --- */}
        <header className="absolute top-0 left-0 right-0 z-[1000] p-4 flex justify-between items-center pointer-events-none">
          
          {/* Logo / Brand */}
          <button 
            onClick={() => setShowAboutModal(true)}
            className="bg-white/90 dark:bg-zinc-800/80 backdrop-blur px-4 py-2 rounded-full shadow-sm pointer-events-auto flex items-center gap-2 hover:scale-105 transition-transform"
          >
              <div className="w-4 h-4 bg-pola-red rounded-full animate-pulse"></div>
              <span className="font-mono font-bold tracking-tighter text-sm md:text-base dark:text-zinc-100">{t(lang, 'appTitle')}</span>
          </button>

          <div className="flex gap-3 pointer-events-auto">
              <button 
                  onClick={handleResetLayout}
                  disabled={floatingPhotos.length === 0}
                  className={`bg-white/90 dark:bg-zinc-800/80 backdrop-blur p-2 rounded-full shadow-sm transition-all hover:scale-110 
                    ${floatingPhotos.length === 0 ? 'text-gray-300 dark:text-zinc-600 cursor-default hover:scale-100' : 'text-gray-600 dark:text-zinc-300 hover:text-pola-accent cursor-pointer'}
                  `}
                  title={t(lang, 'resetLayout')}
              >
                  <LayoutGrid size={20} />
              </button>

              {/* Skin Toggle */}
              <button 
                  onClick={toggleSkin}
                  className="bg-white/90 dark:bg-zinc-800/80 backdrop-blur p-2 rounded-full shadow-sm text-gray-600 dark:text-zinc-200 transition-all hover:scale-110"
                  title="Change Skin"
              >
                  <Palette size={20} />
              </button>

              {/* Theme Toggle */}
              <button 
                  onClick={toggleTheme}
                  className="bg-white/90 dark:bg-zinc-800/80 backdrop-blur p-2 rounded-full shadow-sm text-gray-600 dark:text-zinc-200 transition-all hover:scale-110"
                  title={t(lang, theme === 'light' ? 'theme.dark' : 'theme.light')}
              >
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              <button 
                onClick={toggleLang}
                className="bg-white/90 dark:bg-zinc-800/80 backdrop-blur p-2 rounded-full shadow-sm text-sm font-bold w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform dark:text-zinc-200"
              >
                {lang === 'en' ? '中' : 'En'}
              </button>
              
              <button 
                  onClick={() => setCurrentView(v => v === 'camera' ? 'gallery' : 'camera')}
                  className={`p-2 rounded-full shadow-sm w-10 h-10 flex items-center justify-center transition-all hover:scale-110
                    ${currentView === 'gallery' ? 'bg-black text-white dark:bg-zinc-100 dark:text-zinc-900' : 'bg-white text-black dark:bg-zinc-800 dark:text-zinc-100'}
                  `}
              >
                  {currentView === 'gallery' ? <CameraIcon size={18} /> : <Grid size={18} />}
              </button>
          </div>
        </header>

        {/* --- Main Content --- */}
        <main className="flex-grow relative w-full h-full overflow-hidden">
          
          {/* Gallery View */}
          {currentView === 'gallery' && (
            <div className="absolute inset-0 z-20 bg-[#f4f2ef] dark:bg-zinc-900 overflow-y-auto animate-fade-in scroll-smooth transition-colors duration-300">
              <Gallery 
                  photos={photos} 
                  onToggle={handleToggleSave} 
                  userProfile={userProfile}
                  lang={lang}
                  onLogin={() => setShowAuthModal(true)}
                  onLogout={() => supabase.auth.signOut()}
                  onEditProfile={() => setShowEditProfileModal(true)}
              />
            </div>
          )}

          {/* Floating Photos */}
          {currentView === 'camera' && floatingPhotos.map((photo) => (
            <DraggablePhoto 
              key={photo.id} 
              photo={photo} 
              initialOrigin={ejectOrigin}
              onUpdate={handleUpdateFloating}
              onFocus={handleBringToFront}
              onDelete={handleDeleteFloating}
              onSave={handleToggleSave}
              onReset={() => handleResetSinglePhoto(photo.id)}
            />
          ))}

          {/* Camera (Always at bottom) */}
          <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center justify-end pointer-events-none">
              <div className="w-full flex justify-center transform translate-y-4 md:translate-y-0 transition-transform">
                  <Camera 
                    onCapture={handleCaptureInit} 
                    isProcessing={isProcessing} 
                    lang={lang}
                    skin={currentSkin}
                  />
              </div>
          </div>

        </main>

        {/* Modals */}
        {selectedFile && (
          <PhotoEditor 
            file={selectedFile} 
            onConfirm={handlePrint} 
            onCancel={() => setSelectedFile(null)} 
            lang={lang}
          />
        )}

        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)} 
            lang={lang} 
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {showEditProfileModal && userProfile && (
          <EditProfileModal 
            profile={userProfile} 
            lang={lang} 
            onClose={() => setShowEditProfileModal(false)}
            onUpdate={setUserProfile}
          />
        )}

        {showAboutModal && (
          <AboutModal onClose={() => setShowAboutModal(false)} lang={lang} />
        )}
      </div>
    );
  }

  export default App;