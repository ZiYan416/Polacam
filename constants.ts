
import { FrameType } from "./types";

export const APP_NAME = "Polacam";

// Dimensions for the generated canvas
// Base height is constant, width changes
export const BASE_HEIGHT = 720;

export const FRAME_DIMENSIONS = {
  [FrameType.SQUARE]: { width: 600, height: 720, photoSize: 520, topPad: 40, sidePad: 40, bottomPad: 160 },
  [FrameType.MINI]:   { width: 430, height: 720, photoSize: 370, topPad: 30, sidePad: 30, bottomPad: 160 }, // Aspect ~ 0.6
  [FrameType.WIDE]:   { width: 860, height: 600, photoSize: 780, topPad: 40, sidePad: 40, bottomPad: 140 }, // Landscape
};

export const STORAGE_KEY_PHOTOS = 'polacam_photos_v2';
