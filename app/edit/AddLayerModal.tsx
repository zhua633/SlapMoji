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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-0 w-full max-w-2xl flex flex-col items-center shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="w-full flex flex-col items-center justify-center p-6">
          <h2 className="text-lg font-bold mb-4">Add New Layer</h2>
          <UploadArea
            onFileSelected={onFileSelected}
            value={newLayerImage}
            buttonLabel="Upload Image"
            showConfirm={false}
            fileTypes={["image/png"]}
            height="400px"
            maxFileSize={5 * 1024 * 1024} // 5MB limit for PNG files
          />
          <div className="flex gap-2 mt-6">
            <button
              onClick={onCreateLayer}
              disabled={!newLayerImage}
              className={`px-4 py-2 text-white rounded text-sm font-semibold ${
                newLayerImage 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-500 cursor-not-allowed'
              }`}
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