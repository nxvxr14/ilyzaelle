import { useEffect, useRef, useState, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;

const ImageLightbox = ({ src, alt, onClose }: ImageLightboxProps) => {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const lastDistRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Reset on double-tap/click
  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  }, [scale]);

  // Scroll-to-zoom (desktop)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.3 : 0.3;
    setScale((prev) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta));
      if (next <= 1) setTranslate({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Touch handlers for pinch-to-zoom and drag
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0]!.clientX - e.touches[1]!.clientX;
      const dy = e.touches[0]!.clientY - e.touches[1]!.clientY;
      lastDistRef.current = Math.sqrt(dx * dx + dy * dy);
    } else if (e.touches.length === 1 && scale > 1) {
      lastTouchRef.current = { x: e.touches[0]!.clientX, y: e.touches[0]!.clientY };
      setIsDragging(true);
    }
  }, [scale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastDistRef.current !== null) {
      e.preventDefault();
      const dx = e.touches[0]!.clientX - e.touches[1]!.clientX;
      const dy = e.touches[0]!.clientY - e.touches[1]!.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = dist / lastDistRef.current;
      lastDistRef.current = dist;
      setScale((prev) => {
        const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev * ratio));
        if (next <= 1) setTranslate({ x: 0, y: 0 });
        return next;
      });
    } else if (e.touches.length === 1 && isDragging && lastTouchRef.current) {
      const dx = e.touches[0]!.clientX - lastTouchRef.current.x;
      const dy = e.touches[0]!.clientY - lastTouchRef.current.y;
      lastTouchRef.current = { x: e.touches[0]!.clientX, y: e.touches[0]!.clientY };
      setTranslate((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    lastDistRef.current = null;
    lastTouchRef.current = null;
    setIsDragging(false);
  }, []);

  // Mouse drag (desktop)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      lastTouchRef.current = { x: e.clientX, y: e.clientY };
      setIsDragging(true);
    }
  }, [scale]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && lastTouchRef.current) {
      const dx = e.clientX - lastTouchRef.current.x;
      const dy = e.clientY - lastTouchRef.current.y;
      lastTouchRef.current = { x: e.clientX, y: e.clientY };
      setTranslate((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    lastTouchRef.current = null;
    setIsDragging(false);
  }, []);

  // Close if tapping backdrop (not the image) at 1x zoom
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current && scale <= 1) {
      onClose();
    }
  }, [onClose, scale]);

  return (
    <div className="fixed inset-0 z-[80] bg-black/95 flex flex-col">
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3">
        <p className="text-xs text-white/60">{Math.round(scale * 100)}%</p>
        <button
          onClick={onClose}
          className="p-2 text-white/70 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Image area */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden select-none"
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in', touchAction: 'none' }}
        onClick={handleBackdropClick}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain pointer-events-none"
          draggable={false}
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
        />
      </div>
    </div>
  );
};

export default ImageLightbox;
