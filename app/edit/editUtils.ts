// Utility functions for EditPageContent and related components

export const DEFAULT_IMG_SIZE = 320;
export const DEFAULT_IMG_POS = { x: 0, y: 0 };

export const isGif = (src: string) => src.toLowerCase().endsWith('.gif') || src.startsWith('data:image/gif');

export function createBlankFrame(width: number, height: number): { preview: string } {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.clearRect(0, 0, width, height);
  return { preview: canvas.toDataURL() };
} 