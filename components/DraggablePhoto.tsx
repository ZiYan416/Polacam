
/**
 * @file DraggablePhoto.tsx
 * @description Controlled component for floating photos with advanced interactions (Zoom, Rotate, Drag).
 */

import React, { useState, useEffect, useRef } from 'react';
import { FloatingPhoto, Photo } from '../types';
import PhotoCard from './PhotoCard';
import { RefreshCw } from 'lucide-react';

interface DraggablePhotoProps {
  photo: FloatingPhoto;
  initialOrigin: { x: number; y: number };
  onUpdate: (id: string, updates: Partial<FloatingPhoto>) => void;
  onFocus: (id: string) => void;
  onDelete: (id: string) => void;
  onSave: (photo: Photo) => void;
  onReset?: (id: string) => void;
}

const DraggablePhoto: React.FC<DraggablePhotoProps> = ({ 
  photo, 
  initialOrigin, 
  onUpdate, 
  onFocus,
  onDelete, 
  onSave,
  onReset
}) => {
  // Animation Phase for new photos: Eject -> Fly -> Idle
  const [isEjecting, setIsEjecting] = useState(!!photo.isNew);
  const [ejectOffsetY, setEjectOffsetY] = useState(0);

  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false); // General interaction flag (hover/active)
  
  // Refs for gesture calculations
  const dragStart = useRef({ x: 0, y: 0 });
  const pinchStart = useRef({ dist: 0, angle: 0, scale: 1, rotation: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // --- Ejection Animation Logic (Only for new photos) ---
  useEffect(() => {
    if (!photo.isNew) return;

    // Phase 1: Eject Up
    const t1 = setTimeout(() => setEjectOffsetY(-300), 50);

    // Phase 2: Fly to target (handled by the CSS transition to `photo.x/y`)
    // We just need to mark it as not "new" anymore so it snaps to the persistent state logic
    const t2 = setTimeout(() => {
        setIsEjecting(false);
        onUpdate(photo.id, { isNew: false });
    }, 1200);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [photo.isNew, photo.id, onUpdate]);

  // --- Mouse/Touch Handlers ---

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    // If hitting buttons, don't drag
    if ((e.target as HTMLElement).closest('button')) return;
    
    onFocus(photo.id); // Bring to front
    
    // Check for multi-touch (Pinch/Rotate)
    if ('touches' in e && e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const angle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);
        
        pinchStart.current = { 
            dist, 
            angle, 
            scale: photo.scale, 
            rotation: photo.rotation 
        };
        setIsDragging(true);
        return;
    }

    // Single touch/mouse drag
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    setIsDragging(true);
    dragStart.current = { x: clientX - photo.x, y: clientY - photo.y };
  };

  const handlePointerMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    // Multi-touch
    if ('touches' in e && e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const angle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);

        const scaleDelta = dist / pinchStart.current.dist;
        const angleDelta = angle - pinchStart.current.angle;

        // Apply constraints
        const newScale = Math.min(Math.max(pinchStart.current.scale * scaleDelta, 0.5), 2);
        
        onUpdate(photo.id, {
            scale: newScale,
            rotation: pinchStart.current.rotation + angleDelta
        });
        return;
    }

    // Single drag
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    onUpdate(photo.id, {
        x: clientX - dragStart.current.x,
        y: clientY - dragStart.current.y
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  // Attach global move/up listeners when dragging
  useEffect(() => {
    if (isDragging) {
        window.addEventListener('mousemove', handlePointerMove as any, { passive: false });
        window.addEventListener('mouseup', handlePointerUp);
        window.addEventListener('touchmove', handlePointerMove as any, { passive: false });
        window.addEventListener('touchend', handlePointerUp);
    } else {
        window.removeEventListener('mousemove', handlePointerMove as any);
        window.removeEventListener('mouseup', handlePointerUp);
        window.removeEventListener('touchmove', handlePointerMove as any);
        window.removeEventListener('touchend', handlePointerUp);
    }
    return () => {
        window.removeEventListener('mousemove', handlePointerMove as any);
        window.removeEventListener('mouseup', handlePointerUp);
        window.removeEventListener('touchmove', handlePointerMove as any);
        window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging]);


  // --- Wheel Zoom (Desktop) ---
  const handleWheel = (e: React.WheelEvent) => {
    if (!isInteracting) return;
    e.stopPropagation();
    const delta = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(photo.scale + delta, 0.5), 1.5);
    onUpdate(photo.id, { scale: newScale });
  };

  // --- Styles ---
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const baseWidth = isMobile ? 180 : 280;

  const x = isEjecting ? initialOrigin.x : photo.x;
  const y = isEjecting ? (initialOrigin.y + ejectOffsetY) : photo.y;
  
  const transition = isDragging ? 'none' : 
                     isEjecting ? 'transform 1s cubic-bezier(0.25, 1, 0.5, 1), clip-path 1s ease' : 
                     'transform 0.3s ease-out';

  const clipPath = isEjecting 
      ? (ejectOffsetY === 0 ? 'inset(0 0 100% 0)' : 'inset(0 0 0% 0)') 
      : 'none';

  return (
    <div 
        ref={cardRef}
        className="fixed touch-none"
        style={{
            left: 0, top: 0,
            width: `${baseWidth}px`,
            zIndex: photo.zIndex,
            transform: `translate3d(${x}px, ${y}px, 0) rotate(${photo.rotation}deg) scale(${photo.scale})`,
            transition,
            clipPath,
            cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onMouseEnter={() => setIsInteracting(true)}
        onMouseLeave={() => setIsInteracting(false)}
        onWheel={handleWheel}
    >
      
      {/* Interaction Controls (Visible on Hover/Interact) */}
      {!isEjecting && isInteracting && (
        <>
            {/* Reset Button (Top Right corner relative to card) */}
            {onReset && (
                <button
                    onClick={(e) => { e.stopPropagation(); onReset(photo.id); }}
                    className="absolute -top-8 -right-4 w-8 h-8 bg-white border border-gray-300 rounded-full shadow-md flex items-center justify-center cursor-pointer z-50 animate-fade-in text-gray-600 hover:text-pola-accent hover:border-pola-accent"
                    title="Reset Transform"
                >
                    <RefreshCw size={16} />
                </button>
            )}
        </>
      )}

      {/* Visual Feedback for Selection */}
      <div className={`relative transition-all duration-300 ${isInteracting ? 'scale-[1.02]' : ''}`}>
        <PhotoCard 
            photo={photo} 
            onDelete={onDelete} 
            onSave={onSave} 
            isDeveloping={isEjecting} 
            isSaved={photo.isSaved} 
            className={isInteracting ? 'shadow-2xl ring-2 ring-white/50 ring-offset-2 ring-offset-transparent' : ''}
        />
      </div>
    </div>
  );
};

export default DraggablePhoto;
