"use client";
import { useSearchParams } from "next/navigation";
import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { parseGIF, decompressFrames } from 'gifuct-js';
import GIF from 'gif.js';
import LayeredCanvas from "./LayeredCanvas";
import LayerList from "./LayerList";
import FrameStrip from "./FrameStrip";
import ExportDialog from "./ExportDialog";
import AddLayerModal from "./AddLayerModal";
import { Layer, Frame } from "./editTypes";
import { DEFAULT_IMG_SIZE, DEFAULT_IMG_POS, isGif, createBlankFrame } from "./editUtils";
import { DropResult } from "react-beautiful-dnd";

export default function EditPageContent() {
  const searchParams = useSearchParams();
  const imgUrl = searchParams.get("img");
  const imgName = searchParams.get("name");
  const imgType = searchParams.get("type");

  // Per-frame layers: each frame has its own array of layers
  const [frameLayers, setFrameLayers] = useState<Layer[][]>([]);
  // Selected layer state (per frame)
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newLayerImage, setNewLayerImage] = useState<File | null>(null);

  // For resizing
  const resizing = useRef(false);
  const rotating = useRef(false);
  const dragging = useRef(false);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startSize = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const startRotation = useRef<number>(0);
  const startOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Export dialog state
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exporting, setExporting] = useState(false);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const [editorSize, setEditorSize] = useState({ width: 600, height: 600 });

  const [frames, setFrames] = useState<Frame[]>([]);
  const [selectedFrameIdx, setSelectedFrameIdx] = useState(0);

  // State for copy-paste
  const [copiedLayer, setCopiedLayer] = useState<Layer | null>(null);

  useLayoutEffect(() => {
    if (editorRef.current) {
      const rect = editorRef.current.getBoundingClientRect();
      setEditorSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
    }
  }, []);

  // Extract frames on initial upload
  useEffect(() => {
    async function extractFrames() {
      if (!imgUrl) return;
      const isGifType = imgType === "image/gif";
      if (isGif(imgUrl) || isGifType) {
        // Extract all frames from GIF
        const response = await fetch(imgUrl);
        const buffer = await response.arrayBuffer();
        const gif = parseGIF(buffer);
        const gifFrames = decompressFrames(gif, true);
        const previews = gifFrames.map((frame) => {
          // Convert frame patch to data URL
          const frameCanvas = document.createElement("canvas");
          frameCanvas.width = frame.dims.width;
          frameCanvas.height = frame.dims.height;
          const frameCtx = frameCanvas.getContext("2d");
          if (frameCtx) {
            const imageData = frameCtx.createImageData(frame.dims.width, frame.dims.height);
            imageData.data.set(frame.patch);
            frameCtx.putImageData(imageData, 0, 0);
          }
          return {
            preview: frameCanvas.toDataURL(),
            frame,
          };
        });
        setFrames(previews);
        // Initialize per-frame layers: each frame gets a copy of the initial image layer
        const initialLayer = {
          id: "layer-1",
          name: imgName || "Image Layer",
          type: "image" as const,
          src: previews[0].preview,
          width: DEFAULT_IMG_SIZE,
          height: DEFAULT_IMG_SIZE,
          rotation: 0,
          ...DEFAULT_IMG_POS,
        };
        setFrameLayers(previews.map((f) => [{ ...initialLayer, id: `layer-1`, src: f.preview, type: "image" as const }]));
        setSelectedFrameIdx(0);
        setSelectedLayerId("layer-1");
      } else {
        // PNG/JPG: just one frame, use the canvas preview
        setFrames([{ preview: imgUrl }]);
        setFrameLayers([
          [
            {
              id: "layer-1",
              name: imgName || "Image Layer",
              type: "image" as const,
              src: imgUrl,
              width: DEFAULT_IMG_SIZE,
              height: DEFAULT_IMG_SIZE,
              rotation: 0,
              ...DEFAULT_IMG_POS,
            },
          ],
        ]);
        setSelectedFrameIdx(0);
        setSelectedLayerId("layer-1");
      }
    }
    extractFrames();
  }, [imgUrl, imgType, imgName]);

  // Handlers for modal
  const handleAddLayerClick = () => {
    setShowModal(true);
    setNewLayerImage(null);
  };
  const handleModalClose = () => {
    setShowModal(false);
    setNewLayerImage(null);
  };
  const handleCreateLayer = () => {
    setFrameLayers((prev: Layer[][]) => {
      const newLayer: Layer = newLayerImage
        ? {
            id: `layer-${prev[selectedFrameIdx]?.length + 1 || 1}`,
            name: newLayerImage.name,
            type: "image",
            src: URL.createObjectURL(newLayerImage),
            width: DEFAULT_IMG_SIZE,
            height: DEFAULT_IMG_SIZE,
            rotation: 0,
            ...DEFAULT_IMG_POS,
          }
        : {
            id: `layer-${prev[selectedFrameIdx]?.length + 1 || 1}`,
            name: `Blank Layer ${prev[selectedFrameIdx]?.length + 1 || 1}`,
            type: "blank",
          };
      setSelectedLayerId(newLayer.id);
      return prev.map((layers, idx) =>
        idx === selectedFrameIdx ? [...layers, newLayer] : layers
      );
    });
    handleModalClose();
  };

  // Drag and drop handlers
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    setFrameLayers((prev: Layer[][]) =>
      prev.map((layers, idx) => {
        if (idx !== selectedFrameIdx) return layers;
        const reordered = Array.from(layers);
        if (!result.destination) return layers;
        const [removed] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, removed);
        return reordered;
      })
    );
  };

  // Layer selection
  const handleSelectLayer = (id: string) => {
    setSelectedLayerId(id);
  };

  // Resize/rotate handlers
  const handleResizeMouseDown = (e: React.MouseEvent, layer: Layer) => {
    e.stopPropagation();
    resizing.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { width: layer.width || DEFAULT_IMG_SIZE, height: layer.height || DEFAULT_IMG_SIZE };
    document.addEventListener("mousemove", handleResizeMouseMove);
    document.addEventListener("mouseup", handleResizeMouseUp);
  };
  const handleResizeMouseMove = (e: MouseEvent) => {
    if (!resizing.current || !selectedLayerId) return;
    setFrameLayers((prev: Layer[][]) =>
      prev.map((layers, idx) => {
        if (idx !== selectedFrameIdx) return layers;
        return layers.map((layer: Layer) => {
          if (layer.id !== selectedLayerId) return layer;
          const dx = e.clientX - startPos.current.x;
          const dy = e.clientY - startPos.current.y;
          return {
            ...layer,
            width: Math.max(40, startSize.current.width + dx),
            height: Math.max(40, startSize.current.height + dy),
          };
        });
      })
    );
  };
  const handleResizeMouseUp = () => {
    resizing.current = false;
    document.removeEventListener("mousemove", handleResizeMouseMove);
    document.removeEventListener("mouseup", handleResizeMouseUp);
  };
  const handleRotateMouseDown = (e: React.MouseEvent, layer: Layer) => {
    e.stopPropagation();
    rotating.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startRotation.current = layer.rotation || 0;
    document.addEventListener("mousemove", handleRotateMouseMove);
    document.addEventListener("mouseup", handleRotateMouseUp);
  };
  const handleRotateMouseMove = (e: MouseEvent) => {
    if (!rotating.current || !selectedLayerId) return;
    setFrameLayers((prev: Layer[][]) =>
      prev.map((layers, idx) => {
        if (idx !== selectedFrameIdx) return layers;
        return layers.map((layer: Layer) => {
          if (layer.id !== selectedLayerId) return layer;
          // Center of the image area (assume 320x320 default)
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
          return {
            ...layer,
            rotation: ((angle * 180) / Math.PI + 90) % 360,
          };
        });
      })
    );
  };
  const handleRotateMouseUp = () => {
    rotating.current = false;
    document.removeEventListener("mousemove", handleRotateMouseMove);
    document.removeEventListener("mouseup", handleRotateMouseUp);
  };
  // Drag selected image
  const handleImageMouseDown = (e: React.MouseEvent, layer: Layer) => {
    // Only drag if not on a handle
    if (
      (e.target as HTMLElement).classList.contains("resize-handle") ||
      (e.target as HTMLElement).classList.contains("rotate-handle")
    ) {
      return;
    }
    e.stopPropagation();
    dragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startOffset.current = { x: layer.x || 0, y: layer.y || 0 };
    document.addEventListener("mousemove", handleImageMouseMove);
    document.addEventListener("mouseup", handleImageMouseUp);
  };
  const handleImageMouseMove = (e: MouseEvent) => {
    if (!dragging.current || !selectedLayerId) return;
    setFrameLayers((prev: Layer[][]) =>
      prev.map((layers, idx) => {
        if (idx !== selectedFrameIdx) return layers;
        return layers.map((layer: Layer) => {
          if (layer.id !== selectedLayerId) return layer;
          const dx = e.clientX - startPos.current.x;
          const dy = e.clientY - startPos.current.y;
          // Clamp position to stay within canvas
          const width = layer.width || DEFAULT_IMG_SIZE;
          const height = layer.height || DEFAULT_IMG_SIZE;
          const minX = -editorSize.width / 2 + width / 2;
          const maxX = editorSize.width / 2 - width / 2;
          const minY = -editorSize.height / 2 + height / 2;
          const maxY = editorSize.height / 2 - height / 2;
          let newX = (startOffset.current.x || 0) + dx;
          let newY = (startOffset.current.y || 0) + dy;
          newX = Math.max(minX, Math.min(maxX, newX));
          newY = Math.max(minY, Math.min(maxY, newY));
          return {
            ...layer,
            x: newX,
            y: newY,
          };
        });
      })
    );
  };
  const handleImageMouseUp = () => {
    dragging.current = false;
    document.removeEventListener("mousemove", handleImageMouseMove);
    document.removeEventListener("mouseup", handleImageMouseUp);
  };

  // Export handler
  const handleExport = () => {
    setShowExportDialog(true);
  };
  const doExport = async (format: "png" | "gif") => {
    setExporting(true);
    const visibleLayers = frameLayers[selectedFrameIdx].filter((l) => l.type === "image" && l.src);
    if (visibleLayers.length === 0) return;
    const canvasWidth = editorSize.width;
    const canvasHeight = editorSize.height;
    if (format === "gif" && frames.length > 0) {
      // Export all frames in the current frames array
      const gifEncoder = new GIF({ workers: 2, quality: 10, width: canvasWidth, height: canvasHeight, workerScript: "/gif.worker.js" });
      for (let i = 0; i < frames.length; i++) {
        // For each frame, set the main image layer's src to the frame preview
        const layersForFrame = frameLayers[i].map((layer: Layer, idx: number) => {
          if (idx === 0 && layer.type === "image") {
            return {
              ...layer,
              src: frames[i].preview,
            };
          }
          return layer;
        });
        // Draw all layers to a canvas
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        for (const layer of layersForFrame) {
          if (layer.type !== 'image' || !layer.src) continue;
          await new Promise((resolve) => {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              ctx.save();
              const cx = canvasWidth / 2 + (layer.x || 0);
              const cy = canvasHeight / 2 + (layer.y || 0);
              ctx.translate(cx, cy);
              ctx.rotate(((layer.rotation || 0) * Math.PI) / 180);
              const boxW = layer.width || DEFAULT_IMG_SIZE;
              const boxH = layer.height || DEFAULT_IMG_SIZE;
              const imgAR = img.width / img.height;
              const boxAR = boxW / boxH;
              let drawW = boxW;
              let drawH = boxH;
              if (imgAR > boxAR) {
                drawW = boxW;
                drawH = boxW / imgAR;
              } else {
                drawH = boxH;
                drawW = boxH * imgAR;
              }
              ctx.drawImage(
                img,
                -drawW / 2,
                -drawH / 2,
                drawW,
                drawH
              );
              ctx.restore();
              resolve(null);
            };
            img.src = layer.src || '';
          });
        }
        gifEncoder.addFrame(ctx, { copy: true, delay: frames[i].frame?.delay || 100 });
      }
      gifEncoder.on('finished', function(blob: Blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'exported-image.gif';
        a.click();
        setExporting(false);
        setShowExportDialog(false);
      });
      gifEncoder.render();
      return;
    }
    // PNG or static GIF fallback
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    for (const layer of frameLayers[selectedFrameIdx]) {
      if (layer.type !== "image" || !layer.src) continue;
      await new Promise((resolve) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.save();
          const cx = canvasWidth / 2 + (layer.x || 0);
          const cy = canvasHeight / 2 + (layer.y || 0);
          ctx.translate(cx, cy);
          ctx.rotate(((layer.rotation || 0) * Math.PI) / 180);
          const boxW = layer.width || DEFAULT_IMG_SIZE;
          const boxH = layer.height || DEFAULT_IMG_SIZE;
          const imgAR = img.width / img.height;
          const boxAR = boxW / boxH;
          let drawW = boxW;
          let drawH = boxH;
          if (imgAR > boxAR) {
            drawW = boxW;
            drawH = boxW / imgAR;
          } else {
            drawH = boxH;
            drawW = boxH * imgAR;
          }
          ctx.drawImage(
            img,
            -drawW / 2,
            -drawH / 2,
            drawW,
            drawH
          );
          ctx.restore();
          resolve(null);
        };
        img.src = layer.src || "";
      });
    }
    let url = "";
    if (format === "png") {
      url = canvas.toDataURL("image/png");
    } else {
      url = canvas.toDataURL("image/gif");
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = `exported-image.${format}`;
    a.click();
    setExporting(false);
    setShowExportDialog(false);
  };

  // Add blank frame
  const handleAddFrame = () => {
    const blank = createBlankFrame(editorSize.width, editorSize.height);
    setFrames((prev) => [...prev, blank]);
    // Option 1: Copy layers from previous frame
    setFrameLayers((prev: Layer[][]) => {
      const prevLayers = prev[selectedFrameIdx] || [];
      // Deep copy layers (new ids)
      const copiedLayers = prevLayers.map((layer, i) => ({ ...layer, id: `layer-${i + 1}` }));
      return [...prev, copiedLayers];
    });
    setSelectedFrameIdx(frames.length); // select the new frame
    setSelectedLayerId(null);
  };

  // Defensive: ensure selectedFrameIdx is valid
  const safeFrameIdx = Math.max(0, Math.min(selectedFrameIdx, frameLayers.length - 1));
  let displayLayers: Layer[] = frameLayers[safeFrameIdx] || [];
  if ((isGif(imgUrl || "") || imgType === "image/gif") && frames.length > 0) {
    displayLayers = (frameLayers[safeFrameIdx] || []).map((layer: Layer, idx: number) => {
      if (
        idx === 0 &&
        layer.type === "image" &&
        // Only override src if it matches the original GIF frame preview
        frames[safeFrameIdx] &&
        layer.src === frames[safeFrameIdx].preview
      ) {
        return {
          ...layer,
          src: frames[safeFrameIdx]?.preview || layer.src,
        };
      }
      return layer;
    });
  }

  // Keyboard copy-paste handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;
      // Copy (Ctrl/Cmd+C)
      if (ctrlKey && e.key.toLowerCase() === 'c' && selectedLayerId) {
        const layer = frameLayers[selectedFrameIdx]?.find(l => l.id === selectedLayerId);
        if (layer) {
          setCopiedLayer({ ...layer });
        }
      }
      // Paste (Ctrl/Cmd+V)
      if (ctrlKey && e.key.toLowerCase() === 'v' && copiedLayer) {
        e.preventDefault();
        setFrameLayers((prev: Layer[][]) =>
          prev.map((layers, idx) => {
            if (idx !== selectedFrameIdx) return layers;
            // Generate a new unique id for the pasted layer
            const newId = `layer-${layers.length + 1}`;
            const pastedLayer = { ...copiedLayer, id: newId };
            setSelectedLayerId(newId);
            return [...layers, pastedLayer];
          })
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerId, copiedLayer, frameLayers, selectedFrameIdx]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
      <div className="flex w-full max-w-5xl bg-gray-900 rounded-xl shadow-lg overflow-hidden" style={{ height: editorSize.height }}>
        {/* Left: Superimposed Images */}
        <LayeredCanvas
          layers={displayLayers || []}
          selectedLayerId={selectedLayerId}
          editorRef={editorRef}
          onImageMouseDown={handleImageMouseDown}
          onResizeMouseDown={handleResizeMouseDown}
          onRotateMouseDown={handleRotateMouseDown}
        />
        {/* Right: Layers box, same height as canvas */}
        <LayerList
          layers={frameLayers[safeFrameIdx] || []}
          selectedLayerId={selectedLayerId}
          onSelectLayer={handleSelectLayer}
          onAddLayerClick={handleAddLayerClick}
          onExportClick={handleExport}
          onDragEnd={onDragEnd}
          editorHeight={editorSize.height}
        />
      </div>
      {/* Frame row at the bottom */}
      <FrameStrip
        frames={frames}
        selectedFrameIdx={selectedFrameIdx}
        onSelectFrame={setSelectedFrameIdx}
        onAddFrame={handleAddFrame}
      />
      {/* Export format dialog */}
      <ExportDialog
        show={showExportDialog}
        exporting={exporting}
        onExport={doExport}
        onClose={() => setShowExportDialog(false)}
      />
      {/* Modal Dialog for Adding Layer */}
      <AddLayerModal
        show={showModal}
        newLayerImage={newLayerImage}
        onFileSelected={setNewLayerImage}
        onCreateLayer={handleCreateLayer}
        onClose={handleModalClose}
      />
    </div>
  );
} 