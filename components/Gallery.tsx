
import React from 'react';
import { Photo } from '../types';
import PhotoCard from './PhotoCard';
import { Camera as CameraIcon } from 'lucide-react';
import { t } from '../locales'; // Importing t for translations if needed, though not strictly used in loop

interface GalleryProps {
  photos: Photo[];
  onToggle: (photo: Photo) => void;
}

const Gallery: React.FC<GalleryProps> = ({ photos, onToggle }) => {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 opacity-60 min-h-[50vh]">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
          <CameraIcon size={40} className="text-gray-400" />
        </div>
        <p className="font-mono text-xl">No photos yet.</p>
        <p className="font-mono text-sm mt-2">Go to Studio to take some shots!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-16 px-2 md:px-4 pb-28">
      {photos.map((photo, index) => (
        <div key={photo.id} className="flex justify-center relative group">
             {/* 
                Group hover z-index ensures the active card is on top for interaction
             */}
            <div 
              className="relative transition-all duration-300 z-0 group-hover:z-[50] group-hover:scale-105 group-hover:rotate-0"
              style={{ transform: `rotate(${index % 2 === 0 ? 2 : -2}deg)` }}
            >
                <PhotoCard 
                  photo={photo} 
                  onSave={onToggle}  // Use onSave to trigger toggle
                  isSaved={true}     // Always saved in gallery view
                  className="w-full max-w-[170px] md:max-w-[280px]" 
                />
            </div>
        </div>
      ))}
    </div>
  );
};

export default Gallery;
