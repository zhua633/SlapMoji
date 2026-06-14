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
  onSaveTemplateClick?: () => void;
  saveTemplateLoading?: boolean;
  showSaveTemplate?: boolean;
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void;
  editorHeight: number;
}

const iconBtnClass =
  "p-2 rounded-full text-white/45 hover:text-white hover:bg-white/[0.06] transition-colors";

const LayerList: React.FC<LayerListProps> = ({
  layers,
  selectedLayerId,
  showTextProperties,
  onSelectLayer,
  onAddLayerClick,
  onAddTextLayerClick,
  onExportClick,
  onSaveTemplateClick,
  saveTemplateLoading = false,
  showSaveTemplate = false,
  onUpdateLayer,
  editorHeight,
}) => {
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);

  return (
    <div
      className="w-[300px] shrink-0 flex flex-col gap-3"
      style={{ height: editorHeight }}
    >
      <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <span className="text-[11px] uppercase tracking-[0.15em] text-white/40">
            Layers
          </span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={onAddTextLayerClick}
              aria-label="Add text layer"
              title="Add text"
              className={iconBtnClass}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 22 22"
                fill="none"
                aria-hidden
              >
                <path d="M3 4H19V6H13V18H9V6H3V4Z" fill="currentColor" />
              </svg>
            </button>
            <button
              onClick={onAddLayerClick}
              aria-label="Add image layer"
              title="Add image"
              className={iconBtnClass}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 22 22"
                fill="none"
                aria-hidden
              >
                <path
                  d="M11 4V18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M4 11H18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
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
                className="h-full overflow-y-auto px-3 py-3 space-y-1.5"
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{ scrollbarWidth: "thin" }}
              >
                {layers.length === 0 && (
                  <li className="px-2 py-6 text-center text-[12px] text-white/30 leading-relaxed">
                    No layers yet.
                    <br />
                    Add text or an image above.
                  </li>
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
                        className={`rounded-lg px-3 py-2.5 flex items-center gap-2.5 text-[13px] text-white/80 cursor-move transition-all border ${
                          snapshot.isDragging
                            ? "shadow-lg bg-white/[0.08] border-white/20"
                            : layer.id === selectedLayerId
                              ? "bg-white/[0.06] border-white/25 text-white"
                              : "bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/10"
                        }`}
                        onClick={() => onSelectLayer(layer.id)}
                      >
                        <span
                          className={`inline-block w-1.5 h-1.5 shrink-0 rounded-full ${
                            layer.type === "text"
                              ? "bg-white"
                              : layer.type === "image"
                                ? "bg-white/50"
                                : "bg-white/25"
                          }`}
                          aria-hidden
                        />
                        <span className="truncate">{layer.name}</span>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            </div>
          )}
        </Droppable>

        <div className="shrink-0 px-3 py-3 border-t border-white/[0.06] flex flex-col gap-2">
          <button
            type="button"
            onClick={onExportClick}
            className="w-full rounded-full bg-white py-2.5 text-[13px] font-medium text-black hover:bg-white/90 transition-colors"
          >
            Export
          </button>
          {showSaveTemplate && onSaveTemplateClick && (
            <button
              type="button"
              onClick={onSaveTemplateClick}
              disabled={saveTemplateLoading}
              className="w-full rounded-full border border-white/20 py-2 text-[12px] text-white/60 hover:text-white hover:border-white/35 hover:bg-white/[0.04] disabled:opacity-40 transition-colors"
            >
              {saveTemplateLoading ? "Saving…" : "Save to gallery"}
            </button>
          )}
        </div>
      </div>

      {selectedLayer && selectedLayer.type === "text" && showTextProperties && (
        <div className="max-h-72 overflow-y-auto shrink-0">
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
