
/**
 * @file imageProcessing.ts
 * @description Core image manipulation service using the Canvas API.
 * Matches the rendering logic of PhotoEditor.tsx exactly.
 */

import { FilterType, EditConfig } from '../types';
import { FRAME_DIMENSIONS } from '../constants';

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
};

const applyFilterToContext = (ctx: CanvasRenderingContext2D, width: number, height: number, filter: FilterType) => {
  if (filter === FilterType.NORMAL) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (filter === FilterType.GRAYSCALE) {
      const avg = 0.3 * r + 0.59 * g + 0.11 * b;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    } else if (filter === FilterType.SEPIA) {
      data[i] = r * 0.393 + g * 0.769 + b * 0.189;
      data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
      data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
    } else if (filter === FilterType.VINTAGE) {
      data[i] = r * 1.1 + 20;
      data[i + 1] = g * 0.9 + 10;
      data[i + 2] = b * 0.8;
    } else if (filter === FilterType.COOL) {
      data[i] = r * 0.9;
      data[i + 1] = g * 0.95;
      data[i + 2] = b * 1.2;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Overlay effects
  if (filter === FilterType.VINTAGE || filter === FilterType.SEPIA) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    const gradient = ctx.createRadialGradient(width / 2, height / 2, width / 3, width / 2, height / 2, width);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, 'rgba(60, 40, 20, 0.4)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
};

export const generatePolaroid = async (
  file: File, 
  config: EditConfig
): Promise<string> => {
  // 1. Setup Canvas with Target Dimensions
  const dims = FRAME_DIMENSIONS[config.frameType];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');

  canvas.width = dims.width;
  canvas.height = dims.height;

  // 2. Load Image
  const objectUrl = URL.createObjectURL(file);
  const img = await loadImage(objectUrl);
  URL.revokeObjectURL(objectUrl);

  // 3. Draw Paper Base
  ctx.fillStyle = '#fdfbf7'; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Paper Texture (Subtle Noise)
  ctx.fillStyle = 'rgba(0,0,0,0.02)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 4. Define Photo Area
  const photoX = dims.sidePad;
  const photoY = dims.topPad;
  const photoW = dims.photoSize;
  const photoH = dims.height - dims.topPad - dims.bottomPad;

  // 5. Draw Photo (Clipped)
  ctx.save();
  ctx.beginPath();
  ctx.rect(photoX, photoY, photoW, photoH);
  ctx.clip();

  // 5.1 Draw Background for photo area (in case image doesn't cover)
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(photoX, photoY, photoW, photoH);

  // 5.2 Transformations
  // Move origin to center of Photo Area
  ctx.translate(photoX + photoW / 2, photoY + photoH / 2);
  
  // Apply User Transforms (Pan, Rotate, Scale)
  ctx.translate(config.x, config.y);
  ctx.rotate((config.rotation * Math.PI) / 180);
  ctx.scale(config.scale, config.scale);
  
  // Draw Image Centered at Origin
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  
  // 5.3 Apply Filter (Must be done on the photo area)
  // Since we are transformed, we need to be careful. 
  // It's easier to apply filters to the whole canvas masked by the clip, 
  // but `getImageData` ignores clip.
  // Strategy: Draw to offscreen canvas if we need pixel manipulation, or just apply overlays.
  // For simplicity and performance in this demo, we apply global filter logic or simple overlays.
  // However, to match the preview exactly, let's restore and apply filter to the rect.
  ctx.restore();

  // Apply Pixel Filters to the photo region
  // Note: getImageData gets device pixels.
  const pixels = ctx.getImageData(photoX, photoY, photoW, photoH);
  // Create a temporary canvas to process pixels
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = photoW;
  tempCanvas.height = photoH;
  const tempCtx = tempCanvas.getContext('2d');
  if (tempCtx) {
     tempCtx.putImageData(pixels, 0, 0);
     applyFilterToContext(tempCtx, photoW, photoH, config.filter);
     // Draw back
     ctx.drawImage(tempCanvas, photoX, photoY);
  }

  // 6. Draw Inner Shadow (Inset shadow for depth)
  ctx.save();
  ctx.beginPath();
  ctx.rect(photoX, photoY, photoW, photoH);
  ctx.clip();
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.strokeRect(photoX - 2, photoY - 2, photoW + 4, photoH + 4);
  ctx.restore();

  // 7. Caption
  if (config.caption) {
    ctx.fillStyle = '#2c2c2c'; 
    ctx.font = '24px "Courier Prime", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Position text in the bottom padding area
    const textY = dims.height - (dims.bottomPad / 2);
    ctx.save();
    ctx.translate(canvas.width / 2, textY);
    ctx.rotate((Math.random() * 0.02) - 0.01); // Subtle handwriting vibe
    ctx.fillText(config.caption, 0, 0);
    ctx.restore();
  }

  return canvas.toDataURL('image/jpeg', 0.95);
};
