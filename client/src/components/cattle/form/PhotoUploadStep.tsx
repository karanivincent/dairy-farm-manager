import { useFormContext } from 'react-hook-form';
import { useState, useRef } from 'react';
import { CameraIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

export function PhotoUploadStep() {
  const { setValue, watch } = useFormContext();
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const photoFile = watch('photoFile');

  const handleFileSelect = (file: File | null) => {
    if (file) {
      setValue('photoFile', file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setValue('photoFile', undefined);
      setPreview(null);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemovePhoto = () => {
    handleFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Photo Upload</h3>
      
      <div className="text-sm text-gray-600">
        Add a photo to help identify this cattle. This is optional but recommended.
      </div>

      {!preview ? (
        <div className="space-y-4">
          {/* Upload Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Camera Capture (Mobile) */}
            <button
              type="button"
              onClick={openCamera}
              className="relative rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <div className="flex flex-col items-center">
                <CameraIcon className="h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Take Photo
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  Use camera
                </span>
              </div>
            </button>

            {/* File Upload */}
            <button
              type="button"
              onClick={openFileDialog}
              className="relative rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <div className="flex flex-col items-center">
                <PhotoIcon className="h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Choose File
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  JPG, PNG up to 10MB
                </span>
              </div>
            </button>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative">
            <img
              src={preview}
              alt="Cattle preview"
              className="mx-auto h-64 w-64 object-cover rounded-lg shadow-lg"
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute top-2 right-2 rounded-full bg-white p-1 shadow-md hover:bg-gray-100"
            >
              <XMarkIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* File Info */}
          {photoFile && (
            <div className="text-center text-sm text-gray-600">
              <p>{photoFile.name}</p>
              <p>{(photoFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}

          {/* Change Photo Button */}
          <div className="flex justify-center space-x-3">
            <button
              type="button"
              onClick={openCamera}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <CameraIcon className="h-4 w-4 mr-2" />
              Retake
            </button>
            <button
              type="button"
              onClick={openFileDialog}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <PhotoIcon className="h-4 w-4 mr-2" />
              Choose Different
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-900">Photo Tips</h4>
        <ul className="mt-2 text-sm text-gray-600 space-y-1">
          <li>• Take photo from the side for best identification</li>
          <li>• Ensure good lighting and clear visibility</li>
          <li>• Include distinguishing marks or features</li>
          <li>• Avoid blurry or dark photos</li>
        </ul>
      </div>
    </div>
  );
}