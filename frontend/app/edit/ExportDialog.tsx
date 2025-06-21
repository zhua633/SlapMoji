import React from "react";

interface ExportDialogProps {
  show: boolean;
  exporting: boolean;
  onExport: (format: "png" | "gif") => void;
  onClose: () => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ show, exporting, onExport, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-gray-900 rounded-lg p-8 w-80 flex flex-col items-center shadow-2xl">
        <h2 className="text-lg font-bold mb-4">Export as...</h2>
        <div className="flex gap-4">
          <button
            onClick={() => onExport("png")}
            disabled={exporting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold disabled:opacity-50"
          >
            PNG
          </button>
          <button
            onClick={() => onExport("gif")}
            disabled={exporting}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm font-semibold disabled:opacity-50"
          >
            GIF
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm font-semibold"
          disabled={exporting}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ExportDialog; 