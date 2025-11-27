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
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 opacity-60">
        <CameraIcon size={64} className="mb-4" />
        <p className="font-mono text-lg">No photos yet. Start snapping!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4 py-8">
      {photos.map((photo) => (
        <div key={photo.id} className="flex justify-center">
             {/* Randomize rotation slightly for organic wall look */}
            <div style={{ transform: `rotate(${Math.random() * 4 - 2}deg)` }}>
                <PhotoCard photo={photo} onDelete={onDelete} className="w-64" />
            </div>
        </div>
      ))}
    </div>
  );
};

export default Gallery;
