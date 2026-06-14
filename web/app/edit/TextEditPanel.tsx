import React from "react";
import { Layer } from "./editTypes";

interface TextEditPanelProps {
  layer: Layer;
  onUpdate: (updates: Partial<Layer>) => void;
}

const labelClass =
  "block text-[10px] uppercase tracking-[0.12em] text-white/35 mb-1.5";

const inputClass =
  "w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-white text-[13px] focus:outline-none focus:border-white/25 transition-colors";

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
  }> = [
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
      <p className="text-[11px] uppercase tracking-[0.15em] text-white/40">
        Text
      </p>

      <div>
        <label className={labelClass}>Content</label>
        <textarea
          value={layer.text || ""}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className={`${inputClass} resize-none`}
          rows={2}
          placeholder="Enter text…"
        />
      </div>

      <div>
        <label className={labelClass}>Font</label>
        <select
          value={layer.fontFamily || "Impact, sans-serif"}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          className={inputClass}
        >
          {fontFamilies.map((font) => (
            <option key={font} value={font}>
              {font.split(",")[0]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Size</label>
          <select
            value={layer.fontSize || 48}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
            className={inputClass}
          >
            {fontSizes.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={layer.color || "#ffffff"}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border border-white/10"
            />
            <input
              type="text"
              value={layer.color || "#ffffff"}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className={`${inputClass} text-[11px] font-mono`}
              placeholder="#ffffff"
            />
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Weight</label>
        <select
          value={layer.fontWeight || "bold"}
          onChange={(e) => onUpdate({ fontWeight: e.target.value })}
          className={inputClass}
        >
          {fontWeights.map((weight) => (
            <option key={weight} value={weight}>
              {weight.charAt(0).toUpperCase() + weight.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Stroke</label>
          <select
            value={layer.strokeWidth || 3}
            onChange={(e) =>
              onUpdate({ strokeWidth: parseInt(e.target.value) })
            }
            className={inputClass}
          >
            {strokeWidths.map((width) => (
              <option key={width} value={width}>
                {width}px
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Stroke color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={layer.strokeColor || "#000000"}
              onChange={(e) => onUpdate({ strokeColor: e.target.value })}
              className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border border-white/10"
            />
            <input
              type="text"
              value={layer.strokeColor || "#000000"}
              onChange={(e) => onUpdate({ strokeColor: e.target.value })}
              className={`${inputClass} text-[11px] font-mono`}
              placeholder="#000000"
            />
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Align</label>
        <div className="flex gap-1.5">
          {textAlignments.map((alignment) => (
            <button
              key={alignment.value}
              type="button"
              onClick={() => onUpdate({ textAlign: alignment.value })}
              className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] transition-colors ${
                (layer.textAlign || "center") === alignment.value
                  ? "bg-white text-black font-medium"
                  : "border border-white/10 text-white/45 hover:text-white/70 hover:border-white/20"
              }`}
            >
              {alignment.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextEditPanel;
