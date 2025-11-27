/**
 * @file imageProcessing.ts
 * @description Core image manipulation service using the Canvas API.
 * Handles loading images, applying pixel-level filters, and compositing the final Polaroid frame.
 */

import { FilterType, EditConfig } from '../types';
import { POLAROID_WIDTH, POLAROID_HEIGHT, PHOTO_SIZE, TOP_PADDING, SIDE_PADDING } from '../constants';

/**
 * Helper: Asynchronously loads an image from a source string.
 * @param src - Image URL or Base64 string
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
};

/**
 * Applies pixel-manipulation filters to a canvas context.
 * @param ctx - The 2D Canvas Context
 * @param width - Width of area to filter
 * @param height - Height of area to filter
 * @param filter - The selected FilterType enum
 */
const applyFilterToContext = (ctx: CanvasRenderingContext2D, width: number, height: number, filter: FilterType) => {
  if (filter === FilterType.NORMAL) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (filter === FilterType.GRAYSCALE) {
      // Standard luminance formula
      const avg = 0.3 * r + 0.59 * g + 0.11 * b;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    } else if (filter === FilterType.SEPIA) {
      // Classic sepia matrix
      data[i] = r * 0.393 + g * 0.769 + b * 0.189;
      data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
      data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
    } else if (filter === FilterType.VINTAGE) {
      // Faded look: increased red, decreased blue, lower contrast
      data[i] = r * 1.1 + 20;
      data[i + 1] = g * 0.9 + 10;
      data[i + 2] = b * 0.8;
    } else if (filter === FilterType.COOL) {
      // Cold look: decreased red, increased blue
      data[i] = r * 0.9;
      data[i + 1] = g * 0.95;
      data[i + 2] = b * 1.2;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Apply Overlay Effects (Vignette)
  if (filter === FilterType.VINTAGE || filter === FilterType.SEPIA) {
    ctx.globalCompositeOperation = 'multiply';
    const gradient = ctx.createRadialGradient(width / 2, height / 2, width / 3, width / 2, height / 2, width);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, 'rgba(60, 40, 20, 0.4)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
  }
};

/**
 * Main function to generate the final Polaroid image.
 * Combines the raw image, user edits (crop/rotate), filters, and the frame.
 * 
 * @param file - The raw image file uploaded by user
 * @param config - The editing configuration (zoom, rotation, caption, filter)
 * @returns Promise resolving to a Base64 string of the final image
 */
export const generatePolaroid = async (
  file: File, 
  config: EditConfig
): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');

  // Set High Resolution
  canvas.width = POLAROID_WIDTH;
  canvas.height = POLAROID_HEIGHT;

  // --- Step 1: Draw Paper Body ---
  ctx.fillStyle = '#fdfbf7'; // Creamy white paper
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add subtle paper texture (noise)
  ctx.fillStyle = 'rgba(0,0,0,0.02)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // --- Step 2: Process User Photo ---
  const objectUrl = URL.createObjectURL(file);
  const img = await loadImage(objectUrl);
  URL.revokeObjectURL(objectUrl);

  // Create a temporary canvas for the inner photo area
  // This allows us to apply rotation/scale independently before placing it on the card
  const photoCanvas = document.createElement('canvas');
  photoCanvas.width = PHOTO_SIZE;
  photoCanvas.height = PHOTO_SIZE;
  const photoCtx = photoCanvas.getContext('2d');
  
  if (!photoCtx) throw new Error('Photo context failed');

  // Fill black background for the photo area (in case image doesn't cover all)
  photoCtx.fillStyle = '#1a1a1a';
  photoCtx.fillRect(0, 0, PHOTO_SIZE, PHOTO_SIZE);

  // --- Transformation Logic ---
  photoCtx.save();
  
  // Move to center of the photo canvas
  photoCtx.translate(PHOTO_SIZE / 2, PHOTO_SIZE / 2);
  
  // Apply User Rotation
  photoCtx.rotate((config.rotation * Math.PI) / 180);
  
  // Apply User Scale
  photoCtx.scale(config.scale, config.scale);
  
  // Apply User Pan (Offsets)
  // Note: We invert X/Y here because we are moving the image relative to the viewport
  photoCtx.translate(config.x, config.y);

  // Draw the image centered at the origin
  photoCtx.drawImage(
    img, 
    -img.width / 2, 
    -img.height / 2
  );
  
  photoCtx.restore();

  // --- Filter Application ---
  applyFilterToContext(photoCtx, PHOTO_SIZE, PHOTO_SIZE, config.filter);

  // --- Step 3: Composite Photo onto Card ---
  // Add inner shadow for depth ("cutout" effect)
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  
  ctx.drawImage(photoCanvas, SIDE_PADDING, TOP_PADDING);
  
  ctx.shadowColor = 'transparent'; // Reset shadow

  // --- Step 4: Add Caption / Date ---
  ctx.fillStyle = '#2c2c2c'; // Dark ink color
  ctx.font = '24px "Courier Prime", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Caption Logic
  const textContent = config.caption.trim() || new Date().toLocaleDateString('en-US', { 
    year: '2-digit', month: '2-digit', day: '2-digit' 
  }).replace(/\//g, ' . ');

  // Random slight rotation for "handwritten" or "stamped" feel
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height - 80);
  ctx.rotate((Math.random() * 0.04) - 0.02); 
  ctx.fillText(textContent, 0, 0);
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.9);
};
