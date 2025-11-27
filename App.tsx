/**
 * @file App.tsx
 * @description Main Application Controller.
 * Updated to support Language Switching, Floating Draggable Photos, and Onboarding Guide.
 */

import React, { useState, useEffect, useCallback } from 'react';
import Camera from './components/Camera';
import PhotoCard from './components/PhotoCard';
import Gallery from './components/Gallery';
import PhotoEditor from './components/PhotoEditor';
import DraggablePhoto from './components/DraggablePhoto';
import Guide from './components/Guide';
import { generatePolaroid } from './services/imageProcessing';
import { savePhoto, getPhotos, deletePhoto } from './services/storageService';
import { Photo, EditConfig, Language } from './types';
import { APP_NAME } from './constants';
import { Grid, Languages } from 'lucide-react';
import { t } from './locales';

function App() {
  // --- Global State ---
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [lang, setLang] = useState<Language>('zh'); // Default to Chinese
  const [showGuide, setShowGuide] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // --- Capture & Edit State ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Floating Photos (Active draggable overlays)
  const [floatingPhotos, setFloatingPhotos] = useState<Photo[]>([]);

  // Initial Data Load
  useEffect(() => {
    getPhotos().then(data => {
      setPhotos(data);
      if (data.length === 0) {
        setTimeout(() => setShowGuide(true), 1000);
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

      // 1. Add to Gallery Persistence
      await savePhoto(newPhoto);
      setPhotos(prev => [newPhoto, ...prev]);

      // 2. Add to Floating State (Ejection)
      setFloatingPhotos(prev => [...prev, newPhoto]);
      
      setIsProcessing(false);

    } catch (error) {
      console.error("Error creating polaroid:", error);
      setIsProcessing(false);
      alert("Something went wrong processing your image.");
    }
  }, [selectedFile]);

  const handleDelete = async (id: string) => {
    if (confirm(t(lang, 'confirmDelete'))) {
      await deletePhoto(id);
      setPhotos(prev => prev.filter(p => p.id !== id));
      setFloatingPhotos(prev => prev.filter(p => p.id !== id));
    }
  };

  // Remove a floating photo from the overlay (it remains in gallery)
  const dismissFloating = (id: string) => {
    setFloatingPhotos(prev => prev.filter(p => p.id !== id));
  };

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

      {/* Floating Photos Layer */}
      {floatingPhotos.map((photo) => (
        <DraggablePhoto 
          key={photo.id} 
          photo={photo} 
          initialX={window.innerWidth / 2 - 144} // Center horizontally (approx card half width)
          initialY={250} // Approximate exit slot of camera
          onDelete={(id) => { handleDelete(id); dismissFloating(id); }}
        />
      ))}

      {/* --- App Header --- */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-md">
                <div className="w-3 h-3 bg-pola-red rounded-full"></div>
            </div>
            <span className="font-mono font-bold text-xl tracking-tighter text-gray-800">{t(lang, 'appTitle')}</span>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
               onClick={toggleLang}
               className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-black px-3 py-1 rounded-full border border-transparent hover:border-gray-200 transition-all"
             >
               <Languages size={16} />
               <span>{lang === 'en' ? '中文' : 'EN'}</span>
             </button>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center relative">
        
        {/* Camera Section */}
        <div className="w-full max-w-2xl mb-12 relative z-10 pt-4">
            <Camera 
                onCapture={handleCaptureInit} 
                isProcessing={isProcessing} 
                isPrinting={false} // Handled by FloatingPhotos now
                lang={lang}
            />
        </div>

        {/* Gallery Section */}
        <div className="w-full max-w-7xl mt-8">
            <div className="flex items-center justify-between mb-8 border-b border-gray-300 pb-4">
               <div className="flex items-center space-x-2">
                  <Grid size={24} className="text-gray-700"/>
                  <h2 className="text-2xl font-bold text-gray-800 font-mono">{t(lang, 'galleryTitle')}</h2>
               </div>
               <div className="text-sm text-gray-500 font-mono">
                  {photos.length} {t(lang, 'memories')}
               </div>
            </div>
            
            {photos.length === 0 ? (
               <div className="text-center py-20 opacity-50">
                  <p className="font-mono text-xl text-gray-400">{t(lang, 'noPhotos')}</p>
               </div>
            ) : (
               <Gallery photos={photos} onDelete={handleDelete} />
            )}
        </div>

      </main>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm font-mono">
          <p>&copy; {new Date().getFullYear()} Polacam Project.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
