
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
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  // 1. Load Image and Set Default Caption
  useEffect(() => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    img.onload = () => {
       setImage(img);
       // Fit image initially
       // We'll calculate fit scale in render or effect, but here we reset defaults
       setRotation(0);
       setPosition({ x: 0, y: 0 });
    };
    
    // Set default caption (Date or Cute Kaomoji)
    const dateStr = new Date().toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    }).replace(/\//g, '.');
    // 50% chance for date, 50% chance for empty (or you can use random caption)
    setCaption(dateStr);

    return () => URL.revokeObjectURL(url);
  }, [file, lang]);

  // 2. Initial Auto-Fit Logic
  useEffect(() => {
    if (!image) return;
    const dims = FRAME_DIMENSIONS[selectedFrame];
    // Calculate scale to cover the photo area
    const photoW = dims.photoSize;
    // Basic cover logic
    const scaleX = photoW / image.width;
    // const scaleY = (dims.height - dims.topPad - dims.bottomPad) / image.height;
    const initialScale = Math.max(scaleX, 0.5); // Ensure not too small
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
    // 1. Move to Photo Center
    ctx.translate(photoCenterX, photoCenterY);
    // 2. Apply User Transforms (Pan, Rotate, Scale)
    ctx.translate(position.x, position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    // 3. Draw Image Centered
    ctx.drawImage(image, -image.width / 2, -image.height / 2);

    // Apply simple canvas filters (preview only, real processing happens in imageProcessing.ts)
    // Note: context filter property is supported in modern browsers
    let filterStr = '';
    if (selectedFilter === FilterType.GRAYSCALE) filterStr = 'grayscale(100%)';
    else if (selectedFilter === FilterType.SEPIA) filterStr = 'sepia(80%)';
    else if (selectedFilter === FilterType.VINTAGE) filterStr = 'sepia(40%) contrast(1.2) brightness(0.9)';
    else if (selectedFilter === FilterType.COOL) filterStr = 'hue-rotate(180deg) saturate(0.8)';
    
    // For preview, we can simply apply the filter over the rect if ctx.filter isn't perfect, 
    // but ctx.filter is good for preview.
    // However, ctx.filter applies to drawing. We already drew.
    // So we apply compositing or just rely on CSS for the canvas element? 
    // No, we want to export eventually. But this is just preview.
    // Let's use a colored overlay for speed in preview loop.
    if (selectedFilter !== FilterType.NORMAL) {
        ctx.globalCompositeOperation = 'overlay'; // or 'color', 'multiply' etc
        ctx.fillStyle = selectedFilter === FilterType.GRAYSCALE ? '#888' 
                      : selectedFilter === FilterType.SEPIA ? '#704214'
                      : selectedFilter === FilterType.VINTAGE ? '#5e4b35'
                      : '#001133';
        
        // Apply filter overlay
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
    
    // Adjust pan speed relative to canvas display size vs actual size
    // If canvas is displayed at 300px but actual is 600px, 1px drag = 2px pan
    const ratio = canvasRef.current ? canvasRef.current.width / canvasRef.current.clientWidth : 1;
    
    setPosition(p => ({ x: p.x + dx * ratio, y: p.y + dy * ratio }));
    lastPos.current = { x: clientX, y: clientY };
  };

  const handleEnd = () => {
    isDragging.current = false;
  };

  // --- Confirm ---
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

      {/* Viewport (Canvas) */}
      <div className="flex-1 relative overflow-hidden bg-[#111] flex items-center justify-center cursor-move"
           onMouseDown={e => handleStart(e.clientX, e.clientY)}
           onMouseMove={e => handleMove(e.clientX, e.clientY)}
           onMouseUp={handleEnd}
           onMouseLeave={handleEnd}
           onTouchStart={e => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
           onTouchMove={e => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
           onTouchEnd={handleEnd}
      >
          {/* Canvas */}
          <canvas 
            ref={canvasRef} 
            className="max-h-[60vh] max-w-[90vw] shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            style={{ width: 'auto', height: 'auto' }} // Let layout constrain it
          />
          
          {/* Overlay Hint */}
          <div className="absolute top-4 pointer-events-none opacity-50 bg-black/40 px-3 py-1 rounded-full text-white text-xs font-mono border border-white/10">
             {t(lang, 'dragHint')}
          </div>
      </div>

      {/* Controls Area */}
      <div className="bg-[#1a1a1a] border-t border-white/5 pb-safe">
        
        {/* Sliders (Contextual) */}
        <div className="h-16 flex items-center justify-center px-6 border-b border-white/5">
            {activeMode === 'crop' && (
                <div className="w-full flex items-center gap-4">
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
                 <div className="w-full flex items-center gap-2">
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
            {(activeMode === 'frame' || activeMode === 'filter') && (
                 <div className="text-xs text-gray-500 font-mono">{t(lang, 'dragHint')}</div>
            )}
        </div>

        {/* Options Row (Horizontal Scroll) */}
        <div className="h-20 flex items-center gap-3 overflow-x-auto px-4 no-scrollbar">
            {activeMode === 'frame' && Object.values(FrameType).map(f => (
                <button key={f} onClick={() => setSelectedFrame(f)} 
                    className={`flex-shrink-0 px-4 py-2 rounded-lg border text-sm font-mono transition-all ${selectedFrame === f ? 'bg-white text-black border-white' : 'text-gray-400 border-white/10'}`}
                >
                    {t(lang, `framesList.${f}`)}
                </button>
            ))}
            
            {activeMode === 'filter' && Object.values(FilterType).map(f => (
                <button key={f} onClick={() => setSelectedFilter(f)} 
                    className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm font-mono transition-all ${selectedFilter === f ? 'bg-pola-accent text-black border-pola-accent' : 'text-gray-400 border-white/10'}`}
                >
                    {t(lang, `filtersList.${f}`)}
                </button>
            ))}
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
