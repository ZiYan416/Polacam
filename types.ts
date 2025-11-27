
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
}

export interface EditConfig {
  x: number;
  y: number;
  scale: number;
  rotation: number;
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

export interface CameraState {
  isProcessing: boolean;
  isPrinting: boolean;
  lastPhotoId: string | null;
}
