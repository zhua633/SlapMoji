import React from "react";
import Image from "next/image";
import { Droppable, Draggable } from "@hello-pangea/dnd";
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
  <div className="w-full max-w-5xl mt-6">
    <p className="text-[11px] uppercase tracking-[0.15em] text-white/35 mb-3">
      Frames
      {frames.length > 1 && (
        <span className="normal-case tracking-normal text-white/25 ml-2">
          · drag to reorder
        </span>
      )}
    </p>
    <div className="flex items-center overflow-x-auto gap-2.5 pb-2">
      <Droppable
        droppableId="frames-droppable"
        direction="horizontal"
        isDropDisabled={false}
        isCombineEnabled={false}
        ignoreContainerClipping={false}
      >
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex items-center gap-2.5"
          >
            {frames.map((f, idx) => (
              <Draggable key={f.id} draggableId={f.id} index={idx}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`relative w-[72px] h-[72px] rounded-lg border flex-shrink-0 cursor-pointer overflow-hidden transition-all ${
                      selectedFrameIdx === idx
                        ? "border-white/50 ring-1 ring-white/20"
                        : "border-white/10 hover:border-white/25"
                    } ${snapshot.isDragging ? "opacity-80 scale-105" : ""}`}
                    onClick={() => {
                      if (!snapshot.isDragging) {
                        onSelectFrame(idx);
                      }
                    }}
                  >
                    <Image
                      src={customPreviews[idx] || f.preview}
                      alt={`Frame ${idx + 1}`}
                      width={72}
                      height={72}
                      className="w-full h-full object-contain bg-white/[0.03]"
                      draggable={false}
                      style={{ pointerEvents: "none" }}
                    />
                    <span className="absolute bottom-1 right-1.5 text-[9px] font-mono text-white/40">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <PlusSquare onAddFrame={onAddFrame} />
    </div>
  </div>
);

export default FrameStrip;
