
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FilterType, EditConfig, Language, FrameType } from '../types';
import { FRAME_DIMENSIONS } from '../constants';
import { t, getRandomCaption } from '../locales';
import { X, Check, RotateCw, Type, Wand2, Layout, Scan, Palette } from 'lucide-react';

interface PhotoEditorProps {
  file: File;
  onConfirm: (config: EditConfig) => void;
  onCancel: () => void;
  lang: Language;
}

// Modes for the bottom tab bar
type Mode = 'frame' | 'crop' | 'filter' | 'text';

// Aspect Ratio Map
const ASPECT_LABELS: Record<FrameType, string> = {
    [FrameType.SQUARE]: '1:1',
    [FrameType.MINI]: '3:4',
    [FrameType.WIDE]: '16:9',
    [FrameType.CINEMA]: '21:9',
    [FrameType.PORTRAIT]: '4:5'
};

const PhotoEditor: React.FC<PhotoEditorProps> = ({ file, onConfirm, onCancel, lang }) => {
  // --- State ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  
  // Transform State
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Config State
  const [activeMode, setActiveMode] = useState<Mode>('frame');
  const [selectedFrame, setSelectedFrame] = useState<FrameType>(FrameType.SQUARE);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(FilterType.NORMAL);
  const [caption, setCaption] = useState('');

  // Interaction State
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // 1. Load Image and Set Default Caption
  useEffect(() => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    img.onload = () => {
       setImage(img);
       setRotation(0);
       setPosition({ x: 0, y: 0 });
    };
    
    // Set default caption
    const dateStr = new Date().toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    }).replace(/\//g, '.');
    setCaption(dateStr);

    return () => URL.revokeObjectURL(url);
  }, [file, lang]);

  // 2. Initial Auto-Fit Logic
  useEffect(() => {
    if (!image) return;
    const dims = FRAME_DIMENSIONS[selectedFrame];
    const photoW = dims.photoSize;
    const scaleX = photoW / image.width;
    const initialScale = Math.max(scaleX, 0.5); 
    setScale(initialScale);
  }, [image, selectedFrame]);

  // 3. Render Loop (Canvas)
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dims = FRAME_DIMENSIONS[selectedFrame];
    // We render at high resolution internally (dims.width) but display via CSS
    canvas.width = dims.width;
    canvas.height = dims.height;

    // --- A. Draw Paper Base ---
    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- B. Draw Photo (Clipped & Transformed) ---
    const photoX = dims.sidePad;
    const photoY = dims.topPad;
    const photoW = dims.photoSize;
    const photoH = dims.height - dims.topPad - dims.bottomPad;
    const photoCenterX = photoX + photoW / 2;
    const photoCenterY = photoY + photoH / 2;

    ctx.save();
    
    // Clip to Photo Region
    ctx.beginPath();
    ctx.rect(photoX, photoY, photoW, photoH);
    ctx.clip();

    // Background for transparent images
    ctx.fillStyle = '#111';
    ctx.fillRect(photoX, photoY, photoW, photoH);

    // Transforms
    ctx.translate(photoCenterX, photoCenterY);
    ctx.translate(position.x, position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);

    if (selectedFilter !== FilterType.NORMAL) {
        ctx.globalCompositeOperation = 'overlay'; 
        ctx.fillStyle = selectedFilter === FilterType.GRAYSCALE ? '#888' 
                      : selectedFilter === FilterType.SEPIA ? '#704214'
                      : selectedFilter === FilterType.VINTAGE ? '#5e4b35'
                      : '#001133';
        
        ctx.globalCompositeOperation = selectedFilter === FilterType.COOL ? 'overlay' : 'color';
        ctx.fillRect(-image.width, -image.height, image.width * 2, image.height * 2);
    }

    ctx.restore();

    // --- C. Draw Frame Shadow (Inner) ---
    ctx.save();
    ctx.beginPath();
    ctx.rect(photoX, photoY, photoW, photoH);
    ctx.clip();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
    ctx.lineWidth = 2;
    ctx.strokeRect(photoX-1, photoY-1, photoW+2, photoH+2);
    ctx.restore();

    // --- D. Draw Text ---
    if (caption) {
        ctx.fillStyle = '#2c2c2c';
        ctx.font = '24px "Courier Prime", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const textY = dims.height - (dims.bottomPad / 2);
        ctx.fillText(caption, canvas.width / 2, textY);
    }

  }, [image, selectedFrame, position, scale, rotation, selectedFilter, caption]);

  // Request Animation Frame Loop
  useEffect(() => {
    let animationId: number;
    const loop = () => {
      render();
      animationId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animationId);
  }, [render]);


  // --- Gestures ---
  const handleStart = (clientX: number, clientY: number) => {
    isDragging.current = true;
    lastPos.current = { x: clientX, y: clientY };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging.current) return;
    const dx = clientX - lastPos.current.x;
    const dy = clientY - lastPos.current.y;
    
    // Adjust pan speed
    const ratio = canvasRef.current ? canvasRef.current.width / canvasRef.current.clientWidth : 1;
    
    setPosition(p => ({ x: p.x + dx * ratio, y: p.y + dy * ratio }));
    lastPos.current = { x: clientX, y: clientY };
  };

  const handleEnd = () => {
    isDragging.current = false;
  };

  const handleDone = () => {
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

  // Helper to render Frame Icon
  const renderFrameIcon = (type: FrameType) => {
      const dim = FRAME_DIMENSIONS[type];
      const aspect = dim.width / dim.height;
      const w = aspect >= 1 ? 24 : 24 * aspect;
      const h = aspect >= 1 ? 24 / aspect : 24;
      
      return (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 flex items-center justify-center border border-white/20 rounded bg-white/5 relative">
                <div style={{ width: w, height: h }} className={`border-2 ${selectedFrame === type ? 'border-white bg-white/50' : 'border-gray-500'}`}></div>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-white/90">{t(lang, `framesList.${type}`)}</span>
                <span className="text-[9px] font-mono text-white/50">{ASPECT_LABELS[type]}</span>
            </div>
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-[5000] bg-black flex flex-col animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black z-20">
         <button onClick={onCancel} className="p-2 text-white/70 hover:text-white transition-colors">
            <X size={24} />
         </button>
         <h1 className="text-white font-mono font-bold tracking-widest text-sm">{t(lang, 'editorTitle')}</h1>
         <button onClick={handleDone} className="p-2 text-pola-red hover:text-red-400 transition-colors">
            <Check size={28} />
         </button>
      </div>

      {/* Viewport */}
      <div className="flex-1 relative overflow-hidden bg-[#111] flex items-center justify-center cursor-move"
           onMouseDown={e => handleStart(e.clientX, e.clientY)}
           onMouseMove={e => handleMove(e.clientX, e.clientY)}
           onMouseUp={handleEnd}
           onMouseLeave={handleEnd}
           onTouchStart={e => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
           onTouchMove={e => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
           onTouchEnd={handleEnd}
      >
          <canvas 
            ref={canvasRef} 
            className="max-h-[60vh] max-w-[90vw] shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            style={{ width: 'auto', height: 'auto' }} 
          />
          
          <div className="absolute top-4 pointer-events-none opacity-50 bg-black/40 px-3 py-1 rounded-full text-white text-xs font-mono border border-white/10">
             {t(lang, 'dragHint')}
          </div>
      </div>

      {/* Controls Area */}
      <div className="bg-[#1a1a1a] border-t border-white/5 pb-safe">
        
        {/* Sliders / Options */}
        <div className="h-24 flex items-center justify-center px-4 border-b border-white/5 overflow-x-auto no-scrollbar">
            {activeMode === 'crop' && (
                <div className="w-full flex items-center gap-4 max-w-md mx-auto">
                    <span className="text-xs text-gray-500 font-mono w-8">ZOOM</span>
                    <input 
                        type="range" min="0.2" max="3" step="0.05" 
                        value={scale} 
                        onChange={e => setScale(parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                    <button onClick={() => setRotation(r => r + 90)} className="p-2 text-white/80 border border-white/20 rounded">
                        <RotateCw size={14} />
                    </button>
                </div>
            )}
            
            {activeMode === 'text' && (
                 <div className="w-full flex items-center gap-2 max-w-md mx-auto">
                     <input 
                        type="text" value={caption} onChange={e => setCaption(e.target.value)}
                        placeholder={t(lang, 'captionPlaceholder')}
                        className="flex-1 bg-black/50 border border-white/10 text-white px-3 py-2 rounded font-mono text-sm focus:outline-none focus:border-white/40"
                     />
                     <button onClick={() => setCaption(getRandomCaption(lang))} className="p-2 bg-white/10 rounded text-yellow-400">
                         <Wand2 size={16} />
                     </button>
                 </div>
            )}

            {activeMode === 'frame' && (
                <div className="flex gap-4">
                   {Object.values(FrameType).map(f => (
                       <button key={f} onClick={() => setSelectedFrame(f)} className={`opacity-${selectedFrame === f ? '100' : '50'} hover:opacity-100 transition-opacity`}>
                           {renderFrameIcon(f)}
                       </button>
                   ))}
                </div>
            )}
            
            {activeMode === 'filter' && (
                <div className="flex gap-2">
                    {Object.values(FilterType).map(f => (
                        <button key={f} onClick={() => setSelectedFilter(f)} 
                            className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm font-mono transition-all ${selectedFilter === f ? 'bg-pola-accent text-black border-pola-accent' : 'text-gray-400 border-white/10'}`}
                        >
                            {t(lang, `filtersList.${f}`)}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Tab Bar */}
        <div className="flex justify-around items-center pt-2 pb-6 border-t border-white/5 text-gray-500">
            <button onClick={() => setActiveMode('frame')} className={`flex flex-col items-center gap-1 p-2 ${activeMode === 'frame' ? 'text-white' : ''}`}>
                <Layout size={20} />
                <span className="text-[10px] font-bold tracking-wider">{t(lang, 'frame')}</span>
            </button>
            <button onClick={() => setActiveMode('crop')} className={`flex flex-col items-center gap-1 p-2 ${activeMode === 'crop' ? 'text-white' : ''}`}>
                <Scan size={20} />
                <span className="text-[10px] font-bold tracking-wider">{t(lang, 'zoom')}</span>
            </button>
            <button onClick={() => setActiveMode('filter')} className={`flex flex-col items-center gap-1 p-2 ${activeMode === 'filter' ? 'text-white' : ''}`}>
                <Palette size={20} />
                <span className="text-[10px] font-bold tracking-wider">{t(lang, 'filters')}</span>
            </button>
            <button onClick={() => setActiveMode('text')} className={`flex flex-col items-center gap-1 p-2 ${activeMode === 'text' ? 'text-white' : ''}`}>
                <Type size={20} />
                <span className="text-[10px] font-bold tracking-wider">{t(lang, 'caption')}</span>
            </button>
        </div>

      </div>
    </div>
  );
};

export default PhotoEditor;
