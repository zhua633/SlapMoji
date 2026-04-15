import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Layer } from "./editTypes";
import TextEditPanel from "./TextEditPanel";

interface LayerListProps {
  layers: Layer[];
  selectedLayerId: string | null;
  showTextProperties: boolean;
  onSelectLayer: (id: string) => void;
  onAddLayerClick: () => void;
  onAddTextLayerClick: () => void;
  onExportClick: () => void;
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void;
  editorHeight: number;
}

const LayerList: React.FC<LayerListProps> = ({
  layers,
  selectedLayerId,
  showTextProperties,
  onSelectLayer,
  onAddLayerClick,
  onAddTextLayerClick,
  onExportClick,
  onUpdateLayer,
  editorHeight,
}) => {
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);

  return (
    <div className="w-[350px] flex flex-col" style={{ height: editorHeight }}>
      {/* Layers Section */}
      <div
        className={`bg-gray-800 rounded-lg shadow-inner flex flex-col p-4 ${
          selectedLayer && selectedLayer.type === "text" && showTextProperties
            ? "flex-1"
            : "flex-1"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-white">Layers</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onAddTextLayerClick}
              aria-label="Add Text Layer"
              className="p-2 text-white hover:text-blue-300 flex items-center justify-center"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3 4H19V6H13V18H9V6H3V4Z" fill="currentColor" />
              </svg>
            </button>
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
        <Droppable
          droppableId="layers-droppable"
          isDropDisabled={false}
          isCombineEnabled={false}
          ignoreContainerClipping={false}
        >
          {(provided) => (
            <div className="flex-1 min-h-0">
              <ul
                className="h-full overflow-y-auto space-y-2 pr-2"
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{ scrollbarWidth: "thin" }}
              >
                {layers.length === 0 && (
                  <li className="text-gray-500 text-sm">No layers yet.</li>
                )}
                {layers.map((layer, index) => (
                  <Draggable
                    key={layer.id}
                    draggableId={layer.id}
                    index={index}
                  >
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
                        ) : layer.type === "text" ? (
                          <span
                            className="inline-block w-2 h-2 flex-shrink-0 bg-blue-400 rounded-full"
                            title="Text Layer"
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
            </div>
          )}
        </Droppable>
      </div>

      {/* Text Edit Panel - Separate scrollable section */}
      {selectedLayer && selectedLayer.type === "text" && showTextProperties && (
        <div className="max-h-96 overflow-y-auto">
          <TextEditPanel
            layer={selectedLayer}
            onUpdate={(updates) => onUpdateLayer(selectedLayer.id, updates)}
          />
        </div>
      )}
    </div>
  );
};

export default LayerList;
