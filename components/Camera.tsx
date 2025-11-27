/**
 * @file Camera.tsx
 * @description A retro-styled camera UI component with leather textures and detailed lens assembly.
 */

import React, { useRef, useState } from 'react';
import { Zap } from 'lucide-react';
import { Language } from '../types';
import { t } from '../locales';

interface CameraProps {
  onCapture: (file: File) => void;
  isProcessing: boolean;
  isPrinting: boolean;
  lang: Language;
}

const Camera: React.FC<CameraProps> = ({ onCapture, isProcessing, isPrinting, lang }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLensOpen, setIsLensOpen] = useState(true);

  const handleShutterClick = () => {
    if (isProcessing || isPrinting) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsLensOpen(false);
      setTimeout(() => setIsLensOpen(true), 250);
      onCapture(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <div className="relative w-full max-w-[340px] md:max-w-md mx-auto select-none z-20">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {/* --- Main Body --- */}
      <div className="relative bg-[#f4f1ea] rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)] p-1 overflow-hidden transition-transform duration-300">
        
        {/* Leather Texture Overlay - CSS Pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-[65%] bg-[#222] rounded-b-[2.2rem]" 
             style={{
               backgroundImage: `radial-gradient(hsla(0, 0%, 100%, 0.05) 1px, transparent 0)`,
               backgroundSize: '4px 4px'
             }}>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          
          {/* --- Top Face (Viewfinder & Flash) --- */}
          <div className="h-32 px-6 pt-6 flex justify-between items-start">
            
            {/* Flash Unit */}
            <div className="relative group">
               <div className="w-20 h-14 bg-[#333] rounded-lg border-2 border-[#555] shadow-lg flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_40%,rgba(255,255,255,0.2)_50%,transparent_60%)]"></div>
                  <Zap className="text-yellow-100 opacity-60 drop-shadow-[0_0_5px_rgba(255,255,0,0.5)]" size={24} />
               </div>
               <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-black/50 blur-sm"></div>
            </div>

            {/* Viewfinder */}
            <div className="relative mt-2">
               <div className="w-16 h-12 bg-[#111] rounded-md border-4 border-[#333] shadow-[inset_0_2px_10px_rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden">
                   <div className="w-4 h-4 bg-purple-900 rounded-full opacity-40 blur-[2px]"></div>
                   <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-white/10 to-transparent"></div>
               </div>
            </div>
          </div>

          {/* --- Rainbow Stripe (Iconic) --- */}
          <div className="relative h-12 flex justify-center items-center my-2">
             <div className="w-full max-w-[80%] h-full flex flex-col justify-center items-center">
                <div className="w-full h-1.5 bg-[#e63946]"></div>
                <div className="w-full h-1.5 bg-[#f4a261]"></div>
                <div className="w-full h-1.5 bg-[#e9c46a]"></div>
                <div className="w-full h-1.5 bg-[#2a9d8f]"></div>
                <div className="w-full h-1.5 bg-[#264653]"></div>
             </div>
          </div>

          {/* --- Lens Area --- */}
          <div className="relative h-48 flex justify-center items-center">
             
             {/* Shutter Button */}
             <button 
                onClick={handleShutterClick}
                disabled={isProcessing}
                className={`absolute right-6 bottom-16 z-30 w-16 h-16 rounded-full border-[6px] border-[#d4d1cb] shadow-[0_5px_15px_rgba(0,0,0,0.4),inset_0_-2px_4px_rgba(0,0,0,0.3)] transition-transform active:scale-95
                   ${isProcessing ? 'bg-gray-400' : 'bg-[#e63946] hover:bg-[#ff4d5a]'}
                `}
                aria-label={t(lang, 'takePhoto')}
             >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
             </button>

             {/* Lens Ring */}
             <div className="w-40 h-40 rounded-full bg-[#1a1a1a] border-[8px] border-[#2a2a2a] shadow-2xl flex items-center justify-center relative">
                {/* Distance Scale Markings */}
                <div className="absolute inset-0 rounded-full border border-gray-600 opacity-30"></div>
                <span className="absolute bottom-2 text-[0.5rem] text-gray-500 font-mono tracking-widest">LENS SYSTEM 1:10</span>
                
                {/* Glass */}
                <div className={`w-28 h-28 rounded-full bg-[#050505] relative overflow-hidden transition-all duration-150 ${!isLensOpen ? 'scale-0' : 'scale-100'}`}>
                   <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-purple-900/20 to-transparent"></div>
                   <div className="absolute top-6 left-6 w-10 h-6 bg-white/10 rounded-full -rotate-45 blur-md"></div>
                   <div className="absolute bottom-6 right-8 w-2 h-2 bg-white/30 rounded-full blur-[1px]"></div>
                </div>
             </div>
          </div>

          {/* --- Bottom Ejection Slot --- */}
          <div className="mt-auto h-8 bg-[#111] mx-8 mb-6 rounded-sm border-t border-gray-700 relative shadow-inner z-20">
             {/* This is just visual, the photo comes out from behind */}
             <div className="w-full h-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)]"></div>
          </div>

        </div>
      </div>
      
      <div className="text-center mt-3">
        <h1 className="font-mono font-bold text-gray-400 text-sm tracking-[0.2em] opacity-80">{t(lang, 'tagline')}</h1>
      </div>
    </div>
  );
};

export default Camera;