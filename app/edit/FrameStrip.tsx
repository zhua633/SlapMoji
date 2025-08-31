import React from "react";
import { Frame } from "./editTypes";
import { PlusSquare } from "./PlusSquare";

interface FrameStripProps {
  frames: Frame[];
  selectedFrameIdx: number;
  onSelectFrame: (idx: number) => void;
  onAddFrame: () => void;
  customPreviews?: string[];
}

const FrameStrip: React.FC<FrameStripProps> = ({
  frames,
  selectedFrameIdx,
  onSelectFrame,
  onAddFrame,
  customPreviews = [],
}) => (
  <div className="w-full max-w-5xl mt-4 flex items-center overflow-x-auto gap-3 pb-2">
    {frames.map((f, idx) => (
      <div
        key={idx}
        className={`w-20 h-20 rounded border-2 flex-shrink-0 cursor-pointer overflow-hidden ${
          selectedFrameIdx === idx ? "border-blue-500" : "border-gray-600"
        }`}
        onClick={() => onSelectFrame(idx)}
      >
        <img
          src={customPreviews[idx] || f.preview}
          alt={`Frame ${idx + 1}`}
          className="w-full h-full object-contain"
        />
      </div>
    ))}
    <PlusSquare onAddFrame={onAddFrame} />
  </div>
);

export default FrameStrip;
