import { useState } from 'react';
import type { CardBlock, TextBlock, ImageBlock, ButtonBlock, QuizBlock, CodeBlock, DownloadBlock } from '@/types';
import CardBlockEditor from './CardBlockEditor';
import CardPreview from './CardPreview';
import {
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

interface CardEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle: string;
  initialBlocks: CardBlock[];
  onSave: (title: string, blocks: CardBlock[]) => void;
  isSaving: boolean;
}

const BLOCK_TEMPLATES: Record<string, () => CardBlock> = {
  text: () => ({
    type: 'text',
    content: '',
    fontSize: 16,
    bold: false,
    italic: false,
    align: 'left',
  }),
  image: () => ({
    type: 'image',
    url: '',
    alt: '',
    caption: '',
  }),
  button: () => ({
    type: 'button',
    label: 'Enlace',
    url: '',
    variant: 'primary',
  }),
  quiz: () => ({
    type: 'quiz',
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: '',
    points: 10,
  }),
  code: () => ({
    type: 'code',
    language: 'javascript',
    content: '',
  }),
  download: () => ({
    type: 'download',
    label: '',
    fileUrl: '',
    fileName: '',
  }),
};

const CardEditor = ({ isOpen, onClose, initialTitle, initialBlocks, onSave, isSaving }: CardEditorProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [blocks, setBlocks] = useState<CardBlock[]>(initialBlocks);
  const [showPreview, setShowPreview] = useState(false);

  const addBlock = (type: string) => {
    const template = BLOCK_TEMPLATES[type];
    if (template) {
      setBlocks([...blocks, template()]);
    }
  };

  const updateBlock = (index: number, updatedBlock: CardBlock) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    setBlocks(newBlocks);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex]!, newBlocks[index]!];
    setBlocks(newBlocks);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title, blocks);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-lab-bg overflow-y-auto">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-lab-surface border-b border-lab-border px-4 py-3">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <button onClick={onClose} className="text-sm text-lab-text-muted hover:text-lab-text">
            Cancelar
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-secondary py-2 px-3 text-sm flex items-center gap-1"
            >
              {showPreview ? (
                <><PencilSquareIcon className="w-4 h-4" /> Editar</>
              ) : (
                <><EyeIcon className="w-4 h-4" /> Vista previa</>
              )}
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || isSaving}
              className="btn-primary py-2 px-4 text-sm"
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {showPreview ? (
          <CardPreview title={title} blocks={blocks} />
        ) : (
          <div className="space-y-4">
            {/* Title */}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field text-lg font-semibold"
              placeholder="Titulo de la tarjeta"
            />

            {/* Blocks */}
            {blocks.map((block, index) => (
              <CardBlockEditor
                key={index}
                block={block}
                index={index}
                totalBlocks={blocks.length}
                onUpdate={(updated) => updateBlock(index, updated)}
                onRemove={() => removeBlock(index)}
                onMove={(dir) => moveBlock(index, dir)}
              />
            ))}

            {/* Add block buttons */}
            <div className="card bg-lab-bg border-dashed">
              <p className="text-sm text-lab-text-muted mb-3 text-center">Agregar bloque</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { type: 'text', label: 'Texto' },
                  { type: 'image', label: 'Imagen' },
                  { type: 'button', label: 'Boton' },
                  { type: 'quiz', label: 'Quiz' },
                  { type: 'code', label: 'Codigo' },
                  { type: 'download', label: 'Descarga' },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => addBlock(item.type)}
                    className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
                  >
                    <PlusIcon className="w-3 h-3" /> {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardEditor;
