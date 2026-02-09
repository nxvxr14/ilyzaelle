import { useState, useRef } from 'react';
import type { Card } from '@/types';
import PixelButton from '@/components/common/PixelButton';
import { IoCamera } from 'react-icons/io5';
import { motion } from 'framer-motion';

interface PhotoUploadCardProps {
  card: Card;
  onSubmit: (photoFile: File) => void;
  isSubmitting: boolean;
}

const apiBase = import.meta.env.VITE_API_URL.replace('/api', '');

const PhotoUploadCard = ({ card, onSubmit, isSubmitting }: PhotoUploadCardProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = () => {
    if (file) {
      onSubmit(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg px-4">
      {card.title && (
        <h2 className="font-pixel text-sm md:text-base text-pixel-primary pixel-text-shadow text-center">
          {card.title}
        </h2>
      )}

      {card.image && (
        <img
          src={`${apiBase}${card.image}`}
          alt={card.title || ''}
          className="w-full max-w-sm max-h-40 object-contain"
        />
      )}

      <div className="text-gray-200 text-base font-body leading-relaxed text-center whitespace-pre-line">
        {card.content}
      </div>

      {/* Camera capture area */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleCapture}
        className="w-full max-w-xs aspect-square border-2 border-dashed border-gray-500
                   flex flex-col items-center justify-center gap-3
                   hover:border-pixel-primary transition-colors bg-pixel-dark overflow-hidden"
      >
        {preview ? (
          <img src={preview} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <>
            <IoCamera className="text-5xl text-gray-400" />
            <span className="font-pixel text-[10px] text-gray-400">
              TOMAR FOTO
            </span>
          </>
        )}
      </motion.button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview && (
        <div className="flex gap-3">
          <PixelButton variant="secondary" size="sm" onClick={handleCapture}>
            RETOMAR
          </PixelButton>
          <PixelButton
            onClick={handleSubmit}
            isLoading={isSubmitting}
            size="lg"
            variant="green"
          >
            ENVIAR FOTO ▶
          </PixelButton>
        </div>
      )}
    </div>
  );
};

export default PhotoUploadCard;
