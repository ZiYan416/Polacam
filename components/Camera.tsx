
/**
 * @file Camera.tsx
 * @description Inverted Retro Camera (Bottom Layout) with Skin Support.
 */

import React, { useRef, useState } from 'react';
import { Zap } from 'lucide-react';
import { Language, CameraSkin } from '../types';
import { t } from '../locales';

interface CameraProps {
  onCapture: (file: File) => void;
  isProcessing: boolean;
  lang: Language;
  skin?: CameraSkin;
}

// Skin Configuration Mapping
const SKIN_CONFIG: Record<CameraSkin, {
  body: string;
  bodyShadow: string;
  leather: string;
  leatherTexture: string;
  slot: string;
  stripes: string[];
  lensRing: string;
  lensBody: string;
  shutter: string;
  shutterBorder: string;
  taglineColor: string;
}> = {
  original: {
    body: 'bg-[#f0eee6] dark:bg-zinc-800',
    bodyShadow: 'shadow-[0_-10px_40px_rgba(0,0,0,0.3)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.6)]',
    leather: 'bg-[#1a1a1a] dark:bg-[#18181b]',
    leatherTexture: 'radial-gradient(hsla(0, 0%, 100%, 0.05) 1px, transparent 0)',
    slot: 'bg-[#111] border-gray-700',
    stripes: ['bg-[#e63946]', 'bg-[#f4a261]', 'bg-[#e9c46a]', 'bg-[#2a9d8f]', 'bg-[#264653]'],
    lensRing: 'border-[#252525]',
    lensBody: 'bg-[#111]',
    shutter: 'bg-[#d62828] hover:bg-[#ff3333]',
    shutterBorder: 'border-[#333]',
    taglineColor: 'text-[#444] dark:text-zinc-500',
  },
  crimson: { // Canon Style
    body: 'bg-[#1c1c1c]',
    bodyShadow: 'shadow-[0_-10px_40px_rgba(0,0,0,0.5)]',
    leather: 'bg-[#0a0a0a]',
    leatherTexture: 'radial-gradient(hsla(0, 0%, 100%, 0.1) 1px, transparent 0)', // Rubber texture
    slot: 'bg-[#000] border-red-900',
    stripes: ['bg-[#cc0000]', 'bg-[#cc0000]', 'bg-[#cc0000]', 'bg-[#cc0000]', 'bg-[#cc0000]'], // Single Red Line block
    lensRing: 'border-[#cc0000]', // Red Ring
    lensBody: 'bg-[#0f0f0f]',
    shutter: 'bg-[#222] hover:bg-[#333]',
    shutterBorder: 'border-[#111]',
    taglineColor: 'text-[#888]',
  },
  silver: { // Fuji Style
    body: 'bg-[#d4d4d4] border-t border-white/50',
    bodyShadow: 'shadow-[0_-10px_40px_rgba(0,0,0,0.4)]',
    leather: 'bg-[#1a1a1a]',
    leatherTexture: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 4px)', // Crosshatch
    slot: 'bg-[#222] border-gray-400',
    stripes: ['bg-black', 'bg-black', 'bg-black', 'bg-black', 'bg-black'],
    lensRing: 'border-[#c0c0c0]',
    lensBody: 'bg-[#111]',
    shutter: 'bg-[#c0c0c0] hover:bg-[#e0e0e0] border-gray-400',
    shutterBorder: 'border-[#999]',
    taglineColor: 'text-[#555]',
  },
  alpha: { // Sony Style
    body: 'bg-[#0f0f0f]',
    bodyShadow: 'shadow-[0_-10px_40px_rgba(231,125,56,0.1)]', // Orange glow
    leather: 'bg-[#181818]',
    leatherTexture: 'radial-gradient(hsla(0, 0%, 100%, 0.05) 1px, transparent 0)',
    slot: 'bg-[#000] border-[#e77d38]',
    stripes: ['bg-[#e77d38]'], // Orange accent
    lensRing: 'border-[#e77d38]', // Orange Ring
    lensBody: 'bg-[#000]',
    shutter: 'bg-[#e77d38] hover:bg-[#ff9f5e]',
    shutterBorder: 'border-[#a3501a]',
    taglineColor: 'text-[#e77d38] opacity-80',
  },
  lumix: { // Panasonic Style
    body: 'bg-[#2d2d2d]',
    bodyShadow: 'shadow-[0_-10px_40px_rgba(0,0,0,0.5)]',
    leather: 'bg-[#1a1a1a]',
    leatherTexture: 'radial-gradient(hsla(0, 0%, 100%, 0.02) 1px, transparent 0)',
    slot: 'bg-[#000] border-[#b8860b]', // Dark Golden Rod
    stripes: ['bg-[#b8860b]', 'bg-[#b8860b]', 'bg-[#b8860b]', 'bg-[#b8860b]', 'bg-[#b8860b]'], // Gold strip
    lensRing: 'border-[#b8860b]', // Gold Ring
    lensBody: 'bg-[#1f1f1f]',
    shutter: 'bg-[#222] hover:bg-[#333]',
    shutterBorder: 'border-[#b8860b]',
    taglineColor: 'text-[#b8860b]',
  }
};

const Camera: React.FC<CameraProps> = ({ onCapture, isProcessing, lang, skin = 'original' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLensOpen, setIsLensOpen] = useState(true);

  const style = SKIN_CONFIG[skin];

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
    <div className="relative w-full max-w-[85vw] sm:max-w-[300px] md:max-w-md mx-auto select-none z-30 pointer-events-auto transition-all duration-300">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {/* --- Main Body Container --- */}
      <div className={`relative ${style.body} rounded-t-[2.5rem] md:rounded-t-[3rem] rounded-b-xl ${style.bodyShadow} p-1 pb-8 md:pb-12 pt-0 overflow-hidden transition-colors duration-500`}>
        
        {/* Leather Texture */}
        <div className={`absolute top-[35%] bottom-0 left-0 right-0 ${style.leather} rounded-t-[1rem] z-0 transition-colors duration-500`} 
             style={{
               backgroundImage: style.leatherTexture,
               backgroundSize: '4px 4px'
             }}>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          
          {/* --- TOP: Ejection Slot --- */}
          <div className={`w-full h-6 md:h-8 mt-6 md:mt-8 mb-3 md:mb-4 mx-auto w-4/5 rounded-full border-b-2 relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] z-40 transition-colors duration-500 ${style.slot}`}>
             <div className="w-full h-full bg-[linear-gradient(180deg,rgba(0,0,0,0.9)_0%,transparent_100%)] rounded-full"></div>
             {/* The Lip that defines the "Slot Line" */}
             <div className="absolute -bottom-1 left-2 right-2 h-1 bg-gray-500/30 rounded-full blur-[1px]"></div>
          </div>

          {/* --- MIDDLE: Viewfinder & Stripes --- */}
          <div className="w-full px-4 md:px-8 flex justify-between items-center mb-4 md:mb-6">
            {/* Viewfinder */}
            <div className="w-10 h-8 md:w-14 md:h-10 bg-[#222] rounded border-2 border-[#444] shadow-inner flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-black"></div>
                <div className="absolute w-2 h-2 bg-white/20 rounded-full top-2 right-2 blur-[1px]"></div>
            </div>

            {/* Decoration Stripes (Brand Identity) */}
            <div className="flex-1 mx-2 md:mx-4 h-full flex flex-col justify-center gap-[2px]">
               {style.stripes.length > 1 ? (
                 // Multi-stripe (Rainbow)
                 style.stripes.map((colorClass, idx) => (
                    <div key={idx} className={`w-full h-1 ${colorClass}`}></div>
                 ))
               ) : (
                 // Single Accent Stripe (Sony/Canon)
                 <div className={`w-full h-4 rounded-sm ${style.stripes[0]}`}></div>
               )}
            </div>

            {/* Flash */}
            <div className="w-12 h-8 md:w-16 md:h-10 bg-[#dadada] rounded border-2 border-[#bbb] flex items-center justify-center shadow-md relative overflow-hidden group">
               <Zap size={16} className="text-gray-400 group-hover:text-yellow-400 transition-colors z-10" />
               <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.8),transparent)] opacity-50"></div>
            </div>
          </div>

          {/* --- BOTTOM: Lens & Shutter --- */}
          <div className="relative w-full flex justify-center items-center mt-2 md:mt-4">
             {/* Shutter Button */}
             <button 
                onClick={handleShutterClick}
                disabled={isProcessing}
                className={`absolute right-4 md:right-6 bottom-2 md:bottom-4 z-30 w-12 h-12 md:w-16 md:h-16 rounded-full border-[4px] shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform active:scale-95 duration-300
                   ${style.shutterBorder}
                   ${isProcessing ? 'bg-gray-600' : style.shutter}
                `}
                aria-label={t(lang, 'takePhoto')}
             >
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-white/20"></div>
             </button>

             {/* Lens Assembly */}
             <div className={`w-28 h-28 md:w-36 md:h-36 rounded-full ${style.lensBody} border-[6px] ${style.lensRing} shadow-[0_10px_20px_rgba(0,0,0,0.4)] flex items-center justify-center relative transition-colors duration-500`}>
                <div className="absolute inset-2 border border-gray-600 rounded-full opacity-30 border-dashed"></div>
                {/* Glass */}
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-black relative overflow-hidden transition-all duration-300 ${!isLensOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                   <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-transparent"></div>
                   <div className="absolute top-5 left-5 w-8 h-4 bg-white/10 rounded-full -rotate-45 blur-md"></div>
                   <div className="absolute bottom-6 right-6 w-2 h-2 bg-white/40 rounded-full blur-none"></div>
                </div>
                {/* Shutter Leaf */}
                <div className={`absolute inset-0 bg-[#1a1a1a] rounded-full flex items-center justify-center transition-all duration-300 ${isLensOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                    <div className="w-full h-[1px] bg-gray-700"></div>
                    <div className="h-full w-[1px] bg-gray-700"></div>
                </div>
             </div>
          </div>

          {/* Tagline */}
          <div className={`mt-4 md:mt-6 font-mono text-[10px] md:text-xs tracking-[0.3em] opacity-40 transition-colors ${style.taglineColor}`}>
             DIGITAL ANALOG
          </div>

        </div>
      </div>
    </div>
  );
};

export default Camera;
