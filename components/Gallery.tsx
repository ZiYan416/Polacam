
import React from 'react';
import { Photo } from '../types';
import PhotoCard from './PhotoCard';
import { Camera as CameraIcon } from 'lucide-react';

interface GalleryProps {
  photos: Photo[];
  onDelete: (id: string) => void;
}

const Gallery: React.FC<GalleryProps> = ({ photos, onDelete }) => {
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
                Fix: Removed 'isolate'. Added 'group-hover:z-[50]' to the inner wrapper.
                This ensures the hovered card is physically on top of neighbors in the stacking context,
                allowing buttons to be clicked.
             */}
            <div 
              className="relative transition-all duration-300 z-0 group-hover:z-[50] group-hover:scale-105 group-hover:rotate-0"
              style={{ transform: `rotate(${index % 2 === 0 ? 2 : -2}deg)` }}
            >
                <PhotoCard 
                  photo={photo} 
                  onDelete={onDelete} 
                  className="w-full max-w-[170px] md:max-w-[280px]" 
                />
            </div>
        </div>
      ))}
    </div>
  );
};

export default Gallery;
