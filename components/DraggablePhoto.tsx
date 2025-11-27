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
  onDragEnd?: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
}

const DraggablePhoto: React.FC<DraggablePhotoProps> = ({ photo, initialX, initialY, onDelete }) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [isEjecting, setIsEjecting] = useState(true);
  const dragStart = useRef({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  // Ejection Animation
  useEffect(() => {
    // Start at "slot" position (provided by initialX/Y which should be centered)
    // Animate down
    const timer = setTimeout(() => {
      setIsEjecting(false);
      // Move down by 150px to simulate full ejection
      setPosition(p => ({ ...p, y: p.y + 160 }));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
  const onMouseUp = () => handleEnd();

  const onTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchMove = (e: TouchEvent) => {
    // Prevent scrolling while dragging photo
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
      ref={nodeRef}
      className={`fixed z-50 cursor-grab active:cursor-grabbing touch-none
        ${isEjecting ? 'transition-all duration-[2000ms] ease-out' : 'transition-none'}
      `}
      style={{
        left: 0,
        top: 0,
        transform: `translate3d(${position.x}px, ${position.y}px, 0) rotate(${isEjecting ? 0 : (Math.random() * 6 - 3)}deg) scale(${isDragging ? 1.05 : 1})`,
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <PhotoCard photo={photo} onDelete={onDelete} isDeveloping={isEjecting} className="w-60 md:w-72 shadow-2xl" />
    </div>
  );
};

export default DraggablePhoto;
