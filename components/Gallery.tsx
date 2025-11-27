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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12 px-4 pb-20">
      {photos.map((photo, index) => (
        <div key={photo.id} className="flex justify-center group">
             {/* Alternating rotations for natural wall look */}
            <div 
              className="transition-transform duration-300 group-hover:scale-105 group-hover:rotate-0 z-10"
              style={{ transform: `rotate(${index % 2 === 0 ? 1.5 : -1.5}deg)` }}
            >
                <PhotoCard 
                  photo={photo} 
                  onDelete={onDelete} 
                  className="w-full max-w-[280px] shadow-lg hover:shadow-2xl" 
                />
            </div>
        </div>
      ))}
    </div>
  );
};

export default Gallery;