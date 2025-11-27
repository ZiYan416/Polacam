
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
  
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.download = `polacam_${photo.createdAt}.jpg`;
    link.href = photo.dataUrl;
    link.click();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(photo.id);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) onSave(photo);
  };

  return (
    <div className={`relative group bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform select-none ${className}`}>
      <div className="p-4 pb-0 flex flex-col items-center">
        
        {/* Photo Container */}
        <div className="bg-gray-900 w-full aspect-square mb-4 overflow-hidden shadow-inner relative">
          <img 
            src={photo.dataUrl} 
            alt="Polaroid" 
            className={`w-full h-full object-cover transition-all duration-[3000ms] ease-out ${isDeveloping ? 'animate-develop' : ''}`}
            style={isDeveloping ? { clipPath: 'inset(14% 6% 22% 6%)' } : {}}
            draggable={false}
          />
        </div>
        
        {/* Full Image Overlay (The actual frame) */}
        <div className="absolute inset-0 pointer-events-none">
             <img 
                src={photo.dataUrl} 
                className={`w-full h-auto shadow-sm ${isDeveloping ? 'animate-develop' : ''}`}
                alt="Generated Polaroid"
                draggable={false}
             />
        </div>

        {/* --- Action Buttons (Bottom Chin) --- */}
        {/* We place them in the bottom padding area (approx 140px-160px height in logic). 
            In the rendered image it's just the bottom part. 
            We absolute position them at the bottom. */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-auto">
          
          {/* Save Button (Only for floating photos) */}
          {onSave && (
             <button 
                onClick={handleSave}
                disabled={isSaved}
                className={`p-2 rounded-full border border-gray-200 shadow-sm transition-all transform hover:scale-110 active:scale-95
                  ${isSaved ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white/80 backdrop-blur-sm text-gray-500 hover:text-red-500 hover:bg-white'}
                `}
                title="Save to Gallery"
             >
                <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
             </button>
          )}

          <button 
            onClick={handleDownload}
            className="p-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm hover:bg-white text-gray-500 hover:text-blue-500 transition-all transform hover:scale-110 active:scale-95"
            title="Download"
          >
            <Download size={16} />
          </button>
          
          {onDelete && (
            <button 
                onClick={handleDelete}
                className="p-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm hover:bg-white text-gray-500 hover:text-red-500 transition-all transform hover:scale-110 active:scale-95"
                title="Delete"
            >
                <Trash2 size={16} />
            </button>
          )}
        </div>
        
        {/* Mobile touch hint (Always visible if touch, handled by parent hover usually on desktop) */}
        {/* In mobile, we might want buttons always visible? 
            For now, group-hover works on tap on many devices. 
            To be safe, we can make them visible if 'isDeveloping' is false.
        */}
      </div>
      {/* Spacer to simulate bottom chin height in DOM flow if needed, but the image takes space */}
      <div className="h-12 w-full"></div>
    </div>
  );
};

export default PhotoCard;
