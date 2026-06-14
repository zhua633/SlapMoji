import React from "react";
import UploadArea from "../components/UploadArea";

interface AddLayerModalProps {
  show: boolean;
  newLayerImage: File | null;
  onFileSelected: (file: File | null) => void;
  onCreateLayer: () => void;
  onClose: () => void;
}

const AddLayerModal: React.FC<AddLayerModalProps> = ({
  show,
  newLayerImage,
  onFileSelected,
  onCreateLayer,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="px-6 pt-8 pb-6 flex flex-col items-center">
          <p className="text-[11px] uppercase tracking-[0.15em] text-white/40 mb-2">
            New layer
          </p>
          <h2 className="text-lg font-medium text-white mb-1">Add image</h2>
          <p className="text-[13px] text-white/40 mb-6 text-center">
            PNG or JPG · up to 5 MB
          </p>

          <div className="w-full">
            <UploadArea
              onFileSelected={onFileSelected}
              value={newLayerImage}
              buttonLabel="Choose image"
              showConfirm={false}
              fileTypes={["image/png", "image/jpeg", "image/jpg"]}
              height="auto"
              maxFileSize={5 * 1024 * 1024}
            />
          </div>

          <div className="flex gap-3 mt-6 w-full">
            <button
              type="button"
              onClick={onCreateLayer}
              disabled={!newLayerImage}
              className="flex-1 rounded-full bg-white py-2.5 text-[13px] font-medium text-black hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Add layer
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-white/20 py-2.5 text-[13px] text-white/60 hover:text-white hover:border-white/35 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLayerModal;
