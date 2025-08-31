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
  flipX?: boolean;
  flipY?: boolean;
}

export type GifFrame = {
  dims: { width: number; height: number };
  patch: Uint8ClampedArray;
  delay: number;
};

export type Frame = {
  id: string;
  preview: string;
  frame?: GifFrame;
}; 