declare module "gif-encoder-2" {
  class GIFEncoder {
    out: { getData(): Uint8Array };
    constructor(
      width: number,
      height: number,
      algorithm?: "neuquant" | "octree",
      useOptimizer?: boolean,
      totalFrames?: number
    );
    start(): void;
    finish(): void;
    setRepeat(repeat: number): void;
    setDelay(ms: number): void;
    setQuality(quality: number): void;
    setThreshold(threshold: number): void;
    addFrame(ctx: CanvasRenderingContext2D): void;
    on(event: "progress", cb: (percent: number) => void): void;
  }
  export = GIFEncoder;
}
