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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-gray-900 rounded-lg p-0 w-[420px] flex flex-col items-center shadow-2xl">
        <div className="w-full flex flex-col items-center justify-center p-6">
          <h2 className="text-lg font-bold mb-4">Add New Layer</h2>
          <UploadArea
            onFileSelected={onFileSelected}
            value={newLayerImage}
            buttonLabel="Upload Image (optional)"
            showConfirm={false}
          />
          <div className="flex gap-2 mt-6">
            <button
              onClick={onCreateLayer}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
            >
              Create Layer
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm font-semibold"
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