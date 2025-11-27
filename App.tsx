/**
 * @file App.tsx
 * @description Main Application Controller.
 * Updated to support View Switching and Manual Saving.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Camera from './components/Camera';
import Gallery from './components/Gallery';
import PhotoEditor from './components/PhotoEditor';
import DraggablePhoto from './components/DraggablePhoto';
import Guide from './components/Guide';
import { generatePolaroid } from './services/imageProcessing';
import { savePhoto, getPhotos, deletePhoto } from './services/storageService';
import { Photo, EditConfig, Language } from './types';
import { Grid, Languages, Camera as CameraIcon, Image as ImageIcon } from 'lucide-react';
import { t } from './locales';

type View = 'camera' | 'gallery';

function App() {
  // --- Global State ---
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [lang, setLang] = useState<Language>('zh');
  const [currentView, setCurrentView] = useState<View>('camera');
  
  const [showGuide, setShowGuide] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // --- Capture & Edit State ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Floating Photos (Active draggable overlays in Camera View)
  const [floatingPhotos, setFloatingPhotos] = useState<Photo[]>([]);

  // Initial Data Load
  useEffect(() => {
    getPhotos().then(data => {
      setPhotos(data);
      if (data.length === 0) {
        setTimeout(() => setShowGuide(true), 1500);
      }
    });
  }, []);

  const toggleLang = () => setLang(prev => prev === 'en' ? 'zh' : 'en');

  const handleCaptureInit = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleCancelEdit = () => {
    setSelectedFile(null);
  };

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
      };

      // NOTE: We do NOT save to storage automatically anymore.
      // We just add it to the floating state. User must click "Save" on the photo.
      
      setFloatingPhotos(prev => [...prev, newPhoto]);
      setIsProcessing(false);
      
      // Ensure we are on camera view to see the result
      setCurrentView('camera');

    } catch (error) {
      console.error("Error creating polaroid:", error);
      setIsProcessing(false);
      alert("Something went wrong processing your image.");
    }
  }, [selectedFile]);

  const handleSaveToGallery = async (photo: Photo) => {
    // Check if already exists to prevent dupes (though ID is unique timestamp)
    if (photos.some(p => p.id === photo.id)) return;

    try {
      await savePhoto(photo);
      setPhotos(prev => [photo, ...prev]);
      // We don't remove it from floating, just mark it saved (handled in PhotoCard)
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFromGallery = async (id: string) => {
    if (confirm(t(lang, 'confirmDelete'))) {
      await deletePhoto(id);
      setPhotos(prev => prev.filter(p => p.id !== id));
    }
  };

  const dismissFloating = (id: string) => {
    setFloatingPhotos(prev => prev.filter(p => p.id !== id));
  };

  // Determine Camera Slot Position for Ejection origin
  // Simplified: center of screen horizontally, and slightly below the header.
  const getEjectOrigin = () => {
    const isMobile = window.innerWidth < 768;
    return {
      x: window.innerWidth / 2 - (isMobile ? 120 : 144), // Centered - half card width
      y: isMobile ? 320 : 380 // Approximate slot Y position based on Camera CSS
    };
  };

  const ejectOrigin = getEjectOrigin();

  return (
    <div className="min-h-screen flex flex-col bg-[#e8e8e3] font-sans overflow-x-hidden">
      
      {/* --- Overlays --- */}
      {showGuide && <Guide onDismiss={() => setShowGuide(false)} lang={lang} />}
      
      {selectedFile && (
        <PhotoEditor 
          file={selectedFile} 
          onConfirm={handlePrint}
          onCancel={handleCancelEdit}
          lang={lang}
        />
      )}

      {/* Floating Photos Layer (Only visible in Camera View) */}
      {currentView === 'camera' && floatingPhotos.map((photo) => (
        <DraggablePhoto 
          key={photo.id} 
          photo={photo} 
          initialX={ejectOrigin.x} 
          initialY={ejectOrigin.y}
          onDelete={(id) => dismissFloating(id)}
          onSave={handleSaveToGallery}
        />
      ))}

      {/* --- App Header --- */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 shadow-sm transition-all">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => setCurrentView('camera')}
          >
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-md group">
                <div className="w-3 h-3 bg-pola-red rounded-full group-hover:animate-pulse"></div>
            </div>
            <span className="font-mono font-bold text-xl tracking-tighter text-gray-800 hidden sm:block">{t(lang, 'appTitle')}</span>
          </div>
          
          {/* Navigation & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
             
             {/* View Switcher */}
             <div className="flex bg-gray-100 rounded-lg p-1">
                <button 
                  onClick={() => setCurrentView('camera')}
                  className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${currentView === 'camera' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <CameraIcon size={18} />
                  <span className="hidden sm:inline">{t(lang, 'nav.camera')}</span>
                </button>
                <button 
                  onClick={() => setCurrentView('gallery')}
                  className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${currentView === 'gallery' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <ImageIcon size={18} />
                  <span className="hidden sm:inline">{t(lang, 'nav.gallery')}</span>
                </button>
             </div>

             <div className="w-px h-6 bg-gray-300 mx-1"></div>

             <button 
               onClick={toggleLang}
               className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-black px-2 py-1 rounded hover:bg-gray-100 transition-all"
             >
               <Languages size={18} />
               <span className="w-4">{lang === 'en' ? 'CN' : 'EN'}</span>
             </button>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center relative">
        
        {/* VIEW: CAMERA */}
        {currentView === 'camera' && (
          <div className="w-full max-w-2xl flex flex-col items-center animate-fade-in">
              <div className="mt-4 md:mt-8 relative z-10 w-full">
                  <Camera 
                      onCapture={handleCaptureInit} 
                      isProcessing={isProcessing} 
                      isPrinting={false} 
                      lang={lang}
                  />
              </div>
              
              {/* Hint text if empty */}
              {floatingPhotos.length === 0 && !isProcessing && (
                <div className="mt-16 text-center text-gray-400 font-mono text-sm animate-pulse">
                  <p>Click the shutter to start</p>
                </div>
              )}
          </div>
        )}

        {/* VIEW: GALLERY */}
        {currentView === 'gallery' && (
          <div className="w-full max-w-6xl animate-fade-in">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-300">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-200 rounded-full">
                      <Grid size={20} className="text-gray-700"/>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 font-mono">{t(lang, 'galleryTitle')}</h2>
                </div>
                <div className="text-sm text-gray-500 font-mono bg-white px-3 py-1 rounded-full shadow-sm">
                    {photos.length} {t(lang, 'memories')}
                </div>
              </div>
              
              <Gallery photos={photos} onDelete={handleDeleteFromGallery} />
          </div>
        )}

      </main>

      {/* --- Footer --- */}
      <footer className="mt-auto py-6 border-t border-gray-200/50 bg-[#e8e8e3]">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-xs font-mono">
          <p>&copy; {new Date().getFullYear()} Polacam Project.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;