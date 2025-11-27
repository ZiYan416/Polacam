
/**
 * @file Camera.tsx
 * @description Inverted Retro Camera (Bottom Layout).
 * Ejection slot is now at the TOP. Lens is below.
 */

import React, { useRef, useState } from 'react';
import { Zap } from 'lucide-react';
import { Language } from '../types';
import { t } from '../locales';

interface CameraProps {
  onCapture: (file: File) => void;
  isProcessing: boolean;
  lang: Language;
}

const Camera: React.FC<CameraProps> = ({ onCapture, isProcessing, lang }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLensOpen, setIsLensOpen] = useState(true);

  const handleShutterClick = () => {
    if (isProcessing) return;
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
    <div className="relative w-full max-w-[360px] md:max-w-md mx-auto select-none z-20">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {/* --- Main Body Container --- */}
      {/* Positioned at bottom, styled to look like top of camera is visible */}
      <div className="relative bg-[#f0eee6] rounded-t-[3rem] rounded-b-xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] p-1 pb-12 pt-0 overflow-hidden">
        
        {/* Leather Texture (Bottom half) */}
        <div className="absolute top-[35%] bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-[1rem] z-0" 
             style={{
               backgroundImage: `radial-gradient(hsla(0, 0%, 100%, 0.05) 1px, transparent 0)`,
               backgroundSize: '4px 4px'
             }}>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          
          {/* --- TOP: Ejection Slot (Facing Upwards) --- */}
          {/* We ensure this has high Z so photo can look like it comes from under it if we use z-indexing, 
              but mainly we use clip-path on the photo. This visual helps the illusion. */}
          <div className="w-full h-6 bg-[#111] mt-8 mb-4 mx-auto w-4/5 rounded-full border-b border-gray-700 relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] z-30">
             {/* Gradient to suggest depth */}
             <div className="w-full h-full bg-[linear-gradient(180deg,rgba(0,0,0,0.8)_0%,transparent_100%)] rounded-full"></div>
             {/* Slot Lip */}
             <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-400/20 mx-4 rounded-full"></div>
          </div>

          {/* --- MIDDLE: Viewfinder & Rainbow --- */}
          <div className="w-full px-8 flex justify-between items-center mb-6">
            
            {/* Viewfinder Window */}
            <div className="w-14 h-10 bg-[#222] rounded border-2 border-[#444] shadow-inner flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-black"></div>
                <div className="absolute w-2 h-2 bg-white/20 rounded-full top-2 right-2 blur-[1px]"></div>
            </div>

            {/* Iconic Rainbow Stripe */}
            <div className="flex-1 mx-4 h-full flex flex-col justify-center gap-[2px]">
               <div className="w-full h-1 bg-[#e63946]"></div>
               <div className="w-full h-1 bg-[#f4a261]"></div>
               <div className="w-full h-1 bg-[#e9c46a]"></div>
               <div className="w-full h-1 bg-[#2a9d8f]"></div>
               <div className="w-full h-1 bg-[#264653]"></div>
            </div>

            {/* Flash Unit */}
            <div className="w-16 h-10 bg-[#dadada] rounded border-2 border-[#bbb] flex items-center justify-center shadow-md relative overflow-hidden group">
               <Zap size={18} className="text-gray-400 group-hover:text-yellow-400 transition-colors z-10" />
               <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.8),transparent)] opacity-50"></div>
            </div>
          </div>

          {/* --- BOTTOM: Lens & Shutter (In Leather Area) --- */}
          <div className="relative w-full flex justify-center items-center mt-4">
             
             {/* Shutter Button (Right Side) */}
             <button 
                onClick={handleShutterClick}
                disabled={isProcessing}
                className={`absolute right-6 bottom-4 z-30 w-16 h-16 rounded-full border-[4px] border-[#333] shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform active:scale-95
                   ${isProcessing ? 'bg-gray-600' : 'bg-[#d62828] hover:bg-[#ff3333]'}
                `}
                aria-label={t(lang, 'takePhoto')}
             >
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-white/20"></div>
             </button>

             {/* Lens Assembly */}
             <div className="w-36 h-36 rounded-full bg-[#111] border-[6px] border-[#252525] shadow-[0_10px_20px_rgba(0,0,0,0.4)] flex items-center justify-center relative">
                {/* Markings */}
                <div className="absolute inset-2 border border-gray-600 rounded-full opacity-30 border-dashed"></div>
                
                {/* Inner Glass */}
                <div className={`w-24 h-24 rounded-full bg-black relative overflow-hidden transition-all duration-300 ${!isLensOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                   <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-transparent"></div>
                   <div className="absolute top-5 left-5 w-8 h-4 bg-white/10 rounded-full -rotate-45 blur-md"></div>
                   <div className="absolute bottom-6 right-6 w-2 h-2 bg-white/40 rounded-full blur-none"></div>
                </div>

                {/* Closed Lens Cover */}
                <div className={`absolute inset-0 bg-[#1a1a1a] rounded-full flex items-center justify-center transition-all duration-300 ${isLensOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                    <div className="w-full h-[1px] bg-gray-700"></div>
                    <div className="h-full w-[1px] bg-gray-700"></div>
                </div>
             </div>
          </div>

          <div className="mt-6 text-[#444] font-mono text-xs tracking-[0.3em] opacity-40">
             {t(lang, 'tagline')}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Camera;
