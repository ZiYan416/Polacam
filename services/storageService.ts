import { Photo, FilterType } from '../types';
import { STORAGE_KEY_PHOTOS } from '../constants';

// In a real app, these would be API calls to Python/FastAPI

export const savePhoto = async (photo: Photo): Promise<void> => {
  try {
    const existing = await getPhotos();
    const updated = [photo, ...existing];
    localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(updated));
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
  } catch (error) {
    console.error("Failed to save photo", error);
    throw error;
  }
};

export const getPhotos = async (): Promise<Photo[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PHOTOS);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load photos", error);
    return [];
  }
};

export const deletePhoto = async (id: string): Promise<void> => {
  try {
    const existing = await getPhotos();
    const updated = existing.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to delete photo", error);
    throw error;
  }
};
