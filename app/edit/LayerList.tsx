import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Layer } from "./editTypes";

interface LayerListProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onAddLayerClick: () => void;
  onExportClick: () => void;
  onDragEnd: (result: DropResult) => void;
  editorHeight: number;
}

const LayerList: React.FC<LayerListProps> = ({
  layers,
  selectedLayerId,
  onSelectLayer,
  onAddLayerClick,
  onExportClick,
  onDragEnd,
  editorHeight,
}) => (
  <div className="w-[350px] flex flex-col" style={{ height: editorHeight }}>
    <div className="flex-1 bg-gray-800 rounded-lg shadow-inner flex flex-col p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-white">Layers</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddLayerClick}
            aria-label="Add Layer"
            className="p-2 text-white hover:text-blue-300 flex items-center justify-center"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11 4V18"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M4 11H18"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            onClick={onExportClick}
            className="w-[70px] min-w-[70px] px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-semibold text-center"
          >
            Export
          </button>
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId="layers-droppable"
          isDropDisabled={false}
          isCombineEnabled={false}
          ignoreContainerClipping={false}
        >
          {(provided) => (
            <ul
              className="flex-1 overflow-y-auto space-y-2"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {layers.length === 0 && (
                <li className="text-gray-500 text-sm">No layers yet.</li>
              )}
              {layers.map((layer, index) => (
                <Draggable key={layer.id} draggableId={layer.id} index={index}>
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`bg-gray-700 rounded px-3 py-2 flex items-center gap-2 text-sm text-white cursor-move transition-shadow ${
                        snapshot.isDragging ? "shadow-2xl bg-gray-600" : ""
                      } ${
                        layer.id === selectedLayerId
                          ? "ring-2 ring-blue-400"
                          : ""
                      }`}
                      onClick={() => onSelectLayer(layer.id)}
                    >
                      {layer.type === "image" ? (
                        <span
                          className="inline-block w-2 h-2 flex-shrink-0 bg-green-400 rounded-full"
                          title="Image Layer"
                        ></span>
                      ) : (
                        <span
                          className="inline-block w-2 h-2 flex-shrink-0 bg-gray-400 rounded-full"
                          title="Blank Layer"
                        ></span>
                      )}
                      {layer.name}
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  </div>
);

export default LayerList;
