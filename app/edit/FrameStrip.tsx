import React from "react";
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
  <div className="w-full max-w-5xl mt-4">
    <div className="flex items-center overflow-x-auto gap-3 pb-2">
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
            className="flex items-center gap-3"
          >
            {frames.map((f, idx) => (
              <Draggable key={f.id} draggableId={f.id} index={idx}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`w-20 h-20 rounded border-2 flex-shrink-0 cursor-pointer overflow-hidden transition-shadow ${
                      selectedFrameIdx === idx
                        ? "border-blue-500"
                        : "border-gray-600"
                    } ${snapshot.isDragging ? "shadow-lg" : ""}`}
                    onClick={() => {
                      // Only handle click if not dragging
                      if (!snapshot.isDragging) {
                        onSelectFrame(idx);
                      }
                    }}
                  >
                    <img
                      src={customPreviews[idx] || f.preview}
                      alt={`Frame ${idx + 1}`}
                      className="w-full h-full object-contain"
                      draggable={false}
                      style={{ pointerEvents: "none" }}
                    />
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
