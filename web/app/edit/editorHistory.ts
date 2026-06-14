import type { Frame, Layer } from "./editTypes";

export type EditorSnapshot = {
  frameLayers: Layer[][];
  frames: Frame[];
  selectedFrameIdx: number;
  selectedLayerId: string | null;
};

export type EditorStateSlice = EditorSnapshot;

const MAX_HISTORY = 50;

export function cloneEditorSnapshot(state: EditorStateSlice): EditorSnapshot {
  return {
    frameLayers: state.frameLayers.map((layers) =>
      layers.map((layer) => ({ ...layer }))
    ),
    frames: state.frames.map((frame) => ({
      ...frame,
      frame: frame.frame
        ? { ...frame.frame, patch: frame.frame.patch }
        : undefined,
    })),
    selectedFrameIdx: state.selectedFrameIdx,
    selectedLayerId: state.selectedLayerId,
  };
}

export function pushSnapshot(
  stack: EditorSnapshot[],
  snapshot: EditorSnapshot
): EditorSnapshot[] {
  return [...stack.slice(-(MAX_HISTORY - 1)), snapshot];
}
