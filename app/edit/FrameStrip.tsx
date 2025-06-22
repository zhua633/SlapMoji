import React from "react";
import { Frame } from "./editTypes";

interface FrameStripProps {
  frames: Frame[];
  selectedFrameIdx: number;
  onSelectFrame: (idx: number) => void;
  onAddFrame: () => void;
  customPreviews?: string[]; // Optional custom preview images
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
        className={`w-20 h-20 rounded border-2 flex-shrink-0 cursor-pointer overflow-hidden ${selectedFrameIdx === idx ? "border-blue-500" : "border-gray-600"}`}
        onClick={() => onSelectFrame(idx)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={customPreviews[idx] || f.preview} 
          alt={`Frame ${idx + 1}`} 
          className="w-full h-full object-contain" 
        />
      </div>
    ))}
    {/* Plus square */}
    <div
      className="w-20 h-20 rounded border-2 border-dashed border-gray-500 flex-shrink-0 flex items-center justify-center cursor-pointer hover:border-blue-400"
      title="Add Frame"
      onClick={onAddFrame}
    >
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 8V24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><path d="M8 16H24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
    </div>
  </div>
);

export default FrameStrip; 