
/**
 * @file App.tsx
 * @description Main Controller. Camera is now persistent at the bottom.
 */

import React, { useState, useEffect, useCallback } from 'react';
import Camera from './components/Camera';
import Gallery from './components/Gallery';
import PhotoEditor from './components/PhotoEditor';
import DraggablePhoto from './components/DraggablePhoto';
import Guide from './components/Guide';
import { generatePolaroid } from './services/imageProcessing';
import { savePhoto, getPhotos, deletePhoto } from './services/storageService';
import { Photo, EditConfig, Language } from './types';
import { Grid, Languages, Camera as CameraIcon, Image as ImageIcon, Github } from 'lucide-react';
import { t } from './locales';

type View = 'camera' | 'gallery';

function App() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [lang, setLang] = useState<Language>('en'); // Default EN for "Gen Z" feel
  const [currentView, setCurrentView] = useState<View>('camera');
  
  const [showGuide, setShowGuide] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [floatingPhotos, setFloatingPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    getPhotos().then(data => {
      setPhotos(data);
      if (data.length === 0) setTimeout(() => setShowGuide(true), 1500);
    });
  }, []);

  const toggleLang = () => setLang(prev => prev === 'en' ? 'zh' : 'en');

  const handleCaptureInit = useCallback((file: File) => setSelectedFile(file), []);

  const handlePrint = useCallback(async (config: EditConfig) => {
    if (!selectedFile) return;
    const fileToProcess = selectedFile;
    setSelectedFile(null); 
    setIsProcessing(true);
    
    try {
      const dataUrl = await generatePolaroid(fileToProcess, config);
      const newPhoto: Photo = {
        id: Date.now().toString(),
        dataUrl,
        originalUrl: URL.createObjectURL(fileToProcess),
        createdAt: Date.now(),
        filter: config.filter,
        caption: config.caption,
        frameType: config.frameType
      };
      
      setFloatingPhotos(prev => [...prev, newPhoto]);
      setIsProcessing(false);
      setCurrentView('camera');
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  }, [selectedFile]);

  const handleSaveToGallery = async (photo: Photo) => {
    if (photos.some(p => p.id === photo.id)) return;
    await savePhoto(photo);
    setPhotos(prev => [photo, ...prev]);
  };

  const handleDeleteFromGallery = async (id: string) => {
    if (confirm(t(lang, 'confirmDelete'))) {
      await deletePhoto(id);
      setPhotos(prev => prev.filter(p => p.id !== id));
    }
  };

  // Ejection Origin: Bottom center of screen, slightly up from bottom edge
  const getEjectOrigin = () => {
    const isMobile = window.innerWidth < 768;
    return {
      x: window.innerWidth / 2 - (isMobile ? 128 : 128), // Center (card width ~256)
      y: window.innerHeight - 180 // Start exactly at the slot line
    };
  };
  const ejectOrigin = getEjectOrigin();

  return (
    <div className="h-screen w-screen flex flex-col bg-[#e0dfd5] font-sans overflow-hidden fixed inset-0">
      
      {/* --- Overlays --- */}
      {showGuide && <Guide onDismiss={() => setShowGuide(false)} lang={lang} />}
      
      {selectedFile && (
        <PhotoEditor 
          file={selectedFile} 
          onConfirm={handlePrint} 
          onCancel={() => setSelectedFile(null)} 
          lang={lang}
        />
      )}

      {/* Floating Photos (Z-Index High) - Only visible in Camera View */}
      {currentView === 'camera' && floatingPhotos.map((photo) => (
        <DraggablePhoto 
          key={photo.id} 
          photo={photo} 
          initialX={ejectOrigin.x} 
          initialY={ejectOrigin.y}
          onDelete={(id) => setFloatingPhotos(prev => prev.filter(p => p.id !== id))}
          onSave={handleSaveToGallery}
        />
      ))}

      {/* --- Header --- */}
      <header className="absolute top-0 left-0 right-0 z-30 p-4 flex justify-between items-center pointer-events-none">
        {/* Title */}
        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm pointer-events-auto flex items-center gap-2">
            <div className="w-4 h-4 bg-pola-red rounded-full animate-pulse"></div>
            <span className="font-mono font-bold tracking-tighter">{t(lang, 'appTitle')}</span>
        </div>

        {/* Controls */}
        <div className="flex gap-3 pointer-events-auto">
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

      {/* --- Main Content Area --- */}
      <main className="flex-grow relative w-full h-full overflow-hidden">
        
        {/* VIEW: GALLERY OVERLAY */}
        {currentView === 'gallery' && (
          <div className="absolute inset-0 z-20 bg-[#e0dfd5]/95 backdrop-blur-sm overflow-y-auto animate-fade-in pt-20 pb-40">
              <div className="max-w-6xl mx-auto px-4">
                  <div className="flex justify-between items-end mb-8 border-b border-gray-400/30 pb-4">
                    <h2 className="text-4xl font-bold text-gray-800 font-mono tracking-tighter">{t(lang, 'galleryTitle')}</h2>
                    <span className="font-mono text-sm">{photos.length} {t(lang, 'memories')}</span>
                  </div>
                  <Gallery photos={photos} onDelete={handleDeleteFromGallery} />
              </div>
          </div>
        )}

        {/* VIEW: CAMERA (Always at bottom) */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center justify-end">
            {/* The Camera Component */}
            <div className="w-full max-w-lg transform translate-y-4 md:translate-y-0 transition-transform">
                <Camera 
                   onCapture={handleCaptureInit} 
                   isProcessing={isProcessing} 
                   lang={lang}
                />
            </div>
        </div>

      </main>
    </div>
  );
}

export default App;
