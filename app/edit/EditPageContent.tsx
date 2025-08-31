"use client";
import { useSearchParams } from "next/navigation";
import {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { parseGIF, decompressFrames } from "gifuct-js";
import GIF from "gif.js";
import LayeredCanvas from "./LayeredCanvas";
import LayerList from "./LayerList";
import FrameStrip from "./FrameStrip";
import ExportDialog from "./ExportDialog";
import AddLayerModal from "./AddLayerModal";
import { Layer, Frame } from "./editTypes";
import {
  DEFAULT_IMG_SIZE,
  DEFAULT_IMG_POS,
  isGif,
  createBlankFrame,
} from "./editUtils";
import { DropResult, DragDropContext } from "@hello-pangea/dnd";

export default function EditPageContent() {
  const searchParams = useSearchParams();
  const imgUrl = searchParams.get("img");
  const imgName = searchParams.get("name");
  const imgType = searchParams.get("type");

  // Per-frame layers: each frame has its own array of layers
  const [frameLayers, setFrameLayers] = useState<Layer[][]>([]);
  // Selected layer state (per frame)
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  // Focus state to track whether user is focused on frames or layers
  const [focusedElement, setFocusedElement] = useState<
    "frame" | "layer" | null
  >(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newLayerImage, setNewLayerImage] = useState<File | null>(null);

  // For resizing
  const resizing = useRef(false);
  const rotating = useRef(false);
  const dragging = useRef(false);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startSize = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
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
  const [copiedFrame, setCopiedFrame] = useState<{
    frame: Frame;
    layers: Layer[];
  } | null>(null);

  // State for live frame previews
  const [liveFramePreviews, setLiveFramePreviews] = useState<string[]>([]);

  // Loading state to prevent flickering before image validation
  const [isLoading, setIsLoading] = useState(true);
  // State to track if component is mounted (for SSR compatibility)
  const [isMounted, setIsMounted] = useState(false);
  // Counter for generating stable frame IDs
  const frameIdCounter = useRef(0);

  // Function to generate stable frame ID
  const generateFrameId = (prefix: string = "frame") => {
    frameIdCounter.current += 1;
    return `${prefix}-${frameIdCounter.current}`;
  };

  // Function to generate preview image from layers
  const generateFramePreview = async (
    layers: Layer[],
    canvasWidth: number,
    canvasHeight: number
  ): Promise<string> => {
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw all layers
    for (const layer of layers) {
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

          // Apply flip transformations
          if (layer.flipX || layer.flipY) {
            ctx.scale(layer.flipX ? -1 : 1, layer.flipY ? -1 : 1);
          }

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
          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
          resolve(null);
        };
        img.src = layer.src || "";
      });
    }

    return canvas.toDataURL("image/png");
  };

  // Function to calculate bounding box of all image layers
  const calculateBoundingBox = (
    layers: Layer[],
    canvasWidth: number,
    canvasHeight: number
  ) => {
    if (layers.length === 0) {
      return { x: 0, y: 0, width: canvasWidth, height: canvasHeight };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const layer of layers) {
      if (layer.type !== "image" || !layer.src) continue;

      const boxW = layer.width || DEFAULT_IMG_SIZE;
      const boxH = layer.height || DEFAULT_IMG_SIZE;
      // Layer positions are relative to center of canvas
      const x = (layer.x || 0) + canvasWidth / 2;
      const y = (layer.y || 0) + canvasHeight / 2;

      // Calculate corners of the layer (considering rotation)
      const corners = [
        { x: x - boxW / 2, y: y - boxH / 2 },
        { x: x + boxW / 2, y: y - boxH / 2 },
        { x: x + boxW / 2, y: y + boxH / 2 },
        { x: x - boxW / 2, y: y + boxH / 2 },
      ];

      // Apply rotation if needed
      if (layer.rotation) {
        const angle = (layer.rotation * Math.PI) / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        corners.forEach((corner) => {
          const dx = corner.x - x;
          const dy = corner.y - y;
          corner.x = x + dx * cos - dy * sin;
          corner.y = y + dx * sin + dy * cos;
        });
      }

      // Update bounding box
      corners.forEach((corner) => {
        minX = Math.min(minX, corner.x);
        minY = Math.min(minY, corner.y);
        maxX = Math.max(maxX, corner.x);
        maxY = Math.max(maxY, corner.y);
      });
    }

    // Add some padding
    const padding = 20;
    const bboxWidth = maxX - minX + 2 * padding;
    const bboxHeight = maxY - minY + 2 * padding;

    return {
      x: Math.max(0, minX - padding),
      y: Math.max(0, minY - padding),
      width: Math.min(canvasWidth, bboxWidth),
      height: Math.min(canvasHeight, bboxHeight),
    };
  };

  // Function to draw layers to canvas with transparent background (for PNG)
  const drawLayersToCanvasTransparent = async (
    layers: Layer[],
    canvas: HTMLCanvasElement,
    offsetX: number = 0,
    offsetY: number = 0
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const layer of layers) {
      if (layer.type !== "image" || !layer.src) continue;

      await new Promise((resolve) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.save();

          // Calculate position relative to the new canvas
          // Layer positions are relative to center of original canvas, so we need to adjust
          const cx = canvas.width / 2 + (layer.x || 0) + offsetX;
          const cy = canvas.height / 2 + (layer.y || 0) + offsetY;
          ctx.translate(cx, cy);
          ctx.rotate(((layer.rotation || 0) * Math.PI) / 180);

          // Apply flip transformations
          if (layer.flipX || layer.flipY) {
            ctx.scale(layer.flipX ? -1 : 1, layer.flipY ? -1 : 1);
          }

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
          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
          resolve(null);
        };
        img.src = layer.src || "";
      });
    }
  };

  // Function to draw layers to canvas with proper aspect ratio
  const drawLayersToCanvas = async (
    layers: Layer[],
    canvas: HTMLCanvasElement,
    offsetX: number = 0,
    offsetY: number = 0
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill with black background for GIF transparency
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const layer of layers) {
      if (layer.type !== "image" || !layer.src) continue;

      await new Promise((resolve) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.save();

          // Calculate position relative to the new canvas
          // Layer positions are relative to center of original canvas, so we need to adjust
          const cx = canvas.width / 2 + (layer.x || 0) + offsetX;
          const cy = canvas.height / 2 + (layer.y || 0) + offsetY;
          ctx.translate(cx, cy);
          ctx.rotate(((layer.rotation || 0) * Math.PI) / 180);

          // Apply flip transformations
          if (layer.flipX || layer.flipY) {
            ctx.scale(layer.flipX ? -1 : 1, layer.flipY ? -1 : 1);
          }

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
          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
          resolve(null);
        };
        img.src = layer.src || "";
      });
    }
  };

  useLayoutEffect(() => {
    setIsMounted(true);
    if (editorRef.current) {
      const rect = editorRef.current.getBoundingClientRect();
      setEditorSize({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    }
  }, []);

  // Extract frames on initial upload
  useEffect(() => {
    async function extractFrames() {
      if (!imgUrl) {
        setIsLoading(false);
        return;
      }

      try {
        const isGifType = imgType === "image/gif";
        if (isGif(imgUrl) || isGifType) {
          // Extract all frames from GIF
          const response = await fetch(imgUrl);
          if (!response.ok) {
            window.location.href = "/";
            return;
          }
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
              const imageData = frameCtx.createImageData(
                frame.dims.width,
                frame.dims.height
              );
              imageData.data.set(frame.patch);
              frameCtx.putImageData(imageData, 0, 0);
            }
            return {
              id: generateFrameId("gif-frame"),
              preview: frameCanvas.toDataURL(),
              frame,
            };
          });
          setFrames(previews);
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
          setFrameLayers(
            previews.map((f) => [
              {
                ...initialLayer,
                id: `layer-1`,
                src: f.preview,
                type: "image" as const,
              },
            ])
          );
          setSelectedFrameIdx(0);
          setSelectedLayerId("layer-1");
          setIsLoading(false);
        } else {
          const img = new Image();
          img.onerror = () => {
            window.location.href = "/";
            return;
          };
          img.onload = () => {
            setFrames([
              {
                id: generateFrameId("static-frame"),
                preview: imgUrl,
              },
            ]);
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
            setIsLoading(false);
          };
          img.src = imgUrl;
        }
      } catch {
        window.location.href = "/";
        return;
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
    // Only create a layer if an image is selected
    if (!newLayerImage) {
      handleModalClose();
      return;
    }

    setFrameLayers((prev: Layer[][]) => {
      const newLayer: Layer = {
        id: `layer-${prev[selectedFrameIdx]?.length + 1 || 1}`,
        name: newLayerImage.name,
        type: "image",
        src: URL.createObjectURL(newLayerImage),
        width: DEFAULT_IMG_SIZE,
        height: DEFAULT_IMG_SIZE,
        rotation: 0,
        ...DEFAULT_IMG_POS,
      };
      setSelectedLayerId(newLayer.id);
      setFocusedElement("layer"); // Set focus to layer when creating new layer
      return prev.map((layers, idx) =>
        idx === selectedFrameIdx ? [...layers, newLayer] : layers
      );
    });
    handleModalClose();
  };

  // Unified drag and drop handler for both layers and frames
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Handle frame reordering
    if (
      source.droppableId === "frames-droppable" &&
      destination.droppableId === "frames-droppable"
    ) {
      const sourceIndex = source.index;
      const destinationIndex = destination.index;

      // Reorder frames array
      setFrames((prev) => {
        const reordered = Array.from(prev);
        const [removed] = reordered.splice(sourceIndex, 1);
        reordered.splice(destinationIndex, 0, removed);
        return reordered;
      });

      // Reorder corresponding frameLayers
      setFrameLayers((prev: Layer[][]) => {
        const reordered = Array.from(prev);
        const [removed] = reordered.splice(sourceIndex, 1);
        reordered.splice(destinationIndex, 0, removed);
        return reordered;
      });

      // Update selectedFrameIdx if the selected frame was moved
      if (selectedFrameIdx === sourceIndex) {
        setSelectedFrameIdx(destinationIndex);
      } else if (
        selectedFrameIdx > sourceIndex &&
        selectedFrameIdx <= destinationIndex
      ) {
        setSelectedFrameIdx(selectedFrameIdx - 1);
      } else if (
        selectedFrameIdx < sourceIndex &&
        selectedFrameIdx >= destinationIndex
      ) {
        setSelectedFrameIdx(selectedFrameIdx + 1);
      }
    }
    // Handle layer reordering
    else if (
      source.droppableId === "layers-droppable" &&
      destination.droppableId === "layers-droppable"
    ) {
      setFrameLayers((prev: Layer[][]) =>
        prev.map((layers, idx) => {
          if (idx !== selectedFrameIdx) return layers;
          const reordered = Array.from(layers);
          const [removed] = reordered.splice(source.index, 1);
          reordered.splice(destination.index, 0, removed);
          return reordered;
        })
      );
    }
  };

  // Layer selection
  const handleSelectLayer = (id: string) => {
    setSelectedLayerId(id);
    setFocusedElement("layer");
  };

  // Frame selection
  const handleSelectFrame = (idx: number) => {
    setSelectedFrameIdx(idx);
    setFocusedElement("frame");
    // Clear layer selection when switching frames unless staying on same frame
    if (idx !== selectedFrameIdx) {
      setSelectedLayerId(null);
    }
  };

  // Image click handler (for canvas clicks)
  const handleImageClick = (layer: Layer) => {
    setSelectedLayerId(layer.id);
    setFocusedElement("layer");
  };

  // Resize/rotate handlers
  const handleResizeMouseDown = (e: React.MouseEvent, layer: Layer) => {
    e.stopPropagation();
    resizing.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = {
      width: layer.width || DEFAULT_IMG_SIZE,
      height: layer.height || DEFAULT_IMG_SIZE,
    };
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

  // Flip handler
  const handleFlipClick = (
    e: React.MouseEvent,
    layer: Layer,
    direction: "horizontal" | "vertical"
  ) => {
    e.stopPropagation();
    if (layer.type !== "image") return;

    setFrameLayers((prev: Layer[][]) =>
      prev.map((layers, idx) => {
        if (idx !== selectedFrameIdx) return layers;
        return layers.map((l: Layer) => {
          if (l.id !== layer.id) return l;
          return {
            ...l,
            flipX: direction === "horizontal" ? !l.flipX : l.flipX,
            flipY: direction === "vertical" ? !l.flipY : l.flipY,
          };
        });
      })
    );
  };

  // Export handler
  const handleExport = () => {
    setShowExportDialog(true);
  };
  const doExport = async (format: "png" | "gif") => {
    setExporting(true);
    const visibleLayers = frameLayers[selectedFrameIdx].filter(
      (l) => l.type === "image" && l.src
    );
    if (visibleLayers.length === 0) return;

    if (format === "gif" && frames.length > 0) {
      // Calculate bounding box for all frames to ensure consistent export size
      let globalMinX = Infinity,
        globalMinY = Infinity,
        globalMaxX = -Infinity,
        globalMaxY = -Infinity;

      for (let i = 0; i < frames.length; i++) {
        const layersForFrame = frameLayers[i].map(
          (layer: Layer, idx: number) => {
            if (idx === 0 && layer.type === "image") {
              return {
                ...layer,
                src: frames[i].preview,
              };
            }
            return layer;
          }
        );

        const bbox = calculateBoundingBox(
          layersForFrame,
          editorSize.width,
          editorSize.height
        );
        globalMinX = Math.min(globalMinX, bbox.x);
        globalMinY = Math.min(globalMinY, bbox.y);
        globalMaxX = Math.max(globalMaxX, bbox.x + bbox.width);
        globalMaxY = Math.max(globalMaxY, bbox.y + bbox.height);
      }

      const exportWidth = Math.round(globalMaxX - globalMinX);
      const exportHeight = Math.round(globalMaxY - globalMinY);

      // Export all frames in the current frames array
      const gifEncoder = new GIF({
        workers: 2,
        quality: 10,
        width: exportWidth,
        height: exportHeight,
        workerScript: "/gif.worker.js",
        transparent: "#000000", // Set black as transparent color
      });

      for (let i = 0; i < frames.length; i++) {
        // For each frame, set the main image layer's src to the frame preview
        const layersForFrame = frameLayers[i].map(
          (layer: Layer, idx: number) => {
            if (idx === 0 && layer.type === "image") {
              return {
                ...layer,
                src: frames[i].preview,
              };
            }
            return layer;
          }
        );

        // Create full-size canvas first with transparent background
        const fullCanvas = document.createElement("canvas");
        fullCanvas.width = editorSize.width;
        fullCanvas.height = editorSize.height;
        const fullCtx = fullCanvas.getContext("2d", { alpha: true });

        if (fullCtx) {
          // Fill with black background for GIF transparency
          fullCtx.fillStyle = "#000000";
          fullCtx.fillRect(0, 0, fullCanvas.width, fullCanvas.height);

          // Draw layers normally on the full canvas
          await drawLayersToCanvas(layersForFrame, fullCanvas, 0, 0);
        }

        // Create the export canvas with cropped dimensions and transparent background
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = exportWidth;
        exportCanvas.height = exportHeight;
        const exportCtx = exportCanvas.getContext("2d", { alpha: true });

        if (exportCtx) {
          // Fill with black background for GIF transparency
          exportCtx.fillStyle = "#000000";
          exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

          // Draw the cropped portion from the full canvas
          exportCtx.drawImage(
            fullCanvas,
            globalMinX,
            globalMinY,
            exportWidth,
            exportHeight,
            0,
            0,
            exportWidth,
            exportHeight
          );
          gifEncoder.addFrame(exportCtx, {
            copy: true,
            delay: frames[i].frame?.delay || 100,
          });
        }
      }

      gifEncoder.on("finished", function (blob: Blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "exported-image.gif";
        a.click();
        setExporting(false);
        setShowExportDialog(false);
      });
      gifEncoder.render();
      return;
    }

    // PNG or static GIF fallback
    const currentLayers = frameLayers[selectedFrameIdx];
    const bbox = calculateBoundingBox(
      currentLayers,
      editorSize.width,
      editorSize.height
    );

    // Create full-size canvas first with transparent background
    const fullCanvas = document.createElement("canvas");
    fullCanvas.width = editorSize.width;
    fullCanvas.height = editorSize.height;
    const fullCtx = fullCanvas.getContext("2d", { alpha: true });

    if (fullCtx) {
      // Clear with transparent background for PNG
      fullCtx.clearRect(0, 0, fullCanvas.width, fullCanvas.height);

      // Draw layers normally on the full canvas with transparent background
      await drawLayersToCanvasTransparent(currentLayers, fullCanvas, 0, 0);
    }

    // Create the export canvas with cropped dimensions and transparent background
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = Math.round(bbox.width);
    exportCanvas.height = Math.round(bbox.height);
    const exportCtx = exportCanvas.getContext("2d", { alpha: true });

    if (exportCtx) {
      // Clear with transparent background for PNG
      exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);

      // Draw the cropped portion from the full canvas
      exportCtx.drawImage(
        fullCanvas,
        bbox.x,
        bbox.y,
        bbox.width,
        bbox.height,
        0,
        0,
        bbox.width,
        bbox.height
      );
    }

    let url = "";
    if (format === "png") {
      url = exportCanvas.toDataURL("image/png");
    } else {
      url = exportCanvas.toDataURL("image/gif");
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
    // Replace the generated ID with our stable ID
    blank.id = generateFrameId("blank-frame");
    setFrames((prev) => [...prev, blank]);
    // Create a blank frame with no layers
    setFrameLayers((prev: Layer[][]) => {
      return [...prev, []]; // Empty array for the new frame
    });
    setSelectedFrameIdx(frames.length); // select the new frame
    setSelectedLayerId(null);
    setFocusedElement("frame"); // Focus on the newly created frame
  };

  // Delete frame (with minimum one frame constraint)
  const handleDeleteFrame = useCallback(() => {
    if (frames.length <= 1) {
      return;
    }

    setFrames((prev) => prev.filter((_, idx) => idx !== selectedFrameIdx));
    setFrameLayers((prev: Layer[][]) =>
      prev.filter((_, idx) => idx !== selectedFrameIdx)
    );

    // Adjust selected frame index
    const newSelectedIdx =
      selectedFrameIdx >= frames.length - 1
        ? Math.max(0, frames.length - 2) // Select previous frame if we deleted the last one
        : selectedFrameIdx; // Keep same index if we deleted a middle frame

    setSelectedFrameIdx(newSelectedIdx);

    // Reset selected layer to the first layer of the new frame
    const newFrameLayers = frameLayers.filter(
      (_, idx) => idx !== selectedFrameIdx
    );
    const firstLayerId = newFrameLayers[newSelectedIdx]?.[0]?.id || null;
    setSelectedLayerId(firstLayerId);

    // Keep focus on frames after deletion
    setFocusedElement("frame");
  }, [frames.length, selectedFrameIdx, frameLayers]);

  // Defensive: ensure selectedFrameIdx is valid
  const safeFrameIdx = Math.max(
    0,
    Math.min(selectedFrameIdx, frameLayers.length - 1)
  );

  // Calculate display layers reactively
  const displayLayers = useMemo(() => {
    let layers: Layer[] = frameLayers[safeFrameIdx] || [];
    if ((isGif(imgUrl || "") || imgType === "image/gif") && frames.length > 0) {
      layers = (frameLayers[safeFrameIdx] || []).map(
        (layer: Layer, idx: number) => {
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
        }
      );
    }
    return layers;
  }, [frameLayers, safeFrameIdx, frames, imgUrl, imgType]);

  // Generate live previews whenever layers change
  useEffect(() => {
    const updatePreviews = async () => {
      const newPreviews: string[] = [];
      for (let i = 0; i < frameLayers.length; i++) {
        const layers = frameLayers[i];
        if (layers && layers.length > 0) {
          const preview = await generateFramePreview(
            layers,
            editorSize.width,
            editorSize.height
          );
          newPreviews.push(preview);
        } else {
          // If no layers, use original frame preview or empty
          newPreviews.push(frames[i]?.preview || "");
        }
      }
      setLiveFramePreviews(newPreviews);
    };

    if (
      frameLayers.length > 0 &&
      editorSize.width > 0 &&
      editorSize.height > 0
    ) {
      updatePreviews();
    }
  }, [frameLayers, editorSize.width, editorSize.height, frames]);

  // Keyboard copy-paste handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // Copy (Ctrl/Cmd+C)
      if (ctrlKey && e.key.toLowerCase() === "c") {
        if (focusedElement === "layer" && selectedLayerId) {
          // Copy layer
          const layer = frameLayers[selectedFrameIdx]?.find(
            (l) => l.id === selectedLayerId
          );
          if (layer) {
            setCopiedLayer({ ...layer });
          }
        } else if (focusedElement === "frame") {
          // Copy frame
          const frame = frames[selectedFrameIdx];
          const layers = frameLayers[selectedFrameIdx] || [];
          if (frame) {
            setCopiedFrame({
              frame: { ...frame },
              layers: layers.map((layer) => ({ ...layer })),
            });
          }
        }
      }

      // Paste (Ctrl/Cmd+V)
      if (ctrlKey && e.key.toLowerCase() === "v") {
        if (focusedElement === "layer" && copiedLayer) {
          // Paste layer
          e.preventDefault();
          setFrameLayers((prev: Layer[][]) =>
            prev.map((layers, idx) => {
              if (idx !== selectedFrameIdx) return layers;
              // Generate a new unique id for the pasted layer
              const newId = `layer-${layers.length + 1}`;
              const pastedLayer = { ...copiedLayer, id: newId };
              setSelectedLayerId(newId);
              setFocusedElement("layer"); // Set focus to layer when pasting
              return [...layers, pastedLayer];
            })
          );
        } else if (focusedElement === "frame" && copiedFrame) {
          // Paste frame
          e.preventDefault();
          const newFrameIndex = frames.length;

          // Add the copied frame to frames array with new ID
          setFrames((prev) => [
            ...prev,
            {
              ...copiedFrame.frame,
              id: generateFrameId("copied-frame"),
            },
          ]);

          // Add the copied layers to frameLayers with new unique IDs
          setFrameLayers((prev: Layer[][]) => {
            const newLayers = copiedFrame.layers.map((layer, idx) => ({
              ...layer,
              id: `layer-${Date.now()}-${idx}`, // Generate unique IDs
            }));
            return [...prev, newLayers];
          });

          // Select the newly pasted frame
          setSelectedFrameIdx(newFrameIndex);
          setSelectedLayerId(null);
          setFocusedElement("frame");
        }
      }

      // Delete (Delete key or Backspace key)
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();

        // If focus is on a layer and a layer is selected, delete the layer
        if (focusedElement === "layer" && selectedLayerId) {
          setFrameLayers((prev: Layer[][]) => {
            return prev.map((layers, idx) => {
              if (idx !== selectedFrameIdx) return layers;
              const filteredLayers = layers.filter(
                (layer) => layer.id !== selectedLayerId
              );

              // If we deleted the last layer, create a blank layer to prevent empty frames
              if (filteredLayers.length === 0) {
                const blankLayer: Layer = {
                  id: "layer-1",
                  name: "Blank Layer 1",
                  type: "blank",
                };
                setSelectedLayerId(blankLayer.id);
                setFocusedElement("layer"); // Ensure focus stays on layer
                return [blankLayer];
              }

              // Select the layer above the deleted one, or the first layer if we deleted the top one
              const deletedIndex = layers.findIndex(
                (layer) => layer.id === selectedLayerId
              );
              const newSelectedIndex = Math.max(0, deletedIndex - 1);
              const newSelectedId =
                filteredLayers[newSelectedIndex]?.id || null;
              setSelectedLayerId(newSelectedId);
              setFocusedElement("layer"); // Ensure focus stays on layer
              return filteredLayers;
            });
          });
        } else if (focusedElement === "frame") {
          // If focus is on a frame, delete the current frame (with minimum one frame constraint)
          handleDeleteFrame();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedLayerId,
    copiedLayer,
    copiedFrame,
    frameLayers,
    selectedFrameIdx,
    frames,
    handleDeleteFrame,
    focusedElement,
  ]);

  // Show loading screen while validating image
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading image...</p>
        </div>
      </div>
    );
  }

  // Don't render DragDropContext on server side
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8"
        onClick={(e) => {
          // Clear focus when clicking on empty areas
          if (e.target === e.currentTarget) {
            setFocusedElement(null);
            setSelectedLayerId(null);
          }
        }}
      >
        <div
          className="flex w-full max-w-5xl overflow-hidden gap-6"
          style={{ height: editorSize.height }}
        >
          {/* Left: Superimposed Images */}
          <LayeredCanvas
            layers={displayLayers || []}
            selectedLayerId={selectedLayerId}
            editorRef={editorRef}
            onImageMouseDown={handleImageMouseDown}
            onResizeMouseDown={handleResizeMouseDown}
            onRotateMouseDown={handleRotateMouseDown}
            onFlipClick={handleFlipClick}
            onImageClick={handleImageClick}
          />
          {/* Right: Layers box, same height as canvas */}
          <LayerList
            layers={frameLayers[safeFrameIdx] || []}
            selectedLayerId={selectedLayerId}
            onSelectLayer={handleSelectLayer}
            onAddLayerClick={handleAddLayerClick}
            onExportClick={handleExport}
            editorHeight={editorSize.height}
          />
        </div>
        {/* Frame row at the bottom */}
        <FrameStrip
          frames={frames}
          selectedFrameIdx={selectedFrameIdx}
          onSelectFrame={handleSelectFrame}
          onAddFrame={handleAddFrame}
          customPreviews={liveFramePreviews}
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
    </DragDropContext>
  );
}
