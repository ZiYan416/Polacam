
import React from 'react';
import { Photo } from '../types';
import { Download, Trash2, Heart } from 'lucide-react';

interface PhotoCardProps {
  photo: Photo;
  onDelete?: (id: string) => void;
  onSave?: (photo: Photo) => void;
  className?: string;
  isDeveloping?: boolean;
  isSaved?: boolean;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ 
  photo, 
  onDelete, 
  onSave,
  className = '', 
  isDeveloping = false,
  isSaved = false
}) => {
  
  const handleDownload = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    // e.preventDefault(); // Don't prevent default, we want the click to register
    const link = document.createElement('a');
    link.download = `polacam_${photo.createdAt}.jpg`;
    link.href = photo.dataUrl;
    link.click();
  };

  const handleDelete = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(photo.id);
  };

  const handleSave = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (onSave) onSave(photo);
  };

  return (
    <div className={`relative group inline-block select-none ${className}`}>
      <div className="relative w-full shadow-xl transition-shadow duration-300 hover:shadow-2xl bg-white p-0 pointer-events-auto">
        <img 
          src={photo.dataUrl} 
          alt="Polaroid" 
          className={`w-full h-auto block select-none pointer-events-none ${isDeveloping ? 'animate-develop' : ''}`}
          style={isDeveloping ? { filter: 'brightness(1.2) contrast(0.8) sepia(0.2)' } : {}}
          draggable={false}
        />
        
        {/* --- Buttons --- */}
        {/* 
            Interaction Fix:
            Use onPointerDown / onClick carefully.
            Added min-h to ensure hit area.
        */}
        <div className="absolute bottom-2 md:bottom-3 left-0 right-0 flex justify-center items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 px-2 pointer-events-auto touch-manipulation">
          
          {onSave && (
             <button 
                onClick={handleSave}
                disabled={isSaved}
                className={`w-9 h-9 md:w-10 md:h-10 rounded-full border shadow-md flex items-center justify-center transition-transform hover:scale-110 active:scale-95
                  ${isSaved 
                    ? 'bg-red-50 border-red-200 text-pola-red' 
                    : 'bg-white border-gray-200 text-gray-400 hover:text-pola-red'
                  }
                `}
                title="收藏"
             >
                <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
             </button>
          )}

          <button 
            onClick={handleDownload}
            className="w-9 h-9 md:w-10 md:h-10 bg-white border border-gray-200 rounded-full shadow-md text-gray-400 hover:text-blue-500 hover:border-blue-200 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
            title="下载"
          >
            <Download size={18} />
          </button>
          
          {onDelete && (
            <button 
                onClick={handleDelete}
                className="w-9 h-9 md:w-10 md:h-10 bg-white border border-gray-200 rounded-full shadow-md text-gray-400 hover:text-red-500 hover:border-red-200 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
                title="丢弃"
            >
                <Trash2 size={18} />
            </button>
          )}
        </div>

        {/* Mobile: Ensure buttons are visible on 'active' state or just by default if needed. 
            For now, relying on hover/focus/active. The parent DraggablePhoto manages interaction state. */}
      </div>
    </div>
  );
};

export default PhotoCard;
