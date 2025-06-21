// Types and interfaces for EditPageContent and related components

export interface Layer {
  id: string;
  name: string;
  type: "image" | "blank";
  src?: string;
  width?: number;
  height?: number;
  rotation?: number;
  x?: number;
  y?: number;
}

export type GifFrame = {
  dims: { width: number; height: number };
  patch: Uint8ClampedArray;
  delay: number;
};

export type Frame = {
  preview: string;
  frame?: GifFrame;
}; 