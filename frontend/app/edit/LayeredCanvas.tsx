import React, { RefObject } from "react";
import Image from "next/image";
import { Layer } from "./editTypes";
import { DEFAULT_IMG_SIZE } from "./editUtils";

interface LayeredCanvasProps {
  layers: Layer[];
  selectedLayerId: string | null;
  editorRef: RefObject<HTMLDivElement | null>;
  onImageMouseDown: (e: React.MouseEvent, layer: Layer) => void;
  onResizeMouseDown: (e: React.MouseEvent, layer: Layer) => void;
  onRotateMouseDown: (e: React.MouseEvent, layer: Layer) => void;
}

const LayeredCanvas: React.FC<LayeredCanvasProps> = ({
  layers,
  selectedLayerId,
  editorRef,
  onImageMouseDown,
  onResizeMouseDown,
  onRotateMouseDown,
}) => {
  return (
    <div ref={editorRef} className="flex-1 flex items-center justify-center bg-gray-800 relative">
      {layers.length === 0 && <span className="text-gray-400">No image provided.</span>}
      {layers.map((layer, idx) => {
        if (layer.type !== "image" || !layer.src) return null;
        const isSelected = layer.id === selectedLayerId;
        const isDataUrl = layer.src.startsWith('data:') || layer.src.startsWith('blob:');
        return (
          <div
            key={layer.id}
            style={{
              zIndex: idx + 1,
              position: "absolute",
              left: `calc(50% + ${(layer.x || 0)}px)`,
              top: `calc(50% + ${(layer.y || 0)}px)`,
              width: layer.width || DEFAULT_IMG_SIZE,
              height: layer.height || DEFAULT_IMG_SIZE,
              transform: `translate(-50%, -50%) rotate(${layer.rotation || 0}deg)`,
              pointerEvents: isSelected ? "auto" : "none",
              cursor: isSelected ? "move" : "default",
            }}
            onMouseDown={isSelected ? (e) => onImageMouseDown(e, layer) : undefined}
          >
            {isDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={layer.src}
                alt={layer.name}
                className="w-full h-full object-contain rounded shadow-lg select-none"
                draggable={false}
                style={{ pointerEvents: "none" }}
              />
            ) : (
              <Image
                src={layer.src}
                alt={layer.name}
                width={layer.width || DEFAULT_IMG_SIZE}
                height={layer.height || DEFAULT_IMG_SIZE}
                className="w-full h-full object-contain rounded shadow-lg select-none"
                draggable={false}
                style={{ pointerEvents: "none" }}
              />
            )}
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
                {/* Rotate handle (top center) */}
                <div
                  className="absolute w-4 h-4 bg-yellow-400 border-2 border-white rounded-full cursor-pointer rotate-handle"
                  style={{ left: "50%", top: -24, transform: "translateX(-50%)", zIndex: 20 }}
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