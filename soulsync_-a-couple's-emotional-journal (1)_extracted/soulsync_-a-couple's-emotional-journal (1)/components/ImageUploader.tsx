
import React, { useState, useEffect } from 'react';
import { ImageIcon } from './icons/ImageIcon';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  folderName: string; // Keep prop for compatibility, though unused
  currentImageUrl: string | null;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadComplete, currentImageUrl }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPreview(currentImageUrl);
    if (!currentImageUrl) {
        setFile(null);
    }
  }, [currentImageUrl]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File is too large. Please select an image under 5MB.');
        return;
      }
      setError(null);
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
        const base64Url = await blobToBase64(file);
        onUploadComplete(base64Url);
        setFile(null);
    } catch (err) {
        console.error("Failed to convert image", err);
        setError("Could not process the image. Please try another one.");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    onUploadComplete(''); // Notify parent that the image is removed
  };

  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
      {!preview && (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
            <ImageIcon className="w-8 h-8 mb-2" />
            <p className="mb-1 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs">PNG, JPG, or GIF (max 5MB)</p>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {preview && (
        <div className="space-y-3">
          <div className="relative w-full max-w-xs mx-auto">
            <img src={preview} alt="Preview" className="w-full h-auto rounded-lg object-contain max-h-48" />
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600"
              aria-label="Remove image"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>

          {file && (
            <div className="flex items-center justify-center">
              <button
                onClick={handleUpload}
                disabled={isProcessing}
                className="flex items-center gap-2 bg-sky-500 text-white font-semibold rounded-lg px-4 py-2 text-sm transition-all duration-300 hover:bg-sky-600 disabled:bg-sky-300"
              >
                {isProcessing ? <SpinnerIcon className="w-4 h-4" /> : <UploadIcon className="w-4 h-4" />}
                {isProcessing ? `Processing...` : 'Confirm & Save'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};