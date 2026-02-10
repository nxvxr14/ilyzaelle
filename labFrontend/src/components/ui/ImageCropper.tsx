import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import Modal from './Modal';
import { getCroppedImg } from '@/utils/cropImage';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (blob: Blob) => void;
  aspect: number;
  title?: string;
  outputWidth?: number;
  outputHeight?: number;
}

const ImageCropper = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspect,
  title = 'Recortar imagen',
  outputWidth,
  outputHeight,
}: ImageCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropDone = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, outputWidth, outputHeight);
      onCropComplete(blob);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="relative w-full h-80 bg-lab-bg rounded-xl overflow-hidden">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropDone}
          cropShape={aspect === 1 ? 'round' : 'rect'}
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="text-sm text-lab-text-muted">Zoom</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-lab-primary"
        />
      </div>

      <div className="mt-4 flex gap-3">
        <button onClick={onClose} className="btn-secondary flex-1">
          Cancelar
        </button>
        <button onClick={handleSave} className="btn-primary flex-1">
          Guardar
        </button>
      </div>
    </Modal>
  );
};

export default ImageCropper;
