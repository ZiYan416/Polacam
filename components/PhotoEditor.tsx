
import React, { useState, useRef, useEffect } from 'react';
import { FilterType, EditConfig, Language, FrameType } from '../types';
import { FRAME_DIMENSIONS } from '../constants';
import { t, getRandomCaption } from '../locales';
import { X, Check, RotateCw, ZoomIn, Type, Wand2, Hand, Sparkles, Layout } from 'lucide-react';

interface PhotoEditorProps {
  file: File;
  onConfirm: (config: EditConfig) => void;
  onCancel: () => void;
  lang: Language;
}

const PhotoEditor: React.FC<PhotoEditorProps> = ({ file, onConfirm, onCancel, lang }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const [caption, setCaption] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(FilterType.NORMAL);
  const [selectedFrame, setSelectedFrame] = useState<FrameType>(FrameType.SQUARE);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const getClientPos = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if ('clientX' in e) {
      return { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
    }
    return { x: 0, y: 0 };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const pos = getClientPos(e);
    setDragStart({ x: pos.x - position.x, y: pos.y - position.y });
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const pos = getClientPos(e);
    setPosition({ x: pos.x - dragStart.x, y: pos.y - dragStart.y });
  };

  const handleEnd = () => setIsDragging(false);

  const handleConfirm = () => {
    onConfirm({
      x: position.x,
      y: position.y,
      scale,
      rotation,
      caption,
      filter: selectedFilter,
      frameType: selectedFrame
    });
  };

  // Calculate Frame Style based on Real Constants
  const getFrameStyle = () => {
    const dims = FRAME_DIMENSIONS[selectedFrame];
    const aspectRatio = dims.width / dims.height;
    
    // Base size for preview (responsively scaled)
    // We limit max-height to ensure it fits in the modal
    const baseHeight = 320; 
    const width = baseHeight * aspectRatio;

    return {
        width: `${width}px`,
        height: `${baseHeight}px`
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
      {/* Centered Modal Card */}
      <div className="flex flex-col md:flex-row w-full max-w-5xl h-[85vh] md:h-auto md:max-h-[800px] bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
        
        {/* --- Top/Left: Canvas Preview --- */}
        <div 
             className="relative flex-1 bg-[#0f0f0f] overflow-hidden flex items-center justify-center cursor-move touch-none min-h-[40vh] md:min-h-[500px]"
             onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
             onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
             ref={containerRef}
        >
          {/* Guide Overlay */}
          <div className="absolute top-6 left-0 w-full text-center pointer-events-none z-20 opacity-60">
             <span className="text-xs font-mono text-white bg-black/40 px-3 py-1 rounded-full border border-white/10 flex items-center justify-center gap-1 w-fit mx-auto">
                <Hand size={12} /> {t(lang, 'dragHint')}
             </span>
          </div>

          {/* Dynamic Frame Mask */}
          <div 
            className="relative z-10 border-2 border-dashed border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.9)] pointer-events-none flex items-center justify-center transition-all duration-300"
            style={getFrameStyle()}
          >
             <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] text-white/50 font-mono tracking-widest uppercase bg-black/50 px-2 py-0.5 rounded">
                {t(lang, `framesList.${selectedFrame}`)}
             </div>
             {/* Crosshair */}
             <div className="w-4 h-4 border-t border-l border-white/30 absolute top-0 left-0"></div>
             <div className="w-4 h-4 border-t border-r border-white/30 absolute top-0 right-0"></div>
             <div className="w-4 h-4 border-b border-l border-white/30 absolute bottom-0 left-0"></div>
             <div className="w-4 h-4 border-b border-r border-white/30 absolute bottom-0 right-0"></div>
          </div>

          {/* Image Layer */}
          <div className="absolute top-1/2 left-1/2 w-0 h-0 flex items-center justify-center pointer-events-none">
            <img 
              src={imageUrl} 
              alt="Preview"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                filter: selectedFilter !== FilterType.NORMAL 
                  ? (selectedFilter === FilterType.GRAYSCALE ? 'grayscale(100%)' 
                    : selectedFilter === FilterType.SEPIA ? 'sepia(80%)'
                    : selectedFilter === FilterType.VINTAGE ? 'sepia(40%) contrast(120%) brightness(90%)'
                    : selectedFilter === FilterType.COOL ? 'hue-rotate(180deg) saturate(80%)' : 'none')
                  : 'none',
              }}
              className="max-w-none origin-center transition-transform duration-75 opacity-90"
              draggable={false}
            />
          </div>
        </div>

        {/* --- Bottom/Right: Controls --- */}
        <div className="w-full md:w-[380px] bg-[#1a1a1a] flex flex-col border-t md:border-t-0 md:border-l border-white/5 h-[45vh] md:h-auto relative z-30">
          
          <div className="flex justify-between items-center p-4 border-b border-white/5 shrink-0">
            <h2 className="text-white font-mono font-bold text-lg">{t(lang, 'editorTitle')}</h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors p-1">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
            
            {/* 1. Frame Selection */}
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-xs text-gray-500 uppercase font-bold tracking-wider">
                 <Layout size={12}/> {t(lang, 'frame')}
               </div>
               <div className="grid grid-cols-3 gap-2">
                 {Object.values(FrameType).map(type => (
                   <button
                     key={type}
                     onClick={() => setSelectedFrame(type)}
                     className={`py-2 px-1 text-xs font-mono rounded-lg border transition-all
                       ${selectedFrame === type
                         ? 'bg-white text-black border-white shadow-lg shadow-white/10' 
                         : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'
                       }`}
                   >
                     {t(lang, `framesList.${type}`)}
                   </button>
                 ))}
               </div>
            </div>

            {/* 2. Transform Tools */}
            <div className="space-y-4">
               <div className="flex justify-between text-xs text-gray-500 uppercase font-bold tracking-wider">
                 <span className="flex items-center gap-1"><ZoomIn size={12}/> {t(lang, 'zoom')}</span>
                 <span className="text-white font-mono">{Math.round(scale * 100)}%</span>
               </div>
               <input 
                  type="range" min="0.5" max="3" step="0.1" value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
               />
               <button 
                 onClick={() => setRotation(r => (r + 90) % 360)} 
                 className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg flex items-center justify-center gap-2 text-xs font-mono border border-white/5"
               >
                 <RotateCw size={14} /> {t(lang, 'rotate')}
               </button>
            </div>

            {/* 3. Filters */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-gray-500 uppercase font-bold tracking-wider">
                 <Wand2 size={12}/> {t(lang, 'filters')}
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.values(FilterType).map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFilter(f)}
                    className={`px-3 py-1.5 text-xs font-mono rounded-full border transition-all
                      ${selectedFilter === f 
                        ? 'bg-pola-accent text-black border-pola-accent font-bold' 
                        : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
                      }`}
                  >
                    {t(lang, `filtersList.${f}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Caption */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-gray-500 uppercase font-bold tracking-wider">
                 <Type size={12}/> {t(lang, 'caption')}
              </div>
              <div className="flex gap-2">
                  <input 
                    type="text" maxLength={25}
                    placeholder={t(lang, 'captionPlaceholder')}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="flex-1 bg-black text-white px-3 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-pola-accent font-mono text-sm placeholder:text-gray-600"
                  />
                  <button 
                    onClick={() => setCaption(getRandomCaption(lang))}
                    className="p-2.5 bg-white/10 border border-white/5 rounded-lg hover:bg-white/20 text-yellow-400 transition-colors"
                  >
                    <Sparkles size={16} />
                  </button>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="p-5 border-t border-white/10 bg-[#151515] shrink-0">
            <button 
              onClick={handleConfirm}
              className="w-full py-3 md:py-4 bg-white text-black font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 text-sm tracking-widest uppercase font-mono"
            >
              <Check size={18} />
              <span>{t(lang, 'printPhoto')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoEditor;
