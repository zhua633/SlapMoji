import React from "react";
import { Layer } from "./editTypes";

interface TextEditPanelProps {
  layer: Layer;
  onUpdate: (updates: Partial<Layer>) => void;
}

const TextEditPanel: React.FC<TextEditPanelProps> = ({ layer, onUpdate }) => {
  if (layer.type !== "text") return null;

  const fontFamilies = [
    "Impact, sans-serif",
    "Arial, sans-serif",
    "Georgia, serif",
    "Times New Roman, serif",
    "Courier New, monospace",
    "Helvetica, sans-serif",
    "Verdana, sans-serif",
    "Comic Sans MS, cursive",
    "Trebuchet MS, sans-serif",
    "Lucida Console, monospace",
  ];

  const fontWeights = ["normal", "bold", "bolder", "lighter"];

  const strokeWidths = [0, 1, 2, 3, 4, 5, 6, 8, 10];

  const fontSizes = [
    12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 84, 96,
  ];

  const textAlignments: Array<{
    value: "left" | "center" | "right";
    label: string;
    icon: string;
  }> = [
    { value: "left", label: "Left", icon: "⬅" },
    { value: "center", label: "Center", icon: "⬌" },
    { value: "right", label: "Right", icon: "➡" },
  ];

  return (
    <div className="bg-gray-700 rounded-lg p-4 mt-4 space-y-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm">Text Properties</h3>
        <span className="text-xs text-gray-400">✏️</span>
      </div>

      {/* Text Content */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-300">Text</label>
        <textarea
          value={layer.text || ""}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm resize-none"
          rows={2}
          placeholder="Enter text..."
        />
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-300">
          Font Family
        </label>
        <select
          value={layer.fontFamily || "Impact, sans-serif"}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
        >
          {fontFamilies.map((font) => (
            <option key={font} value={font}>
              {font.split(",")[0]}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size and Color Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-300">
            Size
          </label>
          <select
            value={layer.fontSize || 48}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
          >
            {fontSizes.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-300">
            Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={layer.color || "#ffffff"}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer bg-gray-800 border border-gray-600"
            />
            <input
              type="text"
              value={layer.color || "#ffffff"}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs"
              placeholder="#ffffff"
            />
          </div>
        </div>
      </div>

      {/* Font Weight */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-300">
          Font Weight
        </label>
        <select
          value={layer.fontWeight || "bold"}
          onChange={(e) => onUpdate({ fontWeight: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
        >
          {fontWeights.map((weight) => (
            <option key={weight} value={weight}>
              {weight.charAt(0).toUpperCase() + weight.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Stroke Controls */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-300">
            Stroke Width
          </label>
          <select
            value={layer.strokeWidth || 3}
            onChange={(e) =>
              onUpdate({ strokeWidth: parseInt(e.target.value) })
            }
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
          >
            {strokeWidths.map((width) => (
              <option key={width} value={width}>
                {width}px
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-300">
            Stroke Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={layer.strokeColor || "#000000"}
              onChange={(e) => onUpdate({ strokeColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer bg-gray-800 border border-gray-600"
            />
            <input
              type="text"
              value={layer.strokeColor || "#000000"}
              onChange={(e) => onUpdate({ strokeColor: e.target.value })}
              className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs"
              placeholder="#000000"
            />
          </div>
        </div>
      </div>

      {/* Text Alignment */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-300">
          Alignment
        </label>
        <div className="flex gap-1">
          {textAlignments.map((alignment) => (
            <button
              key={alignment.value}
              onClick={() => onUpdate({ textAlign: alignment.value })}
              className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
                (layer.textAlign || "center") === alignment.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-600"
              }`}
              title={alignment.label}
            >
              <span className="block">{alignment.icon}</span>
              <span className="text-xs">{alignment.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextEditPanel;
