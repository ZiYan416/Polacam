
/**
 * @file imageProcessing.ts
 * @description Core image manipulation service using the Canvas API.
 */

import { FilterType, EditConfig, FrameType } from '../types';
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

export const generatePolaroid = async (
  file: File, 
  config: EditConfig
): Promise<string> => {
  // Get dimensions based on Frame Type
  const dims = FRAME_DIMENSIONS[config.frameType];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');

  canvas.width = dims.width;
  canvas.height = dims.height;

  // --- Step 1: Draw Paper Body ---
  ctx.fillStyle = '#fdfbf7'; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Texture
  ctx.fillStyle = 'rgba(0,0,0,0.02)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // --- Step 2: Process User Photo ---
  const objectUrl = URL.createObjectURL(file);
  const img = await loadImage(objectUrl);
  URL.revokeObjectURL(objectUrl);

  // For the inner photo, we use the specific photoSize for that frame type.
  // Note: For WIDE, photoSize implies width, need to calculate height or assume square crop logic modified.
  // To keep it simple, we treat dims.photoSize as width, and calculate height based on frame.
  
  // Actually, let's look at FRAME_DIMENSIONS logic.
  // Classic: 600w, 520 photo (Square-ish)
  // Mini: 430w, 370 photo (Vertical)
  // Wide: 860w, 780 photo (Horizontal)
  
  // We need an explicit photo aspect ratio for the cutout.
  // Let's deduce height from padding.
  const photoW = dims.photoSize;
  const photoH = dims.height - dims.topPad - dims.bottomPad;

  const photoCanvas = document.createElement('canvas');
  photoCanvas.width = photoW;
  photoCanvas.height = photoH;
  const photoCtx = photoCanvas.getContext('2d');
  
  if (!photoCtx) throw new Error('Photo context failed');

  photoCtx.fillStyle = '#1a1a1a';
  photoCtx.fillRect(0, 0, photoW, photoH);

  photoCtx.save();
  photoCtx.translate(photoW / 2, photoH / 2);
  photoCtx.rotate((config.rotation * Math.PI) / 180);
  photoCtx.scale(config.scale, config.scale);
  photoCtx.translate(config.x, config.y);

  // Draw image centered
  photoCtx.drawImage(img, -img.width / 2, -img.height / 2);
  photoCtx.restore();

  applyFilterToContext(photoCtx, photoW, photoH, config.filter);

  // --- Step 3: Composite ---
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  
  ctx.drawImage(photoCanvas, dims.sidePad, dims.topPad);
  
  ctx.shadowColor = 'transparent';

  // --- Step 4: Caption ---
  ctx.fillStyle = '#2c2c2c'; 
  ctx.font = '24px "Courier Prime", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const textContent = config.caption.trim() || new Date().toLocaleDateString('en-US', { 
    year: '2-digit', month: '2-digit', day: '2-digit' 
  }).replace(/\//g, ' . ');

  ctx.save();
  // Position text in the bottom padding area
  const textY = dims.height - (dims.bottomPad / 2);
  ctx.translate(canvas.width / 2, textY);
  ctx.rotate((Math.random() * 0.04) - 0.02); 
  ctx.fillText(textContent, 0, 0);
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.9);
};
