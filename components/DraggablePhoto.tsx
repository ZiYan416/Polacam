/**
 * @file DraggablePhoto.tsx
 * @description A floating photo component that pops out of the camera and can be dragged around.
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
  // Start exactly at the slot position (initialX/Y)
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [isEjecting, setIsEjecting] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  
  // Ejection Animation
  useEffect(() => {
    // Small delay to ensure render before transition
    const timer1 = setTimeout(() => {
      // Eject Downwards by ~200px
      setPosition(p => ({ ...p, y: p.y + 200 }));
    }, 50);

    const timer2 = setTimeout(() => {
      setIsEjecting(false);
    }, 2050); // Matches transition duration

    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  const handleSave = (p: Photo) => {
    onSave(p);
    setIsSaved(true);
  };

  const handleStart = (clientX: number, clientY: number) => {
    if (isEjecting) return;
    setIsDragging(true);
    dragStart.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setPosition({
      x: clientX - dragStart.current.x,
      y: clientY - dragStart.current.y
    });
  };

  const handleEnd = () => setIsDragging(false);

  // Event Listeners
  const onMouseDown = (e: React.MouseEvent) => {
    // Only drag if not clicking a button inside
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
  const onMouseUp = () => handleEnd();

  const onTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    handleStart(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchMove = (e: TouchEvent) => {
    if(isDragging) e.preventDefault();
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      className={`fixed z-30 touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        ${isEjecting ? 'transition-all duration-[2000ms] cubic-bezier(0.25, 1, 0.5, 1)' : 'transition-none'}
      `}
      style={{
        left: 0,
        top: 0,
        transform: `translate3d(${position.x}px, ${position.y}px, 0) rotate(${isEjecting ? 0 : -2}deg) scale(${isDragging ? 1.05 : 1})`,
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <PhotoCard 
        photo={photo} 
        onDelete={onDelete} 
        onSave={handleSave}
        isDeveloping={isEjecting} 
        isSaved={isSaved}
        className="w-60 md:w-72 shadow-2xl" 
      />
    </div>
  );
};

export default DraggablePhoto;