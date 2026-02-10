import { useRef, useState } from 'react';
import type { CardBlock } from '@/types';
import * as endpoints from '@/api/endpoints';
import { getImageUrl } from '@/utils/helpers';
import { toast } from 'react-toastify';
import {
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

interface CardBlockEditorProps {
  block: CardBlock;
  index: number;
  totalBlocks: number;
  onUpdate: (block: CardBlock) => void;
  onRemove: () => void;
  onMove: (direction: 'up' | 'down') => void;
}

const CardBlockEditor = ({ block, index, totalBlocks, onUpdate, onRemove, onMove }: CardBlockEditorProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await endpoints.uploadCardImage(formData);
      onUpdate({ ...block, url: response.data.url } as typeof block);
      toast.success('Imagen subida');
    } catch {
      toast.error('Error al subir imagen');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const renderEditor = () => {
    switch (block.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <textarea
              value={block.content}
              onChange={(e) => onUpdate({ ...block, content: e.target.value })}
              className="input-field min-h-[80px] resize-y"
              placeholder="Escribe el contenido de texto..."
            />
            <div className="flex flex-wrap gap-2">
              <select
                value={block.fontSize}
                onChange={(e) => onUpdate({ ...block, fontSize: Number(e.target.value) })}
                className="input-field w-auto text-xs py-1"
              >
                {[12, 14, 16, 18, 20, 24, 28, 32, 36].map((s) => (
                  <option key={s} value={s}>{s}px</option>
                ))}
              </select>
              <button
                onClick={() => onUpdate({ ...block, bold: !block.bold })}
                className={`px-3 py-1 rounded text-xs font-bold ${block.bold ? 'bg-lab-primary text-white' : 'bg-lab-bg text-lab-text-muted'}`}
              >
                B
              </button>
              <button
                onClick={() => onUpdate({ ...block, italic: !block.italic })}
                className={`px-3 py-1 rounded text-xs italic ${block.italic ? 'bg-lab-primary text-white' : 'bg-lab-bg text-lab-text-muted'}`}
              >
                I
              </button>
              <select
                value={block.align}
                onChange={(e) => onUpdate({ ...block, align: e.target.value as 'left' | 'center' | 'right' })}
                className="input-field w-auto text-xs py-1"
              >
                <option value="left">Izquierda</option>
                <option value="center">Centro</option>
                <option value="right">Derecha</option>
              </select>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            {/* Upload button */}
            <div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={uploading}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 w-full justify-center"
              >
                <ArrowUpTrayIcon className="w-4 h-4" />
                {uploading ? 'Subiendo...' : 'Subir imagen'}
              </button>
            </div>

            {/* Or enter URL manually */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-lab-border" />
              <span className="text-[10px] text-lab-text-muted uppercase">o pegar URL</span>
              <div className="flex-1 h-px bg-lab-border" />
            </div>

            <input
              value={block.url}
              onChange={(e) => onUpdate({ ...block, url: e.target.value })}
              className="input-field text-sm"
              placeholder="URL de la imagen"
            />

            {/* Preview */}
            {block.url && (
              <div className="rounded-lg overflow-hidden bg-lab-bg">
                <img
                  src={block.url.startsWith('/uploads') ? getImageUrl(block.url) : block.url}
                  alt={block.alt || 'Preview'}
                  className="max-h-32 mx-auto object-contain"
                />
              </div>
            )}

            <input
              value={block.alt}
              onChange={(e) => onUpdate({ ...block, alt: e.target.value })}
              className="input-field text-sm"
              placeholder="Texto alternativo"
            />
            <input
              value={block.caption}
              onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
              className="input-field text-sm"
              placeholder="Pie de imagen (opcional)"
            />
          </div>
        );

      case 'button':
        return (
          <div className="space-y-2">
            <input
              value={block.label}
              onChange={(e) => onUpdate({ ...block, label: e.target.value })}
              className="input-field text-sm"
              placeholder="Texto del boton"
            />
            <input
              value={block.url}
              onChange={(e) => onUpdate({ ...block, url: e.target.value })}
              className="input-field text-sm"
              placeholder="URL del enlace"
            />
            <select
              value={block.variant}
              onChange={(e) => onUpdate({ ...block, variant: e.target.value as any })}
              className="input-field text-sm"
            >
              <option value="primary">Primario</option>
              <option value="secondary">Secundario</option>
              <option value="outline">Outline</option>
            </select>
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-2">
            <input
              value={block.question}
              onChange={(e) => onUpdate({ ...block, question: e.target.value })}
              className="input-field text-sm"
              placeholder="Pregunta"
            />
            {block.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`quiz-${index}`}
                  checked={block.correctIndex === i}
                  onChange={() => onUpdate({ ...block, correctIndex: i })}
                  className="accent-lab-primary"
                />
                <input
                  value={opt}
                  onChange={(e) => {
                    const newOptions = [...block.options];
                    newOptions[i] = e.target.value;
                    onUpdate({ ...block, options: newOptions });
                  }}
                  className="input-field text-sm flex-1"
                  placeholder={`Opcion ${i + 1}`}
                />
              </div>
            ))}
            <button
              onClick={() => onUpdate({ ...block, options: [...block.options, ''] })}
              className="text-xs text-lab-primary hover:underline"
            >
              + Agregar opcion
            </button>
            <textarea
              value={block.explanation}
              onChange={(e) => onUpdate({ ...block, explanation: e.target.value })}
              className="input-field text-sm min-h-[60px] resize-y"
              placeholder="Explicacion (se muestra al responder)"
            />
            <input
              type="number"
              value={block.points}
              onChange={(e) => onUpdate({ ...block, points: Number(e.target.value) })}
              className="input-field text-sm w-32"
              placeholder="Puntos"
              min={0}
            />
          </div>
        );

      case 'code':
        return (
          <div className="space-y-2">
            <input
              value={block.language}
              onChange={(e) => onUpdate({ ...block, language: e.target.value })}
              className="input-field text-sm"
              placeholder="Lenguaje (ej: javascript, python)"
            />
            <textarea
              value={block.content}
              onChange={(e) => onUpdate({ ...block, content: e.target.value })}
              className="input-field text-sm min-h-[120px] resize-y font-mono"
              placeholder="Codigo..."
            />
          </div>
        );

      case 'download':
        return (
          <div className="space-y-2">
            <input
              value={block.label}
              onChange={(e) => onUpdate({ ...block, label: e.target.value })}
              className="input-field text-sm"
              placeholder="Texto del enlace"
            />
            <input
              value={block.fileUrl}
              onChange={(e) => onUpdate({ ...block, fileUrl: e.target.value })}
              className="input-field text-sm"
              placeholder="URL del archivo"
            />
            <input
              value={block.fileName}
              onChange={(e) => onUpdate({ ...block, fileName: e.target.value })}
              className="input-field text-sm"
              placeholder="Nombre del archivo"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const blockLabels: Record<string, string> = {
    text: 'Texto',
    image: 'Imagen',
    button: 'Boton',
    quiz: 'Quiz',
    code: 'Codigo',
    download: 'Descarga',
  };

  return (
    <div className="card border-lab-primary/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-lab-primary uppercase tracking-wider">
          {blockLabels[block.type] || block.type}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="p-1 text-lab-text-muted hover:text-lab-text disabled:opacity-30"
          >
            <ChevronUpIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMove('down')}
            disabled={index === totalBlocks - 1}
            className="p-1 text-lab-text-muted hover:text-lab-text disabled:opacity-30"
          >
            <ChevronDownIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onRemove}
            className="p-1 text-lab-text-muted hover:text-red-400"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {renderEditor()}
    </div>
  );
};

export default CardBlockEditor;
