
/**
 * @file DraggablePhoto.tsx
 * @description Complex animation: Eject UP -> Fly to Random Spot.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Photo } from '../types';
import PhotoCard from './PhotoCard';

interface DraggablePhotoProps {
  photo: Photo;
  initialX: number;
  initialY: number;
  onDelete: (id: string) => void;
  onSave: (photo: Photo) => void;
}

const DraggablePhoto: React.FC<DraggablePhotoProps> = ({ photo, initialX, initialY, onDelete, onSave }) => {
  // Phase 1: Start at slot
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(0.9); 
  
  // Animation States
  const [animPhase, setAnimPhase] = useState<'eject' | 'fly' | 'idle'>('eject');
  const [isSaved, setIsSaved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // --- Phase 1: Ejection (Upwards & Reveal) ---
    // Start slightly delayed to allow DOM mount
    const t1 = setTimeout(() => {
        // Move UP by ~220px to clear the camera body
        // Animation CSS will handle the clip-path to make it look like it's sliding out
        setPosition(p => ({ ...p, y: p.y - 220 }));
        setScale(1);
    }, 50);

    // --- Phase 2: Fly to Random Spot ---
    const t2 = setTimeout(() => {
        setAnimPhase('fly');
        
        // Calculate random position within viewport (with padding)
        const maxX = window.innerWidth - 250;
        const maxY = window.innerHeight - 350; // Keep away from camera bottom
        const randX = 20 + Math.random() * (maxX - 20);
        const randY = 80 + Math.random() * (maxY - 150);
        const randRot = (Math.random() * 20) - 10;

        setPosition({ x: randX, y: randY });
        setRotation(randRot);

    }, 1500); // Wait for ejection to finish

    // --- Phase 3: Interactive ---
    const t3 = setTimeout(() => {
        setAnimPhase('idle');
    }, 2500); // 1.5s eject + 1s fly

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // --- Drag Logic ---
  const handleStart = (clientX: number, clientY: number) => {
    if (animPhase !== 'idle') return;
    setIsDragging(true);
    dragStart.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setPosition({ x: clientX - dragStart.current.x, y: clientY - dragStart.current.y });
  };

  const handleEnd = () => setIsDragging(false);

  // Listeners
  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };
  const onTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    handleStart(e.touches[0].clientX, e.touches[0].clientY);
  };

  useEffect(() => {
    if (isDragging) {
        const onMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
        const onUp = () => handleEnd();
        const onTMove = (e: TouchEvent) => { e.preventDefault(); handleMove(e.touches[0].clientX, e.touches[0].clientY); };
        
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchmove', onTMove, { passive: false });
        window.addEventListener('touchend', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchmove', onTMove);
            window.removeEventListener('touchend', onUp);
        };
    }
  }, [isDragging]);

  // Dynamic Styles based on phase
  const getTransition = () => {
      if (isDragging) return 'none';
      if (animPhase === 'eject') return 'transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1), clip-path 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
      if (animPhase === 'fly') return 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'; // Bouncy
      return 'transform 0.2s ease-out';
  };

  // Logic for gradually appearing from the slot (bottom part hidden initially)
  const getClipPath = () => {
      if (animPhase === 'eject' && position.y > initialY - 180) {
          // While ejecting, clip the bottom to simulate coming out of slot
          // We start fully clipped (inset 100% from bottom) and go to 0%
          // But since we animate the state `position.y`, we can just rely on CSS transition
          // However, we need a start state.
          // State-based approach:
          // Before T1: clip-path: inset(0 0 100% 0);
          // After T1: clip-path: inset(0 0 0% 0);
          return 'inset(0 0 0% 0)'; 
      }
      return 'inset(0 0 0% 0)';
  };

  // We need to initialize style for clip-path before the first render effect kicks in
  // So we use a separate style object logic
  const isEjectingStart = animPhase === 'eject' && position.y === initialY;

  return (
    <div 
      className={`fixed touch-none select-none`}
      style={{
        left: 0, top: 0,
        zIndex: animPhase === 'eject' ? 15 : 50, // Z-15 is below Camera Lip (Z-30) but above Body?
        // Actually, simple Z-indexing might fail if Camera is separate. 
        // We use clip-path to simulate occlusion.
        transform: `translate3d(${position.x}px, ${position.y}px, 0) rotate(${rotation}deg) scale(${isDragging ? 1.05 : scale})`,
        transition: getTransition(),
        clipPath: isEjectingStart ? 'inset(0 0 100% 0)' : 'inset(0 0 0% 0)',
        cursor: animPhase === 'idle' ? 'grab' : 'default'
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <PhotoCard 
        photo={photo} 
        onDelete={onDelete} 
        onSave={(p) => { onSave(p); setIsSaved(true); }}
        isDeveloping={animPhase !== 'idle'}
        isSaved={isSaved}
        className="w-64 shadow-xl"
      />
    </div>
  );
};

export default DraggablePhoto;
