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
      <div className="p-4 pb-12 flex flex-col items-center">
        
        {/* Photo Container */}
        <div className="bg-gray-900 w-full aspect-square mb-4 overflow-hidden shadow-inner relative">
          <img 
            src={photo.dataUrl} 
            alt="Polaroid" 
            className={`w-full h-full object-cover transition-all duration-[3000ms] ease-out ${isDeveloping ? 'animate-develop' : ''}`}
            // Using a clip-path to show only the photo part during development simulation
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

        {/* Actions - Always visible on touch, hover on desktop */}
        <div className="absolute -right-4 top-4 flex flex-col space-y-2 z-20 pointer-events-auto">
          
          {/* Save Button (Only for floating photos) */}
          {onSave && (
             <button 
                onClick={handleSave}
                disabled={isSaved}
                className={`p-2.5 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95
                  ${isSaved ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:text-red-500'}
                `}
                title="Save to Gallery"
             >
                <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
             </button>
          )}

          <button 
            onClick={handleDownload}
            className="p-2.5 bg-white rounded-full shadow-lg hover:bg-gray-50 text-gray-700 transition-all transform hover:scale-110 active:scale-95"
            title="Download"
          >
            <Download size={20} />
          </button>
          
          {onDelete && (
            <button 
                onClick={handleDelete}
                className="p-2.5 bg-white rounded-full shadow-lg hover:bg-red-50 text-red-500 transition-all transform hover:scale-110 active:scale-95"
                title="Delete"
            >
                <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;