/// <reference types="vite/client" />
import { Photo } from '../types';
import { STORAGE_KEY_PHOTOS } from '../constants';
import { supabase } from '../supabaseClient.ts';

// Helper: Convert Base64 DataURL to Blob for upload
const dataURLtoBlob = (dataurl: string) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// --- GUEST MODE (LocalStorage) ---

const getLocalPhotos = (): Photo[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PHOTOS);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Local storage error", e);
    return [];
  }
};

const saveLocalPhoto = (photo: Photo) => {
  const existing = getLocalPhotos();
  const updated = [photo, ...existing];
  localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(updated));
};

const deleteLocalPhoto = (id: string) => {
  const existing = getLocalPhotos();
  const updated = existing.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(updated));
};

// --- USER MODE (Supabase) ---

const getUserPhotos = async (userId: string): Promise<Photo[]> => {
  const { data, error } = await supabase
    .from('user_photos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Map DB structure back to app Photo type
  // Note: For performance, we construct the full URL here
  return data.map((row: any) => ({
    id: row.id,
    // Fix: Ensure TypeScript handles import.meta.env correctly via top-level reference
    dataUrl: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/photos/${row.storage_path}`,
    originalUrl: row.original_url || '',
    createdAt: new Date(row.created_at).getTime(),
    caption: row.caption,
    filter: row.filter,
    frameType: row.frame_type
  }));
};

const saveUserPhoto = async (photo: Photo, userId: string) => {
  // 1. Upload Image to Storage Bucket
  const blob = dataURLtoBlob(photo.dataUrl);
  const fileName = `${userId}/${photo.id}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from('photos')
    .upload(fileName, blob);

  if (uploadError) throw uploadError;

  // 2. Insert Record into DB
  const { error: dbError } = await supabase
    .from('user_photos')
    .insert({
      id: photo.id, // Keep consistency if UUID
      user_id: userId,
      storage_path: fileName,
      caption: photo.caption,
      filter: photo.filter,
      frame_type: photo.frameType,
      created_at: new Date(photo.createdAt).toISOString()
    });

  if (dbError) throw dbError;
};

const deleteUserPhoto = async (photoId: string, userId: string) => {
  // 1. Get storage path first (optional, but good for cleanup)
  // For simplicity, we assume path is userId/photoId.jpg based on our logic
  const path = `${userId}/${photoId}.jpg`;

  // 2. Delete from Storage
  await supabase.storage.from('photos').remove([path]);

  // 3. Delete from DB
  const { error } = await supabase
    .from('user_photos')
    .delete()
    .eq('id', photoId)
    .eq('user_id', userId);

  if (error) throw error;
};

// --- PUBLIC INTERFACE ---

export const getPhotos = async (userId?: string): Promise<Photo[]> => {
  if (userId) {
    return await getUserPhotos(userId);
  } else {
    return getLocalPhotos();
  }
};

export const savePhoto = async (photo: Photo, userId?: string): Promise<void> => {
  if (userId) {
    return await saveUserPhoto(photo, userId);
  } else {
    return saveLocalPhoto(photo);
  }
};

export const deletePhoto = async (id: string, userId?: string): Promise<void> => {
  if (userId) {
    return await deleteUserPhoto(id, userId);
  } else {
    return deleteLocalPhoto(id);
  }
};