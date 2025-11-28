
/**
 * @file App.tsx
 * @description Main Controller. Manages persistent floating state.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Camera from './components/Camera';
import Gallery from './components/Gallery';
import PhotoEditor from './components/PhotoEditor';
import DraggablePhoto from './components/DraggablePhoto';
import Guide from './components/Guide';
import { generatePolaroid } from './services/imageProcessing';
import { savePhoto, getPhotos, deletePhoto } from './services/storageService';
import { Photo, EditConfig, Language, FloatingPhoto } from './types';
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
  const [lang, setLang] = useState<Language>('en'); 
  const [currentView, setCurrentView] = useState<View>('camera');
  
  const [showGuide, setShowGuide] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // --- Persistent Floating State ---
  // Store full visual state here
  const [floatingPhotos, setFloatingPhotos] = useState<FloatingPhoto[]>([]);
  const zIndexCounter = useRef(100);

  useEffect(() => {
    getPhotos().then(data => {
      setPhotos(data);
      if (data.length === 0) setTimeout(() => setShowGuide(true), 1500);
    });
  }, []);

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
      
      // Calculate random final position
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
        // Floating State
        x: targetX,
        y: targetY,
        rotation: (Math.random() * 10) - 5,
        scale: 1,
        zIndex: zIndexCounter.current,
        isNew: true, // Trigger animation
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

  // --- Floating Interaction Handlers ---

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

  const handleResetLayout = () => {
    // Organize in a neat grid centered on screen
    const isMobile = window.innerWidth < 768;
    const cardW = isMobile ? 180 : 280;
    const cardH = isMobile ? 220 : 340; // Approx height
    
    const viewportW = window.innerWidth;
    const cols = isMobile ? 2 : Math.floor((viewportW - 40) / (cardW + 20));
    
    // Calculate total grid width to center it
    const totalGridW = cols * cardW + (cols - 1) * 20;
    const startX = (viewportW - totalGridW) / 2;
    const startY = 100; // Top padding

    setFloatingPhotos(prev => {
        // We create a new array to force state update
        return prev.map((p, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            return {
                ...p,
                x: startX + col * (cardW + 20),
                y: startY + row * (cardH + 20),
                rotation: (Math.random() * 4) - 2, // Slight organic variation
                scale: 1,
                zIndex: index + 100 // Reset Z-index stack
            };
        });
    });
    zIndexCounter.current = 100 + floatingPhotos.length;
  };

  // --- Gallery Handlers ---

  const handleSaveToGallery = async (photo: Photo) => {
    if (photos.some(p => p.id === photo.id)) return;
    await savePhoto(photo);
    setPhotos(prev => [photo, ...prev]);
    
    // Fix: Persist the saved state in the floating photo object
    setFloatingPhotos(prev => prev.map(p => 
      p.id === photo.id ? { ...p, isSaved: true } : p
    ));
  };

  const handleDeleteFromGallery = async (id: string) => {
    if (confirm(t(lang, 'confirmDelete'))) {
      await deletePhoto(id);
      setPhotos(prev => prev.filter(p => p.id !== id));
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
             {/* Reset Layout Button - Always Visible now */}
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
          <div className="absolute inset-0 z-20 bg-[#e0dfd5]/95 backdrop-blur-sm overflow-y-auto animate-fade-in pt-20 pb-40">
              <div className="max-w-6xl mx-auto px-4">
                  <div className="flex justify-between items-end mb-8 border-b border-gray-400/30 pb-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 font-mono tracking-tighter">{t(lang, 'galleryTitle')}</h2>
                    <span className="font-mono text-xs md:text-sm">{photos.length} {t(lang, 'memories')}</span>
                  </div>
                  <Gallery photos={photos} onDelete={handleDeleteFromGallery} />
              </div>
          </div>
        )}

        {/* Floating Photos (Only visible in Camera view, but state persists) */}
        {currentView === 'camera' && floatingPhotos.map((photo) => (
          <DraggablePhoto 
            key={photo.id} 
            photo={photo} 
            initialOrigin={ejectOrigin}
            onUpdate={handleUpdateFloating}
            onFocus={handleBringToFront}
            onDelete={handleDeleteFloating}
            onSave={handleSaveToGallery}
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

      {/* Editor Modal */}
      {selectedFile && (
        <PhotoEditor 
          file={selectedFile} 
          onConfirm={handlePrint} 
          onCancel={() => setSelectedFile(null)} 
          lang={lang}
        />
      )}
    </div>
  );
}

export default App;
