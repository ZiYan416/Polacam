
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
import { generatePolaroid } from './services/imageProcessing';
import { savePhoto, getPhotos, deletePhoto } from './services/storageService';
import { getProfile } from './services/userService';
import { supabase } from './supabaseClient';
import { Photo, EditConfig, Language, FloatingPhoto, UserProfile } from './types';
import { Grid, Camera as CameraIcon, Sparkles, LayoutGrid } from 'lucide-react';
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
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-30 select-none">
       <div key={textIndex} className="animate-fade-in text-center">
          <Sparkles className="mx-auto mb-2 text-gray-400" size={24} />
          <h2 className="text-3xl md:text-5xl font-mono font-bold text-gray-400 tracking-widest uppercase">
            {texts[textIndex]}
          </h2>
       </div>
    </div>
  );
};

function App() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [lang, setLang] = useState<Language>('zh'); // Default to Chinese as requested
  const [currentView, setCurrentView] = useState<View>('camera');
  
  const [showGuide, setShowGuide] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Auth & User State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // --- Persistent Floating State ---
  const [floatingPhotos, setFloatingPhotos] = useState<FloatingPhoto[]>([]);
  const zIndexCounter = useRef(100);

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
         // Reload photos when user switches
         getPhotos(session.user.id).then(setPhotos);
      } else {
         setUserProfile(null);
         // Load guest photos
         getPhotos().then(setPhotos);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const profile = await getProfile(userId);
    if (profile) setUserProfile(profile);
  };

  // 2. Load Photos (Initial)
  useEffect(() => {
    const userId = session?.user?.id;
    getPhotos(userId).then(data => {
      setPhotos(data);
      if (data.length === 0 && !session) setTimeout(() => setShowGuide(true), 1500);
    });
  }, [session]);

  const toggleLang = () => setLang(prev => prev === 'en' ? 'zh' : 'en');

  // Ejection Origin Calculation
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
        id: Date.now().toString(),
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
    <div className="h-screen w-screen flex flex-col bg-[#e0dfd5] font-sans overflow-hidden fixed inset-0">
      
      {showGuide && <Guide onDismiss={() => setShowGuide(false)} lang={lang} />}
      
      {currentView === 'camera' && floatingPhotos.length === 0 && !selectedFile && !showGuide && (
         <AmbientText lang={lang} />
      )}

      {/* --- Header --- */}
      <header className="absolute top-0 left-0 right-0 z-[1000] p-4 flex justify-between items-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm pointer-events-auto flex items-center gap-2">
            <div className="w-4 h-4 bg-pola-red rounded-full animate-pulse"></div>
            <span className="font-mono font-bold tracking-tighter text-sm md:text-base">{t(lang, 'appTitle')}</span>
        </div>

        <div className="flex gap-3 pointer-events-auto">
             <button 
                onClick={handleResetLayout}
                disabled={floatingPhotos.length === 0}
                className={`bg-white/90 backdrop-blur p-2 rounded-full shadow-sm transition-all hover:scale-110 
                   ${floatingPhotos.length === 0 ? 'text-gray-300 cursor-default hover:scale-100' : 'text-gray-600 hover:text-pola-accent cursor-pointer'}
                `}
                title={t(lang, 'resetLayout')}
             >
                <LayoutGrid size={20} />
             </button>

             <button 
               onClick={toggleLang}
               className="bg-white/90 backdrop-blur p-2 rounded-full shadow-sm text-sm font-bold w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform"
             >
               {lang === 'en' ? '中' : 'En'}
             </button>
             
             <button 
                onClick={() => setCurrentView(v => v === 'camera' ? 'gallery' : 'camera')}
                className={`p-2 rounded-full shadow-sm w-10 h-10 flex items-center justify-center transition-all hover:scale-110
                  ${currentView === 'gallery' ? 'bg-black text-white' : 'bg-white text-black'}
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
          <div className="absolute inset-0 z-20 bg-[#f4f2ef] overflow-y-auto animate-fade-in scroll-smooth">
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

        {/* Floating Photos (Only visible in Camera view) */}
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
        <AuthModal onClose={() => setShowAuthModal(false)} lang={lang} />
      )}

      {showEditProfileModal && userProfile && (
        <EditProfileModal 
          profile={userProfile} 
          lang={lang} 
          onClose={() => setShowEditProfileModal(false)}
          onUpdate={setUserProfile}
        />
      )}
    </div>
  );
}

export default App;
