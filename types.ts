
/**
 * @file types.ts
 * @description Type definitions for the Polacam application.
 */

export type Language = 'en' | 'zh';

export enum FilterType {
  NORMAL = 'Normal',
  GRAYSCALE = 'B&W',
  SEPIA = 'Sepia',
  VINTAGE = 'Vintage',
  COOL = 'Cool',
}

export enum FrameType {
  SQUARE = 'Square', // Classic 1:1
  MINI = 'Mini',     // Portrait (Credit card size)
  WIDE = 'Wide',     // Landscape
  CINEMA = 'Cinema', // Ultra Wide 21:9
  PORTRAIT = 'Portrait' // Classic 4:5
}

export interface EditConfig {
  x: number;       // Offset X in pixels relative to frame center
  y: number;       // Offset Y in pixels relative to frame center
  scale: number;   // Scaling factor
  rotation: number;// Rotation in degrees
  caption: string;
  filter: FilterType;
  frameType: FrameType;
}

export interface Photo {
  id: string;
  dataUrl: string;
  originalUrl: string;
  createdAt: number;
  caption?: string;
  filter: FilterType;
  frameType: FrameType;
}

export interface FloatingPhoto extends Photo {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
  isNew?: boolean; // Used to trigger the initial ejection animation
  isSaved?: boolean; // Persistent saved state
}

export interface CameraState {
  isProcessing: boolean;
  isPrinting: boolean;
  lastPhotoId: string | null;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  updated_at?: string;
}
