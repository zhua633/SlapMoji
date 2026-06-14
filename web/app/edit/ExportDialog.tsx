import React from "react";

interface ExportDialogProps {
  show: boolean;
  exporting: boolean;
  onExport: (format: "png" | "gif") => void;
  onClose: () => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  show,
  exporting,
  onExport,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a0a0a] p-8 flex flex-col items-center">
        <p className="text-[11px] uppercase tracking-[0.15em] text-white/40 mb-2">
          Export
        </p>
        <h2 className="text-lg font-medium text-white mb-2">Choose format</h2>
        <p className="text-[13px] text-white/40 text-center mb-8 leading-relaxed">
          PNG for a single frame. GIF exports all frames as an animation.
        </p>

        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={() => onExport("png")}
            disabled={exporting}
            className="flex-1 rounded-full bg-white py-2.5 text-[13px] font-medium text-black hover:bg-white/90 disabled:opacity-40 transition-colors"
          >
            PNG
          </button>
          <button
            type="button"
            onClick={() => onExport("gif")}
            disabled={exporting}
            className="flex-1 rounded-full border border-white/20 py-2.5 text-[13px] text-white/70 hover:text-white hover:border-white/35 disabled:opacity-40 transition-colors"
          >
            GIF
          </button>
        </div>

        {exporting && (
          <p className="mt-5 text-[12px] text-white/40 animate-pulse">
            Exporting…
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          disabled={exporting}
          className="mt-6 text-[13px] text-white/35 hover:text-white/60 disabled:opacity-40 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ExportDialog;
