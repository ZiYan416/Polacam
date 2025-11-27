import React from 'react';
import { Photo } from '../types';
import { Download, Trash2 } from 'lucide-react';

interface PhotoCardProps {
  photo: Photo;
  onDelete?: (id: string) => void;
  className?: string;
  isDeveloping?: boolean;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onDelete, className = '', isDeveloping = false }) => {
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `polacam_${photo.createdAt}.jpg`;
    link.href = photo.dataUrl;
    link.click();
  };

  return (
    <div className={`relative group bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${className}`}>
      {/* The Paper Aspect Ratio - Fixed width, dynamic height based on aspect */}
      <div className="p-4 pb-12 flex flex-col items-center">
        
        {/* Photo Area */}
        <div className="bg-gray-900 w-full aspect-square mb-4 overflow-hidden shadow-inner relative">
          <img 
            src={photo.dataUrl} 
            alt="Polaroid" 
            className={`w-full h-full object-cover transition-all duration-[3000ms] ease-out ${isDeveloping ? 'animate-develop' : ''}`}
            style={isDeveloping ? { clipPath: 'inset(14% 6% 22% 6%)' } : { clipPath: 'inset(14% 6% 22% 6%)', transform: 'scale(1.35)' } } 
            // Note: We use clip-path and scale to extract just the photo part from the full polaroid canvas for the preview animation effect, 
            // or we could just display the full canvas image. 
            // Better approach for simplicity here: Just display the full generated canvas image.
          />
          {/* Overwrite above: Just show the full generated image. It already has borders. */}
        </div>
        
        {/* We actually render the full generated canvas as an image, so we don't need manual DOM layout for the border. 
            The imageProcessing service generates the FULL card including text and white borders. 
        */}
        <div className="absolute inset-0">
             <img 
                src={photo.dataUrl} 
                className={`w-full h-auto shadow-sm ${isDeveloping ? 'animate-develop' : ''}`}
                alt="Generated Polaroid"
             />
        </div>

        {/* Hover Actions */}
        <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button 
            onClick={handleDownload}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 text-gray-700"
            title="Download"
          >
            <Download size={16} />
          </button>
          {onDelete && (
            <button 
                onClick={() => onDelete(photo.id)}
                className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-500"
                title="Delete"
            >
                <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;
