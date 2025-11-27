/**
 * @file PhotoEditor.tsx
 * @description A modal-style editor allowing users to manipulate the image before printing.
 * Updated for Mobile/Touch support.
 */

import React, { useState, useRef, useEffect } from 'react';
import { FilterType, EditConfig, Language } from '../types';
import { t, getRandomCaption } from '../locales';
import { X, Check, RotateCw, ZoomIn, Type, Wand2, Grid3X3, Hand, Sparkles } from 'lucide-react';

interface PhotoEditorProps {
  file: File;
  onConfirm: (config: EditConfig) => void;
  onCancel: () => void;
  lang: Language;
}

const PhotoEditor: React.FC<PhotoEditorProps> = ({ file, onConfirm, onCancel, lang }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  
  // Transform State
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Metadata State
  const [caption, setCaption] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(FilterType.NORMAL);
  
  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // --- Unified Input Handlers (Mouse & Touch) ---
  
  const getClientPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
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
    setPosition({
      x: pos.x - dragStart.x,
      y: pos.y - dragStart.y
    });
  };

  const handleEnd = () => setIsDragging(false);

  // --- Actions ---

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleRandomCaption = () => {
    setCaption(getRandomCaption(lang));
  };

  const handleConfirm = () => {
    onConfirm({
      x: position.x,
      y: position.y,
      scale,
      rotation,
      caption,
      filter: selectedFilter
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col md:flex-row w-full h-full md:h-auto md:max-w-5xl md:aspect-video bg-[#1a1a1a] md:rounded-2xl overflow-hidden shadow-2xl">
        
        {/* --- Top/Left: Canvas Preview Area --- */}
        <div 
             className="relative flex-1 bg-[#0f0f0f] overflow-hidden flex items-center justify-center cursor-move select-none touch-none"
             onMouseDown={handleStart}
             onMouseMove={handleMove}
             onMouseUp={handleEnd}
             onMouseLeave={handleEnd}
             onTouchStart={handleStart}
             onTouchMove={handleMove}
             onTouchEnd={handleEnd}
             ref={containerRef}
        >
          {/* Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-20">
             <Grid3X3 size={200} strokeWidth={0.5} className="text-white" />
          </div>

          {/* Hint for Dragging */}
          <div className="absolute top-4 left-0 w-full text-center pointer-events-none z-20 opacity-50">
             <span className="text-xs text-white bg-black/50 px-3 py-1 rounded-full flex items-center justify-center gap-1 w-fit mx-auto">
                <Hand size={12} /> {t(lang, 'dragHint')}
             </span>
          </div>

          {/* Frame Mask */}
          <div className="relative z-0 w-[280px] h-[280px] md:w-[350px] md:h-[350px] border-2 border-dashed border-white/40 shadow-[0_0_0_9999px_rgba(0,0,0,0.85)] pointer-events-none flex items-center justify-center">
             <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white/50 font-mono tracking-widest">{t(lang, 'frameLabel')}</div>
          </div>

          {/* Image Layer */}
          <div className="absolute top-1/2 left-1/2 w-0 h-0 flex items-center justify-center pointer-events-none">
            <img 
              src={imageUrl} 
              alt="Preview"
              style={{
                transform: `
                  translate(${position.x}px, ${position.y}px) 
                  rotate(${rotation}deg) 
                  scale(${scale})
                `,
                filter: getCssFilter(selectedFilter),
              }}
              className="max-w-none origin-center transition-transform duration-75"
              draggable={false}
            />
          </div>
        </div>

        {/* --- Bottom/Right: Controls --- */}
        <div className="w-full md:w-80 bg-gray-900 flex flex-col border-t md:border-t-0 md:border-l border-gray-800 h-[50vh] md:h-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h2 className="text-white font-mono font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              {t(lang, 'editorTitle')}
            </h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-white p-2">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* Zoom */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400 uppercase font-bold">
                <span className="flex items-center gap-1"><ZoomIn size={12}/> {t(lang, 'zoom')}</span>
                <span>{Math.round(scale * 100)}%</span>
              </div>
              <input 
                type="range" min="0.5" max="3" step="0.1" value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pola-accent"
              />
            </div>

            {/* Rotate */}
            <button 
               onClick={handleRotate} 
               className="w-full py-2.5 bg-gray-800 hover:bg-gray-750 text-white rounded-lg flex items-center justify-center gap-2 border border-gray-700 text-sm font-medium"
             >
               <RotateCw size={16} />
               <span>{t(lang, 'rotate')}</span>
             </button>

            {/* Filters */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-400 uppercase font-bold">
                 <Wand2 size={12}/> {t(lang, 'filters')}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(FilterType).map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFilter(f)}
                    className={`py-1.5 px-1 text-[10px] md:text-xs font-mono rounded border transition-all truncate
                      ${selectedFilter === f 
                        ? 'bg-pola-cream text-black border-white font-bold' 
                        : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
                      }`}
                  >
                    {t(lang, `filtersList.${f}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-400 uppercase font-bold">
                 <Type size={12}/> {t(lang, 'caption')}
              </div>
              <div className="flex gap-2">
                  <input 
                    type="text" maxLength={25}
                    placeholder={t(lang, 'captionPlaceholder')}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="flex-1 bg-black/30 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-pola-accent font-mono text-sm"
                  />
                  <button 
                    onClick={handleRandomCaption}
                    className="p-2 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700 text-yellow-400"
                    title="Random Caption"
                  >
                    <Sparkles size={18} />
                  </button>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-gray-800 bg-gray-900 z-10">
            <button 
              onClick={handleConfirm}
              className="w-full py-3.5 bg-gradient-to-r from-pola-red to-orange-600 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 text-sm md:text-base tracking-wide"
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

const getCssFilter = (type: FilterType): string => {
  switch (type) {
    case FilterType.GRAYSCALE: return 'grayscale(100%)';
    case FilterType.SEPIA: return 'sepia(80%)';
    case FilterType.VINTAGE: return 'sepia(40%) contrast(120%) brightness(90%)';
    case FilterType.COOL: return 'hue-rotate(180deg) saturate(80%)';
    default: return 'none';
  }
};

export default PhotoEditor;