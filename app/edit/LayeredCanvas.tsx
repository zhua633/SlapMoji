import React, { RefObject } from "react";
import Image from "next/image";
import type { Layer } from "./editTypes";
import { DEFAULT_IMG_SIZE } from "./editUtils";

interface LayeredCanvasProps {
  layers: Layer[];
  selectedLayerId: string | null;
  editorRef: RefObject<HTMLDivElement | null>;
  onImageMouseDown: (e: React.MouseEvent, layer: Layer) => void;
  onResizeMouseDown: (e: React.MouseEvent, layer: Layer) => void;
  onRotateMouseDown: (e: React.MouseEvent, layer: Layer) => void;
  onFlipClick: (
    e: React.MouseEvent,
    layer: Layer,
    direction: "horizontal" | "vertical"
  ) => void;
  onImageClick?: (layer: Layer) => void;
  onTextDoubleClick?: (layer: Layer) => void;
}

const LayeredCanvas: React.FC<LayeredCanvasProps> = ({
  layers,
  selectedLayerId,
  editorRef,
  onImageMouseDown,
  onResizeMouseDown,
  onRotateMouseDown,
  onFlipClick,
  onImageClick,
  onTextDoubleClick,
}) => {
  return (
    <div
      ref={editorRef}
      className="flex-1 flex items-center justify-center bg-gray-800 relative rounded-xl"
    >
      {layers.length === 0 && (
        <span className="text-gray-400">No image provided.</span>
      )}
      {layers.map((layer, idx) => {
        if (layer.type === "blank") return null;
        if (layer.type === "image" && !layer.src) return null;
        const isSelected = layer.id === selectedLayerId;
        const isDataUrl =
          layer.src &&
          (layer.src.startsWith("data:") || layer.src.startsWith("blob:"));
        return (
          <div
            key={layer.id}
            style={{
              zIndex: idx + 1,
              position: "absolute",
              left: `calc(50% + ${layer.x || 0}px)`,
              top: `calc(50% + ${layer.y || 0}px)`,
              width:
                layer.type === "text"
                  ? "auto"
                  : layer.width || DEFAULT_IMG_SIZE,
              height:
                layer.type === "text"
                  ? "auto"
                  : layer.height || DEFAULT_IMG_SIZE,
              minWidth: layer.type === "text" ? "50px" : undefined,
              minHeight: layer.type === "text" ? "20px" : undefined,
              maxWidth: layer.type === "text" ? "400px" : undefined,
              transform: `translate(-50%, -50%) rotate(${
                layer.rotation || 0
              }deg)`,
              pointerEvents: "auto",
              cursor: isSelected ? "move" : "pointer",
            }}
            onMouseDown={(e) => {
              if (isSelected) {
                onImageMouseDown(e, layer);
              } else {
                // Select the layer when clicking on unselected layer
                onImageClick?.(layer);
              }
            }}
            onDoubleClick={(e) => {
              if (layer.type === "text") {
                e.stopPropagation();
                onTextDoubleClick?.(layer);
              }
            }}
          >
            {layer.type === "text" ? (
              <div
                className="select-none"
                style={{
                  pointerEvents: "none",
                  fontSize: layer.fontSize || 48,
                  fontFamily: layer.fontFamily || "Impact, sans-serif",
                  fontWeight: layer.fontWeight || "bold",
                  color: layer.color || "#ffffff",
                  textAlign: layer.textAlign || "center",
                  transform: `scaleX(${layer.flipX ? -1 : 1}) scaleY(${
                    layer.flipY ? -1 : 1
                  })`,
                  padding: "8px",
                  wordWrap: "break-word",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.2",
                  WebkitTextStroke:
                    layer.strokeWidth && layer.strokeColor
                      ? `${layer.strokeWidth}px ${layer.strokeColor}`
                      : "3px #000000",
                  textShadow:
                    layer.strokeWidth && layer.strokeColor
                      ? `
                      -${layer.strokeWidth}px -${layer.strokeWidth}px 0 ${layer.strokeColor},
                      ${layer.strokeWidth}px -${layer.strokeWidth}px 0 ${layer.strokeColor},
                      -${layer.strokeWidth}px ${layer.strokeWidth}px 0 ${layer.strokeColor},
                      ${layer.strokeWidth}px ${layer.strokeWidth}px 0 ${layer.strokeColor}
                    `
                      : "-3px -3px 0 #000000, 3px -3px 0 #000000, -3px 3px 0 #000000, 3px 3px 0 #000000",
                }}
              >
                {layer.text || "MEME TEXT"}
              </div>
            ) : layer.type === "image" && isDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={layer.src}
                alt={layer.name}
                className="w-full h-full object-contain rounded shadow-lg select-none"
                draggable={false}
                style={{
                  pointerEvents: "none",
                  transform: `scaleX(${layer.flipX ? -1 : 1}) scaleY(${
                    layer.flipY ? -1 : 1
                  })`,
                }}
              />
            ) : layer.type === "image" && layer.src ? (
              <Image
                src={layer.src}
                alt={layer.name}
                width={layer.width || DEFAULT_IMG_SIZE}
                height={layer.height || DEFAULT_IMG_SIZE}
                className="w-full h-full object-contain rounded shadow-lg select-none"
                draggable={false}
                style={{
                  pointerEvents: "none",
                  transform: `scaleX(${layer.flipX ? -1 : 1}) scaleY(${
                    layer.flipY ? -1 : 1
                  })`,
                }}
              />
            ) : null}
            {isSelected && (
              <>
                {/* Dotted outline */}
                <div
                  className="absolute inset-0 border-2 border-dotted border-blue-400 rounded pointer-events-none"
                  style={{ zIndex: 10 }}
                />
                {/* Resize handle (bottom right) */}
                <div
                  className="absolute w-4 h-4 bg-blue-400 border-2 border-white rounded-full cursor-nwse-resize resize-handle"
                  style={{ right: -10, bottom: -10, zIndex: 20 }}
                  onMouseDown={(e) => onResizeMouseDown(e, layer)}
                />
                {/* Flip handles */}
                {/* Horizontal flip (top left) */}
                <div
                  className="absolute w-4 h-4 bg-purple-400 border-2 border-white rounded-full cursor-pointer flip-handle flex items-center justify-center"
                  style={{ left: -10, top: -10, zIndex: 20 }}
                  onClick={(e) => onFlipClick(e, layer, "horizontal")}
                  title="Flip Horizontal"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3" />
                    <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
                    <path d="M12 20v2" />
                    <path d="M12 14v2" />
                    <path d="M12 8v2" />
                    <path d="M12 2v2" />
                  </svg>
                </div>
                {/* Vertical flip (top right) */}
                <div
                  className="absolute w-4 h-4 bg-purple-400 border-2 border-white rounded-full cursor-pointer flip-handle flex items-center justify-center"
                  style={{ right: -10, top: -10, zIndex: 20 }}
                  onClick={(e) => onFlipClick(e, layer, "vertical")}
                  title="Flip Vertical"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3" />
                    <path d="M3 16v3a2 2 0 0 0 2 2h14a2 2 0 0 1-2 2v-3" />
                    <path d="M20 12h2" />
                    <path d="M14 12h2" />
                    <path d="M8 12h2" />
                    <path d="M2 12h2" />
                  </svg>
                </div>
                {/* Rotate handle (top center) */}
                <div
                  className="absolute w-4 h-4 bg-yellow-400 border-2 border-white rounded-full cursor-pointer rotate-handle"
                  style={{
                    left: "50%",
                    top: -24,
                    transform: "translateX(-50%)",
                    zIndex: 20,
                  }}
                  onMouseDown={(e) => onRotateMouseDown(e, layer)}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LayeredCanvas;
